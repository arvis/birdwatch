# Backend Spec - BirdWatch API

## Overview
Python FastAPI backend that accepts bird images and returns identification results via OpenAI Vision API.

## Stack
- **Framework**: FastAPI
- **Server**: Uvicorn
- **AI**: OpenAI Python SDK (GPT-4o vision)
- **Images**: Unsplash API (httpx)
- **Validation**: Pydantic v2
- **Environment**: python-dotenv

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app, CORS, lifespan
│   ├── config.py                # Settings via pydantic-settings
│   ├── routers/
│   │   ├── __init__.py
│   │   └── identify.py          # POST /api/identify
│   ├── services/
│   │   ├── __init__.py
│   │   ├── openai_service.py    # OpenAI vision call + prompt
│   │   └── image_service.py     # Unsplash image search
│   └── models/
│       ├── __init__.py
│       └── schemas.py           # Request/response Pydantic models
├── tests/
│   ├── __init__.py
│   ├── test_identify.py
│   └── conftest.py
├── .env
├── .env.example
├── requirements.txt
└── Dockerfile
```

## API Endpoints

### `POST /api/identify`
Accepts a bird image, returns identification result.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file, required) - JPEG/PNG, max 5MB

**Response (200):**
```json
{
  "species": "American Robin",
  "scientific_name": "Turdus migratorius",
  "confidence": "high",
  "description": "A common North American songbird with a warm orange-red breast...",
  "habitat": "Lawns, gardens, woodlands across North America",
  "fun_facts": [
    "They can eat up to 14 feet of earthworms in a day",
    "They are one of the first birds to sing at dawn",
    "Their eggs are the color known as 'robin's egg blue'"
  ],
  "example_images": [
    {
      "url": "https://images.unsplash.com/...",
      "alt": "American Robin perched on branch",
      "attribution": "Photo by John Doe on Unsplash"
    }
  ]
}
```

**Error Responses:**
- `400` - Invalid file type or size
- `422` - Could not identify a bird in the image
- `500` - OpenAI API or server error

### `GET /api/health`
Health check endpoint.

**Response (200):**
```json
{ "status": "ok" }
```

## OpenAI Prompt Strategy
- Send image as base64 in a vision message
- Use `response_format: { type: "json_object" }` for structured output
- System prompt instructs the model to return the exact JSON schema
- If the image doesn't contain a bird, return a clear error message in JSON

## Configuration (.env)
```
OPENAI_API_KEY=sk-...
UNSPLASH_ACCESS_KEY=...
ALLOWED_ORIGINS=http://localhost:8081
```

## CORS
- Allow mobile app origin (Expo dev server + production app)
- Allow all origins in development

## Error Handling
- Custom exception handlers for validation and API errors
- Structured error responses: `{ "error": "message" }`
- Log errors with context (request ID, timestamp)
