import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { NetlifyIdentity, NetlifyIdentityUser } from 'netlify-identity-widget'
import { loadIdentity, onUnauthorized } from '../lib/identityClient'

interface AuthValue {
  user: NetlifyIdentityUser | null
  ready: boolean
  login: () => void
  signup: () => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

// Netlify Identity (GoTrue) is a hosted-only backend — `netlify dev` can't
// run it locally like it does Functions/Blobs, so a local page's request
// gets redirected to the real production identity endpoint and blocked by
// its CORS policy (which only trusts the production origin). There's no way
// to make the real Google-login flow work against localhost, so local dev
// can opt into a fake session instead: set VITE_DEV_BYPASS_AUTH=true in a
// local .env. `import.meta.env.DEV` makes this whole branch dead code in a
// production build (Vite statically replaces it with `false` and strips
// it) — the env var alone can't do anything in a real deploy.
const DEV_BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'
const DEV_USER: NetlifyIdentityUser = {
  id: 'local-dev-user',
  email: 'local-dev@fulbini.test',
  user_metadata: { full_name: 'Local Dev' },
  app_metadata: {},
  // Never actually called: getAuthToken() reads from the identityClient
  // singleton (which stays unloaded in bypass mode), not this object, and
  // the backend's own dev bypass (NETLIFY_DEV) doesn't require a token.
  jwt: () => Promise.resolve('local-dev-fake-token'),
}

// Requires "Identity" to be enabled for this site in Netlify (Site
// configuration > Identity), and Google added under External providers
// there for the Google button to appear in the widget's login modal.
//
// netlify-identity-widget bundles Preact + mobx (~60kB gzipped) — loaded
// lazily (via lib/identityClient) so it doesn't block the initial paint.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NetlifyIdentityUser | null>(DEV_BYPASS_AUTH ? DEV_USER : null)
  const [ready, setReady] = useState(DEV_BYPASS_AUTH)
  const identityRef = useRef<NetlifyIdentity | null>(null)

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      console.warn('[dev] VITE_DEV_BYPASS_AUTH is on — skipping Netlify Identity entirely with a fake session.')
      return
    }
    let cancelled = false

    // Belt-and-braces: if the widget's 'init' event never fires for any
    // reason (blocked request, ad blocker, some edge case we haven't hit),
    // the app must not hang on "Checking your session…" forever — fail open
    // to signed-out after a few seconds so the sign-in screen shows instead.
    const timeout = setTimeout(() => {
      console.warn('Netlify Identity did not initialize within 8s — showing sign-in.')
      if (!cancelled) setReady(true)
    }, 8000)

    loadIdentity()
      .then((netlifyIdentity) => {
        if (cancelled) return
        identityRef.current = netlifyIdentity

        netlifyIdentity.on('init', (u) => {
          clearTimeout(timeout)
          setUser(u)
          setReady(true)
        })
        netlifyIdentity.on('login', (u) => {
          setUser(u)
          netlifyIdentity.close()
        })
        netlifyIdentity.on('logout', () => setUser(null))
        netlifyIdentity.on('error', (err) => console.error('Netlify Identity error:', err))

        netlifyIdentity.init()
      })
      .catch((err) => {
        // The app is gated on `ready` — if the widget itself fails to load,
        // fail open to "not signed in" rather than an infinite loading screen.
        console.error('Failed to load Netlify Identity:', err)
        clearTimeout(timeout)
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
      clearTimeout(timeout)
      identityRef.current?.off('init')
      identityRef.current?.off('login')
      identityRef.current?.off('logout')
      identityRef.current?.off('error')
    }
  }, [])

  useEffect(
    () =>
      onUnauthorized(() => {
        // A locally-cached session that the server no longer accepts (e.g. a
        // revoked refresh token) — clear it so the widget doesn't keep
        // resurrecting the same broken user, and drop back to signed-out.
        void identityRef.current?.logout()
        setUser(null)
      }),
    [],
  )

  const value: AuthValue = {
    user,
    ready,
    login: () => identityRef.current?.open('login'),
    signup: () => identityRef.current?.open('signup'),
    logout: () => {
      void identityRef.current?.logout()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
