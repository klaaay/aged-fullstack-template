from dataclasses import dataclass


@dataclass(frozen=True)
class ExampleRecord:
    id: str
    label: str
