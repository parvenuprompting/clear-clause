from typing import Optional

from pydantic import BaseModel, Field

from modules.chat.engine import ChatMessage


class DocumentRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500_000, description="Te analyseren tekst")
    document_name: str = Field(default="Onbekend Document", max_length=255, description="Naam van het document")
    mode: str = Field(default="algemene_voorwaarden", min_length=1, description="Analyse modus")
    context: Optional[str] = Field(default=None, max_length=50_000, description="Extra context (voor reactie brief mode)")


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4_000)
    context_text: str = Field(min_length=1, max_length=100_000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
