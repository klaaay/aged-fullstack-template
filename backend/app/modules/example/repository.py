from app.db.models.example import ExampleRecord


def list_example_records() -> list[ExampleRecord]:
    return [
        ExampleRecord(id="hello", label="Hello template"),
        ExampleRecord(id="customize", label="Customize me"),
    ]
