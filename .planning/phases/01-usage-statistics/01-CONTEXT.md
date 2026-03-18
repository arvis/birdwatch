# Phase 1: Usage Statistics - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers silent, fire-and-forget identification event logging. Users never see any stats activity. Stats failures must never interrupt the identification flow or show errors. Covers: backend POST /api/stats endpoint, JSONL log file, mobile deviceId module, mobile stats module, integration in result.tsx, and wikipedia tap tracking.

</domain>

<decisions>
## Implementation Decisions

### Wikipedia Tap Tracking
- Track using `useRef` — boolean flag, no re-render needed
- Send a second fire-and-forget stats call with `wikipedia_tapped: true` when user taps the Wikipedia link
- Track first tap only — second tap is a no-op (ref already set to true)

### Dev Visibility of Stats Failures
- Production: silently swallowed — `.catch(() => {})`
- Dev (`__DEV__`): `console.warn` in catch — helps debugging without breaking UX
- `android_id` when null (iOS/web): send `null` — backend schema accepts `string | null`

### Backend Tests
- Endpoint tests: valid payload → 200 + `{"ok": true}`; invalid payload → 422
- Mock `append_stat` in endpoint tests — unit test only, no real file I/O
- Separate stats service test: `test_append_stat_writes_jsonl` writes to a tmp path

### Claude's Discretion
- Exact naming/organization of test functions within the conventions set by existing tests
- stats.jsonl location relative to CWD (backend/ root as per spec)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mobile/lib/api.ts` — pattern for fire-and-forget fetch with `API_URL` already set up (uses `10.0.2.2` for Android emulator)
- `mobile/app/result.tsx` — integration point: `runIdentification()` is where duration_ms should be measured and stats sent
- `backend/app/main.py` — router registration pattern: `app.include_router(router, prefix="/api")`
- `backend/app/models/schemas.py` — Pydantic model pattern established (BaseModel, type annotations)

### Established Patterns
- Backend: new feature = new router + service + schema additions; registered in main.py
- Mobile: utility functions live in `mobile/lib/`
- Tests: mock external calls; fixtures in `backend/tests/fixtures/`

### Integration Points
- `mobile/app/result.tsx`: wrap `identifyBird` call with `Date.now()` timing, call `sendStats()` after success
- `mobile/app/result.tsx`: wrap Wikipedia `Linking.openURL` call to also call `sendStats()` with `wikipedia_tapped: true`
- `backend/app/main.py`: add `from app.routers import identify, stats` and `app.include_router(stats.router, prefix="/api")`

</code_context>

<specifics>
## Specific Ideas

- Spec is fully defined in `docs/specs/step-5-stats.md` — implementation should match exactly
- `sendStats` uses same `API_URL` constant as `identifyBird` — add stats endpoint to existing `lib/api.ts` or create separate `lib/stats.ts` (spec shows separate file, follow that)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
