# Step 4 Spec: Android Build & Distribution

## Overview
Move from a working Expo app (tested in Expo Go) to a real Android APK installable on a device. No Android Studio or local SDK required — EAS Build handles compilation in the cloud.

## Development → Android Flow

### Phase 0: Android Emulator via Android Studio (fastest local dev)

Since Android Studio is installed, you can run the app on a virtual Android device without a physical phone.

**One-time setup — create a virtual device (AVD):**

1. Open Android Studio
2. Go to **More Actions → Virtual Device Manager** (or Tools menu → Device Manager)
3. Click **Create Device**
4. Pick a phone (e.g. Pixel 6) → click Next
5. Download a system image (e.g. **API 34 / Android 14**, x86_64) → click Next → Finish
6. Click the green ▶ play button next to the device to boot the emulator

**Run the app on the emulator:**

```bash
cd mobile
npx expo start
```

When the dev server is running, press **`a`** in the terminal to open the app in the Android emulator. Expo will install the Expo Go client automatically.

**API URL for the emulator:**

The emulator cannot reach `localhost` — use `10.0.2.2` which maps to your PC's localhost:

```typescript
// mobile/lib/api.ts
const API_URL = __DEV__
  ? "http://10.0.2.2:8000"            // Android emulator → your PC's localhost
  : "https://your-app.railway.app";   // production APK
```

**Every dev session (two terminals):**

Terminal 1 — start the backend:
```
cd backend
uvicorn app.main:app --reload
```

Terminal 2 — start the mobile dev server:
```
cd mobile
npx expo start
```

Then press **`a`** in Terminal 2 to open the app in the emulator. Changes hot-reload instantly.

---

### Phase 1: Build & test with Expo Go (daily development)

No build step needed. Changes hot-reload instantly.

1. Start the dev server: `npx expo start`
2. Install **Expo Go** on Android phone (free, Google Play)
3. Scan the QR code shown in the terminal
4. App loads on the phone over LAN

Repeat for every feature — this is the main dev loop.

### Phase 2: EAS Build — Android APK (sideload)

Once the app works in Expo Go, build a real APK:

```bash
npm install -g eas-cli
eas login                                         # free Expo account
eas build:configure                               # generates eas.json
eas build -p android --profile preview            # queues cloud build (~5-10 min)
```

Download the `.apk` from the Expo dashboard and install on Android:
- Enable "Install unknown apps" in Android settings
- Open the APK file on the device

No Android Studio, no local Android SDK required.

### Phase 3: Google Play Store (future)

- Switch build profile to `production` (outputs AAB instead of APK)
- $25 one-time Google Play developer fee
- Submit via `eas submit -p android`

---

## API URL — Key Decision

`localhost:8000` does not work from a physical device or emulator — the phone cannot reach the laptop's localhost.

### Option A: LAN IP (recommended for dev)
Use the laptop's local network IP (e.g. `192.168.1.x`).

```typescript
// lib/api.ts
const API_URL = __DEV__
  ? "http://192.168.1.x:8000"   // replace with your machine's LAN IP
  : "https://api.birdwatch.app";
```

Works when phone and laptop are on the same WiFi. Simple, fast, no extra setup.
Downside: IP can change when reconnecting to WiFi.

### Option B: Expo Tunnel
Run `npx expo start --tunnel`. Expo creates a temporary public URL via ngrok.

```typescript
const API_URL = __DEV__
  ? "https://xxxx.ngrok.io"   // shown in terminal after --tunnel start
  : "https://api.birdwatch.app";
```

Works anywhere (phone on mobile data, etc). Slightly slower. URL changes each session.

### Option C: Deploy backend to cloud (cleanest)
Host the backend on a cloud provider. One stable URL for both dev and production.

Free tier options:
- **Render** — free web service, sleeps after inactivity
- **Railway** — small free allowance, stays awake
- **Fly.io** — generous free tier, always on

```typescript
const API_URL = "https://birdwatch-api.onrender.com"; // example
```

No LAN IP management. Works from any network. Slightly more setup upfront.

**Recommended:** Start with Option A (LAN IP) during development. Move to Option C before EAS Build so the APK has a stable URL baked in.

---

## Backend Server Options for APK Deployment

When the app is installed as a real APK on a physical device, it needs a public URL — `10.0.2.2` only works in the emulator and `localhost` is unreachable from a phone.

### Option A: Tunnel (no server, quick testing)

Expose your local backend to the internet temporarily. Backend still runs on your PC.

**ngrok:**
```bash
ngrok http 8000
# gives you: https://abc123.ngrok.io
```
- Free tier: works but URL changes every session
- Paid ($10/mo): fixed subdomain, permanent URL

**Cloudflare Tunnel (free):**
```bash
cloudflared tunnel --url http://localhost:8000
# gives you: https://random-name.trycloudflare.com
```
- Free, no account needed for quick tunnels
- Permanent tunnel: free with a Cloudflare account

**Downside of tunnels:** your PC must be on and backend running for the app to work.

### Option B: Cloud hosting (recommended before EAS Build)

Backend deployed to a server — always available, phone works anywhere.

| Provider | Cost | Sleeps on idle? | Notes |
|---|---|---|---|
| **Railway** | $5/mo | No | Best DX, deploys from git, recommended |
| **Render** | Free / $7/mo | Yes (free tier, 15min) | Easy setup, slow cold start on free |
| **Fly.io** | Free tier | No | More setup, generous free tier |
| **Hetzner VPS** | €4/mo | No | Cheapest always-on, manual Linux setup |
| **DigitalOcean** | $6/mo | No | Simple, good docs |
| **Google Cloud Run** | Pay per request | Scales to zero | Free tier generous, cold starts |

**Recommended:** Railway — $5/mo, no sleep, deploys directly from git, minimal config.

### Option C: Home server / always-on PC

If your PC is always on:
- Port forward `8000` on your router to your PC
- Use your public IP or a free dynamic DNS service (DuckDNS, No-IP)
- Free but requires router access

---

## What changes in `lib/api.ts` for APK

The APK bakes in the production URL at build time — decide on the server URL before running `eas build`:

```typescript
const API_URL = __DEV__
  ? "http://10.0.2.2:8000"            // Android emulator
  : "https://your-app.railway.app";   // production APK
```

---

## eas.json

Generated by `eas build:configure`. Key profiles:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

- `preview` → APK, for sideloading and testing
- `production` → AAB, required for Play Store submission

---

## Recommended Order

1. Build the app (Phase 1 — Expo Go for all development)
2. Set `API_URL` to LAN IP or tunnel
3. Confirm end-to-end flow works on real Android hardware
4. Deploy backend to cloud (stable URL)
5. Update `API_URL` production value in `lib/api.ts`
6. EAS Build → APK → sideload (Phase 2)
7. Play Store when ready (Phase 3)

## What's NOT in this step
- iOS build (requires Apple Developer account, $99/year)
- Push notifications
- App signing for Play Store (EAS manages this automatically)
