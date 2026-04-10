from app.modules.users.repository import get_user_by_email
from app.modules.users.service import ensure_default_admin_user
from app.platform.config.settings import settings


def test_ensure_default_admin_user_creates_admin_once(db_session) -> None:
    ensure_default_admin_user(db_session)
    ensure_default_admin_user(db_session)

    admin = get_user_by_email(db_session, settings.admin_email)

    assert admin is not None
    assert admin.role == "admin"
