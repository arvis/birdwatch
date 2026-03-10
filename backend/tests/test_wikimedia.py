from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.image_providers.wikimedia import WikimediaProvider

MOCK_RESPONSE = {
    "query": {
        "pages": {
            "123": {
                "imageinfo": [
                    {
                        "url": "https://upload.wikimedia.org/full/robin.jpg",
                        "thumburl": "https://upload.wikimedia.org/thumb/robin.jpg",
                        "extmetadata": {
                            "Artist": {"value": "John Doe"},
                            "LicenseShortName": {"value": "CC BY-SA 4.0"},
                        },
                    }
                ]
            }
        }
    }
}


@pytest.fixture
def provider():
    return WikimediaProvider()


def _make_mock_client(response_data):
    mock_resp = MagicMock()
    mock_resp.json.return_value = response_data
    mock_resp.raise_for_status = MagicMock()

    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=mock_resp)

    mock_client = MagicMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_http)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    return mock_client


@pytest.mark.anyio
async def test_wikimedia_returns_images(provider):
    with patch("app.services.image_providers.wikimedia.httpx.AsyncClient", return_value=_make_mock_client(MOCK_RESPONSE)):
        images = await provider.search("Turdus migratorius")

    assert len(images) == 1
    assert images[0].source == "wikimedia"
    assert "John Doe" in images[0].attribution
    assert images[0].url == "https://upload.wikimedia.org/full/robin.jpg"


@pytest.mark.anyio
async def test_wikimedia_handles_no_results(provider):
    with patch("app.services.image_providers.wikimedia.httpx.AsyncClient", return_value=_make_mock_client({"query": {"pages": {}}})):
        images = await provider.search("Nonexistent Bird")

    assert images == []


@pytest.mark.anyio
async def test_wikimedia_handles_api_error(provider):
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(side_effect=Exception("Connection error"))

    mock_client = MagicMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_http)
    mock_client.__aexit__ = AsyncMock(return_value=False)

    with patch("app.services.image_providers.wikimedia.httpx.AsyncClient", return_value=mock_client):
        images = await provider.search("Turdus migratorius")

    assert images == []
