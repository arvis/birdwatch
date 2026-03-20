# BirdWatch

Bird identification app - upload a photo, get AI-powered species identification.

## Repository
- **Monorepo** — backend and mobile live in one repo
- Single git history, shared docs, one PR can touch both sides
- Each directory (`backend/`, `mobile/`) has its own dependency management
- Deploy independently — backend to cloud, mobile via EAS Build

## Project Structure
- `backend/` - Python FastAPI API server
- `mobile/` - React Native (Expo) mobile app
- `docs/` - Specs and planning documents

## Docs
- `docs/plans/` - Project plans and implementation steps
- `docs/specs/` - Step-by-step specs for each feature
  - `backend-overview.md` - Backend API overview
  - `frontend-overview.md` - Mobile app overview
  - `step-1-identify-api.md` - Step 1: Bird identification endpoint
  - `step-2-example-images.md` - Step 2: Example images & Wikipedia links (provider pattern)

## Tech Stack
- **Backend**: Python, FastAPI, OpenAI SDK (structured outputs), Pydantic
- **Frontend**: React Native, Expo (SDK 52+), Expo Router, TypeScript

## Development

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn app.main:app --reload
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

## Git
- **Commit after each step** — when a spec step is complete and tests pass, create a git commit before moving to the next step

## Testing
- **Tests first**: Always run existing tests before making changes and after completing changes
- Backend unit tests: `cd backend && pytest -v` (mocked, no API calls)
- Backend integration tests: `cd backend && pytest -m integration -v` (hits real APIs, needs valid OPENAI_API_KEY)
- Integration tests are skipped by default via `pyproject.toml` config
- Mock external APIs (OpenAI, Wikimedia, Wikipedia) in unit tests — they must not make real API calls
- Test fixtures (images) stored in `backend/tests/fixtures/`
- Every new endpoint or service needs corresponding unit tests

## Conventions
- Backend uses snake_case (Python)
- Frontend uses camelCase (TypeScript)
- API responses use snake_case (Pydantic default)
- All API endpoints prefixed with `/api/`
- Pydantic models for all request/response schemas
- Expo Router file-based routing in `mobile/app/`

## Environment Variables & Secrets
- `OPENAI_API_KEY` - Required for bird identification
- Wikimedia Commons & Wikipedia APIs are free and keyless
- `ALLOWED_ORIGINS` - CORS origins for the backend

### Secret handling rules
- **NEVER commit `.env` files** — they contain real API keys
- `.env.example` files are committed with placeholder values (no real keys)
- `.gitignore` must include: `.env`, `.env.local`, `.env.*.local`
- Backend loads env vars via `python-dotenv` from `backend/.env`
- Mobile uses Expo's built-in env var support via `app.json` extras or `expo-constants`
- When creating new env files, always create a matching `.env.example` with placeholders
- **NEVER** hardcode API keys, tokens, or secrets in source code
