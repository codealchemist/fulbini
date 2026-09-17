import type { Handler, HandlerContext, HandlerEvent, HandlerResponse } from '@netlify/functions'
import { buildCacheKey, classifyTier, indexFixtureStatuses, readCache, writeCache } from './lib/cache.ts'

// Proxies the app's /api/football/* calls to the real API-Sports endpoint,
// attaching the API key server-side so it never reaches the browser bundle.
// Get a key from https://dashboard.api-football.com and set API_FOOTBALL_KEY
// as a Netlify environment variable (Site configuration > Environment variables).
//
// This app is invite-only (see src/components/auth/AuthGate.tsx for the UI
// side of that), so this function requires a signed-in Netlify Identity user
// too — otherwise the "lock" would only be cosmetic: anyone could still call
// this endpoint directly and burn the API-Football quota without ever
// signing in. Uses the *classic* event/context handler signature rather than
// the newer Request/Response one specifically because Netlify's gateway only
// auto-verifies the caller's Identity JWT and populates
// `context.clientContext.user` for that signature — the v2 Context type
// (checked in @netlify/types) has no identity/auth field at all.
//
// Responses are cached in Netlify Blobs to conserve the API's daily quota:
//   - "historical" (finished fixtures, past seasons/dates): cached forever.
//   - "live" (today's fixtures, in-progress matches, current season): cached
//     for at most 30s — see netlify/functions/lib/cache.ts.
//   - "reference" (static-ish lookups with no date/season): cached 6h.
// Clients polling live data add their own jitter (src/hooks/useApi.ts) so
// concurrent pollers don't all miss the cache at the same instant; the first
// one to land refreshes the blob and the rest read it back shortly after.
const API_BASE = 'https://v3.football.api-sports.io'
// Matches both the direct function path (/.netlify/functions/football/…)
// and the public path it's redirected from (/api/football/…), whichever
// the request arrives as.
const PATH_MARKER = '/football'

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (!context.clientContext?.user) {
    return json({ error: 'Sign in required.' }, 401)
  }

  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) {
    return json({ error: 'API_FOOTBALL_KEY is not configured on the server.' }, 500)
  }

  const path = event.path
  const markerIndex = path.indexOf(PATH_MARKER)
  const upstreamPath = markerIndex >= 0 ? path.slice(markerIndex + PATH_MARKER.length) || '/' : '/'

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(event.queryStringParameters ?? {})) {
    if (value !== undefined) searchParams.set(key, value)
  }
  const search = searchParams.toString()
  const upstreamUrl = `${API_BASE}${upstreamPath}${search ? `?${search}` : ''}`
  const cacheKey = buildCacheKey(upstreamPath, searchParams)

  try {
    const cached = await readCache(cacheKey)
    if (cached) {
      return {
        statusCode: cached.status,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          'x-cache': 'HIT',
          'x-cache-tier': cached.tier,
        },
        body: cached.body,
      }
    }

    const tier = await classifyTier(upstreamPath, searchParams)
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'x-apisports-key': apiKey,
        accept: 'application/json',
      },
    })
    const body = await upstreamRes.text()

    if (upstreamRes.ok) {
      await indexFixtureStatuses(upstreamPath, body)
      await writeCache(cacheKey, { storedAt: Date.now(), tier, status: upstreamRes.status, body })
    }

    return {
      statusCode: upstreamRes.status,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'x-cache': 'MISS',
        'x-cache-tier': tier,
      },
      body,
    }
  } catch (err) {
    return json({ error: 'Upstream request to api-football failed', detail: String(err) }, 502)
  }
}

function json(data: unknown, statusCode: number): HandlerResponse {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  }
}
