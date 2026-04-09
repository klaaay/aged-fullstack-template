class AppError(Exception):
    def __init__(self, *, error_type: str, message: str, status_code: int) -> None:
        super().__init__(message)
        self.error_type = error_type
        self.message = message
        self.status_code = status_code
