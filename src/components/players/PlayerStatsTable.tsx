import type { PlayerStat } from '../../api/types'
import { TeamLogo } from '../common/TeamLogo'
import { Snapshottable } from '../common/Snapshottable'

export function PlayerStatsTable({ stats }: { stats: PlayerStat[] }) {
  return (
    <Snapshottable filename="player-stats.png" className="rounded-2xl">
      <div className="overflow-x-auto rounded-2xl border border-border-soft bg-surface/40">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs text-text-faint">
              <th className="px-4 py-2 font-medium">Team</th>
              <th className="px-2 py-2 font-medium">Competition</th>
              <th className="px-2 py-2 text-center font-medium">Apps</th>
              <th className="px-2 py-2 text-center font-medium">Mins</th>
              <th className="px-2 py-2 text-center font-medium">Goals</th>
              <th className="px-2 py-2 text-center font-medium">Assists</th>
              <th className="px-2 py-2 text-center font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr key={i} className="border-t border-border-soft">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <TeamLogo src={s.team.logo} alt={s.team.name} size={18} />
                    <span className="truncate text-text">{s.team.name}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-text-muted">{s.league.name}</td>
                <td className="px-2 py-2.5 text-center text-text-muted">{s.games.appearences ?? '—'}</td>
                <td className="px-2 py-2.5 text-center text-text-muted">{s.games.minutes ?? '—'}</td>
                <td className="px-2 py-2.5 text-center font-medium text-text">{s.goals.total ?? 0}</td>
                <td className="px-2 py-2.5 text-center font-medium text-text">{s.goals.assists ?? 0}</td>
                <td className="px-2 py-2.5 text-center text-text-muted">{s.games.rating ? Number(s.games.rating).toFixed(2) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Snapshottable>
  )
}
