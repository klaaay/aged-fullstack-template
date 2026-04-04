from fastapi import APIRouter

from app.core.config import settings
from app.modules.example.router import router as example_router

router = APIRouter(prefix="/api")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.project_name}


router.include_router(example_router)
