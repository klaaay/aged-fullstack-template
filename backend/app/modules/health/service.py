from app.platform.config.settings import settings


def get_health_payload() -> dict[str, str]:
    return {"status": "ok", "service": settings.project_name}
