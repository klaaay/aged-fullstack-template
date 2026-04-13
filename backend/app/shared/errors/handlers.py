import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.shared.errors.exceptions import AppError

logger = logging.getLogger(__name__)


def _format_validation_error(exc: RequestValidationError) -> str:
    parts: list[str] = []

    for item in exc.errors():
        location = ".".join(str(value) for value in item.get("loc", []))
        message = item.get("msg", "invalid input")
        parts.append(f"{location}: {message}" if location else message)

    return "; ".join(parts) or "request validation failed"


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        logger.info(
            "handled application error",
            extra={
                "path": str(request.url.path),
                "status_code": exc.status_code,
                "error_type": exc.error_type,
            },
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"type": exc.error_type, "message": exc.message}},
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        logger.info(
            "handled validation error",
            extra={"path": str(request.url.path), "errors": exc.errors()},
        )
        return JSONResponse(
            status_code=400,
            content={
                "error": {
                    "type": "validation_error",
                    "message": _format_validation_error(exc),
                }
            },
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled server error on %s", request.url.path, exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "type": "internal_error",
                    "message": "internal server error",
                }
            },
        )
