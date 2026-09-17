import type { ApiEnvelope } from './types'
import { getAuthToken } from '../lib/identityClient'

const BASE = '/api/football'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

function buildQuery(params?: Record<string, string | number | boolean | undefined | null>) {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

// The football proxy function requires a signed-in Netlify Identity user
// (see netlify/functions/football.mts) — the app itself is invite-only and
// gated on this same session, so a token is always available by the time
// any page actually calls this, but requests fail cleanly (401) if not.
async function authorizedFetch(url: string, signal?: AbortSignal): Promise<Response> {
  const token = await getAuthToken()
  return fetch(url, {
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  signal?: AbortSignal,
): Promise<T[]> {
  const res = await authorizedFetch(`${BASE}${path}${buildQuery(params)}`, signal)

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // ignore parse failure, keep default message
    }
    throw new ApiError(message, res.status)
  }

  // The API documents 204 No Content as a normal empty-result response for
  // every endpoint; there's no JSON body to parse in that case.
  if (res.status === 204) return []

  const data = (await res.json()) as ApiEnvelope<T>

  if (data.errors && Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors ?? {}).length > 0) {
    const detail = Array.isArray(data.errors) ? data.errors.join(', ') : Object.values(data.errors).join(', ')
    throw new ApiError(detail || 'The API rejected this request', 400)
  }

  return data.response
}

/**
 * A handful of API-Football endpoints (e.g. /teams/statistics) return a single
 * object in `response` rather than an array. This mirrors apiGet without the
 * array-shaped envelope type.
 */
export async function apiGetObject<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  signal?: AbortSignal,
): Promise<T> {
  const res = await authorizedFetch(`${BASE}${path}${buildQuery(params)}`, signal)

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // ignore parse failure, keep default message
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return {} as T

  const data = (await res.json()) as { response: T; errors: unknown[] | Record<string, string> }

  if (data.errors && Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors ?? {}).length > 0) {
    const detail = Array.isArray(data.errors) ? data.errors.join(', ') : Object.values(data.errors).join(', ')
    throw new ApiError(detail || 'The API rejected this request', 400)
  }

  return data.response
}
