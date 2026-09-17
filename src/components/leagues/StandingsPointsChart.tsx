import { Bar } from 'react-chartjs-2'
import type { StandingRow } from '../../api/types'
import { CHART_ACCENT, baseChartOptions } from '../../lib/chartSetup'
import { Snapshottable } from '../common/Snapshottable'

export function StandingsPointsChart({ rows }: { rows: StandingRow[] }) {
  const data = {
    labels: rows.map((r) => r.team.name),
    datasets: [
      {
        label: 'Points',
        data: rows.map((r) => r.points),
        backgroundColor: CHART_ACCENT,
        borderRadius: 4,
        maxBarThickness: 28,
      },
    ],
  }

  return (
    <Snapshottable filename="league-points.png" className="rounded-2xl">
      <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Points by team</h3>
        <div style={{ height: Math.max(220, rows.length * 26) }}>
          <Bar
            data={data}
            options={{
              ...baseChartOptions,
              indexAxis: 'y' as const,
              plugins: { ...baseChartOptions.plugins, legend: { display: false } },
            }}
          />
        </div>
      </div>
    </Snapshottable>
  )
}
