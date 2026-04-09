from fastapi import FastAPI

from app.bootstrap.lifespan import lifespan
from app.bootstrap.routing import register_routes
from app.platform.config.settings import settings
from app.shared.errors.handlers import install_error_handlers


def create_app() -> FastAPI:
    app = FastAPI(title=settings.project_name, lifespan=lifespan)
    install_error_handlers(app)
    register_routes(app)
    return app
