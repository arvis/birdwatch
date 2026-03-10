import io
from unittest.mock import AsyncMock, patch


def test_identify_returns_bird_result(client, sample_image, mock_openai, mock_images, mock_wikipedia):
    response = client.post(
        "/api/identify",
        files={"image": ("bird.jpg", io.BytesIO(sample_image), "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["species"] == "American Robin"
    assert data["scientific_name"] == "Turdus migratorius"
    assert data["confidence"] == "high"
    assert len(data["fun_facts"]) == 3
    mock_openai.assert_called_once()


def test_identify_returns_example_images(client, sample_image, mock_openai, mock_images, mock_wikipedia):
    response = client.post(
        "/api/identify",
        files={"image": ("bird.jpg", io.BytesIO(sample_image), "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["example_images"]) == 1
    assert data["example_images"][0]["source"] == "wikimedia"
    assert data["links"]["wikipedia"] == "https://en.wikipedia.org/wiki/Turdus_migratorius"


def test_identify_works_without_images(client, sample_image, mock_openai):
    with patch("app.routers.identify.get_example_images", new_callable=AsyncMock, return_value=[]), \
         patch("app.routers.identify.get_wikipedia_link", new_callable=AsyncMock, return_value=None):
        response = client.post(
            "/api/identify",
            files={"image": ("bird.jpg", io.BytesIO(sample_image), "image/jpeg")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["species"] == "American Robin"
        assert data["example_images"] == []
        assert data["links"]["wikipedia"] is None


def test_identify_rejects_non_image(client):
    response = client.post(
        "/api/identify",
        files={"image": ("notes.txt", io.BytesIO(b"not an image"), "text/plain")},
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


def test_identify_rejects_oversized_file(client, mock_openai, mock_images, mock_wikipedia):
    big_file = b"\xff\xd8\xff\xe0" + b"\x00" * (6 * 1024 * 1024)  # ~6MB
    response = client.post(
        "/api/identify",
        files={"image": ("big.jpg", io.BytesIO(big_file), "image/jpeg")},
    )
    assert response.status_code == 400
    assert "too large" in response.json()["detail"]


def test_identify_handles_openai_error(client, sample_image):
    with patch(
        "app.routers.identify.identify_bird",
        new_callable=AsyncMock,
        side_effect=Exception("OpenAI API error"),
    ):
        response = client.post(
            "/api/identify",
            files={"image": ("bird.jpg", io.BytesIO(sample_image), "image/jpeg")},
        )
        assert response.status_code == 500
        assert "Identification failed" in response.json()["detail"]
