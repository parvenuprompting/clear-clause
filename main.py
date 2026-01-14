from dotenv import load_dotenv
import os

# Laad de .env variabelen onmiddellijk
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from modules.analysis import analyze_document
from modules.analysis.modes import AnalysisMode
from modules.chat.engine import generate_chat_response, ChatMessage
from modules.analysis.file_processor import extract_text_from_pdf, extract_text_from_image
from fastapi import UploadFile, File, Form
import json
from datetime import datetime, timedelta
from collections import defaultdict

# Simple In-Memory Rate Limiter (voor MVP)
# In productie: gebruik Redis
DAILY_LIMIT = 10
analysis_usage = defaultdict(list)

def check_rate_limit(ip_address: str) -> bool:
    now = datetime.now()
    # Filter requests ouder dan 24 uur updates de lijst
    analysis_usage[ip_address] = [t for t in analysis_usage[ip_address] if t > now - timedelta(days=1)]
    
    if len(analysis_usage[ip_address]) >= DAILY_LIMIT:
        return False
    
    analysis_usage[ip_address].append(now)
    return True


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
        if content_length and int(content_length) > MAX_REQUEST_SIZE:
            return HTTPException(
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
    text: str = Field(description="Te analyseren tekst")
    document_name: str = Field(default="Onbekend Document", description="Naam van het document")
    mode: str = Field(default="algemene_voorwaarden", description="Analyse modus")
    context: Optional[str] = Field(default=None, description="Extra context (voor reactie brief mode)")

class ChatRequest(BaseModel):
    question: str
    context_text: str
    history: list[ChatMessage]

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
                "icon": metadata["icon"]
            }
            for mode, metadata in MODE_METADATA.items()
        ]
    }

@app.post("/analyze")
async def handle_analysis(request: DocumentRequest, req: Request):
    client_ip = req.client.host
    if not check_rate_limit(client_ip):
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
        result_json = analyze_document(
            text=request.text,
            mode=mode,
            context=request.context
        )
        
        return json.loads(result_json)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[!] Fout: {e}")
        raise HTTPException(status_code=500, detail=f"Interne Server Fout: {str(e)}")
@app.post("/analyze-file")
async def handle_file_analysis(
    file: UploadFile = File(...),
    mode: str = Form("algemene_voorwaarden"),
    document_name: Optional[str] = Form(None),
    req: Request = None
):
    """
    Handle analysis of uploaded files (PDF or Images).
    """
    client_ip = req.client.host
    if not check_rate_limit(client_ip):
         raise HTTPException(
            status_code=429,
            detail=f"Dagelijks limiet bereikt ({DAILY_LIMIT} analyses per 24u)."
        )

    try:
        content = await file.read()
        filename = document_name or file.filename
        content_type = file.content_type

        print(f"[*] Bestandsanalyse: {filename} ({content_type}) | Mode: {mode}")

        if content_type == "application/pdf":
            extracted_text = extract_text_from_pdf(content)
        elif content_type.startswith("image/"):
            extracted_text = extract_text_from_image(content)
        else:
            raise HTTPException(status_code=400, detail="Alleen PDF of afbeeldingen zijn toegestaan.")

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Geen tekst gevonden in het bestand.")

        # Analyseer de geëxtraheerde tekst
        result_json = analyze_document(
            text=extracted_text,
            mode=AnalysisMode(mode),
            context=None
        )
        
        # Voeg de geëxtraheerde tekst toe aan de response voor de chat context
        result = json.loads(result_json)
        result["extracted_text"] = extracted_text
        return result

    except Exception as e:
        print(f"[!] File Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def handle_chat(request: ChatRequest):
    try:
        response = generate_chat_response(
            question=request.question,
            context_text=request.context_text,
            history=request.history
        )
        return {"answer": response}
    except Exception as e:
        print(f"[!] Chat Fout: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
