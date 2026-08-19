from modules.auth.rate_limiter import InMemoryRateLimiter


def test_rate_limiter_allows_only_the_configured_number_of_requests():
    limiter = InMemoryRateLimiter(limit=2)

    assert limiter.check_limit("client") is True
    assert limiter.check_limit("client") is True
    assert limiter.check_limit("client") is False


def test_rate_limiter_tracks_clients_independently():
    limiter = InMemoryRateLimiter(limit=1)

    assert limiter.check_limit("client-a") is True
    assert limiter.check_limit("client-a") is False
    assert limiter.check_limit("client-b") is True
