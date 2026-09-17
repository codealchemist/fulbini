import { getStore } from '@netlify/blobs'

// Once a fixture reaches one of these statuses it never changes again, so
// anything scoped to it (lineups, stats, events, player ratings, the fixture
// itself) can be cached forever.
const FINISHED_STATUS_CODES = new Set(['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'])

// These all take a required `fixture` id and have no date/season of their
// own — their freshness depends entirely on whether that fixture is over.
const FIXTURE_SCOPED_PATHS = new Set(['/fixtures/lineups', '/fixtures/statistics', '/fixtures/events', '/fixtures/players'])

const RESPONSE_CACHE_STORE = 'football-response-cache'
const FIXTURE_STATUS_STORE = 'football-fixture-status'

// "Live" data is re-checked against the upstream API no more than once per
// this window; readers in between are served straight from the blob.
export const LIVE_MAX_AGE_MS = 30_000
// Static-ish lookups (team/coach/player search, squads, leagues...) with no
// date/season component — cheap to keep fresh-ish without hammering quota.
const REFERENCE_MAX_AGE_MS = 6 * 60 * 60 * 1000
// Historical (finished-fixture or past-season) data has no max age at all.

export type CacheTier = 'historical' | 'live' | 'reference'

export interface CachedResponse {
  storedAt: number
  tier: CacheTier
  status: number
  body: string
}

function currentSeasonYear(): number {
  const now = new Date()
  // Mirrors src/lib/date.ts#currentSeasonYear: a match in Jan-Jun belongs to
  // the season that started the previous year.
  return now.getUTCMonth() < 6 ? now.getUTCFullYear() - 1 : now.getUTCFullYear()
}

function isPastDate(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr < today
}

async function isFixtureFinished(fixtureId: string): Promise<boolean> {
  const store = getStore(FIXTURE_STATUS_STORE)
  const status = await store.get(`fixture:${fixtureId}`, { type: 'text' })
  return status === 'finished'
}

/**
 * Decides how long a request's response may be trusted for, based on the
 * request shape alone (plus, for fixture-scoped endpoints, whatever we
 * already know about that fixture from `indexFixtureStatuses`).
 */
export async function classifyTier(pathname: string, params: URLSearchParams): Promise<CacheTier> {
  // Explicit live-matches queries are always volatile.
  if (params.has('live')) return 'live'

  if (FIXTURE_SCOPED_PATHS.has(pathname)) {
    const fixtureId = params.get('fixture')
    return fixtureId && (await isFixtureFinished(fixtureId)) ? 'historical' : 'live'
  }

  if (pathname === '/fixtures' && params.has('id')) {
    return (await isFixtureFinished(params.get('id')!)) ? 'historical' : 'live'
  }

  const date = params.get('date')
  if (date) return isPastDate(date) ? 'historical' : 'live'

  const season = Number(params.get('season'))
  if (!Number.isNaN(season) && season > 0) {
    return season < currentSeasonYear() ? 'historical' : 'live'
  }

  return 'reference'
}

function maxAgeFor(tier: CacheTier): number | null {
  if (tier === 'historical') return null
  if (tier === 'live') return LIVE_MAX_AGE_MS
  return REFERENCE_MAX_AGE_MS
}

export async function readCache(key: string): Promise<CachedResponse | null> {
  const store = getStore(RESPONSE_CACHE_STORE)
  const entry = (await store.get(key, { type: 'json' })) as CachedResponse | null
  if (!entry) return null

  const maxAge = maxAgeFor(entry.tier)
  if (maxAge !== null && Date.now() - entry.storedAt > maxAge) return null
  return entry
}

export async function writeCache(key: string, entry: CachedResponse): Promise<void> {
  const store = getStore(RESPONSE_CACHE_STORE)
  await store.setJSON(key, entry)
}

/**
 * Opportunistically records which fixtures are finished from any response
 * that carries fixture objects with a status — /fixtures and
 * /fixtures/headtohead — so that fixture-scoped sub-resources know they can
 * be cached forever once the match is over. Cheap: it only parses JSON
 * already in hand, no extra network calls.
 */
export async function indexFixtureStatuses(pathname: string, bodyText: string): Promise<void> {
  if (pathname !== '/fixtures' && pathname !== '/fixtures/headtohead') return

  let parsed: unknown
  try {
    parsed = JSON.parse(bodyText)
  } catch {
    return
  }

  const response = (parsed as { response?: unknown }).response
  if (!Array.isArray(response)) return

  const store = getStore(FIXTURE_STATUS_STORE)
  const writes: Promise<unknown>[] = []

  for (const item of response) {
    const fixture = (item as { fixture?: { id?: number; status?: { short?: string } } }).fixture
    const id = fixture?.id
    const short = fixture?.status?.short
    if (id && short && FINISHED_STATUS_CODES.has(short)) {
      writes.push(store.set(`fixture:${id}`, 'finished'))
    }
  }

  await Promise.all(writes)
}

/** Stable cache key regardless of the order query params arrived in. */
export function buildCacheKey(pathname: string, params: URLSearchParams): string {
  const sorted = [...params.entries()].sort(([a], [b]) => a.localeCompare(b))
  const qs = new URLSearchParams(sorted).toString()
  return qs ? `${pathname}?${qs}` : pathname
}
