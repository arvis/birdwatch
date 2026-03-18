# Requirements: BirdWatch

**Defined:** 2026-03-18
**Core Value:** Any bird photo → species identification in seconds, with enough detail to be genuinely useful.

## v1.0 Requirements

### Statistics

- [ ] **STAT-01**: App sends an identification event to the backend after every bird identification
- [ ] **STAT-02**: Event includes device identifiers (install_id + android_id), species, confidence, duration, platform, app version
- [ ] **STAT-03**: Stats failure never blocks or shows errors to the user (fire-and-forget)
- [x] **STAT-04**: Backend accepts `POST /api/stats` and appends events to `stats.jsonl`
- [ ] **STAT-05**: Wikipedia tap is tracked (boolean flag updated when user taps the link)

### Internationalization

- [ ] **I18N-01**: All UI text uses translation keys — no hardcoded English strings in components
- [ ] **I18N-02**: English and Latvian translations are complete
- [ ] **I18N-03**: Settings screen with language picker is always accessible via a gear icon in the home screen header
- [ ] **I18N-04**: Chosen language persists across app restarts
- [ ] **I18N-05**: First launch defaults to device locale; language can be changed at any time from the always-visible Settings icon

## Future Requirements

### UI
- **UI-01**: App UI redesigned for beta — custom fonts, edge-to-edge layout, magazine-style result screen
- **UI-02**: Animated loading state
- **UI-03**: App icon and splash screen

## Out of Scope

| Feature | Reason |
|---------|--------|
| Translating AI-generated content | OpenAI returns English; dynamic translation is complex and low value |
| RTL layout | Not needed for EN/LV target languages |
| User accounts / login | Anonymous usage is intentional |
| Pluralization rules | No plural strings in current UI |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STAT-01 | Phase 1 | Pending |
| STAT-02 | Phase 1 | Pending |
| STAT-03 | Phase 1 | Pending |
| STAT-04 | Phase 1 | Complete |
| STAT-05 | Phase 1 | Pending |
| I18N-01 | Phase 2 | Pending |
| I18N-02 | Phase 2 | Pending |
| I18N-03 | Phase 2 | Pending |
| I18N-04 | Phase 2 | Pending |
| I18N-05 | Phase 2 | Pending |

**Coverage:**
- v1.0 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 — Traceability confirmed after roadmap creation*
