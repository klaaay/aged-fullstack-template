from fastapi import APIRouter

router = APIRouter()


@router.get("/example")
def list_example_items() -> dict[str, list[dict[str, str]]]:
    return {
        "items": [
            {"id": "hello", "label": "Hello template"},
            {"id": "customize", "label": "Customize me"},
        ]
    }
