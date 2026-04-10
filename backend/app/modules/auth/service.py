from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import Response
from sqlalchemy.orm import Session

from app.modules.auth.schemas import LoginInput, RegisterInput
from app.modules.users.repository import create_user, get_user_by_email, get_user_by_id
from app.platform.integrations.refresh_sessions import (
    delete_refresh_session,
    get_refresh_session,
    replace_refresh_session,
    save_refresh_session,
)
from app.platform.security.jwt import decode_token, issue_access_token, issue_refresh_token
from app.platform.security.passwords import hash_password, verify_password
from app.shared.errors.exceptions import AppError, UnauthorizedError


def register_user(payload: RegisterInput, session: Session) -> dict[str, str]:
    if get_user_by_email(session, payload.email):
        raise AppError(
            error_type="conflict",
            message="该邮箱已注册",
            status_code=409,
        )

    user = create_user(
        session,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="user",
    )
    session.commit()

    return {"id": user.id, "email": user.email, "role": user.role}


def login_user(payload: LoginInput, session: Session, response: Response) -> dict[str, object]:
    user = get_user_by_email(session, payload.email)

    if user is None or not verify_password(payload.password, user.password_hash):
        raise AppError(
            error_type="unauthorized",
            message="邮箱或密码错误",
            status_code=401,
        )

    access_token = issue_access_token(user.id, user.role)
    session_id = str(uuid4())
    refresh_token, refresh_jti, expires_at = issue_refresh_token(user.id, session_id)
    save_refresh_session(
        session_id=session_id,
        user_id=user.id,
        refresh_token_jti=refresh_jti,
        expires_at=expires_at,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        path="/api/auth/refresh",
        expires=int(expires_at.timestamp()),
    )

    return {
        "access_token": access_token,
        "user": {"id": user.id, "email": user.email, "role": user.role},
        "expires_at": datetime.now(timezone.utc).isoformat(),
    }


def refresh_access_token(refresh_token: str | None, response: Response, session: Session) -> dict[str, object]:
    if not refresh_token:
        raise UnauthorizedError("刷新令牌不存在，请重新登录")

    payload = decode_token(refresh_token)

    if payload.get("type") != "refresh":
        raise UnauthorizedError("刷新令牌无效，请重新登录")

    session_id = payload.get("sid")
    user_id = payload.get("sub")
    refresh_jti = payload.get("jti")

    if not isinstance(session_id, str) or not isinstance(user_id, str) or not isinstance(refresh_jti, str):
        raise UnauthorizedError("刷新令牌无效，请重新登录")

    session_record = get_refresh_session(session_id)

    if session_record is None or session_record["refresh_token_jti"] != refresh_jti:
        raise UnauthorizedError("登录已失效，请重新登录")

    user = get_user_by_id(session, user_id)

    if user is None:
        raise UnauthorizedError("用户不存在或已失效")

    access_token = issue_access_token(user.id, user.role)
    new_refresh_token, new_refresh_jti, expires_at = issue_refresh_token(user.id, session_id)
    replace_refresh_session(
        session_id=session_id,
        user_id=user.id,
        refresh_token_jti=new_refresh_jti,
        expires_at=expires_at,
    )
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        samesite="lax",
        path="/api/auth/refresh",
        expires=int(expires_at.timestamp()),
    )
    return {
        "access_token": access_token,
        "user": {"id": user.id, "email": user.email, "role": user.role},
    }


def logout_user(refresh_token: str | None, response: Response) -> None:
    if refresh_token:
        payload = decode_token(refresh_token)
        session_id = payload.get("sid")

        if isinstance(session_id, str):
            delete_refresh_session(session_id)

    response.delete_cookie(key="refresh_token", path="/api/auth/refresh")
