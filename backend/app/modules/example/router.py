from fastapi import APIRouter

from app.modules.example.service import list_example_items as list_example_items_from_service

router = APIRouter()


@router.get("/example")
def list_example_items() -> dict[str, list[dict[str, str]]]:
    return {"items": list_example_items_from_service()}
