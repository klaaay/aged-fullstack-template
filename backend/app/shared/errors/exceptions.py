class AppError(Exception):
    def __init__(self, *, error_type: str, message: str, status_code: int) -> None:
        super().__init__(message)
        self.error_type = error_type
        self.message = message
        self.status_code = status_code


class ValidationError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(error_type="validation_error", message=message, status_code=422)


class UnauthorizedError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(error_type="unauthorized", message=message, status_code=401)


class ForbiddenError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(error_type="forbidden", message=message, status_code=403)


class NotFoundError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(error_type="not_found", message=message, status_code=404)


class ConflictError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(error_type="conflict", message=message, status_code=409)
