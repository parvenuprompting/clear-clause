import os

from openai import AsyncOpenAI
from modules.shared.config import OPENAI_BASE_URL


openai_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=OPENAI_BASE_URL,
    timeout=float(os.getenv("OPENAI_TIMEOUT", "30")),
    max_retries=int(os.getenv("OPENAI_MAX_RETRIES", "2")),
)
