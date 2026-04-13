from app.modules.users.repository import get_user_by_email
from app.modules.users.service import ensure_default_admin_user
from app.platform.config.settings import settings
from app.platform.security.passwords import hash_password, verify_password


def test_ensure_default_admin_user_creates_admin_once(db_session) -> None:
    ensure_default_admin_user(db_session)
    ensure_default_admin_user(db_session)

    admin = get_user_by_email(db_session, settings.admin_email)

    assert admin is not None
    assert admin.role == "admin"


def test_hash_password_uses_argon2() -> None:
    password_hash = hash_password("password123")

    assert password_hash != "password123"
    assert password_hash.startswith("$argon2")
    assert verify_password("password123", password_hash) is True
