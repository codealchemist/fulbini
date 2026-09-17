import type { FixtureLineup } from '../../api/types'
import { computeFormationPositions } from '../../lib/formation'
import { TeamLogo } from '../common/TeamLogo'
import { PlayerAvatar } from '../common/PlayerAvatar'
import { Snapshottable } from '../common/Snapshottable'

export function FormationPitch({ home, away }: { home: FixtureLineup; away: FixtureLineup }) {
  const homePositions = computeFormationPositions(home.startXI, 'home')
  const awayPositions = computeFormationPositions(away.startXI, 'away')

  return (
    <Snapshottable filename="lineups.png" className="rounded-2xl">
      <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <TeamHeader team={home.team} formation={home.formation} coach={home.coach.name} align="left" />
          <TeamHeader team={away.team} formation={away.formation} coach={away.coach.name} align="right" />
        </div>

        <div className="relative aspect-[3/4] w-full max-w-xl mx-auto overflow-hidden rounded-xl border border-border-soft bg-[#0d3b20]">
          <PitchMarkings />

          {homePositions.map((p) => (
            <PlayerDot key={`h-${p.player.id}`} pos={p} colorClass="bg-accent text-[#05130a]" />
          ))}
          {awayPositions.map((p) => (
            <PlayerDot key={`a-${p.player.id}`} pos={p} colorClass="bg-info text-[#04202f]" />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SubstitutesList title={`${home.team.name} bench`} lineup={home} />
          <SubstitutesList title={`${away.team.name} bench`} lineup={away} />
        </div>
      </div>
    </Snapshottable>
  )
}

function TeamHeader({
  team,
  formation,
  coach,
  align,
}: {
  team: FixtureLineup['team']
  formation: string
  coach: string
  align: 'left' | 'right'
}) {
  return (
    <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <TeamLogo src={team.logo} alt={team.name} size={28} />
      <div>
        <p className="font-medium text-text">{team.name}</p>
        <p className="text-xs text-text-faint">
          {formation} · {coach}
        </p>
      </div>
    </div>
  )
}

function PlayerDot({ pos, colorClass }: { pos: ReturnType<typeof computeFormationPositions>[number]; colorClass: string }) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow ${colorClass}`}>
        {pos.player.number}
      </div>
      <span className="max-w-[72px] truncate rounded bg-black/50 px-1 text-[10px] text-white">{pos.player.name}</span>
    </div>
  )
}

function PitchMarkings() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.4" />
      <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.4" />
      <rect x="20" y="0" width="60" height="16" fill="none" stroke="white" strokeWidth="0.4" />
      <rect x="20" y="84" width="60" height="16" fill="none" stroke="white" strokeWidth="0.4" />
    </svg>
  )
}

function SubstitutesList({ title, lineup }: { title: string; lineup: FixtureLineup }) {
  return (
    <div className="rounded-xl border border-border-soft p-3">
      <p className="mb-2 text-xs uppercase tracking-wide text-text-faint">{title}</p>
      <div className="flex flex-wrap gap-2">
        {lineup.substitutes.map((s) => (
          <div key={s.player.id} className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-1 text-xs text-text-muted">
            <PlayerAvatar src={null} alt={s.player.name} size={16} />
            {s.player.name}
          </div>
        ))}
      </div>
    </div>
  )
}
