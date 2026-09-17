# Fulbini

A live football (soccer) dashboard built on the [API-Football](https://www.api-football.com/) data set. Dark, minimalist UI with live scores, calendar-based fixture browsing, league standings, team/player/coach profiles with charts, lineup formations, and one-click "copy as image" on every view.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** for styling (dark theme only)
- **lucide-react** for icons
- **chart.js / react-chartjs-2** for graphs
- **react-router-dom** for routing
- **html-to-image** for the clipboard-copy feature
- **Netlify Functions** as a thin server-side proxy to API-Football, so your API key never ships in the browser bundle

## Why a proxy function?

API-Football/API-Sports keys are meant for server-side use. A plain Vite SPA would embed the key in the built JS for anyone to read. Instead, `netlify/functions/football.mts` forwards `/api/football/*` requests to `https://v3.football.api-sports.io/*`, attaching the key from the `API_FOOTBALL_KEY` environment variable server-side. The React app never sees the key.

## Getting an API key

1. Create an account at [dashboard.api-football.com](https://dashboard.api-football.com) (the direct API-Sports dashboard, not RapidAPI).
2. Copy your API key from the dashboard.
3. Note your plan's rate limits and available seasons — the free plan is limited (requests/day, and older seasons may be restricted).

## Local development

```bash
npm install
cp .env.example .env
# paste your key into .env as API_FOOTBALL_KEY=...
npm run dev
```

`npm run dev` runs `netlify dev`, which serves the Vite app and the proxy function together on one origin so `/api/football/*` calls work exactly as they will in production.

> **Open the URL `netlify dev` prints — `http://localhost:8888` — not `http://127.0.0.1:5173`.** Vite itself runs on 5173, but that's an internal implementation detail; it has no `/api/*` proxy or redirects wired up, so fixture requests there will fail with something like `Unexpected token '<' … is not valid JSON` (Vite serving `index.html` back for a request it doesn't recognize). Port 8888 is the one with everything connected.

> If `netlify dev`'s port-readiness check misbehaves in your environment (some sandboxes/containers have loopback quirks), you can run the two pieces separately:
> - `npm run dev:vite` — Vite only (the app will render, but `/api/*` calls will 404 without the proxy)
> - `npx netlify functions:serve` — serves just the function, or deploy to Netlify directly and test there.

### "Failed to load module script… MIME type of ''"

This means `netlify dev`'s proxy ended up pointed at something other than the actual Vite server on port 5173 — almost always because another process was already squatting on that port when `netlify dev` started, so its readiness probe locked onto the wrong server. `dev:vite` runs with `--strictPort`, so if this happens Vite will now fail loudly instead of silently moving to 5174. Fix: stop whatever's on port 5173 (`lsof -i :5173` / kill it) and re-run `npm run dev`. If you need a different port, change both the `vite --port` value in `dev:vite` and `targetPort` in `netlify.toml` together.

## Deploying to Netlify

First-time setup — link this folder to a Netlify site (creates a new one, or connects to an existing one):

```bash
npx netlify init    # or: npx netlify link
```

Then:

```bash
npm run env:push   # pushes API_FOOTBALL_KEY (and anything else in .env) to the linked site
npm run deploy      # builds and deploys to production
```

- `npm run env:push` runs `netlify env:import .env` — it upserts the variables from your local `.env` into the site's environment variables (existing unrelated variables on the site are left alone). Re-run it any time you rotate the key.
- `npm run deploy` runs `netlify deploy --build --prod` — builds via the `netlify.toml` build command and publishes straight to production. Drop `--prod` (edit the script, or run `npx netlify deploy --build` directly) if you want a draft preview URL first.
- Build command and publish directory are already configured in `netlify.toml` (`npm run build` → `dist`), and the SPA fallback redirect plus the `/api/football/*` function route are already set up — nothing else to configure in the Netlify UI.

## Features

- **Today view**: live matches (auto-refreshing), played matches below, with an "Upcoming" toggle that surfaces not-yet-played fixtures at the top of the list.
- **Calendar picker** to browse fixtures for any date.
- **League filter** on the fixtures list, plus a dedicated Leagues section to search competitions and view standings (table + points chart).
- **Search** across teams, players, and coaches from the header (desktop) or a full-screen overlay (mobile).
- **Team pages**: profile, venue, season record (doughnut chart), goals for/against (bar chart), squad grid, recent/upcoming fixtures.
- **Player pages**: profile (photo optional — see below), per-competition stats table, radar chart of key metrics, season selector.
- **Coach pages**: profile and career history.
- **Match page**: score/status, a goals panel (minute + scorer + assist, own-goal/penalty tagged, home/away aligned), starting XI rendered on a pitch by formation, bench, match statistics (bar comparison), top-rated performers, head-to-head history.
- **Player photo toggle**: player/coach headshots are hidden by default and can be enabled from the header (desktop) or bottom nav (mobile); the preference persists locally.
- **Copy as image**: every card/section has a hover-visible copy button that renders it to a PNG and writes it straight to the clipboard (falls back to a download if the Clipboard API is unavailable).
- Fully responsive: sidebar-style header + inline search on desktop, bottom tab bar + search overlay on mobile.

## Notes on the data

- Season year follows API-Football's convention (e.g. a January 2027 match belongs to the "2026" season).
- A team's "current league" (used for its statistics) is inferred from its most frequent league across the current season's fixtures, since API-Football has no direct "primary league" field.
- Lineups/statistics/player-ratings only become available once a fixture has kicked off.
