import os
import time
import uuid

from dotenv import load_dotenv

load_dotenv()

from modules.shared.logging import configure_logging, request_id_context

configure_logging()

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from modules.api.config import MAX_REQUEST_SIZE
from modules.api.routes import router
from modules.shared.metrics import record_http_request


app = FastAPI(title="ClearClause Suite API")


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    context_token = request_id_context.set(request_id)
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    finally:
        request_id_context.reset(context_token)


@app.middleware("http")
async def collect_http_metrics(request: Request, call_next):
    started_at = time.perf_counter()
    response = await call_next(request)
    route = request.scope.get("route")
    path = getattr(route, "path", request.url.path)
    record_http_request(request.method, path, response.status_code, time.perf_counter() - started_at)
    return response


@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    """Blokkeer payloads groter dan 1 MB voordat routes worden uitgevoerd."""
    if request.method in ["POST", "PUT", "PATCH"]:
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                request_size = int(content_length)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail="Ongeldige Content-Length header.") from exc
            if request_size > MAX_REQUEST_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"Request te groot. Maximum: {MAX_REQUEST_SIZE / (1024*1024)}MB",
                )

    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,https://localhost:3000",
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.get("/metrics", include_in_schema=False)
async def metrics() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=os.getenv("HOST", "127.0.0.1"), port=8000, reload=True)
