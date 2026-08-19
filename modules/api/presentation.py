from typing import Any

from modules.analysis.modes import AnalysisMode


def add_presentational_fields(result: dict[str, Any], mode: AnalysisMode) -> dict[str, Any]:
    """Voeg een stabiele dashboardvorm toe zonder mode-specifieke data te verliezen."""
    result = {**result, "mode": mode.value}

    if mode == AnalysisMode.PRIVACY_BELEID:
        result.setdefault("summary", result.get("compliance_gaps", [])[:5])
        result.setdefault("red_flags", [
            {"clause_citation": "GDPR compliance gap", "risk_type": "compliance_gap", "explanation": gap, "severity_score": 5}
            for gap in result.get("compliance_gaps", [])
        ])
        result.setdefault("suggestions", result.get("recommendations", []))
        result.setdefault("privacy_score", result.get("gdpr_compliance_score", 0))
        result.setdefault("privacy_motivatie", f"GDPR-compliance score: {result.get('gdpr_compliance_score', 0)}/10")
    elif mode == AnalysisMode.GEBRUIKERSVOORWAARDEN:
        result.setdefault("summary", result.get("restrictions", [])[:5])
        result["red_flags"] = [
            {"clause_citation": "Gebruikersvoorwaarden", "risk_type": "user_rights", "explanation": flag, "severity_score": 5}
            for flag in result.get("red_flags", [])
            if isinstance(flag, str)
        ]
        result.setdefault("suggestions", result.get("recommendations", []))
        result.setdefault("privacy_score", result.get("fairness_score", 0))
        result.setdefault("privacy_motivatie", f"Fairness score: {result.get('fairness_score', 0)}/10")
    elif mode == AnalysisMode.BRIEVEN_ANALYSE:
        result.setdefault("summary", result.get("action_points", [])[:5])
        result.setdefault("red_flags", [
            {"clause_citation": "Juridische claim", "risk_type": "legal_claim", "explanation": claim, "severity_score": result.get("urgency_level", 5)}
            for claim in result.get("legal_claims", [])
        ])
        result.setdefault("suggestions", [result.get("response_strategy", "")])
        result.setdefault("privacy_score", result.get("urgency_level", 0))
        result.setdefault("privacy_motivatie", f"Urgentieniveau: {result.get('urgency_level', 0)}/10")
    elif mode == AnalysisMode.REACTIE_BRIEF:
        result.setdefault("summary", result.get("key_points", [])[:5])
        result.setdefault("red_flags", [])
        result.setdefault("suggestions", result.get("next_steps", []))
        result.setdefault("privacy_score", 0)
        result.setdefault("privacy_motivatie", "Dit resultaat is een conceptbrief en geen risicoscore.")

    return result
