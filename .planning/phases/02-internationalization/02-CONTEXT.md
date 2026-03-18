# Phase 2: Internationalization - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers full UI internationalization: English and Latvian translations, a Settings screen accessible via always-visible gear icon in the home header, language persistence via AsyncStorage, and device locale as the first-launch default. AI-generated content (species names, descriptions) is out of scope — stays in English.

</domain>

<decisions>
## Implementation Decisions

### Settings Screen Navigation
- Standard push screen (not modal) — consistent with existing Expo Router Stack nav, back arrow auto-provided
- Gear icon rendered in `_layout.tsx` via `Stack.Screen name="index"` `headerRight` prop
- Settings accessible from home screen only (gear icon in home header); result screen has no gear icon

### i18n Init Loading State
- `return null` while `initI18n()` resolves on app start — i18n init is fast (AsyncStorage read + sync i18next init)
- AsyncStorage errors during init: silently fall back to device locale (same fire-and-forget philosophy as stats)
- `initI18n()` called in `_layout.tsx` `useEffect`: `useEffect(() => { initI18n().then(() => setReady(true)); }, [])`

### Test Strategy
- Add `react-i18next` mock to `mobile/__mocks__/react-i18next.ts` — `useTranslation` returns `{ t: (key) => key }`
- Unit tests for `changeLanguage` + `initI18n` (mock AsyncStorage + expo-localization); snapshot test for Settings screen
- Update existing component test assertions to expect translation keys (e.g., `"home.identify"`) not hardcoded English strings

### Claude's Discretion
- Exact Latvian translation values for all keys (user doesn't speak Latvian — Claude provides idiomatic translations)
- ExampleGallery and ConfidenceBadge component test file names/structure within existing Jest conventions

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mobile/app/_layout.tsx` — Expo Router Stack with `headerStyle: { backgroundColor: "#0D2818" }`, `headerTintColor: "#F0EDE8"` — gear icon must match this color scheme
- `mobile/lib/api.ts`, `mobile/lib/stats.ts` — pattern for lib modules (TypeScript, named exports)
- `mobile/lib/deviceId.ts` — AsyncStorage usage pattern (already in codebase)

### Established Patterns
- Expo Router file-based routing: new screen = new file in `mobile/app/`
- `_layout.tsx` wraps all screens with shared Stack options
- Components in `mobile/components/` (ConfidenceBadge, ExampleGallery)
- Jest with `__mocks__/` directory for module mocking

### Integration Points
- `mobile/app/_layout.tsx`: add `initI18n()` call + `headerRight` gear icon on index screen + register `settings` Stack.Screen
- `mobile/app/index.tsx`: replace hardcoded strings with `useTranslation` hook
- `mobile/app/result.tsx`: replace hardcoded strings with `useTranslation` hook
- `mobile/components/ConfidenceBadge.tsx`: replace confidence label strings
- `mobile/components/ExampleGallery.tsx`: replace section title string

</code_context>

<specifics>
## Specific Ideas

- Spec is fully defined in `docs/specs/step-7-i18n.md` — translation keys, i18n setup code, Settings screen layout, file structure all specified
- `SUPPORTED_LANGUAGES = [{ code: "en", label: "English" }, { code: "lv", label: "Latviešu" }]`
- Storage key: `@language` (AsyncStorage)
- Settings screen layout: section label + note + one row per language, active row has checkmark
- Gear icon: use `Ionicons` or `MaterialIcons` from `@expo/vector-icons` (already available in Expo SDK)

</specifics>

<deferred>
## Deferred Ideas

- German and Spanish translations (mentioned in spec as "planned next languages") — out of scope for Phase 2
- RTL layout support — explicitly out of scope per PROJECT.md
- Translating AI-generated content (species names, descriptions) — out of scope per PROJECT.md

</deferred>
