from __future__ import annotations

from datetime import datetime
import json

from app.platform.integrations.cache_client import get_cache_client


def _build_session_key(session_id: str) -> str:
    return f"refresh_session:{session_id}"


def save_refresh_session(
    *,
    session_id: str,
    user_id: str,
    refresh_token_jti: str,
    expires_at: datetime,
) -> None:
    client = get_cache_client()
    payload = {
        "session_id": session_id,
        "user_id": user_id,
        "refresh_token_jti": refresh_token_jti,
        "expires_at": expires_at.isoformat(),
    }
    ttl = max(int(expires_at.timestamp() - datetime.now(expires_at.tzinfo).timestamp()), 1)
    client.set(_build_session_key(session_id), json.dumps(payload), ex=ttl)


def get_refresh_session(session_id: str) -> dict[str, str] | None:
    client = get_cache_client()
    raw_value = client.get(_build_session_key(session_id))

    if raw_value is None:
        return None

    return json.loads(raw_value)


def delete_refresh_session(session_id: str) -> None:
    client = get_cache_client()
    client.delete(_build_session_key(session_id))


def replace_refresh_session(
    *,
    session_id: str,
    user_id: str,
    refresh_token_jti: str,
    expires_at: datetime,
) -> None:
    save_refresh_session(
        session_id=session_id,
        user_id=user_id,
        refresh_token_jti=refresh_token_jti,
        expires_at=expires_at,
    )
