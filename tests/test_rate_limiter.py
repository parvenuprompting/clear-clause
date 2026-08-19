from modules.auth.rate_limiter import InMemoryRateLimiter, RedisRateLimiter


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


class FakeRedis:
    def __init__(self):
        self.values = {}
        self.expirations = {}

    def incr(self, key):
        self.values[key] = self.values.get(key, 0) + 1
        return self.values[key]

    def expire(self, key, seconds):
        self.expirations[key] = seconds
        return True


def test_redis_rate_limiter_uses_counter_and_expiration():
    redis = FakeRedis()
    limiter = RedisRateLimiter(redis, limit=2, window_seconds=60)

    assert limiter.check_limit("client") is True
    assert limiter.check_limit("client") is True
    assert limiter.check_limit("client") is False
    assert redis.expirations["clearclause:rate-limit:client"] == 60


def test_redis_rate_limiter_fails_open_when_redis_is_unavailable():
    class BrokenRedis:
        def incr(self, key):
            raise ConnectionError("redis unavailable")

    assert RedisRateLimiter(BrokenRedis(), limit=1).check_limit("client") is True
