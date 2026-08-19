from dotenv import load_dotenv
import os

# Laad de .env variabelen onmiddellijk
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Optional
from modules.analysis import analyze_document
from modules.analysis.modes import AnalysisMode
from modules.chat.engine import generate_chat_response, ChatMessage
from modules.analysis.file_processor import extract_text_from_pdf, extract_text_from_image
from fastapi import UploadFile, File, Form
import json
from modules.auth.security import verify_token, TokenData
from modules.auth.rate_limiter import InMemoryRateLimiter
from fastapi import Depends

# Rate Limiter
DAILY_LIMIT = 10
rate_limiter = InMemoryRateLimiter(limit=DAILY_LIMIT)


app = FastAPI(title="ClearClause Suite API")

# Request Size Limiting Middleware (max 1MB voor beveiliging)
MAX_REQUEST_SIZE = 1 * 1024 * 1024  # 1MB in bytes

@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    """
    Middleware om extreem grote payloads te blokkeren.
    Voorkomt DoS aanvallen via grote uploads.
    """
    if request.method in ["POST", "PUT", "PATCH"]:
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                request_size = int(content_length)
            except ValueError:
                raise HTTPException(status_code=400, detail="Ongeldige Content-Length header.")
            if request_size > MAX_REQUEST_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"Request te groot. Maximum: {MAX_REQUEST_SIZE / (1024*1024)}MB"
                )
    
    response = await call_next(request)
    return response

# CORS Configuratie voor Next.js (localhost:3000)
origins = [
    "http://localhost:3000",
    "https://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500_000, description="Te analyseren tekst")
    document_name: str = Field(default="Onbekend Document", max_length=255, description="Naam van het document")
    mode: str = Field(default="algemene_voorwaarden", min_length=1, description="Analyse modus")
    context: Optional[str] = Field(default=None, max_length=50_000, description="Extra context (voor reactie brief mode)")

class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4_000)
    context_text: str = Field(min_length=1, max_length=100_000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)


def _add_presentational_fields(result: dict[str, Any], mode: AnalysisMode) -> dict[str, Any]:
    """Voeg een stabiele dashboardvorm toe zonder mode-specifieke data te verliezen."""
    result = {**result, "mode": mode.value}

    if mode == AnalysisMode.PRIVACY_BELEID:
        result.setdefault("summary", result.get("compliance_gaps", [])[:5])
        result.setdefault("red_flags", [
            {"clause_citation": "GDPR compliance gap", "risk_type": "compliance_gap", "explanation": gap, "severity_score": 5}
            for gap in result.get("compliance_gaps", [])
        ])
        result.setdefault("suggestions", result.get("recommendations", []))
        result.setdefault("privacy_score", result.get("gdpr_compliance_score", 0))
        result.setdefault("privacy_motivatie", f"GDPR-compliance score: {result.get('gdpr_compliance_score', 0)}/10")
    elif mode == AnalysisMode.GEBRUIKERSVOORWAARDEN:
        result.setdefault("summary", result.get("restrictions", [])[:5])
        result["red_flags"] = [
            {"clause_citation": "Gebruikersvoorwaarden", "risk_type": "user_rights", "explanation": flag, "severity_score": 5}
            for flag in result.get("red_flags", [])
            if isinstance(flag, str)
        ]
        result.setdefault("suggestions", result.get("recommendations", []))
        result.setdefault("privacy_score", result.get("fairness_score", 0))
        result.setdefault("privacy_motivatie", f"Fairness score: {result.get('fairness_score', 0)}/10")
    elif mode == AnalysisMode.BRIEVEN_ANALYSE:
        result.setdefault("summary", result.get("action_points", [])[:5])
        result.setdefault("red_flags", [
            {"clause_citation": "Juridische claim", "risk_type": "legal_claim", "explanation": claim, "severity_score": result.get("urgency_level", 5)}
            for claim in result.get("legal_claims", [])
        ])
        result.setdefault("suggestions", [result.get("response_strategy", "")])
        result.setdefault("privacy_score", result.get("urgency_level", 0))
        result.setdefault("privacy_motivatie", f"Urgentieniveau: {result.get('urgency_level', 0)}/10")
    elif mode == AnalysisMode.REACTIE_BRIEF:
        result.setdefault("summary", result.get("key_points", [])[:5])
        result.setdefault("red_flags", [])
        result.setdefault("suggestions", result.get("next_steps", []))
        result.setdefault("privacy_score", 0)
        result.setdefault("privacy_motivatie", "Dit resultaat is een conceptbrief en geen risicoscore.")

    return result

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ClearClause Suite"}

@app.get("/modes")
async def get_modes():
    """Retourneer beschikbare analyse modi met metadata"""
    from modules.analysis.modes import MODE_METADATA
    return {
        "modes": [
            {
                "value": mode.value,
                "naam": metadata["naam"],
                "beschrijving": metadata["beschrijving"],
                "icon": metadata.get("icon", "FileText")
            }
            for mode, metadata in MODE_METADATA.items()
        ]
    }

@app.post("/analyze")
async def handle_analysis(
    request: DocumentRequest, 
    req: Request,
    token: TokenData = Depends(verify_token)
):
    client_ip = req.client.host
    if not rate_limiter.check_limit(client_ip):
         raise HTTPException(
            status_code=429,
            detail=f"Dagelijks limiet bereikt ({DAILY_LIMIT} analyses per 24u). Probeer het morgen opnieuw."
        )

    try:
        # Converteer string naar AnalysisMode enum
        try:
            mode = AnalysisMode(request.mode)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Ongeldige mode: {request.mode}. Gebruik /modes endpoint voor beschikbare opties."
            )
        
        print(f"[*] Analyse verzoek: {request.document_name} | Mode: {mode.value}")
        
        # Roep analyze_document aan met mode en optionele context
        result_json = await analyze_document(
            text=request.text,
            mode=mode,
            context=request.context
        )
        
        return _add_presentational_fields(json.loads(result_json), mode)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[!] Fout: {e}")
        print(f"[!] Fout tijdens analyse: {e}")
        raise HTTPException(status_code=500, detail="Analyse mislukt. Probeer het later opnieuw.")
@app.post("/analyze-file")
async def handle_file_analysis(
    req: Request,
    file: UploadFile = File(...),
    mode: str = Form("algemene_voorwaarden"),
    document_name: Optional[str] = Form(None),
    token: TokenData = Depends(verify_token)
):
    """
    Handle analysis of uploaded files (PDF or Images).
    """
    client_ip = req.client.host
    if not rate_limiter.check_limit(client_ip):
         raise HTTPException(
            status_code=429,
            detail=f"Dagelijks limiet bereikt ({DAILY_LIMIT} analyses per 24u)."
        )

    try:
        try:
            analysis_mode = AnalysisMode(mode)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Ongeldige mode: {mode}. Gebruik /modes endpoint voor beschikbare opties.",
            )

        content = await file.read()
        if len(content) > MAX_REQUEST_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Bestand te groot. Maximum: {MAX_REQUEST_SIZE / (1024*1024)}MB",
            )
        filename = document_name or file.filename
        content_type = file.content_type

        print(f"[*] Bestandsanalyse: {filename} ({content_type}) | Mode: {mode}")

        if content_type == "application/pdf":
            extracted_text = extract_text_from_pdf(content)
        elif content_type and content_type.startswith("image/"):
            extracted_text = await extract_text_from_image(content)
        else:
            raise HTTPException(status_code=400, detail="Alleen PDF of afbeeldingen zijn toegestaan.")

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Geen tekst gevonden in het bestand.")

        # Analyseer de geëxtraheerde tekst
        result_json = await analyze_document(
            text=extracted_text,
            mode=analysis_mode,
            context=None
        )
        
        # Voeg de geëxtraheerde tekst toe aan de response voor de chat context
        result = _add_presentational_fields(json.loads(result_json), analysis_mode)
        result["extracted_text"] = extracted_text
        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"[!] File Error: {e}")
        raise HTTPException(status_code=500, detail="Bestandsanalyse mislukt.")

@app.post("/chat")
async def handle_chat(request: ChatRequest, token: TokenData = Depends(verify_token)):
    try:
        response = await generate_chat_response(
            question=request.question,
            context_text=request.context_text,
            history=request.history
        )
        return {"answer": response}
    except Exception as e:
        print(f"[!] Chat Fout: {e}")
        raise HTTPException(status_code=500, detail="Chatverzoek mislukt.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=os.getenv("HOST", "127.0.0.1"), port=8000, reload=True)
