---
phase: 01-usage-statistics
plan: 02
subsystem: ui
tags: [react-native, expo, typescript, stats, analytics, async-storage, uuid]

# Dependency graph
requires: []
provides:
  - "mobile/lib/deviceId.ts with getInstallId (UUID + AsyncStorage) and getAndroidId"
  - "mobile/lib/stats.ts with StatsEvent interface and fire-and-forget sendStats function"
  - "result.tsx integrated with timing, sendStats on identification, and Wikipedia tap tracking"
affects:
  - "02-i18n"

# Tech tracking
tech-stack:
  added:
    - "expo-application ~55.0.10"
    - "expo-device ~55.0.10"
    - "@react-native-async-storage/async-storage 2.2.0"
    - "uuid ^13.0.0"
    - "react-native-get-random-values ^2.0.0"
  patterns:
    - "fire-and-forget stats: sendStats is async but never awaited; errors swallowed in prod, console.warn in dev"
    - "API_URL pattern duplicated from api.ts (intentional per decisions — stats.ts is a separate module)"
    - "useRef for single-event tracking: no re-render needed, ref persists across renders"

key-files:
  created:
    - "mobile/lib/deviceId.ts"
    - "mobile/lib/stats.ts"
  modified:
    - "mobile/app/result.tsx"

key-decisions:
  - "Use Application.getAndroidId() function (not Application.androidId property) — expo-application SDK 55 changed the API"
  - "Duplicate API_URL constant in stats.ts rather than importing from api.ts — keeps stats module self-contained"
  - "duration_ms: 0 in Wikipedia tap stats event — tap is secondary event, not a timed identification"

patterns-established:
  - "Fire-and-forget stats: call sendStats without await; errors handled inside stats.ts"
  - "Single-fire tap tracking: useRef(false) guard prevents duplicate stats events on repeated taps"

requirements-completed: [STAT-01, STAT-02, STAT-03, STAT-05]

# Metrics
duration: 3min
completed: 2026-03-18
---

# Phase 1 Plan 02: Mobile Stats Modules Summary

**Fire-and-forget stats from install ID generation through identification timing and Wikipedia tap deduplication using AsyncStorage UUID, expo-application, and expo-device**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-18T17:46:52Z
- **Completed:** 2026-03-18T17:49:56Z
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- Created deviceId.ts with persistent UUID install ID (AsyncStorage) and Android device ID retrieval
- Created stats.ts assembling full StatsEvent payload with device/platform metadata, sent fire-and-forget to /api/stats
- Integrated timing and sendStats into result.tsx runIdentification — measures duration_ms from API call to response
- Added Wikipedia tap tracking with useRef(false) guard — first tap sends stats, subsequent taps are no-ops

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create deviceId.ts and stats.ts modules** - `fc79a88` (feat)
2. **Task 2: Integrate stats into result.tsx with timing and Wikipedia tap tracking** - `8259ada` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `mobile/lib/deviceId.ts` - getInstallId (UUID persisted in AsyncStorage) and getAndroidId (Android-only)
- `mobile/lib/stats.ts` - StatsEvent interface and sendStats function assembling full device context payload
- `mobile/app/result.tsx` - Added timing, sendStats after identification, Wikipedia tap tracking with useRef
- `mobile/package.json` + `mobile/package-lock.json` - Added 5 new packages

## Decisions Made
- Used `Application.getAndroidId()` function call instead of `Application.androidId` property — expo-application SDK 55 changed the API to a function
- Duplicated `API_URL` constant in stats.ts rather than importing from api.ts — keeps stats module self-contained with no cross-module dependency
- `duration_ms: 0` in Wikipedia tap stats event is correct and intentional — tap is a secondary event, not a timed identification

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] expo-application SDK 55 uses getAndroidId() function, not androidId property**
- **Found during:** Task 1 (deviceId.ts creation)
- **Issue:** Spec and plan both used `Application.androidId` as a property access, but expo-application SDK 55.0.10 exports `getAndroidId()` as a function. TypeScript caught this: `Property 'androidId' does not exist on type '...' Did you mean 'getAndroidId'?`
- **Fix:** Changed `Application.androidId ?? null` to `Application.getAndroidId() ?? null` in deviceId.ts
- **Files modified:** mobile/lib/deviceId.ts
- **Verification:** TypeScript no longer reports any errors in our source files
- **Committed in:** fc79a88 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — API surface change in SDK 55)
**Impact on plan:** Required for correctness. All other plan details were implemented exactly as specified.

## Issues Encountered
- Pre-existing TypeScript type conflicts in `node_modules` between `react-native/src/types/globals.d.ts` and `@types/node` — these are project-level pre-existing issues unrelated to this plan's changes

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Mobile stats modules complete and integrated
- Backend /api/stats endpoint (01-01) needed to actually receive the events — both sides of stats are now done
- i18n phase (Phase 2) can begin independently

---
*Phase: 01-usage-statistics*
*Completed: 2026-03-18*

## Self-Check: PASSED

- FOUND: mobile/lib/deviceId.ts
- FOUND: mobile/lib/stats.ts
- FOUND: mobile/app/result.tsx
- FOUND: .planning/phases/01-usage-statistics/01-02-SUMMARY.md
- FOUND commit: fc79a88 (Task 1)
- FOUND commit: 8259ada (Task 2)
