import pytest
from pydantic import ValidationError

from main import ChatRequest, DocumentRequest, _add_presentational_fields
from modules.analysis.modes import AnalysisMode


def test_document_request_rejects_empty_text():
    with pytest.raises(ValidationError):
        DocumentRequest(text="")


def test_chat_request_rejects_unknown_message_role():
    with pytest.raises(ValidationError):
        ChatRequest(
            question="Wat staat hier?",
            context_text="Een document",
            history=[{"role": "unknown", "content": "test"}],
        )


def test_privacy_result_gets_dashboard_fields_without_losing_details():
    result = _add_presentational_fields(
        {
            "gdpr_compliance_score": 7,
            "compliance_gaps": ["Geen bewaartermijn gevonden"],
            "recommendations": ["Voeg een bewaartermijn toe"],
        },
        AnalysisMode.PRIVACY_BELEID,
    )

    assert result["mode"] == "privacy_beleid"
    assert result["privacy_score"] == 7
    assert result["summary"] == ["Geen bewaartermijn gevonden"]
    assert result["red_flags"][0]["risk_type"] == "compliance_gap"
    assert result["recommendations"] == ["Voeg een bewaartermijn toe"]


def test_response_letter_result_gets_safe_empty_risk_fields():
    result = _add_presentational_fields(
        {
            "draft_letter": "Geachte heer/mevrouw, ...",
            "key_points": ["Vraag om toelichting"],
            "next_steps": ["Laat de brief controleren"],
        },
        AnalysisMode.REACTIE_BRIEF,
    )

    assert result["summary"] == ["Vraag om toelichting"]
    assert result["red_flags"] == []
    assert result["suggestions"] == ["Laat de brief controleren"]
    assert result["draft_letter"].startswith("Geachte")
