import { Trophy } from 'lucide-react'
import type { Fixture } from '../../api/types'

export function LeagueFilterSelect({
  fixtures,
  value,
  onChange,
}: {
  fixtures: Fixture[]
  value: number | null
  onChange: (leagueId: number | null) => void
}) {
  const leagues = Array.from(new Map(fixtures.map((fx) => [fx.league.id, fx.league])).values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  if (leagues.length === 0) return null

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-sm">
      <Trophy size={16} className="text-text-muted shrink-0" />
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="bg-transparent text-text outline-none max-w-[9rem] sm:max-w-none"
      >
        <option value="" className="bg-surface-2">
          All leagues
        </option>
        {leagues.map((l) => (
          <option key={l.id} value={l.id} className="bg-surface-2">
            {l.name}
          </option>
        ))}
      </select>
    </div>
  )
}
