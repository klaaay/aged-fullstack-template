import uvicorn

from app.bootstrap.app import create_app
from app.platform.config.settings import settings

app = create_app()


def run_dev() -> None:
    uvicorn.run("app.main:app", host="127.0.0.1", port=settings.api_port, reload=True)


def run() -> None:
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.api_port)
