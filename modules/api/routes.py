import json
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile

from modules.analysis import analyze_document
from modules.analysis.file_processor import extract_text_from_image, extract_text_from_pdf
from modules.analysis.modes import AnalysisMode, MODE_METADATA
from modules.api.config import DAILY_LIMIT, MAX_REQUEST_SIZE
from modules.api.models import ChatRequest, DocumentRequest
from modules.api.presentation import add_presentational_fields
from modules.auth.rate_limiter import InMemoryRateLimiter
from modules.auth.security import TokenData, verify_token
from modules.chat.engine import generate_chat_response


router = APIRouter()
rate_limiter = InMemoryRateLimiter(limit=DAILY_LIMIT)


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ClearClause Suite"}


@router.get("/modes")
async def get_modes():
    return {
        "modes": [
            {
                "value": mode.value,
                "naam": metadata["naam"],
                "beschrijving": metadata["beschrijving"],
                "icon": metadata.get("icon", "FileText"),
            }
            for mode, metadata in MODE_METADATA.items()
        ]
    }


@router.post("/analyze")
async def handle_analysis(
    request: DocumentRequest,
    req: Request,
    token: TokenData = Depends(verify_token),
):
    if not rate_limiter.check_limit(_client_ip(req)):
        raise HTTPException(status_code=429, detail=f"Dagelijks limiet bereikt ({DAILY_LIMIT} analyses per 24u). Probeer het morgen opnieuw.")

    try:
        try:
            mode = AnalysisMode(request.mode)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Ongeldige mode: {request.mode}. Gebruik /modes endpoint voor beschikbare opties.")

        print(f"[*] Analyse verzoek: {request.document_name} | Mode: {mode.value}")
        result_json = await analyze_document(text=request.text, mode=mode, context=request.context)
        return add_presentational_fields(json.loads(result_json), mode)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        print(f"[!] Fout tijdens analyse: {exc}")
        raise HTTPException(status_code=500, detail="Analyse mislukt. Probeer het later opnieuw.") from exc


@router.post("/analyze-file")
async def handle_file_analysis(
    req: Request,
    file: UploadFile = File(...),
    mode: str = Form("algemene_voorwaarden"),
    document_name: Optional[str] = Form(None),
    token: TokenData = Depends(verify_token),
):
    if not rate_limiter.check_limit(_client_ip(req)):
        raise HTTPException(status_code=429, detail=f"Dagelijks limiet bereikt ({DAILY_LIMIT} analyses per 24u).")

    try:
        try:
            analysis_mode = AnalysisMode(mode)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Ongeldige mode: {mode}. Gebruik /modes endpoint voor beschikbare opties.")

        content = await file.read()
        if len(content) > MAX_REQUEST_SIZE:
            raise HTTPException(status_code=413, detail=f"Bestand te groot. Maximum: {MAX_REQUEST_SIZE / (1024*1024)}MB")

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

        result_json = await analyze_document(text=extracted_text, mode=analysis_mode, context=None)
        result = add_presentational_fields(json.loads(result_json), analysis_mode)
        result["extracted_text"] = extracted_text
        return result
    except HTTPException:
        raise
    except Exception as exc:
        print(f"[!] File Error: {exc}")
        raise HTTPException(status_code=500, detail="Bestandsanalyse mislukt.") from exc


@router.post("/chat")
async def handle_chat(request: ChatRequest, token: TokenData = Depends(verify_token)):
    try:
        response = await generate_chat_response(
            question=request.question,
            context_text=request.context_text,
            history=request.history,
        )
        return {"answer": response}
    except Exception as exc:
        print(f"[!] Chat Fout: {exc}")
        raise HTTPException(status_code=500, detail="Chatverzoek mislukt.") from exc
