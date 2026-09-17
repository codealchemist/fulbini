import { Bar } from 'react-chartjs-2'
import type { TeamStatisticsResponse } from '../../api/types'
import { baseChartOptions } from '../../lib/chartSetup'
import { Snapshottable } from '../common/Snapshottable'

export function TeamGoalsChart({ stats }: { stats: TeamStatisticsResponse }) {
  const data = {
    labels: ['Home', 'Away', 'Total'],
    datasets: [
      {
        label: 'Scored',
        data: [stats.goals.for.total.home, stats.goals.for.total.away, stats.goals.for.total.total],
        backgroundColor: '#22c55e',
        borderRadius: 4,
        maxBarThickness: 36,
      },
      {
        label: 'Conceded',
        data: [stats.goals.against.total.home, stats.goals.against.total.away, stats.goals.against.total.total],
        backgroundColor: '#ef4444',
        borderRadius: 4,
        maxBarThickness: 36,
      },
    ],
  }

  return (
    <Snapshottable filename="team-goals.png" className="rounded-2xl">
      <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Goals</h3>
        <div className="h-56">
          <Bar data={data} options={baseChartOptions} />
        </div>
      </div>
    </Snapshottable>
  )
}
