from typing import Any

from fastapi import APIRouter

from app.modules.health.service import get_health_payload
from app.shared.http.response import success_response

router = APIRouter()


@router.get("/health")
def health() -> dict[str, Any]:
    return success_response(get_health_payload())
