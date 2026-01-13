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
import json

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
async def handle_analysis(request: DocumentRequest):
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
