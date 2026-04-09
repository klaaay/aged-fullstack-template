from redis import Redis

from app.platform.config.settings import settings


def create_cache_client() -> Redis:
    return Redis.from_url(settings.redis_url)
