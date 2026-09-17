import { CalendarClock } from 'lucide-react'
import clsx from 'clsx'

export function UpcomingToggle({ active, onToggle, count }: { active: boolean; onToggle: () => void; count: number }) {
  return (
    <button
      onClick={onToggle}
      className={clsx(
        'flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors',
        active ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface text-text hover:border-accent/50 hover:bg-surface-hover',
      )}
    >
      <CalendarClock size={16} />
      Upcoming
      <span className={clsx('rounded-full px-1.5 py-0.5 text-xs', active ? 'bg-accent/20' : 'bg-surface-2 text-text-faint')}>{count}</span>
    </button>
  )
}
