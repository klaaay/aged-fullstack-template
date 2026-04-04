from fastapi import APIRouter

from app.modules.health.router import router as health_router
from app.modules.example.router import router as example_router

router = APIRouter(prefix="/api")

router.include_router(health_router)
router.include_router(example_router)
