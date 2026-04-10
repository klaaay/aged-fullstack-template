from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.modules.users.service import ensure_default_admin_user
from app.platform.db.session import get_session_factory
from app.platform.integrations import create_cache_client


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    cache = create_cache_client()

    session = get_session_factory()()
    try:
        ensure_default_admin_user(session)
    finally:
        session.close()

    try:
        yield
    finally:
        cache.close()
