# BirdWatch - Bird Identification App

## Overview
A mobile-first app where users take/upload a bird photo, which gets sent to a Python backend that calls the OpenAI Vision API for identification. Returns the bird species, description, and example images.

## Tech Stack
- **Frontend**: React Native (Expo) - builds to iOS + Android + web
- **Backend**: FastAPI (Python)
- **AI**: OpenAI GPT-4o (vision) for bird identification
- **Images**: Unsplash API for example reference photos

### Why this stack
- **Expo/React Native** - single codebase for iOS, Android, and web. Camera access built-in. I'm highly capable with React Native + Expo.
- **FastAPI** - lightweight, async Python framework. Excellent for API-first backends. Auto-generates OpenAPI docs. Easy OpenAI SDK integration.

## Features
1. **Camera / Image Upload** - Take photo with camera or pick from gallery
2. **Bird Identification** - Send image to backend → OpenAI Vision API
3. **Result Display** - Bird name, description, habitat, fun facts
4. **Example Images** - Reference photos of the identified species

## Project Structure
```
birdwatch/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── routers/
│   │   │   └── identify.py      # POST /identify endpoint
│   │   ├── services/
│   │   │   ├── openai_service.py # OpenAI vision API logic
│   │   │   └── image_service.py  # Unsplash example image fetching
│   │   └── models/
│   │       └── schemas.py        # Pydantic request/response models
│   ├── .env                      # OPENAI_API_KEY, UNSPLASH_ACCESS_KEY
│   ├── requirements.txt
│   └── Dockerfile
│
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx           # Expo Router root layout
│   │   ├── index.tsx             # Home screen - camera/upload
│   │   └── result.tsx            # Result screen - bird info
│   ├── components/
│   │   ├── CameraCapture.tsx     # Camera + gallery picker
│   │   ├── ResultCard.tsx        # Bird identification display
│   │   └── ExampleGallery.tsx    # Example images carousel
│   ├── lib/
│   │   └── api.ts               # Backend API client
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
└── PLAN.md
```

## Implementation Steps

### Step 1: Backend Setup
- Init Python project with FastAPI + uvicorn
- Install: `openai`, `fastapi`, `uvicorn`, `python-multipart`, `httpx`
- Create Pydantic models for request/response
- Configure `.env` with API keys

### Step 2: Identify Endpoint - `POST /identify`
- Accept multipart image upload
- Convert to base64, send to OpenAI GPT-4o vision with prompt:
  ```
  Identify this bird. Return JSON with:
  - species (common name)
  - scientific_name
  - confidence (low/medium/high)
  - description (2-3 sentences)
  - habitat
  - fun_facts (array of 3 facts)
  ```
- Parse structured JSON response via OpenAI's response_format
- Fetch example images from Unsplash for the identified species
- Return combined result

### Step 3: Mobile App Setup
- Init Expo project with TypeScript (expo-router)
- Install: `expo-camera`, `expo-image-picker`
- Set up navigation: Home → Result

### Step 4: Camera / Upload Screen
- Camera viewfinder with capture button
- "Pick from gallery" alternative button
- Image preview before submitting
- File size validation (max 5MB)

### Step 5: Result Screen
- Send image to backend `/identify` endpoint
- Loading state with animation
- Display: bird name, scientific name, confidence badge
- Description, habitat, fun facts sections
- Horizontal scrollable gallery of example images

### Step 6: Polish
- Error handling (not a bird, network error, API failure)
- Pull-to-retry on error
- "Identify another" button
- App icon + splash screen

## API Keys Needed
- **OpenAI API Key** - for GPT-4o vision calls
- **Unsplash Access Key** (optional) - for example bird photos
