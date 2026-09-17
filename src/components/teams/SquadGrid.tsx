import { useNavigate } from 'react-router-dom'
import type { SquadPlayer } from '../../api/types'
import { PlayerAvatar } from '../common/PlayerAvatar'
import { Snapshottable } from '../common/Snapshottable'

export function SquadGrid({ players }: { players: SquadPlayer[] }) {
  const navigate = useNavigate()
  const byPosition = groupByPosition(players)

  return (
    <Snapshottable filename="squad.png" className="rounded-2xl">
      <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Squad</h3>
        <div className="space-y-4">
          {byPosition.map(([position, group]) => (
            <div key={position}>
              <p className="mb-2 text-xs uppercase tracking-wide text-text-faint">{position}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {group.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/players/${p.id}`)}
                    className="flex items-center gap-2.5 rounded-xl border border-border-soft bg-surface px-2.5 py-2 text-left hover:border-accent/50 hover:bg-surface-hover transition-colors"
                  >
                    <PlayerAvatar src={p.photo} alt={p.name} size={32} />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text">{p.name}</p>
                      <p className="text-xs text-text-faint">{p.number ? `#${p.number}` : '—'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Snapshottable>
  )
}

function groupByPosition(players: SquadPlayer[]): Array<[string, SquadPlayer[]]> {
  const order = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker']
  const map = new Map<string, SquadPlayer[]>()
  for (const p of players) {
    const key = p.position || 'Other'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return Array.from(map.entries()).sort((a, b) => {
    const ai = order.indexOf(a[0])
    const bi = order.indexOf(b[0])
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}
