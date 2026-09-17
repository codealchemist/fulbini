import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import type { Fixture } from '../../api/types'
import { LIVE_STATUS_CODES } from '../../api/types'
import { TeamLogo } from '../common/TeamLogo'
import { MatchStatusBadge } from './MatchStatusBadge'

export function MatchCard({ fixture }: { fixture: Fixture }) {
  const navigate = useNavigate()
  const isLive = LIVE_STATUS_CODES.has(fixture.fixture.status.short)
  const hasScore = fixture.goals.home !== null

  return (
    <button
      onClick={() => navigate(`/matches/${fixture.fixture.id}`)}
      className={clsx(
        'w-full rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-accent/50 hover:bg-surface-hover',
        isLive && 'border-live/30',
      )}
    >
      <div className="mb-2 flex items-center justify-between text-xs text-text-faint">
        <span className="truncate">{fixture.league.name}</span>
        <MatchStatusBadge status={fixture.fixture.status} dateIso={fixture.fixture.date} />
      </div>

      <div className="space-y-1.5">
        <TeamRow name={fixture.teams.home.name} logo={fixture.teams.home.logo} score={fixture.goals.home} shown={hasScore} winner={fixture.teams.home.winner} />
        <TeamRow name={fixture.teams.away.name} logo={fixture.teams.away.logo} score={fixture.goals.away} shown={hasScore} winner={fixture.teams.away.winner} />
      </div>
    </button>
  )
}

function TeamRow({
  name,
  logo,
  score,
  shown,
  winner,
}: {
  name: string
  logo: string
  score: number | null
  shown: boolean
  winner?: boolean | null
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <TeamLogo src={logo} alt={name} size={20} />
        <span className={clsx('truncate text-sm', winner ? 'text-text font-semibold' : 'text-text-muted')}>{name}</span>
      </div>
      {shown && <span className={clsx('text-sm tabular-nums', winner ? 'font-bold text-text' : 'text-text-muted')}>{score}</span>}
    </div>
  )
}
