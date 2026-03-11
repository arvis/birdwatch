# Frontend Spec - BirdWatch Mobile App

## Overview
React Native (Expo) mobile app for iOS and Android. Users capture or upload bird photos and receive AI-powered identification results.

## Stack
- **Framework**: React Native with Expo SDK 55
- **Navigation**: Expo Router (file-based)
- **Language**: TypeScript
- **Camera & Picker**: expo-image-picker (gallery + camera capture)
- **Styling**: React Native StyleSheet (no external UI lib)
- **HTTP**: fetch (built-in)
- **State**: React useState (no external state lib)

## Future Integrations (not in v1)
- **Ads**: react-native-google-mobile-ads
- **Payments**: react-native-purchases (RevenueCat)
- **Analytics**: expo-analytics or Firebase

## Project Structure
```
mobile/
├── app/
│   ├── _layout.tsx              # Root layout, Expo Router stack config
│   ├── index.tsx                # Home screen - camera capture + gallery picker
│   └── result.tsx               # Result screen - loading / success / error
├── components/
│   ├── ConfidenceBadge.tsx      # Color-coded confidence pill badge
│   └── ExampleGallery.tsx       # Horizontal image thumbnail scroll
├── lib/
│   ├── api.ts                   # Backend API client
│   └── types.ts                 # Shared TypeScript types
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── app.json                     # Expo config
├── package.json
├── tsconfig.json
└── eas.json                     # EAS Build config
```

## Screens

### Home Screen (`index.tsx`)
Two states:

**Idle** (no image selected):
- App name + eagle emoji hero section
- Two buttons side by side: **"Take Photo"** (primary) and **"Library"** (secondary)
- "Take Photo" hidden on web (`Platform.OS !== "web"`)

**Preview** (image selected):
- Full-screen image preview
- Two buttons: **"Choose Different"** (re-opens picker/camera) and **"Identify"** (navigates to result)

Permissions handled for both camera and photo library; denied → Settings-redirect alert.

### Result Screen (`result.tsx`)
Receives `imageUri` via route params. On mount, calls `identifyBird(imageUri)`.

**Loading state**: thumbnail of submitted photo + spinner + "Identifying..." label

**Success state** (scrollable):
- Full-width hero image (submitted photo, 280px tall)
- Bird species name (large, bold)
- Scientific name (italic, smaller, muted)
- `ConfidenceBadge`
- Description card
- Habitat card
- Fun Facts card (numbered list)
- Example Images (`ExampleGallery`, hidden if empty)
- Wikipedia link button (hidden if null)
- "Identify Another" button

**Error state**: friendly message + "Try Again" + "Go Back"

## API Client (`lib/api.ts`)
```typescript
const API_URL = __DEV__ ? "http://localhost:8000" : "https://api.birdwatch.app";

async function identifyBird(imageUri: string): Promise<BirdResult> {
  // Create FormData with image file
  // POST to /api/identify
  // Return parsed result
}
```

## Navigation Flow
```
Home (idle)
  ├── [take photo]     → Home (preview)
  ├── [pick gallery]   → Home (preview)
  └── Home (preview)
        └── [identify] → Result (loading)
              ├── [success] → Result (success)
              │     └── [identify another] → Home (idle)
              └── [error] → Result (error)
                    ├── [try again] → Result (loading)
                    └── [go back]   → Home (idle)
```

## Permissions
- Camera: requested on first "Take Photo" tap (`requestCameraPermissionsAsync`)
- Photo Library: requested on first "Library" tap (`requestMediaLibraryPermissionsAsync`)
- Denied → alert with "Open Settings" option

## Design
- **Theme**: dark nature / field guide — deep forest green backgrounds, bright green accents, warm off-white text
- **Palette**:
  - Background: `#0D2818`
  - Cards: `#1C3829`
  - Accent: `#52B788`
  - Text primary: `#F0EDE8`
  - Text secondary: `#8CB49B`
- Large touch targets (min 48px height)
- Card-based layout for result sections
- No external UI library
