from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

import fakeredis
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.platform.config.settings import settings
from app.platform.db.base import Base
from app.platform.db import model_registry  # noqa: F401
from app.platform.db.session import get_engine, get_session_factory, reset_db_runtime
from app.platform.integrations.cache_client import reset_cache_client


@pytest.fixture(autouse=True)
def setup_test_environment(tmp_path: Path) -> Iterator[None]:
    original_database_url = settings.database_url
    original_redis_url = settings.redis_url

    settings.database_url = f"sqlite+pysqlite:///{tmp_path / 'test.db'}"
    settings.redis_url = "redis://fake-test"

    reset_db_runtime()
    reset_cache_client(fakeredis.FakeStrictRedis(decode_responses=True))

    Base.metadata.create_all(bind=get_engine())

    yield

    Base.metadata.drop_all(bind=get_engine())
    reset_db_runtime()
    reset_cache_client(None)

    settings.database_url = original_database_url
    settings.redis_url = original_redis_url


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db_session() -> Iterator[Session]:
    session = get_session_factory()()
    try:
        yield session
    finally:
        session.close()
