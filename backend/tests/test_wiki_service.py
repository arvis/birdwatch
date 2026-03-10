from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.wiki_service import get_wikipedia_link

MOCK_FOUND_RESPONSE = {
    "query": {
        "pages": {
            "12345": {
                "fullurl": "https://en.wikipedia.org/wiki/Turdus_migratorius"
            }
        }
    }
}

MOCK_NOT_FOUND_RESPONSE = {
    "query": {
        "pages": {
            "-1": {
                "title": "Nonexistent",
                "missing": ""
            }
        }
    }
}


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
async def test_get_wikipedia_link_found():
    with patch("app.services.wiki_service.httpx.AsyncClient", return_value=_make_mock_client(MOCK_FOUND_RESPONSE)):
        url = await get_wikipedia_link("American Robin", "Turdus migratorius")
    assert url == "https://en.wikipedia.org/wiki/Turdus_migratorius"


@pytest.mark.anyio
async def test_get_wikipedia_link_not_found():
    with patch("app.services.wiki_service.httpx.AsyncClient", return_value=_make_mock_client(MOCK_NOT_FOUND_RESPONSE)):
        url = await get_wikipedia_link("Nonexistent Bird", "Nonexistus birdus")
    assert url is None


@pytest.mark.anyio
async def test_get_wikipedia_link_handles_error():
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(side_effect=Exception("Network error"))

    mock_client = MagicMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_http)
    mock_client.__aexit__ = AsyncMock(return_value=False)

    with patch("app.services.wiki_service.httpx.AsyncClient", return_value=mock_client):
        url = await get_wikipedia_link("American Robin", "Turdus migratorius")
    assert url is None
