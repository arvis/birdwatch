# Step 5 Spec: Usage Statistics

## Goal
Collect identification events from the mobile app and log them on the backend. Identify returning users without requiring login, using two device identifiers sent together.

## What We Collect

### Per identification event
| Field | Type | Description |
|---|---|---|
| `install_id` | string | Generated UUID, persisted in AsyncStorage. Lost on reinstall. |
| `android_id` | string or null | Android device ID from `expo-application`. Survives reinstalls. Null on iOS. |
| `species` | string | Identified bird species (common name) |
| `scientific_name` | string | Scientific name |
| `confidence` | "low" / "medium" / "high" | Model confidence |
| `had_result` | bool | False if species is "Unknown" |
| `duration_ms` | number | Time from API call start to response |
| `wikipedia_tapped` | bool | Whether user tapped the Wikipedia link |
| `example_images_count` | number | Number of example images returned |
| `platform` | "android" / "ios" | Device platform |
| `app_version` | string | App version from `expo-application` |
| `os_version` | string | OS version string |
| `timestamp` | ISO 8601 string | Event time (client-side) |

### Why both IDs?
- `install_id` is always present — identifies this app installation
- `android_id` is stable across reinstalls — lets you recognise a returning user even after they reinstall
- Sending both lets you correlate sessions and spot when a reinstall happened (same `android_id`, new `install_id`)

---

## Mobile Implementation

### Device ID setup (`lib/deviceId.ts`)

```typescript
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export async function getInstallId(): Promise<string> {
  const stored = await AsyncStorage.getItem('install_id');
  if (stored) return stored;
  const id = uuidv4();
  await AsyncStorage.setItem('install_id', id);
  return id;
}

export function getAndroidId(): string | null {
  if (Platform.OS === 'android') {
    return Application.androidId ?? null;
  }
  return null;
}
```

### Stats payload (`lib/stats.ts`)

```typescript
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getInstallId, getAndroidId } from './deviceId';

const API_URL = __DEV__ ? 'http://192.168.x.x:8000' : 'https://api.birdwatch.app';

export interface StatsEvent {
  install_id: string;
  android_id: string | null;
  species: string;
  scientific_name: string;
  confidence: 'low' | 'medium' | 'high';
  had_result: boolean;
  duration_ms: number;
  wikipedia_tapped: boolean;
  example_images_count: number;
  platform: string;
  app_version: string;
  os_version: string;
  timestamp: string;
}

export async function sendStats(event: Omit<StatsEvent, 'install_id' | 'android_id' | 'platform' | 'app_version' | 'os_version' | 'timestamp'>): Promise<void> {
  const install_id = await getInstallId();

  const payload: StatsEvent = {
    ...event,
    install_id,
    android_id: getAndroidId(),
    platform: Platform.OS,
    app_version: Application.nativeApplicationVersion ?? 'unknown',
    os_version: Device.osVersion ?? 'unknown',
    timestamp: new Date().toISOString(),
  };

  // Fire and forget — stats failure must never affect the user
  fetch(`${API_URL}/api/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
```

### Usage in result screen

```typescript
const start = Date.now();
const result = await identifyBird(imageUri);
const duration_ms = Date.now() - start;

sendStats({
  species: result.species,
  scientific_name: result.scientific_name,
  confidence: result.confidence,
  had_result: result.species !== 'Unknown',
  duration_ms,
  wikipedia_tapped: false,   // updated to true if user taps link
  example_images_count: result.example_images.length,
});
```

### New packages required
```bash
npx expo install expo-application expo-device @react-native-async-storage/async-storage
npm install uuid react-native-get-random-values
```

---

## Backend Implementation

### New endpoint: `POST /api/stats`

Accepts the stats payload and appends it as a JSON line to a log file.

**Request body:** JSON matching the `StatsEvent` schema above.

**Response:** `{ "ok": true }` — always 200, never errors to the client.

### New files
```
backend/app/
├── routers/
│   └── stats.py          # POST /api/stats
├── services/
│   └── stats_service.py  # append to log file
└── models/
    └── schemas.py        # add StatsEvent model (update existing file)
```

### `StatsEvent` Pydantic model (add to `schemas.py`)

```python
class StatsEvent(BaseModel):
    install_id: str
    android_id: str | None = None
    species: str
    scientific_name: str
    confidence: str
    had_result: bool
    duration_ms: int
    wikipedia_tapped: bool
    example_images_count: int
    platform: str
    app_version: str
    os_version: str
    timestamp: str
```

### `stats_service.py`

```python
import json
from pathlib import Path
from datetime import datetime

LOG_FILE = Path("stats.jsonl")

def append_stat(event: dict) -> None:
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")
```

### `stats.py` router

```python
from fastapi import APIRouter
from app.models.schemas import StatsEvent
from app.services.stats_service import append_stat

router = APIRouter()

@router.post("/stats")
async def record_stats(event: StatsEvent):
    append_stat(event.model_dump())
    return {"ok": True}
```

### Register in `main.py`

```python
from app.routers import identify, stats

app.include_router(stats.router, prefix="/api")
```

### Log format (stats.jsonl)

One JSON object per line (newline-delimited JSON — easy to parse, grep, or import into any tool later):

```jsonl
{"install_id": "abc-123", "android_id": "d4e5f6", "species": "Great Tit", "confidence": "high", "had_result": true, "duration_ms": 3241, "wikipedia_tapped": false, "example_images_count": 3, "platform": "android", "app_version": "1.0.0", "os_version": "14", "timestamp": "2026-03-10T10:22:00Z"}
{"install_id": "abc-123", "android_id": "d4e5f6", "species": "Unknown", "confidence": "low", "had_result": false, "duration_ms": 2891, "wikipedia_tapped": false, "example_images_count": 0, "platform": "android", "app_version": "1.0.0", "os_version": "14", "timestamp": "2026-03-10T10:25:00Z"}
```

---

## Privacy
- No names, emails, or precise location collected
- `android_id` is device-scoped — not a global identifier, cannot be used to track across apps
- `install_id` is randomly generated — no link to real identity
- Stats are yours only — no third-party analytics service

## Done When
- `POST /api/stats` accepts the payload and appends to `stats.jsonl`
- Mobile sends stats after every identification (fire and forget)
- Both `install_id` and `android_id` are present in every log entry
- Stats failure never blocks or errors the user
