from app.modules.example.repository import list_example_records
from app.modules.example.schemas import ExampleItem


def list_example_items() -> list[dict[str, str]]:
    records = list_example_records()
    items = [ExampleItem.model_validate(record.__dict__) for record in records]
    return [item.model_dump() for item in items]
