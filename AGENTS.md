# Sela Tire MES — Base44 Dev Environment

## Overview
Vite + React 19 + TypeScript frontend for a tire manufacturing execution system (MES). Uses Firebase Firestore for real-time data sync. No backend server — pure SPA.

## Running the app
```
docker compose -f docker-compose.base44.yml up -d
```
- Web entry point on host port 3000 (Vite dev server).
- Dependencies installed via `npm install` on container startup (node_modules in a named volume).
- Live reload is disabled (`DISABLE_HMR=true`) to prevent flickering during edits; call `reload_preview` after changes to see updates.

## Key details
- Firebase config is committed in `firebase-applet-config.json` (API key, project ID, Firestore database ID). No external secrets needed to boot.
- `.env.example` references `GEMINI_API_KEY` and `APP_URL`, but neither is used in the app code — they are not required.
- App uses `bun.lock` but the compose setup uses `npm install` against `package.json` (lockfile-agnostic for dev).
- Vite config has `@` alias pointing to repo root.
- `@tailwindcss/vite` plugin is used (Tailwind v4, no separate config file needed).

## Verifying it works
- `curl http://localhost:3000/` should return the HTML with `/@vite/client` and `/src/main.tsx` (dev server, not prebuilt).
- The app shows a login page first; Firestore data syncs in real-time after login.
