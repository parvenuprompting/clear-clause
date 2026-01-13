from pydantic import BaseModel, Field
from typing import List, Optional

class RedFlag(BaseModel):
    clause_citation: str = Field(..., description="De exacte tekst van de problematische clausule.")
    risk_type: str = Field(..., description="Het type risico, exact zoals gedefinieerd in het DARK_PATTERN_LEXICON.")
    explanation: str = Field(..., description="Een begrijpelijke uitleg voor de gebruiker.")
    severity_score: int = Field(..., ge=1, le=10, description="De ernst van het risico van 1 tot 10.")

class AnalysisResponse(BaseModel):
    summary: List[str] = Field(..., max_items=5, description="Een samenvatting van het document in maximaal 5 punten.")
    red_flags: List[RedFlag] = Field(..., description="Lijst van gedetecteerde risico's.")
    suggestions: List[str] = Field(..., description="Concrete suggesties voor verbetering of onderhandeling.")
    privacy_score: int = Field(..., ge=0, le=10, description="Een score voor de privacyvriendelijkheid.")
    privacy_motivatie: str = Field(..., description="Motivatie voor de gegeven privacy score.")
