"""
Integration tests that hit the real OpenAI API.
Skipped by default. Run with: pytest -m integration
"""

import io
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import OPENAI_API_KEY
from app.main import app

FIXTURES_DIR = Path(__file__).parent / "fixtures"

pytestmark = pytest.mark.integration


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def great_tit_image():
    image_path = FIXTURES_DIR / "great_tit.jpg"
    assert image_path.exists(), "Test fixture great_tit.jpg not found"
    return image_path.read_bytes()


@pytest.mark.skipif(not OPENAI_API_KEY, reason="OPENAI_API_KEY not set")
def test_identify_great_tit(client, great_tit_image):
    response = client.post(
        "/api/identify",
        files={"image": ("great_tit.jpg", io.BytesIO(great_tit_image), "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()

    # Verify core fields are present
    assert data["species"]
    assert data["scientific_name"]
    assert data["confidence"] in ("low", "medium", "high")
    assert data["description"]
    assert data["habitat"]
    assert len(data["fun_facts"]) > 0

    # Verify it identified a great tit
    species_lower = data["species"].lower()
    scientific_lower = data["scientific_name"].lower()
    assert "great tit" in species_lower or "parus major" in scientific_lower, (
        f"Expected Great Tit (Parus major), got: {data['species']} ({data['scientific_name']})"
    )

    # Verify enrichment fields are present
    assert "example_images" in data
    assert "links" in data
