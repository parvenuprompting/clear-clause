import asyncio
from types import SimpleNamespace

import pytest

from modules.analysis import service
from modules.analysis.modes import AnalysisMode


class FakeCompletions:
    def __init__(self, content):
        self.content = content

    async def create(self, **kwargs):
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content=self.content))]
        )


def fake_client(content):
    return SimpleNamespace(chat=SimpleNamespace(completions=FakeCompletions(content)))


def test_analyze_chunk_uses_async_provider_and_parses_json(monkeypatch):
    monkeypatch.setattr(
        service,
        "openai_client",
        fake_client('{"summary": ["ok"]}'),
    )

    result = asyncio.run(
        service._analyze_chunk("Een document", AnalysisMode.ALGEMENE_VOORWAARDEN)
    )

    assert result == {"summary": ["ok"]}


def test_analyze_chunk_rejects_empty_provider_content(monkeypatch):
    monkeypatch.setattr(service, "openai_client", fake_client(None))

    with pytest.raises(ValueError, match="geen analyse-inhoud"):
        asyncio.run(
            service._analyze_chunk("Een document", AnalysisMode.ALGEMENE_VOORWAARDEN)
        )


def test_merge_results_returns_single_result_without_provider_call(monkeypatch):
    def fail_if_called(**kwargs):
        raise AssertionError("provider should not be called for one result")

    monkeypatch.setattr(service.openai_client.chat.completions, "create", fail_if_called)
    result = {"summary": ["ok"]}

    merged = asyncio.run(
        service._merge_results([result], AnalysisMode.ALGEMENE_VOORWAARDEN)
    )

    assert merged == result
