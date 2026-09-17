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

/**
 * Sends the browser straight to Google's OAuth screen via GoTrue's authorize
 * endpoint, skipping the widget's own login modal entirely. GoTrue redirects
 * back to this same origin with an `#access_token=...` hash afterwards,
 * which the widget's `init()` (already running — see AuthContext) picks up
 * on its own, same as it does for invite/recovery links.
 */
export function redirectToGoogleSignIn(): void {
  window.location.href = '/.netlify/identity/authorize?provider=google'
}

const UNAUTHORIZED_EVENT = 'identity:unauthorized'

/**
 * The football proxy function returns 401 when the token it was sent is
 * missing/invalid/expired (see netlify/functions/football.mts) — which can
 * happen even while the widget's own cached `currentUser()` still looks
 * "logged in" client-side (e.g. a refresh token that's since been revoked).
 * api/client.ts calls this on any 401 so AuthContext can drop back to the
 * signed-out state instead of leaving the app stuck showing broken,
 * half-authenticated panels everywhere.
 */
export function reportUnauthorized(): void {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
}

export function onUnauthorized(cb: () => void): () => void {
  window.addEventListener(UNAUTHORIZED_EVENT, cb)
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, cb)
}
