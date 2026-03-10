from typing import Protocol

from app.models.schemas import ExampleImage


class ImageProvider(Protocol):
    async def search(self, species: str) -> list[ExampleImage]: ...
