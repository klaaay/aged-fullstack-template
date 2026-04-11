from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import app
from app.shared.errors.handlers import install_error_handlers


def test_health_returns_template_status() -> None:
    client = TestClient(app)

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "data": {
            "status": "ok",
            "service": "aged-fullstack-template",
        }
    }


def test_unexpected_error_uses_stable_internal_error_payload() -> None:
    error_app = FastAPI()
    install_error_handlers(error_app)

    @error_app.get("/boom")
    def boom() -> dict[str, str]:
        raise RuntimeError("secret stack detail")

    client = TestClient(error_app, raise_server_exceptions=False)

    response = client.get("/boom")

    assert response.status_code == 500
    assert response.json() == {
        "error": {
            "type": "internal_error",
            "message": "internal server error",
        }
    }
