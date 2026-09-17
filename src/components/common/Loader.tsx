import { Loader2 } from 'lucide-react'

export function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
      <Loader2 className="animate-spin" size={28} strokeWidth={1.75} />
      <span className="text-sm">{label}</span>
    </div>
  )
}
