from prometheus_client import Counter, Histogram


openai_tokens_total = Counter(
    "openai_tokens_total",
    "Total OpenAI tokens consumed by ClearClause",
    ["model", "token_type"],
)
http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests handled by ClearClause",
    ["method", "path", "status"],
)
http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "path"],
)


def record_http_request(method: str, path: str, status: int, duration_seconds: float) -> None:
    http_requests_total.labels(method=method, path=path, status=str(status)).inc()
    http_request_duration_seconds.labels(method=method, path=path).observe(duration_seconds)


def record_openai_usage(response, model: str, operation: str) -> dict[str, int | str]:
    usage = getattr(response, "usage", None)
    if usage is None:
        return {}

    values: dict[str, int | str] = {
        "prompt": int(getattr(usage, "prompt_tokens", 0) or 0),
        "completion": int(getattr(usage, "completion_tokens", 0) or 0),
        "total": int(getattr(usage, "total_tokens", 0) or 0),
    }
    for token_type, count in values.items():
        if not isinstance(count, int):
            continue
        openai_tokens_total.labels(model=model, token_type=token_type).inc(count)
    values["operation"] = operation
    return values
