from collections.abc import Generator

from app.db.session import SessionLocal


def get_db_session() -> Generator[object, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
