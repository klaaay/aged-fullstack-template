from pydantic import BaseModel


class ExampleItem(BaseModel):
    id: str
    label: str


class ExampleListResponse(BaseModel):
    items: list[ExampleItem]
