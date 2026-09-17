import { AlertTriangle, RotateCw } from 'lucide-react'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
      <AlertTriangle className="text-live" size={28} strokeWidth={1.75} />
      <p className="text-sm text-text-muted max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-text hover:bg-surface-2 transition-colors"
        >
          <RotateCw size={13} /> Retry
        </button>
      )}
    </div>
  )
}
