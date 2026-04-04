from fastapi import APIRouter

from app.modules.health.service import get_health_payload

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return get_health_payload()
