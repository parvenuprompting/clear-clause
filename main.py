import os

from dotenv import load_dotenv

load_dotenv()

from modules.shared.logging import configure_logging

configure_logging()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from modules.api.config import MAX_REQUEST_SIZE
from modules.api.routes import router


app = FastAPI(title="ClearClause Suite API")


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
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=os.getenv("HOST", "127.0.0.1"), port=8000, reload=True)
