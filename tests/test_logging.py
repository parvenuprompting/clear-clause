import json
import logging

from modules.shared.logging import JsonFormatter


def test_json_formatter_includes_structured_context():
    record = logging.LogRecord(
        name="clearclause.test",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="Analysis started",
        args=(),
        exc_info=None,
    )
    record.mode = "privacy_beleid"
    record.token_count = 42

    payload = json.loads(JsonFormatter().format(record))

    assert payload["level"] == "INFO"
    assert payload["message"] == "Analysis started"
    assert payload["context"] == {"mode": "privacy_beleid", "token_count": 42}
