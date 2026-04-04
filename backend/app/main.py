import uvicorn
from fastapi import FastAPI

from app.api.router import router as api_router
from app.core.config import settings
from app.core.errors import install_error_handlers

app = FastAPI(title=settings.project_name)
install_error_handlers(app)
app.include_router(api_router)


def run_dev() -> None:
    uvicorn.run("app.main:app", host="127.0.0.1", port=settings.api_port, reload=True)


def run() -> None:
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.api_port)
