# Frontend Spec - BirdWatch Mobile App

## Overview
React Native (Expo) mobile app for iOS and Android. Users capture or upload bird photos and receive AI-powered identification results.

## Stack
- **Framework**: React Native with Expo SDK
- **Navigation**: Expo Router (file-based)
- **Language**: TypeScript
- **Camera**: expo-camera, expo-image-picker
- **Styling**: React Native StyleSheet (no external UI lib to start)
- **HTTP**: fetch (built-in) or axios
- **State**: React useState/useContext (keep it simple)

## Future Integrations (not in v1)
- **Ads**: react-native-google-mobile-ads
- **Payments**: react-native-purchases (RevenueCat)
- **Analytics**: expo-analytics or Firebase

## Project Structure
```
mobile/
├── app/
│   ├── _layout.tsx              # Root layout, global providers
│   ├── index.tsx                # Home screen - camera/upload
│   └── result.tsx               # Result screen - bird info
├── components/
│   ├── CameraCapture.tsx        # Camera viewfinder + capture
│   ├── ImagePickerButton.tsx    # Gallery picker button
│   ├── ResultCard.tsx           # Bird info display card
│   ├── ExampleGallery.tsx       # Horizontal image carousel
│   ├── ConfidenceBadge.tsx      # Color-coded confidence indicator
│   └── LoadingOverlay.tsx       # Full-screen loading animation
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
- **Camera mode**: Full-screen camera viewfinder with capture button
- **Gallery mode**: Button to pick image from photo library
- Toggle between camera and gallery
- Image preview after capture/selection with "Identify" and "Retake" buttons
- Permissions handling for camera and photo library

### Result Screen (`result.tsx`)
- Receives image URI via route params
- Sends image to backend `POST /api/identify`
- **Loading state**: Animated bird icon or skeleton cards
- **Success state**:
  - Bird species name (large) + scientific name (italic, smaller)
  - Confidence badge (green=high, yellow=medium, red=low)
  - Description paragraph
  - Habitat section
  - Fun facts as a numbered list
  - Example images in horizontal ScrollView
- **Error state**: Friendly message + "Try Again" button
- "Identify Another" button at bottom

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
Home (camera/upload)
  ├── [capture photo] → preview → [identify] → Result
  ├── [pick from gallery] → preview → [identify] → Result
  └── Result
       └── [identify another] → Home
```

## Permissions
- Camera: requested on first camera access
- Photo Library: requested on first gallery access
- Graceful fallback if denied (show settings link)

## Design Guidelines
- Clean, minimal UI
- Nature-inspired color palette (greens, earth tones)
- Large touch targets for mobile
- Card-based layout for results
- Smooth transitions between screens
