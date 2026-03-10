import httpx

API_URL = "https://en.wikipedia.org/w/api.php"


async def get_wikipedia_link(species: str, scientific_name: str) -> str | None:
    for query in [scientific_name, species]:
        url = await _search_wikipedia(query)
        if url:
            return url
    return None


async def _search_wikipedia(query: str) -> str | None:
    params = {
        "action": "query",
        "format": "json",
        "titles": query,
        "redirects": 1,
        "prop": "info",
        "inprop": "url",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(API_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return None

    pages = data.get("query", {}).get("pages", {})
    for page_id, page in pages.items():
        if page_id == "-1":
            return None
        return page.get("fullurl")

    return None
