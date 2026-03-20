# BirdWatch

A bird identification app built with a **spec-first methodology**: every feature was specified in detail before any code was written. The app itself is functional, but the real artifact is the `docs/specs/` directory — a demonstration of how to write machine-readable specs that an AI coding assistant can implement reliably.

## What this project demonstrates

Most AI-assisted development looks like this: describe a feature in a chat, get code back, fix the parts that are wrong, repeat. The result is inconsistent and hard to review.

This project takes a different approach:

1. **Write a spec first** — define the endpoint contract, data schemas, error cases, and test requirements before touching any code
2. **Let AI implement from the spec** — the spec is precise enough that the implementation is predictable
3. **Verify against "Done When"** — every spec ends with explicit acceptance criteria; pass them and the step is complete

Each feature step lives in `docs/specs/` as a standalone spec document. Read any one of them and you'll see the pattern: goal, interface contract, edge cases, test list, done criteria. No ambiguity left for the implementer.

## The specs

| Spec | What it covers |
|------|----------------|
| [backend-overview.md](docs/specs/backend-overview.md) | API architecture, endpoint contracts, error response format |
| [frontend-overview.md](docs/specs/frontend-overview.md) | Mobile app structure, screens, navigation flow, design tokens |
| [step-1-identify-api.md](docs/specs/step-1-identify-api.md) | `POST /api/identify` — image upload, OpenAI vision call, structured output |
| [step-2-example-images.md](docs/specs/step-2-example-images.md) | Wikimedia Commons integration with an extensible provider pattern |
| [step-3-mobile-app.md](docs/specs/step-3-mobile-app.md) | React Native UI — camera, gallery picker, result screen |
| [step-4-android-build.md](docs/specs/step-4-android-build.md) | Android emulator setup, EAS Build, deployment options |
| [step-5-stats.md](docs/specs/step-5-stats.md) | Usage event logging — fire-and-forget, privacy-respecting |
| [step-6-local-dev-setup.md](docs/specs/step-6-local-dev-setup.md) | Full-stack local development with Android emulator |
| [step-7-i18n.md](docs/specs/step-7-i18n.md) | Internationalization — English + Latvian, device locale detection, settings screen |

## The app

Users take a photo or pick one from their gallery. The image is sent to a Python backend that calls GPT-4o Vision for species identification. Results include the bird's name, description, habitat, fun facts, example images from Wikimedia Commons, and a Wikipedia link.

**Tech stack:**
- Backend: Python, FastAPI, OpenAI SDK (structured outputs), Pydantic
- Mobile: React Native, Expo SDK 55, Expo Router, TypeScript

## Running locally

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # add your OPENAI_API_KEY
uvicorn app.main:app --reload
```

Runs on `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Mobile

```bash
cd mobile
npm install
npx expo start
```

On Android emulator, the app calls the backend at `10.0.2.2:8000` (the emulator's alias for the host machine's localhost). See [step-6-local-dev-setup.md](docs/specs/step-6-local-dev-setup.md) for full setup instructions.

### Tests

```bash
cd backend
pytest -v                        # unit tests (mocked, no API calls)
pytest -m integration -v         # integration tests (needs OPENAI_API_KEY)
```

## License

MIT
