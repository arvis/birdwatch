import io
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.schemas import BirdResult, ExampleImage


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_image():
    # Minimal valid JPEG bytes (SOI + EOI markers)
    return b"\xff\xd8\xff\xe0" + b"\x00" * 100 + b"\xff\xd9"


@pytest.fixture
def mock_bird_result():
    return BirdResult(
        species="American Robin",
        scientific_name="Turdus migratorius",
        confidence="high",
        description="A common North American songbird with a warm orange-red breast.",
        habitat="Lawns, gardens, woodlands across North America",
        fun_facts=[
            "They can eat up to 14 feet of earthworms in a day",
            "They are one of the first birds to sing at dawn",
            "Their eggs are the color known as robin's egg blue",
        ],
    )


@pytest.fixture
def mock_example_images():
    return [
        ExampleImage(
            url="https://upload.wikimedia.org/full/robin.jpg",
            thumbnail_url="https://upload.wikimedia.org/thumb/robin.jpg",
            source="wikimedia",
            attribution="Wikimedia Commons - John Doe, CC BY-SA 4.0",
        )
    ]


@pytest.fixture
def mock_openai(mock_bird_result):
    with patch(
        "app.routers.identify.identify_bird",
        new_callable=AsyncMock,
        return_value=mock_bird_result,
    ) as mock:
        yield mock


@pytest.fixture
def mock_images(mock_example_images):
    with patch(
        "app.routers.identify.get_example_images",
        new_callable=AsyncMock,
        return_value=mock_example_images,
    ) as mock:
        yield mock


@pytest.fixture
def mock_wikipedia():
    with patch(
        "app.routers.identify.get_wikipedia_link",
        new_callable=AsyncMock,
        return_value="https://en.wikipedia.org/wiki/Turdus_migratorius",
    ) as mock:
        yield mock
