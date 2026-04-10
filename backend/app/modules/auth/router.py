from fastapi import APIRouter, Cookie, Depends, Response, status
from sqlalchemy.orm import Session

from app.modules.auth.dependencies import get_current_user, require_admin
from app.modules.auth.schemas import LoginInput, RegisterInput
from app.modules.auth.service import login_user, logout_user, refresh_access_token, register_user
from app.modules.users.models import UserRecord
from app.platform.db.session import get_db_session
from app.shared.http.response import success_response

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterInput,
    session: Session = Depends(get_db_session),
) -> dict[str, object]:
    return success_response(register_user(payload, session))


@router.post("/login")
def login(
    payload: LoginInput,
    response: Response,
    session: Session = Depends(get_db_session),
) -> dict[str, object]:
    return success_response(login_user(payload, session, response))


@router.post("/refresh")
def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_db_session),
) -> dict[str, object]:
    return success_response(refresh_access_token(refresh_token, response, session))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
) -> Response:
    logout_user(refresh_token, response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me")
def me(current_user: UserRecord = Depends(get_current_user)) -> dict[str, object]:
    return success_response(
        {"id": current_user.id, "email": current_user.email, "role": current_user.role}
    )


@router.get("/admin-entry")
def admin_entry(_: UserRecord = Depends(require_admin)) -> dict[str, object]:
    return success_response({"message": "admin access granted"})
