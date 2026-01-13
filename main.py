from dotenv import load_dotenv
import os

# Laad de .env variabelen onmiddellijk
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from modules.analysis import analyze_document
import json

app = FastAPI(title="ClearClause MVP API")

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
    text: str
    document_name: str = "Onbekend Document"

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ClearClause AI"}

@app.post("/analyze")
async def handle_analysis(request: DocumentRequest):
    try:
        print(f"[*] Analyse verzoek ontvangen voor: {request.document_name}")
        result_json = analyze_document(request.text)
        return json.loads(result_json)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interne Server Fout: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
