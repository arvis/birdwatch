# Roadmap: BirdWatch

## Milestone

**v1.0 Beta Prep** — Add usage statistics and multilanguage support to prepare the app for beta testing.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Usage Statistics** - Backend event endpoint + mobile fire-and-forget tracking after every identification
- [ ] **Phase 2: Internationalization** - i18next setup, EN + LV translations, Settings screen with language picker

## Phase Details

### Phase 1: Usage Statistics
**Goal**: Every bird identification silently logs an event to the backend — users never see stats activity, and stats failures never interrupt their experience
**Depends on**: Nothing (first phase)
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05
**Success Criteria** (what must be TRUE):
  1. After a successful identification, an event appears in `backend/stats.jsonl` containing species, confidence, duration, platform, app version, install_id, and android_id
  2. If the stats endpoint is unreachable or returns an error, the result screen still displays normally with no error message or delay
  3. When a user taps the Wikipedia link on the result screen, a second stats write records the wikipedia_tapped flag as true
  4. `POST /api/stats` rejects malformed payloads with a 422 and accepts valid ones with a 200
**Plans**: TBD

### Phase 2: Internationalization
**Goal**: Users can switch the app UI between English and Latvian at any time; their chosen language persists; new installs default to the device locale
**Depends on**: Phase 1
**Requirements**: I18N-01, I18N-02, I18N-03, I18N-04, I18N-05
**Success Criteria** (what must be TRUE):
  1. Tapping the gear icon on the home screen opens a Settings screen reachable from anywhere in the app
  2. Selecting Latvian in the Settings screen immediately switches all UI labels, buttons, and messages to Latvian without requiring an app restart
  3. Closing and reopening the app retains the last selected language
  4. On first launch with a Latvian device locale, the app opens in Latvian; on any other locale it opens in English
  5. No hardcoded English strings remain in any component — all text renders through translation keys
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Usage Statistics | 0/TBD | Not started | - |
| 2. Internationalization | 0/TBD | Not started | - |
