---
phase: 01-usage-statistics
verified: 2026-03-18T18:10:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
---

# Phase 1: Usage Statistics Verification Report

**Phase Goal:** Every bird identification silently logs an event to the backend — users never see stats activity, and stats failures never interrupt their experience
**Verified:** 2026-03-18T18:10:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | After a successful identification, an event appears in `stats.jsonl` containing species, confidence, duration, platform, app version, install_id, and android_id | VERIFIED | `sendStats` called without `await` after `identifyBird` succeeds in `result.tsx:39-47`; backend `append_stat` writes all fields; `StatsEvent` Pydantic model has all required fields |
| 2 | If the stats endpoint is unreachable or returns an error, the result screen still displays normally with no error message or delay | VERIFIED | `fetch(...).catch((err) => { if (__DEV__) console.warn(...) })` in `stats.ts:49-53` — errors never propagate; `sendStats` is never awaited in `result.tsx` |
| 3 | When a user taps the Wikipedia link, a second stats write records `wikipedia_tapped: true` | VERIFIED | `result.tsx:120-134` — `onPress` calls `sendStats` with `wikipedia_tapped: true` inside a `!wikipediaTapped.current` guard |
| 4 | Second Wikipedia tap does not send another stats call | VERIFIED | `useRef(false)` at `result.tsx:29`; `wikipediaTapped.current = true` set on first tap at line 123; guard `if (!wikipediaTapped.current)` prevents further calls |
| 5 | `POST /api/stats` rejects malformed payloads with a 422 and accepts valid ones with a 200 | VERIFIED | FastAPI + Pydantic `StatsEvent` model provides automatic 422 validation; `record_stats` returns `{"ok": True}` on 200; 4 tests pass confirming both |
| 6 | Device identifiers (install_id, android_id) are included in every stats payload | VERIFIED | `sendStats` calls `getInstallId()` and `getAndroidId()` and spreads both into `payload`; `StatsEvent` model requires `install_id` (str) and allows `android_id` (str | null) |
| 7 | Stats failure never blocks or shows errors to the user in production | VERIFIED | `sendStats` is `async` but never awaited; the `.catch` swallows errors silently in production (`if (__DEV__)` gate on `console.warn`) |
| 8 | `stats.jsonl` receives a JSON line per event | VERIFIED | `append_stat` opens with mode `"a"`, writes `json.dumps(event) + "\n"`; `test_append_stat_writes_jsonl` confirms via `tmp_path` |
| 9 | All pre-existing backend tests continue to pass | VERIFIED | 17 tests passed (4 stats + 13 pre-existing), 1 integration test deselected by config |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/app/models/schemas.py` | StatsEvent Pydantic model | VERIFIED | `class StatsEvent(BaseModel)` at line 29; all 13 fields present including `android_id: str \| None = None` and `wikipedia_tapped: bool` |
| `backend/app/services/stats_service.py` | `append_stat` writing JSONL | VERIFIED | `def append_stat(event: dict) -> None` at line 7; `LOG_FILE = Path("stats.jsonl")` at line 4; appends JSON line |
| `backend/app/routers/stats.py` | POST /api/stats endpoint | VERIFIED | `@router.post("/stats")` at line 9; returns `{"ok": True}`; imports and calls `append_stat` |
| `backend/tests/test_stats.py` | 4 unit tests | VERIFIED | All 4 tests pass: `test_stats_valid_payload`, `test_stats_missing_required_field`, `test_stats_android_id_null`, `test_append_stat_writes_jsonl` |
| `mobile/lib/deviceId.ts` | `getInstallId` and `getAndroidId` | VERIFIED | Both functions exported; UUID via AsyncStorage; `Application.getAndroidId()` (SDK 55 function API, correctly implemented) |
| `mobile/lib/stats.ts` | `StatsEvent` interface and `sendStats` | VERIFIED | Interface exported at line 14; `sendStats` exported at line 30; assembles full device payload; fire-and-forget fetch |
| `mobile/app/result.tsx` | Stats integration with timing and Wikipedia tracking | VERIFIED | `sendStats` called twice (lines 39, 124); `Date.now()` timing at lines 33-36; `useRef(false)` guard at line 29 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `backend/app/routers/stats.py` | `backend/app/services/stats_service.py` | `import append_stat` | WIRED | `from app.services.stats_service import append_stat` at line 4; called at line 11 |
| `backend/app/main.py` | `backend/app/routers/stats.py` | `include_router` | WIRED | `from app.routers import identify, stats` at line 4; `app.include_router(stats.router, prefix="/api")` at line 17; `/api/stats` confirmed in live route list |
| `mobile/lib/stats.ts` | `mobile/lib/deviceId.ts` | `import getInstallId, getAndroidId` | WIRED | `from './deviceId'` at line 4; both functions called in `sendStats` body |
| `mobile/app/result.tsx` | `mobile/lib/stats.ts` | `import sendStats` | WIRED | `from "../lib/stats"` at line 17; `sendStats(...)` called without `await` at lines 39 and 124 |
| `mobile/app/result.tsx` | `useRef` | Wikipedia tap tracking ref | WIRED | `useRef` in React import at line 2; `const wikipediaTapped = useRef(false)` at line 29; read and written in Wikipedia `onPress` handler |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| STAT-01 | 01-02-PLAN.md | App sends identification event after every bird identification | SATISFIED | `sendStats` called in `runIdentification` after `identifyBird` succeeds; fire-and-forget, no await |
| STAT-02 | 01-02-PLAN.md | Event includes device identifiers, species, confidence, duration, platform, app version | SATISFIED | `sendStats` assembles: `install_id`, `android_id`, `species`, `scientific_name`, `confidence`, `duration_ms`, `platform`, `app_version`, `os_version`, `timestamp` |
| STAT-03 | 01-02-PLAN.md | Stats failure never blocks or shows errors to the user | SATISFIED | `.catch` swallows errors silently in prod; `sendStats` never awaited; result screen renders independently |
| STAT-04 | 01-01-PLAN.md | Backend accepts POST /api/stats and appends events to stats.jsonl | SATISFIED | `/api/stats` registered and live; `append_stat` writes JSONL; 4 unit tests pass |
| STAT-05 | 01-02-PLAN.md | Wikipedia tap is tracked (boolean flag updated on first tap) | SATISFIED | `useRef(false)` guard; first tap fires `sendStats` with `wikipedia_tapped: true`; subsequent taps are no-ops |

No orphaned requirements — all 5 STAT requirements mapped to plans and verified. No STAT requirements in REQUIREMENTS.md lack plan coverage.

---

### Anti-Patterns Found

None. No TODO/FIXME/HACK/placeholder comments found in any phase-modified files. No stub implementations. No empty handlers.

---

### Human Verification Required

#### 1. Fire-and-forget timing on slow connections

**Test:** On a device with network throttling, trigger a bird identification and observe the result screen.
**Expected:** Result screen appears immediately after identification; no delay waiting for stats POST to complete.
**Why human:** Programmatic checks confirm `sendStats` is not awaited, but the actual user-perceived timing requires a running app with network conditions.

#### 2. Stats error swallowing in production build

**Test:** Build a production APK and run it with the stats backend URL unreachable; trigger an identification.
**Expected:** Identification result displays normally; no error toast, no error screen, no console output visible to the user.
**Why human:** The `__DEV__` guard suppresses `console.warn` in production; verifying this requires a production build where `__DEV__` is `false`.

#### 3. Android ID populated on physical Android device

**Test:** Run the app on a physical Android device; check that `android_id` is non-null in `stats.jsonl`.
**Expected:** The JSONL entry has a non-null string for `android_id`.
**Why human:** `Application.getAndroidId()` returns null in simulators; only a physical device can confirm the field is populated as intended.

---

### Gaps Summary

No gaps. All 9 observable truths are verified, all 7 artifacts exist and are substantive and wired, all 5 key links are confirmed wired, all 5 STAT requirements are satisfied.

---

_Verified: 2026-03-18T18:10:00Z_
_Verifier: Claude (gsd-verifier)_
