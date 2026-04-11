from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.modules.example.service import list_example_items
from app.platform.db import get_db

router = APIRouter()


@router.get("/example")
def get_example_items(session: Session = Depends(get_db)) -> dict[str, list[dict[str, str]]]:
    return {"items": list_example_items(session)}
