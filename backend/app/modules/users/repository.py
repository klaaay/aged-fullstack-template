from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.users.models import UserRecord


def get_user_by_email(session: Session, email: str) -> UserRecord | None:
    statement = select(UserRecord).where(UserRecord.email == email)
    return session.scalar(statement)


def get_user_by_id(session: Session, user_id: str) -> UserRecord | None:
    statement = select(UserRecord).where(UserRecord.id == user_id)
    return session.scalar(statement)


def create_user(session: Session, *, email: str, password_hash: str, role: str) -> UserRecord:
    user = UserRecord(email=email, password_hash=password_hash, role=role)
    session.add(user)
    session.flush()
    return user
