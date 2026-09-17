import type { NetlifyIdentity } from 'netlify-identity-widget'

// Single shared instance of the (lazily-loaded) widget, so both the React
// auth state (AuthContext) and the plain API client (api/client.ts, which
// isn't a hook and can't call useAuth()) talk to the same widget without
// loading it twice.
let instance: NetlifyIdentity | null = null
let loadPromise: Promise<NetlifyIdentity> | null = null

export function loadIdentity(): Promise<NetlifyIdentity> {
  if (!loadPromise) {
    loadPromise = import('netlify-identity-widget').then((mod) => {
      instance = mod.default
      return instance
    })
  }
  return loadPromise
}

/**
 * The current user's access token, refreshed by gotrue-js if it's expired —
 * or null if nobody's signed in (or the widget hasn't loaded yet). Sent as
 * the Authorization header on every API call so the football proxy function
 * can verify it server-side; see netlify/functions/football.mts.
 */
export async function getAuthToken(): Promise<string | null> {
  const user = instance?.currentUser()
  if (!user) return null
  try {
    return (await user.jwt()) ?? null
  } catch {
    return null
  }
}
