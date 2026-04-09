from fastapi import APIRouter, FastAPI

from app.modules.example.router import router as example_router
from app.modules.health.router import router as health_router


def register_routes(app: FastAPI) -> None:
    api_router = APIRouter(prefix="/api")
    api_router.include_router(health_router)
    api_router.include_router(example_router)
    app.include_router(api_router)
