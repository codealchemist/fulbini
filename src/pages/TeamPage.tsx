import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Users2 } from 'lucide-react'
import { getFixturesByTeam, getTeamInfo, getTeamSquad, getTeamStatistics } from '../api/endpoints'
import { useApi } from '../hooks/useApi'
import { currentSeasonYear } from '../lib/date'
import { categorizeFixtures } from '../lib/fixtures'
import { Loader } from '../components/common/Loader'
import { ErrorState } from '../components/common/ErrorState'
import { TeamLogo } from '../components/common/TeamLogo'
import { Snapshottable } from '../components/common/Snapshottable'
import { TeamResultsChart } from '../components/teams/TeamResultsChart'
import { TeamGoalsChart } from '../components/teams/TeamGoalsChart'
import { SquadGrid } from '../components/teams/SquadGrid'
import { MatchSection } from '../components/matches/MatchSection'

function mostFrequentLeagueId(fixtures: { league: { id: number } }[]): number | null {
  if (fixtures.length === 0) return null
  const counts = new Map<number, number>()
  for (const fx of fixtures) counts.set(fx.league.id, (counts.get(fx.league.id) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

export function TeamPage() {
  const { id } = useParams<{ id: string }>()
  const teamId = Number(id)
  const season = currentSeasonYear()

  const info = useApi((signal) => getTeamInfo(teamId, signal), [teamId])
  const fixtures = useApi((signal) => getFixturesByTeam(teamId, season, signal), [teamId, season])
  const squad = useApi((signal) => getTeamSquad(teamId, signal), [teamId])

  const leagueId = useMemo(() => mostFrequentLeagueId(fixtures.data ?? []), [fixtures.data])
  const stats = useApi((signal) => getTeamStatistics(teamId, leagueId as number, season, signal), [teamId, leagueId, season], {
    enabled: leagueId !== null,
  })

  const { played, upcoming } = useMemo(() => categorizeFixtures(fixtures.data ?? []), [fixtures.data])

  if (info.loading) return <Loader label="Loading team…" />
  if (info.error) return <ErrorState message={info.error} onRetry={info.refetch} />
  if (!info.data?.[0]) return null

  const team = info.data[0]

  return (
    <div className="space-y-5">
      <Snapshottable filename={`${team.team.name}.png`} className="rounded-2xl">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border-soft bg-surface/40 p-5">
          <TeamLogo src={team.team.logo} alt={team.team.name} size={64} />
          <div>
            <h1 className="text-xl font-semibold text-text">{team.team.name}</h1>
            <p className="text-sm text-text-faint">
              {team.team.country}
              {team.team.founded ? ` · Founded ${team.team.founded}` : ''}
            </p>
            {team.venue.name && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                <MapPin size={14} />
                {team.venue.name}
                {team.venue.city ? `, ${team.venue.city}` : ''}
                {team.venue.capacity ? ` · ${team.venue.capacity.toLocaleString()} capacity` : ''}
              </p>
            )}
          </div>
        </div>
      </Snapshottable>

      {stats.loading && <Loader label="Loading statistics…" />}
      {stats.data?.fixtures && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TeamResultsChart stats={stats.data} />
          <TeamGoalsChart stats={stats.data} />
        </div>
      )}

      {squad.loading && <Loader label="Loading squad…" />}
      {squad.error && <ErrorState message={squad.error} onRetry={squad.refetch} />}
      {squad.data?.[0] && <SquadGrid players={squad.data[0].players} />}

      {fixtures.data && (
        <div className="space-y-5">
          <MatchSection title="Upcoming" fixtures={upcoming.slice(0, 6)} emptyLabel="No upcoming fixtures found." icon={<Users2 size={15} className="text-text-muted" />} />
          <MatchSection title="Recent results" fixtures={played.slice(0, 6)} emptyLabel="No recent results found." icon={<Users2 size={15} className="text-text-muted" />} />
        </div>
      )}
    </div>
  )
}
