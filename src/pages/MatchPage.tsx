import { useParams } from 'react-router-dom'
import {
  getFixtureById,
  getFixtureEvents,
  getFixtureLineups,
  getFixturePlayersStats,
  getFixtureStatistics,
  getHeadToHead,
} from '../api/endpoints'
import { useApi } from '../hooks/useApi'
import { LIVE_STATUS_CODES } from '../api/types'
import { formatFullDate, formatKickoff } from '../lib/date'
import { Loader } from '../components/common/Loader'
import { ErrorState } from '../components/common/ErrorState'
import { TeamLogo } from '../components/common/TeamLogo'
import { Snapshottable } from '../components/common/Snapshottable'
import { MatchStatusBadge } from '../components/matches/MatchStatusBadge'
import { GoalsPanel } from '../components/match/GoalsPanel'
import { FormationPitch } from '../components/match/FormationPitch'
import { FixtureStatsCompare } from '../components/match/FixtureStatsCompare'
import { HeadToHeadList } from '../components/match/HeadToHeadList'
import { TopPerformers } from '../components/match/TopPerformers'
import { EmptyState } from '../components/common/EmptyState'

export function MatchPage() {
  const { id } = useParams<{ id: string }>()
  const fixtureId = Number(id)

  const fixture = useApi((signal) => getFixtureById(fixtureId, signal), [fixtureId], { pollMs: 45_000 })
  const fx = fixture.data?.[0]
  const isLive = fx ? LIVE_STATUS_CODES.has(fx.fixture.status.short) : false
  const hasStarted = fx ? fx.goals.home !== null : false

  const events = useApi((signal) => getFixtureEvents(fixtureId, signal), [fixtureId], {
    enabled: hasStarted,
    pollMs: isLive ? 45_000 : undefined,
  })
  const lineups = useApi((signal) => getFixtureLineups(fixtureId, signal), [fixtureId], { enabled: hasStarted })
  const stats = useApi((signal) => getFixtureStatistics(fixtureId, signal), [fixtureId], { enabled: hasStarted })
  const playersStats = useApi((signal) => getFixturePlayersStats(fixtureId, signal), [fixtureId], { enabled: hasStarted })
  const h2h = useApi(
    (signal) => (fx ? getHeadToHead(fx.teams.home.id, fx.teams.away.id, signal) : Promise.resolve([])),
    [fx?.teams.home.id, fx?.teams.away.id],
    { enabled: !!fx },
  )

  if (fixture.loading) return <Loader label="Loading match…" />
  if (fixture.error) return <ErrorState message={fixture.error} onRetry={fixture.refetch} />
  if (!fx) return null

  return (
    <div className="space-y-5">
      <Snapshottable filename="match-summary.png" className="rounded-2xl">
        <div className="rounded-2xl border border-border-soft bg-surface/40 p-6">
          <p className="mb-4 text-center text-xs text-text-faint">
            {fx.league.name} · {formatFullDate(fx.fixture.date)}
          </p>
          <div className="flex items-center justify-center gap-6 sm:gap-12">
            <TeamBlock name={fx.teams.home.name} logo={fx.teams.home.logo} winner={fx.teams.home.winner} />
            <div className="flex flex-col items-center gap-2">
              {hasStarted ? (
                <p className="text-3xl font-bold tabular-nums text-text">
                  {fx.goals.home} – {fx.goals.away}
                </p>
              ) : (
                <p className="text-2xl font-semibold text-text">{formatKickoff(fx.fixture.date)}</p>
              )}
              <MatchStatusBadge status={fx.fixture.status} dateIso={fx.fixture.date} />
            </div>
            <TeamBlock name={fx.teams.away.name} logo={fx.teams.away.logo} winner={fx.teams.away.winner} />
          </div>
          {fx.fixture.venue.name && (
            <p className="mt-4 text-center text-xs text-text-faint">
              {fx.fixture.venue.name}
              {fx.fixture.venue.city ? `, ${fx.fixture.venue.city}` : ''}
            </p>
          )}
          {isLive && <p className="mt-1 text-center text-xs text-live">Updating automatically…</p>}
        </div>
      </Snapshottable>

      {!hasStarted && <EmptyState message="Lineups and stats will appear once the match kicks off." />}

      {hasStarted && (
        <>
          {events.loading && <Loader label="Loading goals…" />}
          {events.data && <GoalsPanel fixture={fx} events={events.data} />}

          {lineups.loading && <Loader label="Loading lineups…" />}
          {lineups.data && lineups.data.length === 2 && <FormationPitch home={lineups.data[0]} away={lineups.data[1]} />}

          {playersStats.data && playersStats.data.length === 2 && <TopPerformers teams={playersStats.data} />}

          {stats.data && stats.data.length === 2 && <FixtureStatsCompare home={stats.data[0]} away={stats.data[1]} />}
        </>
      )}

      {h2h.data && <HeadToHeadList fixtures={h2h.data} />}
    </div>
  )
}

function TeamBlock({ name, logo, winner }: { name: string; logo: string; winner?: boolean | null }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <TeamLogo src={logo} alt={name} size={56} />
      <p className={winner ? 'max-w-[8rem] text-sm font-semibold text-text' : 'max-w-[8rem] text-sm text-text-muted'}>{name}</p>
    </div>
  )
}
