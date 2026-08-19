import json
import logging
import os
import sys
from datetime import datetime, timezone


LOGGER_NAME = "clearclause"


class JsonFormatter(logging.Formatter):
    """Emit compact JSON log records for container-friendly aggregation."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        context_keys = {
            "chunk_count",
            "chunk_number",
            "content_type",
            "document_name",
            "document_filename",
            "environment",
            "mode",
            "token_count",
        }
        context = {
            key: record.__dict__[key]
            for key in context_keys
            if key in record.__dict__
        }
        if context:
            payload["context"] = context
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def configure_logging() -> None:
    logger = logging.getLogger(LOGGER_NAME)
    if logger.handlers:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())
    logger.propagate = False


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"{LOGGER_NAME}.{name}")
