from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.modules.users.models import UserRecord
from app.modules.users.repository import get_user_by_id
from app.platform.db.session import get_db_session
from app.platform.security.jwt import decode_token
from app.shared.errors.exceptions import ForbiddenError, UnauthorizedError


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    session: Session = Depends(get_db_session),
) -> UserRecord:
    if authorization is None or not authorization.startswith("Bearer "):
        raise UnauthorizedError("请先登录")

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise UnauthorizedError("登录状态无效，请重新登录")

    user_id = payload.get("sub")

    if not isinstance(user_id, str):
        raise UnauthorizedError("登录状态无效，请重新登录")

    user = get_user_by_id(session, user_id)

    if user is None:
        raise UnauthorizedError("用户不存在或已失效")

    return user


def require_admin(current_user: UserRecord = Depends(get_current_user)) -> UserRecord:
    if current_user.role != "admin":
        raise ForbiddenError("仅管理员可执行该操作")

    return current_user
