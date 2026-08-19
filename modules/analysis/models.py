from pydantic import BaseModel, Field
from typing import List, Optional

# ============================================================================
# Algemene Voorwaarden (bestaand)
# ============================================================================

class RedFlag(BaseModel):
    clause_citation: str = Field(description="Exacte tekst van de problematische clausule")
    risk_type: str = Field(description="Type risico uit het Dark Pattern lexicon")
    explanation: str = Field(description="Begrijpelijke uitleg van het risico")
    severity_score: int = Field(ge=1, le=10, description="Ernst score 1-10")
    action_required: str = Field(description="Concrete actie die de gebruiker nu kan nemen")

class AnalysisResponse(BaseModel):
    summary: List[str] = Field(max_length=5, description="Maximaal 5 kernpunten")
    red_flags: List[RedFlag] = Field(description="Gedetecteerde rode vlaggen")
    suggestions: List[str] = Field(description="Concrete actie suggesties")
    privacy_score: int = Field(ge=0, le=10, description="Privacy score 0-10")
    privacy_motivatie: str = Field(description="Motivatie voor de privacy score")

# ============================================================================
# Privacy Beleid
# ============================================================================

class PrivacyAnalysisResponse(BaseModel):
    gdpr_compliance_score: int = Field(ge=0, le=10, description="GDPR compliance score 0-10")
    data_categories: List[str] = Field(description="Verzamelde data categorieën")
    third_parties: List[str] = Field(description="Externe partijen met data toegang")
    user_rights: List[str] = Field(description="Expliciet genoemde gebruikersrechten")
    recommendations: List[str] = Field(description="Concrete verbeterpunten")
    compliance_gaps: List[str] = Field(description="Ontbrekende GDPR elementen")
    retention_policies: Optional[str] = Field(default=None, description="Bewaartermijnen samenvatting")

# ============================================================================
# Gebruikersvoorwaarden
# ============================================================================

class UserRightsFlag(BaseModel):
    right_name: str = Field(description="Naam van het gebruikersrecht")
    description: str = Field(description="Omschrijving van het recht")
    is_present: bool = Field(description="Of het recht expliciet vermeld is")

class GebruikersvoorwaardenResponse(BaseModel):
    user_rights: List[UserRightsFlag] = Field(description="Analyse van gebruikersrechten")
    restrictions: List[str] = Field(description="Beperkingen op gebruikersgedrag")
    termination_policy: str = Field(description="Samenvatting opzegvoorwaarden")
    fairness_score: int = Field(ge=0, le=10, description="Balans platform vs gebruiker 0-10")
    red_flags: List[str] = Field(description="Oneerlijke of ongebruikelijke clausules")
    recommendations: List[str] = Field(description="Verbeterpunten voor gebruikersbescherming")

# ============================================================================
# Brieven Analyse
# ============================================================================

class LetterAnalysisResponse(BaseModel):
    letter_type: str = Field(description="Type brief (aanmaning, bezwaar, etc.)")
    sentiment: str = Field(description="Algemene toon van de brief")
    urgency_level: int = Field(ge=1, le=10, description="Urgentie 1-10")
    action_points: List[str] = Field(description="Gevraagde acties")
    deadlines: List[str] = Field(description="Vermelde termijnen en data")
    legal_claims: List[str] = Field(description="Juridische eisen")
    risk_assessment: str = Field(description="Potentiële juridische risico's")
    response_strategy: str = Field(description="Aanbevolen reactie strategie")

# ============================================================================
# Reactie Brief Generator
# ============================================================================

class ResponseLetterOutput(BaseModel):
    draft_letter: str = Field(description="Volledige reactie brief tekst")
    tone: str = Field(description="Gebruikte toon (formeel, zakelijk, assertief, diplomatiek)")
    key_points: List[str] = Field(description="Kernpunten van de reactie")
    next_steps: List[str] = Field(description="Geadviseerde vervolgstappen")
    legal_review_needed: bool = Field(description="Of juridische review aangeraden is")
