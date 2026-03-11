# Step 3 Spec: Mobile App (MVP)

## Goal
React Native (Expo) mobile app where users take a photo or pick one from their gallery, send it to the backend, and see the identification result.

## Stack
- React Native with Expo SDK 55
- Expo Router (file-based navigation)
- TypeScript
- expo-image-picker (camera capture + gallery)
- Built-in fetch (no axios)
- React useState (no external state lib)

## Structure
```
mobile/
├── app/
│   ├── _layout.tsx          # Root layout, sets up Expo Router stack
│   ├── index.tsx            # Home screen - camera + gallery picker + preview
│   └── result.tsx           # Result screen - loading / success / error
├── components/
│   ├── ConfidenceBadge.tsx  # Color-coded confidence pill badge
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
- Eagle emoji + "BirdWatch" title + subtitle hero
- Two side-by-side buttons:
  - **"📷 Take Photo"** (primary) — calls `launchCameraAsync`, hidden on web
  - **"🖼 Library"** (secondary outline) — calls `launchImageLibraryAsync`
- On web: only "Library" button, full-width

### preview state
- Selected image fills most of the screen
- Two buttons at bottom:
  - **"Identify"** — navigates to `/result` with `imageUri` as route param
  - **"Choose Different"** — re-opens picker

### Permissions
- Camera: `requestCameraPermissionsAsync()` before launching camera
- Photo library: `requestMediaLibraryPermissionsAsync()` before opening gallery
- If denied: alert with "Open Settings" link

## Result Screen (`app/result.tsx`)

Receives `imageUri` via route params. On mount, calls `identifyBird(imageUri)`.

### Loading state
- Thumbnail of the submitted photo (200×150, rounded)
- Spinner below
- "Identifying..." label

### Success state (scrollable)
- Full-width hero image (submitted photo, 280px tall, no border radius — bleeds edge to edge)
- Bird species name (large, bold, padded)
- Scientific name (italic, smaller, muted, padded)
- `ConfidenceBadge` component
- Description card
- **Habitat** card with label + text
- **Fun Facts** card with numbered list
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
- high → dark green bg `#1A4731`, green text `#52B788`, "High Confidence"
- medium → dark amber bg `#3D2E0A`, yellow text `#F5C542`, "Medium Confidence"
- low → dark red bg `#3D1515`, red text `#F87171`, "Low Confidence"

### `ExampleGallery.tsx`
Props: `images: ExampleImage[]`

Horizontal `ScrollView` of thumbnail images. Each image:
- Fixed size (120×90)
- Rounded corners
- Attribution text below (truncated, muted color)

Returns `null` if `images` is empty.

## Navigation Flow
```
Home (idle)
  ├── [take photo]   → Home (preview)
  ├── [pick gallery] → Home (preview)
  └── Home (preview)
        └── [identify] → Result (loading)
              ├── [success] → Result (success)
              │     └── [identify another] → Home (idle)
              └── [error] → Result (error)
                    ├── [try again] → Result (loading)
                    └── [go back]   → Home (idle)
```

## Design
- **Theme**: dark nature / field guide
- **Palette**:
  - Background: `#0D2818` (deep forest)
  - Cards: `#1C3829`
  - Accent / primary button: `#52B788` (bright green, dark text `#0D2818`)
  - Secondary button: outlined `#52B788`
  - Text primary: `#F0EDE8`
  - Text secondary / muted: `#8CB49B`
  - Header bg: `#0D2818`, header text: `#F0EDE8`
- Large touch targets (paddingVertical 16)
- No external UI library

## Done When
- User can take a photo with the camera
- User can pick a photo from the gallery
- Photo is sent to backend `POST /api/identify`
- Result screen shows: hero photo, species, confidence, description, habitat, fun facts, example images, Wikipedia link
- Loading state shows submitted photo thumbnail + spinner
- Error state handled with retry and back navigation
- Camera button hidden on web
- App runs on iOS and Android via `npx expo start`
