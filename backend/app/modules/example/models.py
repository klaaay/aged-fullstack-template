from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.platform.db.base import Base


class ExampleItemModel(Base):
    __tablename__ = "example_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
