import { useMemo, useState } from 'react'
import { Radio, CheckCircle2, CalendarClock } from 'lucide-react'
import { getFixturesByDate } from '../api/endpoints'
import { useApi } from '../hooks/useApi'
import { toISODate, isSameDay, formatFullDate } from '../lib/date'
import { categorizeFixtures } from '../lib/fixtures'
import { DatePicker } from '../components/calendar/DatePicker'
import { UpcomingToggle } from '../components/matches/UpcomingToggle'
import { LeagueFilterSelect } from '../components/matches/LeagueFilterSelect'
import { MatchSection } from '../components/matches/MatchSection'
import { Loader } from '../components/common/Loader'
import { ErrorState } from '../components/common/ErrorState'

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [leagueId, setLeagueId] = useState<number | null>(null)

  const iso = toISODate(selectedDate)
  const isToday = isSameDay(selectedDate, new Date())

  const { data, loading, error, refetch } = useApi((signal) => getFixturesByDate(iso, signal), [iso], {
    pollMs: isToday ? 45_000 : undefined,
  })

  const { live, played, upcoming } = useMemo(() => categorizeFixtures(data ?? []), [data])

  const filterByLeague = (list: typeof live) => (leagueId ? list.filter((fx) => fx.league.id === leagueId) : list)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">{isToday ? "Today's matches" : formatFullDate(selectedDate.toISOString())}</h1>
          <p className="text-sm text-text-faint">{formatFullDate(selectedDate.toISOString())}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DatePicker value={selectedDate} onChange={setSelectedDate} />
          <UpcomingToggle active={showUpcoming} onToggle={() => setShowUpcoming((v) => !v)} count={upcoming.length} />
          <LeagueFilterSelect fixtures={data ?? []} value={leagueId} onChange={setLeagueId} />
        </div>
      </div>

      {loading && !data && <Loader label="Loading fixtures…" />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <div className="space-y-5">
          {showUpcoming && (
            <MatchSection
              title="Upcoming"
              icon={<CalendarClock size={15} className="text-text-muted" />}
              fixtures={filterByLeague(upcoming)}
              emptyLabel="No upcoming matches scheduled for this day."
            />
          )}

          <MatchSection
            title="Live"
            icon={<Radio size={15} className="text-live" />}
            fixtures={filterByLeague(live)}
            emptyLabel={isToday ? 'Nothing live right now.' : 'No live matches on this day.'}
            accent="live"
          />

          <MatchSection
            title="Played"
            icon={<CheckCircle2 size={15} className="text-text-muted" />}
            fixtures={filterByLeague(played)}
            emptyLabel="No completed matches yet for this day."
          />
        </div>
      )}
    </div>
  )
}
