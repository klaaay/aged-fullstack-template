from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.platform.integrations import create_cache_client


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    cache = create_cache_client()
    try:
        yield
    finally:
        cache.close()
