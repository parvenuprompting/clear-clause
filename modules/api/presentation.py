import hashlib
import re
from typing import Any

from modules.analysis.modes import AnalysisMode


def _normalise_for_match(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip().casefold()


def _source_match(citation: str, source_text: str, index: int) -> dict[str, Any]:
    passage_id = "passage-" + hashlib.sha256(f"{index}:{citation}".encode("utf-8")).hexdigest()[:12]
    if not citation or not source_text:
        return {"passage_id": passage_id, "status": "not_found", "start": None, "end": None, "match_confidence": 0, "matched_text": None}

    exact_start = source_text.find(citation)
    if exact_start >= 0:
        return {"passage_id": passage_id, "status": "matched", "start": exact_start, "end": exact_start + len(citation), "match_confidence": 1, "matched_text": source_text[exact_start:exact_start + len(citation)]}

    # Whitespace often changes during PDF extraction. Treat this as uncertain,
    # but only expose offsets when the normalised citation maps unambiguously.
    normalised_citation = _normalise_for_match(citation)
    if normalised_citation:
        normalised_source: list[str] = []
        source_positions: list[int] = []
        previous_was_space = False
        for position, character in enumerate(source_text):
            if character.isspace():
                if not previous_was_space and normalised_source:
                    normalised_source.append(" ")
                    source_positions.append(position)
                previous_was_space = True
                continue
            normalised_source.append(character.casefold())
            source_positions.append(position)
            previous_was_space = False
        source_value = "".join(normalised_source)
        leading = len(source_value) - len(source_value.lstrip())
        source_value = source_value.strip()
        source_positions = source_positions[leading:leading + len(source_value)]
        found_at = source_value.find(normalised_citation)
        if found_at >= 0:
            start = source_positions[found_at]
            end_index = found_at + len(normalised_citation) - 1
            end = source_positions[end_index] + 1
            return {"passage_id": passage_id, "status": "uncertain", "start": start, "end": end, "match_confidence": 0.85, "matched_text": source_text[start:end]}

    return {"passage_id": passage_id, "status": "not_found", "start": None, "end": None, "match_confidence": 0, "matched_text": None}


def _add_source_matches(result: dict[str, Any], source_text: str | None) -> None:
    for index, flag in enumerate(result.get("red_flags", [])):
        if isinstance(flag, dict):
            flag["source_match"] = _source_match(str(flag.get("clause_citation", "")), source_text or "", index)


def add_presentational_fields(result: dict[str, Any], mode: AnalysisMode, source_text: str | None = None) -> dict[str, Any]:
    """Voeg een stabiele dashboardvorm toe zonder mode-specifieke data te verliezen."""
    result = {**result, "mode": mode.value}

    if mode == AnalysisMode.PRIVACY_BELEID:
        result.setdefault("summary", result.get("compliance_gaps", [])[:5])
        result.setdefault("red_flags", [
            {
                "clause_citation": "GDPR compliance gap",
                "risk_type": "compliance_gap",
                "explanation": gap,
                "severity_score": 5,
                "action_required": (result.get("recommendations", []) + ["Laat dit onderdeel aanvullen."])[index],
            }
            for index, gap in enumerate(result.get("compliance_gaps", []))
        ])
        result.setdefault("suggestions", result.get("recommendations", []))
        result.setdefault("privacy_score", result.get("gdpr_compliance_score", 0))
        result.setdefault("privacy_motivatie", f"GDPR-compliance score: {result.get('gdpr_compliance_score', 0)}/10")
    elif mode == AnalysisMode.GEBRUIKERSVOORWAARDEN:
        result.setdefault("summary", result.get("restrictions", [])[:5])
        result["red_flags"] = [
            {
                "clause_citation": "Gebruikersvoorwaarden",
                "risk_type": "user_rights",
                "explanation": flag,
                "severity_score": 5,
                "action_required": (result.get("recommendations", []) + ["Laat deze clausule juridisch beoordelen."])[index],
            }
            for index, flag in enumerate(result.get("red_flags", []))
            if isinstance(flag, str)
        ]
        result.setdefault("suggestions", result.get("recommendations", []))
        result.setdefault("privacy_score", result.get("fairness_score", 0))
        result.setdefault("privacy_motivatie", f"Fairness score: {result.get('fairness_score', 0)}/10")
    elif mode == AnalysisMode.BRIEVEN_ANALYSE:
        result.setdefault("summary", result.get("action_points", [])[:5])
        result.setdefault("red_flags", [
            {
                "clause_citation": "Juridische claim",
                "risk_type": "legal_claim",
                "explanation": claim,
                "severity_score": result.get("urgency_level", 5),
                "action_required": result.get("response_strategy", "Laat deze claim controleren."),
            }
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

    _add_source_matches(result, source_text)
    return result
