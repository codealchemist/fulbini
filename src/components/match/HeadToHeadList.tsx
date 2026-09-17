import { useNavigate } from 'react-router-dom'
import type { Fixture } from '../../api/types'
import { TeamLogo } from '../common/TeamLogo'
import { EmptyState } from '../common/EmptyState'
import { Snapshottable } from '../common/Snapshottable'

export function HeadToHeadList({ fixtures }: { fixtures: Fixture[] }) {
  const navigate = useNavigate()
  const recent = [...fixtures]
    .filter((fx) => fx.goals.home !== null)
    .sort((a, b) => b.fixture.timestamp - a.fixture.timestamp)
    .slice(0, 5)

  return (
    <Snapshottable filename="head-to-head.png" className="rounded-2xl">
      <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Head to head</h3>
        {recent.length === 0 ? (
          <EmptyState message="No previous meetings found." />
        ) : (
          <div className="space-y-2">
            {recent.map((fx) => (
              <button
                key={fx.fixture.id}
                onClick={() => navigate(`/matches/${fx.fixture.id}`)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-surface-hover"
              >
                <span className="w-20 shrink-0 text-left text-xs text-text-faint">
                  {new Date(fx.fixture.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <TeamLogo src={fx.teams.home.logo} alt={fx.teams.home.name} size={16} />
                <span className="flex-1 truncate text-text-muted">{fx.teams.home.name}</span>
                <span className="font-semibold text-text tabular-nums">
                  {fx.goals.home} – {fx.goals.away}
                </span>
                <span className="flex-1 truncate text-right text-text-muted">{fx.teams.away.name}</span>
                <TeamLogo src={fx.teams.away.logo} alt={fx.teams.away.name} size={16} />
              </button>
            ))}
          </div>
        )}
      </div>
    </Snapshottable>
  )
}
