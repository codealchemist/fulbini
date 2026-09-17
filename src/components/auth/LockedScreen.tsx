import { LogIn, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function LockedScreen() {
  const { login } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <img src="/favicon.svg" alt="" width={64} height={64} className="rounded-2xl" />

      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-text">Fulbini is invite-only</h1>
        <p className="max-w-sm text-sm text-text-muted">
          Sign in with the account you were invited with to continue. If you followed an invite link from your
          email, sign in and set your password there first.
        </p>
      </div>

      <button
        onClick={login}
        className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[#05130a] hover:bg-accent/90 transition-colors"
      >
        <LogIn size={16} />
        Sign in
      </button>

      <p className="flex items-center gap-1.5 text-xs text-text-faint">
        <ShieldCheck size={13} />
        Access is by invitation only.
      </p>
    </div>
  )
}
