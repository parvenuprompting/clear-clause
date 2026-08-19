import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from main import app
from modules.api import routes
from modules.api.models import ChatRequest, DocumentRequest
from modules.analysis.modes import AnalysisMode
from modules.api.presentation import add_presentational_fields


client = TestClient(app)


def test_health_and_modes_routes_are_registered():
    health = client.get("/health")
    modes = client.get("/modes")

    assert health.status_code == 200
    assert health.json()["status"] == "healthy"
    assert health.headers["x-request-id"]
    assert modes.status_code == 200
    assert len(modes.json()["modes"]) == 7


def test_analyze_rejects_unknown_mode_before_calling_provider():
    response = client.post(
        "/analyze",
        json={"text": "Een document", "mode": "onbekende_mode"},
    )

    assert response.status_code == 400
    assert "Ongeldige mode" in response.json()["detail"]


def test_analyze_hides_unexpected_provider_errors(monkeypatch):
    async def raise_provider_error(**kwargs):
        raise RuntimeError("internal provider secret")

    monkeypatch.setattr(routes, "analyze_document", raise_provider_error)
    response = client.post(
        "/analyze",
        json={"text": "Een document", "mode": "algemene_voorwaarden"},
    )

    assert response.status_code == 500
    assert response.json()["detail"] == "Analyse mislukt. Probeer het later opnieuw."
    assert "internal provider secret" not in response.text


def test_document_request_rejects_empty_text():
    with pytest.raises(ValidationError):
        DocumentRequest(text="")


def test_chat_request_rejects_unknown_message_role():
    with pytest.raises(ValidationError):
        ChatRequest(
            question="Wat staat hier?",
            context_text="Een document",
            history=[{"role": "unknown", "content": "test"}],  # type: ignore[list-item]
        )


def test_privacy_result_gets_dashboard_fields_without_losing_details():
    result = add_presentational_fields(
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
    assert result["red_flags"][0]["action_required"] == "Voeg een bewaartermijn toe"
    assert result["recommendations"] == ["Voeg een bewaartermijn toe"]


def test_response_letter_result_gets_safe_empty_risk_fields():
    result = add_presentational_fields(
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
