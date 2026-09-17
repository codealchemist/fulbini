import type { FixturePlayersStat } from '../../api/types'
import { PlayerAvatar } from '../common/PlayerAvatar'
import { Snapshottable } from '../common/Snapshottable'

export function TopPerformers({ teams }: { teams: FixturePlayersStat[] }) {
  return (
    <Snapshottable filename="top-performers.png" className="rounded-2xl">
      <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Top performers</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {teams.map((team) => {
            const ranked = [...team.players]
              .filter((p) => p.statistics[0]?.games.rating)
              .sort((a, b) => Number(b.statistics[0].games.rating) - Number(a.statistics[0].games.rating))
              .slice(0, 3)

            return (
              <div key={team.team.id}>
                <p className="mb-2 text-xs text-text-faint">{team.team.name}</p>
                <div className="space-y-1.5">
                  {ranked.map((p) => (
                    <div key={p.player.id} className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1.5">
                      <PlayerAvatar src={p.player.photo} alt={p.player.name} size={26} />
                      <span className="flex-1 truncate text-sm text-text">{p.player.name}</span>
                      <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent">
                        {Number(p.statistics[0].games.rating).toFixed(1)}
                      </span>
                    </div>
                  ))}
                  {ranked.length === 0 && <p className="text-xs text-text-faint">No ratings yet.</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Snapshottable>
  )
}
