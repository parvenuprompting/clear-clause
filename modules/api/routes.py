import json
import os
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile

from modules.analysis import analyze_document
from modules.analysis.file_processor import extract_text_from_image, extract_text_from_pdf
from modules.analysis.modes import AnalysisMode, MODE_METADATA
from modules.api.config import DAILY_LIMIT, MAX_REQUEST_SIZE
from modules.api.models import ChatRequest, DocumentRequest
from modules.api.presentation import add_presentational_fields
from redis import Redis

from modules.auth.rate_limiter import InMemoryRateLimiter, RateLimiterStrategy, RedisRateLimiter
from modules.auth.security import TokenData, verify_token
from modules.chat.engine import generate_chat_response
from modules.shared.logging import get_logger


router = APIRouter()
logger = get_logger(__name__)


def _create_rate_limiter() -> RateLimiterStrategy:
    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        return InMemoryRateLimiter(limit=DAILY_LIMIT)

    try:
        client = Redis.from_url(redis_url, decode_responses=True)
        client.ping()
        logger.info("Using Redis rate limiter")
        return RedisRateLimiter(client, limit=DAILY_LIMIT)
    except Exception:
        logger.exception("Redis unavailable; falling back to in-memory rate limiter")
        return InMemoryRateLimiter(limit=DAILY_LIMIT)


rate_limiter = _create_rate_limiter()


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

        logger.info("Analyse request received", extra={"document_name": request.document_name, "mode": mode.value})
        result_json = await analyze_document(text=request.text, mode=mode, context=request.context)
        result = add_presentational_fields(json.loads(result_json), mode, request.text)
        result["document_name"] = request.document_name or "Onbekend Document"
        return result
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Analysis request failed")
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
        logger.info("File analysis request received", extra={"document_filename": filename, "content_type": content_type, "mode": mode})

        if content_type == "application/pdf":
            extracted_text = extract_text_from_pdf(content)
        elif content_type and content_type.startswith("image/"):
            extracted_text = await extract_text_from_image(content)
        else:
            raise HTTPException(status_code=400, detail="Alleen PDF of afbeeldingen zijn toegestaan.")

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Geen tekst gevonden in het bestand.")

        result_json = await analyze_document(text=extracted_text, mode=analysis_mode, context=None)
        result = add_presentational_fields(json.loads(result_json), analysis_mode, extracted_text)
        result["extracted_text"] = extracted_text
        result["document_name"] = filename or "Onbekend Document"
        return result
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("File analysis request failed")
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
        logger.exception("Chat request failed")
        raise HTTPException(status_code=500, detail="Chatverzoek mislukt.") from exc
