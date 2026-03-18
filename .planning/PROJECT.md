# BirdWatch

## What This Is

BirdWatch is a mobile app (iOS + Android) where users photograph a bird and receive instant AI-powered species identification. A photo is sent to a Python backend that calls OpenAI GPT-4o Vision and returns the species name, scientific name, confidence level, description, habitat, fun facts, and example images from Wikimedia.

## Core Value

Any bird photo → species identification in seconds, with enough detail to be genuinely useful to a curious person.

## Requirements

### Validated

- ✓ User can upload or photograph a bird and receive AI-powered species identification — Phase 1–4
- ✓ Result shows species name, scientific name, confidence, description, habitat, fun facts — Phase 1–4
- ✓ Result includes example images from Wikimedia Commons — Phase 1–4
- ✓ Wikipedia link provided for the identified species — Phase 1–4
- ✓ Android emulator local dev setup works (10.0.2.2 routing) — pre-GSD

## Current Milestone: v1.0 Beta Prep

**Goal:** Add usage statistics and multilanguage support to prepare the app for beta testing.

**Target features:**
- Usage statistics — fire-and-forget event logging per identification
- i18n — English + Latvian UI, Settings screen for language switching

### Active

<!-- Current scope. Building toward these. -->

### Out of Scope

- Translating AI-generated content (species names, descriptions) — OpenAI returns English; translating dynamic content is complex and low value
- RTL layout support — not needed for EN/LV target languages
- User accounts / login — anonymous usage is intentional
- Real-time identification (video) — out of scope for v1

## Context

- Monorepo: `backend/` (FastAPI, Python) + `mobile/` (React Native, Expo SDK 52+, Expo Router)
- Backend tested with pytest; unit tests mock all external APIs
- Mobile tested with Jest; react-i18next mock already present in `__mocks__/`
- Step 6 (local dev setup) is already implemented — API URL uses `10.0.2.2` for Android emulator
- Stats spec (step 5) and i18n spec (step 7) are fully detailed in `docs/specs/`

## Constraints

- **Tech stack**: React Native + Expo — no bare workflow, must use Expo-compatible packages
- **Backend**: FastAPI + Python — no framework changes
- **Privacy**: No PII collected — stats use anonymous install_id + android_id only
- **Fire-and-forget stats**: Stats failure must never block or show errors to users

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| OpenAI GPT-4o for identification | Best vision model for species accuracy | ✓ Good |
| Wikimedia Commons for example images | Free, no API key, high quality | ✓ Good |
| JSONL for stats logging | Simple, grep-able, no DB dependency for v1 | — Pending |
| i18next for translations | TypeScript-native, standard in React Native ecosystem | — Pending |

---
*Last updated: 2026-03-18 — GSD initialized for milestone v1.0*
