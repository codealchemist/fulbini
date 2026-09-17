import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trophy } from 'lucide-react'
import { getLeagues, searchLeagues } from '../api/endpoints'
import { useApi, useDebouncedValue } from '../hooks/useApi'
import { TeamLogo } from '../components/common/TeamLogo'
import { Loader } from '../components/common/Loader'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'

export function LeaguesPage() {
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query.trim(), 350)
  const navigate = useNavigate()

  const { data, loading, error, refetch } = useApi(
    (signal) => (debounced.length >= 3 ? searchLeagues(debounced, signal) : getLeagues(signal)),
    [debounced],
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text">Leagues</h1>
        <p className="text-sm text-text-faint">Browse current competitions or search for one.</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search leagues (e.g. Premier League)…"
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-text placeholder:text-text-faint outline-none focus:border-accent/60"
        />
      </div>

      {loading && <Loader label="Loading leagues…" />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && data.length === 0 && <EmptyState message="No leagues found." icon={Trophy} />}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((l) => {
            const season = l.seasons.find((s) => s.current) ?? l.seasons.at(-1)
            return (
              <button
                key={l.league.id}
                onClick={() => navigate(`/leagues/${l.league.id}?season=${season?.year ?? ''}`)}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 text-left hover:border-accent/50 hover:bg-surface-hover transition-colors"
              >
                <TeamLogo src={l.league.logo} alt={l.league.name} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">{l.league.name}</p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-text-faint">
                    {l.country.flag && <TeamLogo src={l.country.flag} alt={l.country.name} size={12} />}
                    {l.country.name}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
