from enum import Enum

class AnalysisMode(Enum):
    """
    Verschillende analyse modi voor ClearClause.
    Elke mode heeft eigen prompt, lexicon en output schema.
    """
    ALGEMENE_VOORWAARDEN = "algemene_voorwaarden"
    PRIVACY_BELEID = "privacy_beleid"
    GEBRUIKERSVOORWAARDEN = "gebruikersvoorwaarden"
    BRIEVEN_ANALYSE = "brieven_analyse"
    REACTIE_BRIEF = "reactie_brief"

# Mode metadata voor UI display
MODE_METADATA = {
    AnalysisMode.ALGEMENE_VOORWAARDEN: {
        "naam": "Algemene Voorwaarden",
        "beschrijving": "Analyse van T&C's met focus op Dark Patterns",
        "icon": "FileText"
    },
    AnalysisMode.PRIVACY_BELEID: {
        "naam": "Privacy Beleid",
        "beschrijving": "GDPR compliance en data processing analyse",
        "icon": "Shield"
    },
    AnalysisMode.GEBRUIKERSVOORWAARDEN: {
        "naam": "Gebruikersvoorwaarden",
        "beschrijving": "User rights en account policies",
        "icon": "Users"
    },
    AnalysisMode.BRIEVEN_ANALYSE: {
        "naam": "Brieven Analyse",
        "beschrijving": "Sentiment, urgentie en juridische claims",
        "icon": "Mail"
    },
    AnalysisMode.REACTIE_BRIEF: {
        "naam": "Reactie Brief Generator",
        "beschrijving": "Professionele reactie brief opstellen",
        "icon": "PenTool"
    }
}
