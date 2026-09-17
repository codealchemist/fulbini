import { Doughnut } from 'react-chartjs-2'
import { ArcElement, Chart as ChartJS } from 'chart.js'
import type { TeamStatisticsResponse } from '../../api/types'
import { baseChartOptions } from '../../lib/chartSetup'
import { Snapshottable } from '../common/Snapshottable'

ChartJS.register(ArcElement)

export function TeamResultsChart({ stats }: { stats: TeamStatisticsResponse }) {
  const { wins, draws, loses } = stats.fixtures

  const data = {
    labels: ['Wins', 'Draws', 'Losses'],
    datasets: [
      {
        data: [wins.total, draws.total, loses.total],
        backgroundColor: ['#22c55e', '#8993a4', '#ef4444'],
        borderWidth: 0,
      },
    ],
  }

  return (
    <Snapshottable filename="team-results.png" className="rounded-2xl">
      <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Season record</h3>
        <div className="mx-auto h-52 max-w-[220px]">
          <Doughnut
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { ...baseChartOptions.plugins, legend: { position: 'bottom', labels: { color: '#8993a4' } } },
            }}
          />
        </div>
      </div>
    </Snapshottable>
  )
}
