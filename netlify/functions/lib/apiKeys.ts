import { getStore } from '@netlify/blobs'

// Multiple API-Football accounts, load-balanced round robin, so combined
// daily quota scales with the number of accounts instead of being capped by
// a single one. Set API_FOOTBALL_KEYS to a comma-separated list; falls back
// to the single API_FOOTBALL_KEY if that's not set, so existing single-key
// deployments keep working unchanged.
function parseKeys(): string[] {
  const multi = process.env.API_FOOTBALL_KEYS
  if (multi) {
    const keys = multi
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    if (keys.length > 0) return keys
  }
  const single = process.env.API_FOOTBALL_KEY?.trim()
  return single ? [single] : []
}

export const API_KEYS: string[] = parseKeys()

const ROTATION_STORE = 'football-key-rotation'
const COUNTER_KEY = 'counter'

export interface SelectedKey {
  key: string
  index: number
}

/**
 * Picks the next key via a counter shared (through Netlify Blobs) across
 * every invocation and container, so rotation is a real round robin across
 * all traffic rather than just within one warm function instance.
 *
 * Not perfectly atomic under concurrent requests — two invocations can read
 * the same counter value before either writes back, landing on the same key
 * — but that's fine here: load balancing only needs to be roughly even, not
 * exact. If the counter itself is unavailable (a Blobs hiccup), fall back to
 * a time-based pick rather than failing the request — same "the cache layer
 * must never block real functionality" principle as cache.ts.
 */
export async function nextApiKey(): Promise<SelectedKey> {
  if (API_KEYS.length === 0) {
    throw new Error('No API_FOOTBALL_KEY(S) configured')
  }
  if (API_KEYS.length === 1) {
    return { key: API_KEYS[0], index: 0 }
  }

  try {
    const store = getStore(ROTATION_STORE)
    const raw = await store.get(COUNTER_KEY, { type: 'text' })
    const counter = raw ? Number(raw) : 0
    const index = counter % API_KEYS.length
    await store.set(COUNTER_KEY, String(counter + 1))
    return { key: API_KEYS[index], index }
  } catch (err) {
    console.error('[football] key rotation counter unavailable, falling back to a time-based pick:', err)
    const index = Date.now() % API_KEYS.length
    return { key: API_KEYS[index], index }
  }
}
