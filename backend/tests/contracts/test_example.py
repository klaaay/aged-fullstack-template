def test_example_route_returns_database_items(client) -> None:
    response = client.get("/api/example")

    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {"id": "customize", "label": "Customize me"},
            {"id": "hello", "label": "Hello template"},
        ]
    }
