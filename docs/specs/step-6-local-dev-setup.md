# Step 6 Spec: Local Development Setup (Android Emulator)

## Goal
Run the full stack locally — backend + mobile app — on one PC using the Android emulator. No server uploads, fast iteration with hot reload.

## Architecture

```
PC
├── Backend: uvicorn on localhost:8000
├── Expo dev server: npx expo start (port 8081)
└── Android Emulator (via Android Studio)
      └── App running inside emulator → calls backend at 10.0.2.2:8000
```

## One-time Setup

### 1. Install Android Studio
Download from https://developer.android.com/studio — free.

Includes automatically:
- Android SDK
- AVD Manager (emulator)
- Java JDK 17
- Sets `ANDROID_HOME` environment variable

### 2. Create an Android Virtual Device (AVD)

1. Open Android Studio → **More Actions** → **Virtual Device Manager**
2. Click **Create Device**
3. Pick a device: **Pixel 8** (recommended)
4. Select system image: **API 34 (Android 14)** — download if needed
5. Finish → emulator appears in the list
6. Start it once manually to confirm it works, then close it

Expo will launch it automatically from this point on.

### 3. Verify environment

Open a terminal and check:

```bash
echo $ANDROID_HOME        # should print SDK path
adb devices               # should list the emulator when running
```

If `adb` is not found, add to PATH:
```
%ANDROID_HOME%\platform-tools
```

---

## API URL — Emulator Networking

Inside the Android emulator, `localhost` refers to the emulator itself, not the PC.
Use the fixed alias `10.0.2.2` to reach the host machine:

```typescript
// mobile/lib/api.ts
const API_URL = __DEV__
  ? "http://10.0.2.2:8000"
  : "https://api.birdwatch.app";
```

This is the only networking change needed — everything else works as normal.

---

## Daily Development Workflow

Open two terminals:

**Terminal 1 — backend:**
```bash
cd backend
uvicorn app.main:app --reload
```
Runs on `http://localhost:8000`. Auto-reloads on Python file changes.

**Terminal 2 — mobile:**
```bash
cd mobile
npx expo start --android
```
Launches the emulator automatically and pushes the app to it.
JavaScript changes hot-reload instantly. Native changes (new packages) require a restart.

---

## Verifying the full stack works

1. Backend running → open `http://localhost:8000/api/health` in browser → should return `{"status": "ok"}`
2. Emulator running → app loads on screen
3. Pick a photo in the app → result screen shows bird identification
4. Check backend terminal → request log should show `POST /api/identify 200`
5. Check `backend/stats.jsonl` → stats entry should be appended

---

## Troubleshooting

**Emulator can't reach backend (connection refused)**
- Confirm backend is running on port 8000
- Confirm `API_URL` uses `10.0.2.2`, not `localhost`
- Check Windows Firewall isn't blocking port 8000

**`npx expo start --android` doesn't launch emulator**
- Start the emulator manually from Android Studio first
- Run `adb devices` to confirm it's detected
- Then re-run `npx expo start --android`

**`adb` not found**
- Add `%ANDROID_HOME%\platform-tools` to Windows PATH
- Restart terminal after changing PATH

**App installs but crashes immediately**
- Run `npx expo start` (without `--android`) and check the terminal for JS errors
- Check the emulator's logcat in Android Studio for native errors

---

## When to restart vs hot reload

| Change | Action needed |
|---|---|
| Edit a `.tsx` / `.ts` file | Hot reloads automatically |
| Add a new npm package | `npx expo start --android` again |
| Edit `app.json` | Restart Expo dev server |
| Edit backend `.py` file | Auto-reloads (uvicorn `--reload`) |
| Edit backend `requirements.txt` | Re-run `pip install -r requirements.txt` |

---

## What's NOT needed for local dev
- EAS account or CLI
- Cloud server
- Physical Android device
- Play Store account
