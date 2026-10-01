# Sela Tire MES — Base44 Dev Environment

## Overview
Vite + React 19 + TypeScript frontend app (Manufacturing Execution System for tire production).
Uses Firebase Firestore for data storage and auth. No backend server — frontend-only SPA.

## Running the app
```bash
docker compose -f docker-compose.base44.yml up -d
```
App is served on port 3000 by the Vite dev server (live source, not prebuilt).

## Key details
- **Package manager**: Bun (bun.lock present). Compose installs deps with `bun install --frozen-lockfile` on startup.
- **Firebase config**: Hardcoded in `firebase-applet-config.json` — no external secrets needed for Firebase.
- **GEMINI_API_KEY**: Listed in `.env.example` but NOT referenced anywhere in `src/`. Not required to boot.
- **Auth**: Master admin is ID `733445` / password `selanjr10`. Other users register via the app and are stored in Firestore + localStorage.
- **HMR**: Disabled via `DISABLE_HMR=true` in compose (matches AI Studio convention). Use `reload_preview` after edits.
- **Vite host allowlist**: Handled via `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` env var (Vite 6.1+).

## Tech stack
- React 19, Vite 6, Tailwind CSS 4, Recharts, lucide-react, motion, xlsx
- Firebase 10 (Firestore), @google/genai (dependency present but unused in source)
