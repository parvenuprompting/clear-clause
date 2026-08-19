import os

from openai import AsyncOpenAI


openai_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    timeout=float(os.getenv("OPENAI_TIMEOUT", "30")),
    max_retries=int(os.getenv("OPENAI_MAX_RETRIES", "2")),
)
