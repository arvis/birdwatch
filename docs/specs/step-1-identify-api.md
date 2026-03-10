# Step 1 Spec: Bird Identify API

## Goal
Minimal FastAPI backend with a single endpoint that accepts a bird image and returns identification via OpenAI Vision API.

## Stack
- FastAPI + Uvicorn
- OpenAI Python SDK (structured outputs)
- python-dotenv
- python-multipart (file uploads)

## Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app + CORS
│   ├── config.py        # Settings from env
│   ├── routers/
│   │   ├── __init__.py
│   │   └── identify.py  # POST /api/identify
│   └── services/
│       ├── __init__.py
│       └── openai_service.py  # OpenAI vision call
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Fixtures: test client, mock OpenAI
│   ├── test_health.py       # GET /api/health
│   └── test_identify.py     # POST /api/identify
├── .env
├── .env.example
└── requirements.txt
```

## Endpoint

### `POST /api/identify`

**Request:** multipart/form-data
- `image` (file, required) - JPEG/PNG, max 5MB

**Response (200):**
```json
{
  "species": "American Robin",
  "scientific_name": "Turdus migratorius",
  "confidence": "high",
  "description": "A common North American songbird with a warm orange-red breast.",
  "habitat": "Lawns, gardens, woodlands across North America",
  "fun_facts": [
    "They can eat up to 14 feet of earthworms in a day",
    "They are one of the first birds to sing at dawn",
    "Their eggs are the color known as robin's egg blue"
  ]
}
```

**Errors:**
- `400` - Invalid file type or exceeds 5MB
- `500` - OpenAI API failure

### `GET /api/health`
Returns `{ "status": "ok" }`

## OpenAI Integration

Use `response_format` with `json_schema` for structured output. Single vision call.

**Model:** `gpt-4o`

**System prompt:**
```
You are a bird identification expert. Identify the bird in the image.
If the image does not contain a bird, set species to "Unknown" and confidence to "low".
```

**JSON schema passed to OpenAI:**
```json
{
  "species": "string - common name",
  "scientific_name": "string",
  "confidence": "low | medium | high",
  "description": "string - 2-3 sentences",
  "habitat": "string",
  "fun_facts": ["string", "string", "string"]
}
```

Image is sent as base64 in the user message content array.

## Config (.env)
```
OPENAI_API_KEY=sk-...
```

## What's NOT in Step 1
- No Unsplash/example images (Step 2)
- No auth
- No database
- No rate limiting
- CORS allows all origins (tighten later)

## Tests

Use `pytest` + `httpx` (via FastAPI's `TestClient`). Mock the OpenAI API — tests should not make real API calls.

### `conftest.py`
- `client` fixture: FastAPI `TestClient`
- `mock_openai` fixture: patches `openai_service.identify_bird` to return a fixed `BirdResult`
- `sample_image` fixture: minimal valid JPEG bytes

### `test_health.py`
- `test_health_returns_ok` — GET /api/health returns 200 + `{"status": "ok"}`

### `test_identify.py`
- `test_identify_returns_bird_result` — POST valid image → 200, response has all expected fields
- `test_identify_rejects_non_image` — POST a .txt file → 400
- `test_identify_rejects_oversized_file` — POST >5MB file → 400
- `test_identify_handles_openai_error` — mock raises exception → 500

### Run
```bash
cd backend
pytest -v
```

## Done When
- All tests pass
- `POST /api/identify` accepts an image and returns bird identification JSON
- `GET /api/health` returns ok
- Works locally with `uvicorn app.main:app --reload`
