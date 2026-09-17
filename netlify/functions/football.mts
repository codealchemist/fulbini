import type { Config, Context } from '@netlify/functions'

// Proxies the app's /api/football/* calls to the real API-Sports endpoint,
// attaching the API key server-side so it never reaches the browser bundle.
// Get a key from https://dashboard.api-football.com and set API_FOOTBALL_KEY
// as a Netlify environment variable (Site configuration > Environment variables).
const API_BASE = 'https://v3.football.api-sports.io'
// Matches both the direct function path (/.netlify/functions/football/…)
// and the public path it's redirected from (/api/football/…), whichever
// the request arrives as.
const PATH_MARKER = '/football'

export default async (req: Request, _context: Context) => {
  const apiKey = process.env.API_FOOTBALL_KEY

  if (!apiKey) {
    return json({ error: 'API_FOOTBALL_KEY is not configured on the server.' }, 500)
  }

  const url = new URL(req.url)
  const markerIndex = url.pathname.indexOf(PATH_MARKER)
  const upstreamPath = markerIndex >= 0 ? url.pathname.slice(markerIndex + PATH_MARKER.length) || '/' : '/'
  const upstreamUrl = `${API_BASE}${upstreamPath}${url.search}`

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'x-apisports-key': apiKey,
        accept: 'application/json',
      },
    })
    const body = await upstreamRes.text()

    return new Response(body, {
      status: upstreamRes.status,
      headers: {
        'content-type': 'application/json',
        // Fixtures change often (live scores); keep caching short.
        'cache-control': 'public, max-age=10',
      },
    })
  } catch (err) {
    return json({ error: 'Upstream request to api-football failed', detail: String(err) }, 502)
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export const config: Config = {
  path: '/api/football/*',
}
