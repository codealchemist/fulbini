import { LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function AccountButton({ className }: { className?: string }) {
  const { user, ready, login, logout } = useAuth()

  if (!ready) return null

  if (!user) {
    return (
      <button
        onClick={login}
        className={`flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-sm text-text hover:border-accent/50 hover:bg-surface-hover transition-colors ${className ?? ''}`}
      >
        <LogIn size={15} />
        Sign in
      </button>
    )
  }

  const label = user.user_metadata?.full_name || user.email

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <span className="hidden max-w-[10rem] truncate text-xs text-text-muted lg:inline">{label}</span>
      <button
        onClick={logout}
        title={`Sign out (${label})`}
        aria-label="Sign out"
        className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-text-muted hover:border-live/50 hover:text-live transition-colors"
      >
        <LogOut size={15} />
      </button>
    </div>
  )
}
