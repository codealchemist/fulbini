import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { getCoach } from '../api/endpoints'
import { useApi } from '../hooks/useApi'
import { Loader } from '../components/common/Loader'
import { ErrorState } from '../components/common/ErrorState'
import { PlayerAvatar } from '../components/common/PlayerAvatar'
import { TeamLogo } from '../components/common/TeamLogo'
import { Snapshottable } from '../components/common/Snapshottable'

export function CoachPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const coachId = Number(id)

  const { data, loading, error, refetch } = useApi((signal) => getCoach(coachId, signal), [coachId])
  const coach = data?.[0]

  if (loading) return <Loader label="Loading coach…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!coach) return null

  return (
    <div className="space-y-5">
      <Snapshottable filename={`${coach.name}.png`} className="rounded-2xl">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border-soft bg-surface/40 p-5">
          <PlayerAvatar src={coach.photo} alt={coach.name} size={72} />
          <div>
            <h1 className="text-xl font-semibold text-text">{coach.name}</h1>
            <p className="text-sm text-text-faint">
              {coach.nationality}
              {coach.age ? ` · ${coach.age} yrs` : ''}
            </p>
          </div>

          {coach.team && (
            <button
              onClick={() => navigate(`/teams/${coach.team!.id}`)}
              className="ml-auto flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm hover:border-accent/50 hover:bg-surface-hover"
            >
              <TeamLogo src={coach.team.logo} alt={coach.team.name} size={20} />
              {coach.team.name}
            </button>
          )}
        </div>
      </Snapshottable>

      <Snapshottable filename={`${coach.name}-career.png`} className="rounded-2xl">
        <div className="rounded-2xl border border-border-soft bg-surface/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Career</h3>
          <div className="space-y-2">
            {coach.career.map((c, i) => (
              <button
                key={i}
                onClick={() => navigate(`/teams/${c.team.id}`)}
                className="flex w-full items-center gap-3 rounded-xl border border-border-soft px-3 py-2.5 text-left hover:border-accent/50 hover:bg-surface-hover"
              >
                <TeamLogo src={c.team.logo} alt={c.team.name} size={26} />
                <span className="flex-1 truncate text-sm text-text">{c.team.name}</span>
                <span className="text-xs text-text-faint">
                  {c.start} → {c.end ?? 'present'}
                </span>
              </button>
            ))}
            {coach.career.length === 0 && <p className="text-sm text-text-faint">No career history available.</p>}
          </div>
        </div>
      </Snapshottable>
    </div>
  )
}
