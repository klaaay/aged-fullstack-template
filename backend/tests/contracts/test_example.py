from fastapi.testclient import TestClient

from app.main import app


def test_example_route_returns_seed_payload() -> None:
    client = TestClient(app)

    response = client.get("/api/example")

    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {"id": "hello", "label": "Hello template"},
            {"id": "customize", "label": "Customize me"},
        ]
    }
