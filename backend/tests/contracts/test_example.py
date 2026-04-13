def test_example_route_returns_database_items(client) -> None:
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


def test_example_route_rejects_invalid_pagination(client) -> None:
    response = client.get("/api/example?page=0")

    assert response.status_code == 400
    assert response.json()["error"]["type"] == "validation_error"
