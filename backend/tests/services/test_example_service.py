from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.modules.example.models import ExampleItemModel
from app.modules.example.service import list_example_items
from app.platform.db.base import Base


def test_list_example_items_reads_from_database() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    testing_session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    with testing_session_local() as session:
        session.add_all(
            [
                ExampleItemModel(id="hello", label="Hello template"),
                ExampleItemModel(id="customize", label="Customize me"),
            ]
        )
        session.commit()

    with testing_session_local() as session:
        result = list_example_items(session)

    assert result == [
        {"id": "customize", "label": "Customize me"},
        {"id": "hello", "label": "Hello template"},
    ]
