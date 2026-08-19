from modules.analysis.modes import AnalysisMode
from modules.api.presentation import add_presentational_fields


def _result(citation: str) -> dict:
    return {
        "summary": [],
        "red_flags": [{
            "clause_citation": citation,
            "risk_type": "test",
            "explanation": "Uitleg",
            "severity_score": 5,
            "action_required": "Controleren",
        }],
        "suggestions": [],
        "privacy_score": 5,
        "privacy_motivatie": "Test",
    }


def test_source_match_returns_exact_offsets():
    result = add_presentational_fields(
        _result("De prijs kan op elk moment wijzigen."),
        AnalysisMode.ALGEMENE_VOORWAARDEN,
        "Intro. De prijs kan op elk moment wijzigen. Slot.",
    )

    match = result["red_flags"][0]["source_match"]
    assert match["status"] == "matched"
    assert match["start"] == 7
    assert match["end"] == 43
    assert result["red_flags"][0]["clause_citation"] == "De prijs kan op elk moment wijzigen."


def test_source_match_explicitly_reports_missing_passage():
    result = add_presentational_fields(
        _result("Deze passage staat niet in het document."),
        AnalysisMode.ALGEMENE_VOORWAARDEN,
        "Alleen een andere passage.",
    )

    match = result["red_flags"][0]["source_match"]
    assert match["status"] == "not_found"
    assert match["start"] is None
    assert match["end"] is None
    assert match["match_confidence"] == 0


def test_source_match_returns_uncertain_for_normalised_match():
    result = add_presentational_fields(
        _result("De prijs  kan  op elk  moment wijzigen."),
        AnalysisMode.ALGEMENE_VOORWAARDEN,
        "De prijs kan op elk moment wijzigen.",
    )

    match = result["red_flags"][0]["source_match"]
    assert match["status"] == "uncertain"
    assert match["match_confidence"] == 0.85
    assert match["start"] == 0
    assert match["end"] == len("De prijs kan op elk moment wijzigen.")
