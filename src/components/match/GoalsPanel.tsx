import { Goal as GoalIcon } from 'lucide-react'
import { GOAL_EVENT_DETAILS, type Fixture, type FixtureEvent } from '../../api/types'
import { TeamLogo } from '../common/TeamLogo'
import { PlayerAvatar } from '../common/PlayerAvatar'
import { EmptyState } from '../common/EmptyState'
import { Snapshottable } from '../common/Snapshottable'

function formatMinute(time: FixtureEvent['time']): string {
  return time.extra ? `${time.elapsed}+${time.extra}'` : `${time.elapsed}'`
}

export function GoalsPanel({ fixture, events }: { fixture: Fixture; events: FixtureEvent[] }) {
  const goals = events
    .filter((e) => e.type === 'Goal' && GOAL_EVENT_DETAILS.has(e.detail))
    .sort((a, b) => a.time.elapsed + (a.time.extra ?? 0) / 100 - (b.time.elapsed + (b.time.extra ?? 0) / 100))

  return (
    <Snapshottable filename="goals.png" className="rounded-2xl">
      <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <GoalIcon size={15} className="text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Goals</h3>
        </div>

        {goals.length === 0 ? (
          <EmptyState message="No goals scored yet." icon={GoalIcon} />
        ) : (
          <ul className="space-y-2.5">
            {goals.map((goal, i) => {
              const isHome = goal.team.id === fixture.teams.home.id
              return (
                <li
                  key={i}
                  className={`flex items-center gap-3 ${isHome ? 'flex-row' : 'flex-row-reverse text-right'}`}
                >
                  <span className="w-11 shrink-0 rounded-full bg-surface-2 py-1 text-center text-xs font-semibold tabular-nums text-text-muted">
                    {formatMinute(goal.time)}
                  </span>
                  <PlayerAvatar src={null} alt={goal.player.name ?? 'Unknown player'} size={26} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {goal.player.name ?? 'Unknown player'}
                      {goal.detail === 'Own Goal' && <span className="ml-1 text-xs font-normal text-live">(OG)</span>}
                      {goal.detail === 'Penalty' && <span className="ml-1 text-xs font-normal text-text-faint">(pen.)</span>}
                    </p>
                    {goal.assist.name && <p className="truncate text-xs text-text-faint">assist: {goal.assist.name}</p>}
                  </div>
                  <TeamLogo src={goal.team.logo} alt={goal.team.name} size={20} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Snapshottable>
  )
}
