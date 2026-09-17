import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { NetlifyIdentity, NetlifyIdentityUser } from 'netlify-identity-widget'
import { loadIdentity } from '../lib/identityClient'

interface AuthValue {
  user: NetlifyIdentityUser | null
  ready: boolean
  login: () => void
  signup: () => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

// Requires "Identity" to be enabled for this site in Netlify (Site
// configuration > Identity), and Google added under External providers
// there for the Google button to appear in the widget's login modal.
//
// netlify-identity-widget bundles Preact + mobx (~60kB gzipped) — loaded
// lazily (via lib/identityClient) so it doesn't block the initial paint.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NetlifyIdentityUser | null>(null)
  const [ready, setReady] = useState(false)
  const identityRef = useRef<NetlifyIdentity | null>(null)

  useEffect(() => {
    let cancelled = false

    loadIdentity()
      .then((netlifyIdentity) => {
        if (cancelled) return
        identityRef.current = netlifyIdentity

        netlifyIdentity.on('init', (u) => {
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
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
      identityRef.current?.off('init')
      identityRef.current?.off('login')
      identityRef.current?.off('logout')
      identityRef.current?.off('error')
    }
  }, [])

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
