from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.example.models import ExampleItemModel
from app.modules.example.schemas import ExampleItem


def list_example_items(session: Session, *, page: int = 1, limit: int = 20) -> list[dict[str, str]]:
    offset = (page - 1) * limit
    records = session.scalars(
        select(ExampleItemModel).order_by(ExampleItemModel.id.asc()).offset(offset).limit(limit)
    ).all()
    return [ExampleItem.model_validate(record).model_dump() for record in records]
