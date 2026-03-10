# Step 3 Spec: Mobile App (MVP)

## Goal
React Native (Expo) mobile app where users pick a bird photo from their gallery, send it to the backend, and see the identification result. No camera in this step — image picker only.

## Stack
- React Native with Expo SDK 52+
- Expo Router (file-based navigation)
- TypeScript
- expo-image-picker (gallery only)
- Built-in fetch (no axios)
- React useState (no external state lib)

## Structure
```
mobile/
├── app/
│   ├── _layout.tsx          # Root layout, sets up Expo Router stack
│   ├── index.tsx            # Home screen - image picker + preview
│   └── result.tsx           # Result screen - loading / success / error
├── components/
│   ├── ConfidenceBadge.tsx  # Color-coded confidence indicator
│   └── ExampleGallery.tsx   # Horizontal image thumbnail scroll
├── lib/
│   ├── api.ts               # Backend API client
│   └── types.ts             # Shared TypeScript types
├── app.json                 # Expo config
├── package.json
└── tsconfig.json
```

## Types (`lib/types.ts`)

Mirror the backend response schema:

```typescript
export interface ExampleImage {
  url: string;
  thumbnail_url: string;
  source: string;
  attribution: string;
}

export interface BirdLinks {
  wikipedia: string | null;
}

export interface BirdResult {
  species: string;
  scientific_name: string;
  confidence: "low" | "medium" | "high";
  description: string;
  habitat: string;
  fun_facts: string[];
  example_images: ExampleImage[];
  links: BirdLinks;
}
```

## API Client (`lib/api.ts`)

```typescript
const API_URL = __DEV__ ? "http://localhost:8000" : "https://api.birdwatch.app";

export async function identifyBird(imageUri: string): Promise<BirdResult> {
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: "bird.jpg",
    type: "image/jpeg",
  } as any);

  const response = await fetch(`${API_URL}/api/identify`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? `Request failed: ${response.status}`);
  }

  return response.json();
}
```

## Home Screen (`app/index.tsx`)

### States
- **idle** — no image selected
- **preview** — image selected, showing preview

### idle state
- App name / logo at top
- Large "Pick a Bird Photo" button (calls `expo-image-picker`)
- Picker config: gallery only, images only, max 5MB
- On selection → transition to preview state

### preview state
- Selected image fills most of the screen
- Two buttons at bottom:
  - **"Identify"** — navigates to `/result` with `imageUri` as route param
  - **"Choose Different"** — re-opens picker

### Permissions
- Request photo library permission before opening picker
- If denied: show message explaining why + button to open Settings

## Result Screen (`app/result.tsx`)

Receives `imageUri` via route params. On mount, calls `identifyBird(imageUri)`.

### Loading state
- Spinner centered on screen
- "Identifying..." label below

### Success state (scrollable)
- Bird species name (large, bold)
- Scientific name (italic, smaller, muted)
- `ConfidenceBadge` component
- Description paragraph
- **Habitat** section with label + text
- **Fun Facts** numbered list
- **Example Images** — `ExampleGallery` component (hidden if empty)
- Wikipedia link button (hidden if null) — opens in browser via `Linking`
- "Identify Another" button at bottom — navigates back to home

### Error state
- Friendly error message
- "Try Again" button — re-triggers the API call
- "Go Back" button — navigates back to home

## Components

### `ConfidenceBadge.tsx`
Props: `confidence: "low" | "medium" | "high"`

Renders a small pill badge:
- high → green background, "High Confidence"
- medium → yellow/amber background, "Medium Confidence"
- low → red background, "Low Confidence"

### `ExampleGallery.tsx`
Props: `images: ExampleImage[]`

Horizontal `ScrollView` of thumbnail images. Each image:
- Fixed size (e.g. 120×90)
- Rounded corners
- Attribution text below (truncated)

Returns `null` if `images` is empty.

## Navigation Flow
```
Home (idle)
  └── [pick photo] → Home (preview)
        └── [identify] → Result (loading)
              ├── [success] → Result (success)
              │     └── [identify another] → Home (idle)
              └── [error] → Result (error)
                    ├── [try again] → Result (loading)
                    └── [go back] → Home (idle)
```

## Design
- Nature-inspired palette: deep green primary (`#2D6A4F`), off-white background (`#F8F5F0`), warm text (`#1B1B1B`)
- Large touch targets (min 48px height)
- Card-based layout for result sections
- No external UI library

## What's NOT in Step 3
- Camera viewfinder (Step 4)
- Image size validation on the client (backend enforces 5MB)
- Offline handling
- App icon / splash screen polish
- EAS Build config

## Done When
- User can pick a photo from gallery
- Photo is sent to backend `POST /api/identify`
- Result screen shows species, confidence, description, habitat, fun facts, example images, Wikipedia link
- Loading and error states are handled
- "Identify Another" returns to home cleanly
- App runs on iOS simulator and Android emulator via `npx expo start`
