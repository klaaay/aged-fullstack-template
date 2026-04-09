from app.modules.example.models import ExampleRecord
from app.modules.example.repository import list_example_records


def test_list_example_records_uses_module_owned_model() -> None:
    records = list_example_records()

    assert records == [
        ExampleRecord(id="hello", label="Hello template"),
        ExampleRecord(id="customize", label="Customize me"),
    ]
