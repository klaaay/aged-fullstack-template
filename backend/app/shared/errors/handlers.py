from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.shared.errors.exceptions import AppError


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"type": exc.error_type, "message": exc.message}},
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={"error": {"type": "internal_error", "message": str(exc)}},
        )
