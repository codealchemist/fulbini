import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

export function EmptyState({ message, icon: Icon = Inbox }: { message: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4 text-text-faint">
      <Icon size={28} strokeWidth={1.5} />
      <p className="text-sm">{message}</p>
    </div>
  )
}
