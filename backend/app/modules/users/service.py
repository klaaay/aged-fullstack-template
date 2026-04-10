from sqlalchemy import inspect
from sqlalchemy.orm import Session

from app.modules.users.repository import create_user, get_user_by_email
from app.platform.config.settings import settings
from app.platform.security.passwords import hash_password


def ensure_default_admin_user(session: Session) -> None:
    inspector = inspect(session.bind)

    if not inspector.has_table("users"):
        return

    if get_user_by_email(session, settings.admin_email):
        return

    create_user(
        session,
        email=settings.admin_email,
        password_hash=hash_password(settings.admin_password),
        role="admin",
    )
    session.commit()
