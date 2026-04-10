from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.modules.example.models import ExampleItemModel


def test_example_route_returns_database_items(client: TestClient, db_session: Session) -> None:
    db_session.add_all(
        [
            ExampleItemModel(id="hello", label="Hello template"),
            ExampleItemModel(id="customize", label="Customize me"),
        ]
    )
    db_session.commit()

    response = client.get("/api/example")

    assert response.status_code == 200
    assert response.json() == {
        "data": {
            "items": [
                {"id": "customize", "label": "Customize me"},
                {"id": "hello", "label": "Hello template"},
            ]
        }
    }
