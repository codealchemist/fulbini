import { Radar } from 'react-chartjs-2'
import type { PlayerStat } from '../../api/types'
import { Snapshottable } from '../common/Snapshottable'
import '../../lib/chartSetup'

export function PlayerRadarChart({ stat }: { stat: PlayerStat }) {
  const metrics = [
    { label: 'Goals', value: stat.goals.total ?? 0, max: 25 },
    { label: 'Assists', value: stat.goals.assists ?? 0, max: 20 },
    { label: 'Shots on target', value: stat.shots.on ?? 0, max: 40 },
    { label: 'Key passes', value: stat.passes.key ?? 0, max: 60 },
    { label: 'Tackles', value: stat.tackles.total ?? 0, max: 60 },
    { label: 'Dribbles won', value: stat.dribbles.success ?? 0, max: 50 },
  ]

  const data = {
    labels: metrics.map((m) => m.label),
    datasets: [
      {
        label: `${stat.games.position} · ${stat.league.season}`,
        data: metrics.map((m) => Math.min(100, Math.round((m.value / m.max) * 100))),
        backgroundColor: 'rgba(34,197,94,0.25)',
        borderColor: '#22c55e',
        pointBackgroundColor: '#22c55e',
      },
    ],
  }

  return (
    <Snapshottable filename="player-radar.png" className="rounded-2xl">
      <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Performance profile</h3>
        <div className="mx-auto h-72 max-w-md">
          <Radar
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  angleLines: { color: '#1a202b' },
                  grid: { color: '#1a202b' },
                  pointLabels: { color: '#8993a4', font: { size: 11 } },
                  ticks: { display: false, backdropColor: 'transparent' },
                  suggestedMin: 0,
                  suggestedMax: 100,
                },
              },
              plugins: {
                legend: { labels: { color: '#8993a4' } },
                tooltip: { backgroundColor: '#171c25', titleColor: '#e8ecf1', bodyColor: '#e8ecf1' },
              },
            }}
          />
        </div>
        <p className="mt-2 text-center text-[11px] text-text-faint">Values scaled 0–100 relative to a strong single-season benchmark.</p>
      </div>
    </Snapshottable>
  )
}
