import { useSearchParams, useParams } from 'react-router-dom'
import { getStandings } from '../api/endpoints'
import { useApi } from '../hooks/useApi'
import { currentSeasonYear } from '../lib/date'
import { Loader } from '../components/common/Loader'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'
import { TeamLogo } from '../components/common/TeamLogo'
import { StandingsTable } from '../components/leagues/StandingsTable'
import { StandingsPointsChart } from '../components/leagues/StandingsPointsChart'

export function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const leagueId = Number(id)
  const season = Number(searchParams.get('season')) || currentSeasonYear()

  const { data, loading, error, refetch } = useApi((signal) => getStandings(leagueId, season, signal), [leagueId, season])

  const league = data?.[0]?.league
  const groups = league?.standings ?? []

  return (
    <div className="space-y-5">
      {loading && <Loader label="Loading standings…" />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {league && (
        <>
          <div className="flex items-center gap-3">
            <TeamLogo src={league.logo} alt={league.name} size={44} />
            <div>
              <h1 className="text-xl font-semibold text-text">{league.name}</h1>
              <p className="text-sm text-text-faint">
                {league.country} · Season {league.season}
              </p>
            </div>
          </div>

          {groups.length === 0 && <EmptyState message="No standings available for this season yet." />}

          {groups.map((rows, i) => (
            <div key={i} className="space-y-4">
              <StandingsTable rows={rows} title={groups.length > 1 ? rows[0]?.group : undefined} />
              <StandingsPointsChart rows={rows} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
