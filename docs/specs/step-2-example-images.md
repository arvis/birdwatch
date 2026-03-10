# Step 2 Spec: Example Images & Links

## Goal
After identifying a bird, enrich the response with example images from Wikimedia Commons and a Wikipedia link. Built with an extensible provider pattern so we can add Unsplash, Flickr, etc. later.

## Design

### Provider pattern
```
ImageProvider (protocol/interface)
├── WikimediaProvider    # Step 2 - free, no API key
├── UnsplashProvider     # Future
└── FlickrProvider       # Future
```

Each provider implements one method:
```python
async def search(species: str) -> list[ExampleImage]
```

The service layer calls providers and merges results. New providers are registered in a list — no changes needed to the router or existing code.

### New schemas

```python
class ExampleImage(BaseModel):
    url: str
    thumbnail_url: str
    source: str          # "wikimedia", "unsplash", etc.
    attribution: str     # "Wikimedia Commons, CC BY-SA 4.0"

class BirdLinks(BaseModel):
    wikipedia: str | None   # "https://en.wikipedia.org/wiki/Turdus_migratorius"

class IdentifyResponse(BaseModel):
    # All existing BirdResult fields
    species: str
    scientific_name: str
    confidence: str
    description: str
    habitat: str
    fun_facts: list[str]
    # New fields
    example_images: list[ExampleImage]
    links: BirdLinks
```

## API Changes

### `POST /api/identify` (updated response)
```json
{
  "species": "American Robin",
  "scientific_name": "Turdus migratorius",
  "confidence": "high",
  "description": "...",
  "habitat": "...",
  "fun_facts": ["...", "...", "..."],
  "example_images": [
    {
      "url": "https://upload.wikimedia.org/wikipedia/commons/...",
      "thumbnail_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/...",
      "source": "wikimedia",
      "attribution": "Wikimedia Commons, CC BY-SA 4.0"
    }
  ],
  "links": {
    "wikipedia": "https://en.wikipedia.org/wiki/Turdus_migratorius"
  }
}
```

## Implementation

### New files
```
backend/app/services/
├── image_providers/
│   ├── __init__.py
│   ├── base.py              # ImageProvider protocol + ExampleImage
│   └── wikimedia.py         # WikimediaProvider
├── image_service.py         # Calls providers, merges results
└── wiki_service.py          # Wikipedia link lookup
```

### WikimediaProvider
- Uses Wikimedia Commons API (free, no key)
- Endpoint: `https://commons.wikimedia.org/w/api.php`
- Search by scientific name (more accurate than common name)
- Return up to 4 images with thumbnails
- Attribution: auto-set to "Wikimedia Commons"

### Wikipedia link
- Use Wikipedia API to resolve scientific name to article URL
- Endpoint: `https://en.wikipedia.org/w/api.php`
- Fallback: try common name if scientific name has no article
- Return `None` if no article found

### image_service.py
```python
# List of providers — add new ones here
providers: list[ImageProvider] = [
    WikimediaProvider(),
]

async def get_example_images(species: str, scientific_name: str) -> list[ExampleImage]:
    results = []
    for provider in providers:
        images = await provider.search(scientific_name)
        results.extend(images)
    return results
```

### Router changes
- identify.py calls `get_example_images()` and `get_wikipedia_link()` after OpenAI returns
- Combines into `IdentifyResponse`
- Image/link failures are non-fatal — return empty list / None

## Adding a new provider later
1. Create `app/services/image_providers/new_provider.py`
2. Implement `ImageProvider` protocol with `async def search(species: str) -> list[ExampleImage]`
3. Add instance to `providers` list in `image_service.py`
4. Done — no router or schema changes needed

## Tests

### `test_wikimedia.py`
- `test_wikimedia_returns_images` — mock API response, verify ExampleImage list
- `test_wikimedia_handles_no_results` — mock empty response, returns empty list
- `test_wikimedia_handles_api_error` — mock error, returns empty list (non-fatal)

### `test_wiki_service.py`
- `test_get_wikipedia_link_found` — mock API, returns URL
- `test_get_wikipedia_link_not_found` — mock empty, returns None

### `test_identify.py` (update existing)
- `test_identify_returns_example_images` — verify response includes example_images and links

### Run
```bash
cd backend
pytest -v
```

## Config
No new env vars — Wikimedia and Wikipedia APIs are free and keyless.

## Done When
- All tests pass (new + existing)
- Response includes `example_images` from Wikimedia Commons
- Response includes `links.wikipedia` URL
- Graceful fallback when images/links unavailable
- Adding a new image provider requires only one new file + one line in image_service.py
