from app.modules.example.service import list_example_items


def test_list_example_items_returns_example_records() -> None:
    result = list_example_items()

    assert result == [
        {"id": "hello", "label": "Hello template"},
        {"id": "customize", "label": "Customize me"},
    ]
