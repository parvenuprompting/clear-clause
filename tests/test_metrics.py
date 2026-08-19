from types import SimpleNamespace

from modules.shared.metrics import record_openai_usage


def test_record_openai_usage_returns_token_breakdown():
    response = SimpleNamespace(
        usage=SimpleNamespace(prompt_tokens=10, completion_tokens=4, total_tokens=14)
    )

    usage = record_openai_usage(response, "gpt-4o", "analysis")

    assert usage == {"prompt": 10, "completion": 4, "total": 14, "operation": "analysis"}
