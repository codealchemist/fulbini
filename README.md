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
- **Netlify Identity** (via `netlify-identity-widget`) for sign-in — email/password plus Google, once configured (see below)

## Why a proxy function?

API-Football/API-Sports keys are meant for server-side use. A plain Vite SPA would embed the key in the built JS for anyone to read. Instead, `netlify/functions/football.mts` forwards `/api/football/*` requests to `https://v3.football.api-sports.io/*`, attaching the key from the `API_FOOTBALL_KEY` environment variable server-side. The React app never sees the key.

## Caching & API quota

API-Football plans cap requests per day, so the proxy function caches responses in [Netlify Blobs](https://docs.netlify.com/blobs/overview/) (`netlify/functions/lib/cache.ts`) rather than re-hitting the upstream API on every request. Each request is classified into one of three tiers based on its params (and, for fixture-scoped endpoints, whether that fixture has already finished):

- **historical** — finished fixtures (and everything scoped to them: lineups, statistics, events, player ratings) and past-season/past-date queries. These never change, so they're cached forever.
- **live** — today's fixtures, `live=all`, in-progress matches, and current-season data. Re-checked against upstream **no more than once every 30 seconds**; everything else is served straight from the cached blob.
- **reference** — static-ish lookups with no date/season (team/player/coach search, squads, leagues). Cached for 6 hours.

A small side-index (`football-fixture-status` blob store) records a fixture's id once it's seen with a finished status, so the very next request for its lineups/stats/events/players is served from cache forever instead of hitting the API again.

Because many browser tabs/users can be polling the same live data at once, the frontend adds random jitter (up to 60s, re-rolled every cycle — see `LIVE_DATA_JITTER_MS` in `src/hooks/useApi.ts`) on top of each poll interval. This staggers concurrent clients so they don't all miss the 30s cache window at the same instant: the first one to land after it goes stale refreshes the blob, and the rest land moments later and get a cache hit instead of each independently calling the upstream API.

### Load balancing across multiple accounts

For even more quota, set `API_FOOTBALL_KEYS` to a comma-separated list of keys from multiple API-Football accounts instead of the single `API_FOOTBALL_KEY` — combined daily quota then scales with the number of accounts. Requests are load-balanced **round robin** across them (`netlify/functions/lib/apiKeys.ts`), only on an actual upstream call (a cache hit doesn't rotate anything, since it never calls the API at all).

The rotation counter lives in Netlify Blobs rather than in-memory, specifically so it's a real round robin across *all* traffic — an in-memory counter would only rotate within one warm function container, which under real load means many concurrent containers each doing their own independent, uncoordinated rotation. It's not perfectly atomic (two concurrent requests can occasionally read the same counter value and land on the same key), which is fine for load balancing — it only needs to be roughly even, not exact. If the counter itself is unavailable, key selection falls back to a time-based pick rather than failing the request, same "never let the cache/coordination layer block real functionality" principle as the response cache above. The response carries an `x-api-key-index` header so you can confirm rotation is actually happening.

This is load balancing only, not failover — a request that happens to land on a key whose account is out of quota isn't retried on a different one. Worth building if it turns out to matter in practice.

## Authentication

Sign-in is handled by [Netlify Identity](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/), wired up in `src/context/AuthContext.tsx` (lazy-loads `netlify-identity-widget` so its ~60kB doesn't block the initial dashboard paint) and surfaced via the account button in the header (desktop) and bottom nav (mobile).

To enable it on your site:

1. **Site configuration → Identity → Enable Identity.**
2. **Site configuration → Identity → External providers → toggle Google on.** No Google Cloud Console setup needed — Netlify ships a default, shared OAuth app for this, so flipping the toggle is the whole setup. Nothing to configure in code either: the widget's login modal shows a "Sign in with Google" button automatically once a provider is enabled here.
   - Optional: register your own OAuth Client ID/Secret in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and paste it into this same screen if you want *your* app name/logo on Google's consent screen instead of Netlify's shared one (redirect URI would be `https://<your-site>/.netlify/identity/callback`). Purely cosmetic — the default app works identically otherwise.

**Passkeys/WebAuthn are not supported** — checked against the widget's actual source (no WebAuthn code anywhere) and current Netlify community status (it's an open feature request, not shipped). Email/password and any OAuth providers you enable (Google, GitHub, GitLab, Bitbucket) are what's available.

### Local development without Identity

Unlike Functions and Blobs, **Identity (GoTrue) is a hosted-only backend** — `netlify dev` can't run it locally. A request from `localhost` for `/.netlify/identity/*` gets redirected to your real production identity endpoint, and GoTrue's CORS policy only trusts your production origin, so the browser blocks it. There's no dashboard setting to add `localhost` as a trusted Identity origin — the real Google-login flow simply can't be exercised against a local dev server. Test that part directly on the deployed site (or a deploy preview).

To keep local development of everything else unblocked:

- **Frontend:** set `VITE_DEV_BYPASS_AUTH=true` in your local `.env` and `AuthProvider` skips loading Netlify Identity entirely, using a fake signed-in session instead. Gated on `import.meta.env.DEV`, which Vite statically replaces at build time — this branch doesn't exist in a production build regardless of what env vars happen to be set, so it can't be flipped on by accident in prod.
- **Backend:** `netlify/functions/football.mts` skips its own auth check when `process.env.NETLIFY_DEV === 'true'` — a flag netlify-cli sets automatically for every local invocation and that a real deployed function never sees. No `.env` entry needed for this half; it's automatic under `netlify dev`.

### Invite-only lock-down

This app doesn't allow open signup — access is by invite only, enforced in two places:

1. **Netlify dashboard (you set this):** Site configuration → Identity → Registration preferences → **Invite only**. This is what actually stops someone from self-registering; Identity → Invite users is how you add people (they get an email with a `#invite_token=...` link that the widget picks up automatically and prompts them to set a password).
2. **The app itself (already wired up):**
   - `src/components/auth/AuthGate.tsx` wraps the entire router — nothing renders (not even the header/nav) until `useAuth()` reports a signed-in user. Logged out, you get `LockedScreen` and nothing else.
   - `netlify/functions/football.mts` independently requires a valid session too. This matters because the UI gate alone is cosmetic — anyone could otherwise call `/api/football/*` directly and burn your API-Football quota without ever signing in. The function uses the *classic* `handler(event, context)` signature specifically because Netlify's gateway only auto-verifies the caller's Identity JWT and populates `context.clientContext.user` for that signature (confirmed by checking `@netlify/types` — the newer `Context` type used by the `export default (req, context) =>` style has no identity field at all). The frontend attaches the token itself: `src/lib/identityClient.ts` pulls the current user's JWT (auto-refreshed) and `src/api/client.ts` sends it as `Authorization: Bearer <token>` on every request.

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
