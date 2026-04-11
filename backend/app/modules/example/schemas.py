from pydantic import BaseModel, ConfigDict


class ExampleItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    label: str


class ExampleListResponse(BaseModel):
    items: list[ExampleItem]
