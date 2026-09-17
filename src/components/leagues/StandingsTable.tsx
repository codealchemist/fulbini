import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import type { StandingRow } from '../../api/types'
import { TeamLogo } from '../common/TeamLogo'
import { Snapshottable } from '../common/Snapshottable'

export function StandingsTable({ rows, title }: { rows: StandingRow[]; title?: string }) {
  const navigate = useNavigate()

  return (
    <Snapshottable filename="standings.png" className="rounded-2xl">
      <div className="overflow-x-auto rounded-2xl border border-border-soft bg-surface/40">
        {title && <div className="border-b border-border-soft px-4 py-3 text-sm font-medium text-text-muted">{title}</div>}
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs text-text-faint">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-2 py-2 font-medium">Team</th>
              <th className="px-2 py-2 text-center font-medium">P</th>
              <th className="px-2 py-2 text-center font-medium">W</th>
              <th className="px-2 py-2 text-center font-medium">D</th>
              <th className="px-2 py-2 text-center font-medium">L</th>
              <th className="px-2 py-2 text-center font-medium">GD</th>
              <th className="px-2 py-2 text-center font-medium">Pts</th>
              <th className="hidden px-3 py-2 font-medium sm:table-cell">Form</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.team.id}
                onClick={() => navigate(`/teams/${row.team.id}`)}
                className="cursor-pointer border-t border-border-soft hover:bg-surface-hover"
              >
                <td className="px-4 py-2.5 text-text-faint">{row.rank}</td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <TeamLogo src={row.team.logo} alt={row.team.name} size={20} />
                    <span className="truncate font-medium text-text">{row.team.name}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center text-text-muted">{row.all.played}</td>
                <td className="px-2 py-2.5 text-center text-text-muted">{row.all.win}</td>
                <td className="px-2 py-2.5 text-center text-text-muted">{row.all.draw}</td>
                <td className="px-2 py-2.5 text-center text-text-muted">{row.all.lose}</td>
                <td className="px-2 py-2.5 text-center text-text-muted">{row.goalsDiff}</td>
                <td className="px-2 py-2.5 text-center font-semibold text-text">{row.points}</td>
                <td className="hidden px-3 py-2.5 sm:table-cell">
                  <FormBadges form={row.form} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Snapshottable>
  )
}

function FormBadges({ form }: { form: string | null }) {
  if (!form) return null
  return (
    <div className="flex gap-1">
      {form
        .slice(-5)
        .split('')
        .map((c, i) => (
          <span
            key={i}
            className={clsx(
              'flex h-4 w-4 items-center justify-center rounded-[4px] text-[9px] font-bold',
              c === 'W' && 'bg-accent-soft text-accent',
              c === 'D' && 'bg-surface-2 text-text-muted',
              c === 'L' && 'bg-live-soft text-live',
            )}
          >
            {c}
          </span>
        ))}
    </div>
  )
}
