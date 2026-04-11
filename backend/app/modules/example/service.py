from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.example.models import ExampleItemModel
from app.modules.example.schemas import ExampleItem


def list_example_items(session: Session) -> list[dict[str, str]]:
    records = session.scalars(
        select(ExampleItemModel).order_by(ExampleItemModel.id.asc())
    ).all()
    return [ExampleItem.model_validate(record).model_dump() for record in records]
