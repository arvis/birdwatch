# Step 7 Spec: Multilanguage Support (i18n)

## Goal
Add internationalization to the mobile app so all UI text is translatable. Device locale is the default, but the user can override it from a Settings screen. The chosen language persists across app restarts. Adding a new language requires only one new JSON file.

## Stack
- `expo-localization` — reads device locale for the initial default
- `i18next` — translation engine, TypeScript-native
- `react-i18next` — React hook integration (`useTranslation`)
- `AsyncStorage` — persists the user's language choice

No backend changes needed — API responses (species names, descriptions, fun facts) are already returned in English by OpenAI. Translating AI-generated content is out of scope.

## Languages
- **English** (`en`) — source of truth, fallback for all unknown locales
- **Latvian** (`lv`) — second supported language

### Planned next languages (same pattern)
- **German** (`de`) — `locales/de.json`
- **Spanish** (`es`) — `locales/es.json`

## Structure

New files:
```
mobile/
├── lib/
│   └── i18n.ts              # i18next init, locale detection, language switching
├── locales/
│   ├── en.json              # English (source of truth)
│   └── lv.json              # Latvian
└── app/
    └── settings.tsx         # Settings screen with language picker
```

Modified files:
```
mobile/
├── app/
│   ├── _layout.tsx          # Import i18n init + Settings button in header
│   ├── index.tsx            # useTranslation hook
│   └── result.tsx           # useTranslation hook
└── components/
    ├── ConfidenceBadge.tsx  # useTranslation hook
    └── ExampleGallery.tsx   # useTranslation hook
```

## Translation Keys (`locales/en.json`)

```json
{
  "home": {
    "title": "BirdWatch",
    "subtitle": "Pick a photo to identify any bird instantly",
    "pickPhoto": "Pick a Bird Photo",
    "chooseDifferent": "Choose Different",
    "identify": "Identify",
    "permissionTitle": "Permission required",
    "permissionMessage": "BirdWatch needs access to your photo library to identify birds.",
    "cancel": "Cancel",
    "openSettings": "Open Settings"
  },
  "result": {
    "screenTitle": "Identification",
    "identifying": "Identifying...",
    "errorTitle": "Identification failed",
    "tryAgain": "Try Again",
    "goBack": "Go Back",
    "habitat": "Habitat",
    "funFacts": "Fun Facts",
    "examplePhotos": "Example Photos",
    "readOnWikipedia": "Read on Wikipedia →",
    "identifyAnother": "Identify Another"
  },
  "confidence": {
    "high": "High Confidence",
    "medium": "Medium Confidence",
    "low": "Low Confidence"
  },
  "settings": {
    "screenTitle": "Settings",
    "language": "Language",
    "languageNote": "Choose your preferred language"
  }
}
```

## i18n Setup (`lib/i18n.ts`)

Initial language priority:
1. Persisted user choice (AsyncStorage key `@language`)
2. Device locale from `expo-localization`
3. English fallback

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import lv from "../locales/lv.json";

const STORAGE_KEY = "@language";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "lv", label: "Latviešu" },
];

export async function initI18n() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  const deviceLang = Localization.getLocales()[0]?.languageCode ?? "en";
  const lng = saved ?? deviceLang;

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      lv: { translation: lv },
    },
    lng,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export async function changeLanguage(code: string) {
  await i18n.changeLanguage(code);
  await AsyncStorage.setItem(STORAGE_KEY, code);
}

export default i18n;
```

## Root Layout (`app/_layout.tsx`)

- Calls `initI18n()` before rendering (async, show splash/null until ready)
- Adds a settings icon button in the home screen header that navigates to `/settings`

```typescript
import { initI18n } from "../lib/i18n";

// In component, before rendering:
const [ready, setReady] = useState(false);
useEffect(() => { initI18n().then(() => setReady(true)); }, []);
if (!ready) return null;
```

## Settings Screen (`app/settings.tsx`)

- Header title: `t("settings.screenTitle")`
- Section label: `t("settings.language")` + note: `t("settings.languageNote")`
- Renders one row per entry in `SUPPORTED_LANGUAGES`
- Active language row has a checkmark
- Tapping a row calls `changeLanguage(code)` — UI re-renders instantly via i18next

```
┌─────────────────────────┐
│  Settings               │
├─────────────────────────┤
│  Language               │
│  Choose your preferred  │
│  language               │
│                         │
│  ✓  English             │
│     Latviešu            │
└─────────────────────────┘
```

## Navigation

Settings is accessible from the home screen header (gear icon):
```
Home
  └── [⚙ gear icon] → Settings
        └── [tap language] → language changes, back to Home
```

Expo Router stack — Settings is a modal or standard push screen.

## Adding a New Language

1. Create `mobile/locales/de.json` (copy `en.json`, translate values)
2. In `lib/i18n.ts`:
   ```typescript
   import de from "../locales/de.json";
   // add to resources:
   de: { translation: de }
   // add to SUPPORTED_LANGUAGES:
   { code: "de", label: "Deutsch" }
   ```
3. Done — the language appears in the Settings picker automatically.

## Language Fallback

- On first launch: device locale used if supported, otherwise English
- User choice persists via AsyncStorage and overrides device locale on subsequent launches
- Unsupported locales silently fall back to English
- Sub-locales handled automatically: `lv-LV` → `lv`, `en-US` → `en`

## Tests

### Mock `react-i18next` in `__mocks__/react-i18next.js`
```javascript
module.exports = {
  useTranslation: () => ({ t: (key) => key }),
  initReactI18next: { type: "3rdParty", init: () => {} },
};
```

All existing component tests pass without changes — `t("home.title")` returns `"home.title"`, fine for rendering assertions.

### `__tests__/i18n.test.ts` (new)
- `test_english_fallback` — init with unknown locale, verify fallback to English
- `test_latvian_locale` — init with `lv`, verify Latvian strings returned
- `test_all_english_keys_present_in_latvian` — compare key sets, fail if Latvian is missing any key
- `test_change_language_persists` — call `changeLanguage("lv")`, verify AsyncStorage written

### `__tests__/settings.test.tsx` (new)
- `test_renders_all_languages` — all `SUPPORTED_LANGUAGES` entries visible
- `test_active_language_has_checkmark` — current language row shows checkmark
- `test_tap_language_calls_changeLanguage` — mock `changeLanguage`, verify called with correct code

### Run
```bash
cd mobile
npx jest
```

## What's NOT in This Step
- Translating API response content (species names, descriptions — these come from OpenAI in English)
- Pluralization rules (no plural strings in the current UI)
- RTL layout support

## Done When
- All UI text uses `t()` — no hardcoded English strings in components
- English and Latvian translations are complete
- Settings screen lists available languages; tapping one switches the UI instantly
- Chosen language persists across app restarts
- First launch defaults to device locale if supported, otherwise English
- All existing tests pass with the `react-i18next` mock
- New i18n and settings tests pass
- Adding German or Spanish requires one new JSON file + two lines in `i18n.ts`
