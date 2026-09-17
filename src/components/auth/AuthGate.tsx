import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Loader } from '../common/Loader'
import { LockedScreen } from './LockedScreen'

/**
 * Gates the entire app behind a Netlify Identity session. Nothing in
 * `children` — including the header/nav chrome — renders until a user is
 * signed in, since this is an invite-only app with no public content.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Checking your session…" />
      </div>
    )
  }

  if (!user) {
    return <LockedScreen />
  }

  return <>{children}</>
}
