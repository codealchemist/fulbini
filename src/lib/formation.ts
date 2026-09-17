import type { LineupPlayer } from '../api/types'

export interface PositionedPlayer {
  player: LineupPlayer['player']
  x: number
  y: number
}

/**
 * Converts API-Football's `grid` string ("row:col") into pitch percentage
 * coordinates. Home team is anchored to the bottom half attacking upward,
 * away team to the top half attacking downward, mirroring a broadcast graphic.
 */
export function computeFormationPositions(startXI: LineupPlayer[], side: 'home' | 'away'): PositionedPlayer[] {
  const withGrid = startXI.filter((p) => p.player.grid)
  if (withGrid.length === 0) return []

  const rows = new Map<number, LineupPlayer[]>()
  let maxRow = 1
  for (const p of withGrid) {
    const [rowStr] = p.player.grid!.split(':')
    const row = Number(rowStr)
    maxRow = Math.max(maxRow, row)
    if (!rows.has(row)) rows.set(row, [])
    rows.get(row)!.push(p)
  }

  const positioned: PositionedPlayer[] = []
  for (const [row, players] of rows) {
    const sorted = [...players].sort((a, b) => {
      const colA = Number(a.player.grid!.split(':')[1])
      const colB = Number(b.player.grid!.split(':')[1])
      return colA - colB
    })
    sorted.forEach((p, i) => {
      const x = ((i + 1) / (sorted.length + 1)) * 100
      const progress = maxRow > 1 ? (row - 1) / (maxRow - 1) : 0
      const y = side === 'home' ? 95 - progress * 45 : 5 + progress * 45
      positioned.push({ player: p.player, x, y })
    })
  }

  return positioned
}
