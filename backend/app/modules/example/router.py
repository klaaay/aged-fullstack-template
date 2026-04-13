from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.modules.example.service import list_example_items
from app.platform.db.session import get_db_session
from app.shared.http.response import success_response

router = APIRouter()


@router.get("/example")
def get_example_items(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_db_session),
) -> dict[str, Any]:
    return success_response({"items": list_example_items(session, page=page, limit=limit)})
