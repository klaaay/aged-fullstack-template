from fastapi.testclient import TestClient

from app.bootstrap.app import create_app


def test_create_app_registers_template_routes() -> None:
    app = create_app()
    client = TestClient(app)

    assert client.get("/api/health").status_code == 200
    assert client.get("/api/example").status_code == 200
