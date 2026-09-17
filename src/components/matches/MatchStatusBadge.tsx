import clsx from 'clsx'
import { LIVE_STATUS_CODES, type FixtureStatus } from '../../api/types'
import { formatKickoff } from '../../lib/date'

export function MatchStatusBadge({ status, dateIso }: { status: FixtureStatus; dateIso: string }) {
  const isLive = LIVE_STATUS_CODES.has(status.short)
  const isFinished = ['FT', 'AET', 'PEN'].includes(status.short)
  const isPostponed = ['PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(status.short)

  if (isLive) {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-live-soft px-2 py-0.5 text-xs font-semibold text-live">
        <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
        {status.short === 'HT' ? 'HT' : `${status.elapsed ?? ''}'`}
      </span>
    )
  }

  if (isFinished) {
    return <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-muted">FT</span>
  }

  if (isPostponed) {
    return <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-faint">{status.short}</span>
  }

  return <span className={clsx('text-xs font-medium text-text-muted')}>{formatKickoff(dateIso)}</span>
}
