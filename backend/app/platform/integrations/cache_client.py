from redis import Redis

from app.platform.config.settings import settings

_cache_client: Redis | None = None


def get_cache_client() -> Redis:
    global _cache_client

    if _cache_client is None:
        _cache_client = Redis.from_url(settings.redis_url, decode_responses=True)

    return _cache_client


def reset_cache_client(client: Redis | None) -> None:
    global _cache_client
    _cache_client = client


def create_cache_client() -> Redis:
    return get_cache_client()
