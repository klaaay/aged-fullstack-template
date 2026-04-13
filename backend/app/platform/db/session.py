from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.platform.config.settings import settings

_engine = None
_session_factory = None


def _get_connect_args() -> dict[str, object]:
    if settings.database_url.startswith("sqlite"):
        return {"check_same_thread": False}

    return {}


def get_engine():
    global _engine

    if _engine is None:
        _engine = create_engine(
            settings.database_url,
            future=True,
            connect_args=_get_connect_args(),
        )

    return _engine


def get_session_factory():
    global _session_factory

    if _session_factory is None:
        _session_factory = sessionmaker(
            bind=get_engine(),
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    return _session_factory


def get_db_session() -> Generator[Session, None, None]:
    session = get_session_factory()()
    try:
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def reset_db_runtime() -> None:
    global _engine
    global _session_factory

    if _engine is not None:
        _engine.dispose()

    _engine = None
    _session_factory = None


engine = get_engine()
SessionLocal = get_session_factory()
