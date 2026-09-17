import type { FixtureStatistics } from '../../api/types'
import { Snapshottable } from '../common/Snapshottable'

export function FixtureStatsCompare({ home, away }: { home: FixtureStatistics; away: FixtureStatistics }) {
  const rows = home.statistics.map((stat, i) => ({
    type: stat.type,
    home: stat.value,
    away: away.statistics[i]?.value ?? null,
  }))

  return (
    <Snapshottable filename="match-statistics.png" className="rounded-2xl">
      <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Match statistics</h3>
        <div className="space-y-3">
          {rows.map((row) => (
            <StatRow key={row.type} {...row} />
          ))}
        </div>
      </div>
    </Snapshottable>
  )
}

function StatRow({ type, home, away }: { type: string; home: number | string | null; away: number | string | null }) {
  const homeNum = toNumber(home)
  const awayNum = toNumber(away)
  const total = homeNum + awayNum || 1
  const homePct = (homeNum / total) * 100

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
        <span className="font-medium text-text">{home ?? 0}</span>
        <span>{type}</span>
        <span className="font-medium text-text">{away ?? 0}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="bg-accent" style={{ width: `${homePct}%` }} />
        <div className="bg-info" style={{ width: `${100 - homePct}%` }} />
      </div>
    </div>
  )
}

function toNumber(value: number | string | null): number {
  if (value === null) return 0
  if (typeof value === 'number') return value
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}
