from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.modules.example.service import list_example_items
from app.platform.db import get_db
from app.shared.http.response import success_response

router = APIRouter()


@router.get("/example")
def get_example_items(session: Session = Depends(get_db)) -> dict[str, Any]:
    return success_response({"items": list_example_items(session)})
