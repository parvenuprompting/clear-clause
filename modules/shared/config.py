import os


# OpenRouter exposes the requested model through an OpenAI-compatible API.
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "openai/gpt-5.6-luna")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
