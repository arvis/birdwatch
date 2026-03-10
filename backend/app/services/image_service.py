from app.models.schemas import ExampleImage
from app.services.image_providers.base import ImageProvider
from app.services.image_providers.wikimedia import WikimediaProvider

# Add new providers here
providers: list[ImageProvider] = [
    WikimediaProvider(),
]


async def get_example_images(species: str, scientific_name: str) -> list[ExampleImage]:
    results = []
    for provider in providers:
        try:
            images = await provider.search(scientific_name)
            results.extend(images)
        except Exception:
            continue
    return results
