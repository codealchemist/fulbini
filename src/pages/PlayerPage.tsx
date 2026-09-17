import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPlayerProfile } from '../api/endpoints'
import { useApi } from '../hooks/useApi'
import { currentSeasonYear } from '../lib/date'
import { Loader } from '../components/common/Loader'
import { ErrorState } from '../components/common/ErrorState'
import { PlayerAvatar } from '../components/common/PlayerAvatar'
import { Snapshottable } from '../components/common/Snapshottable'
import { PlayerRadarChart } from '../components/players/PlayerRadarChart'
import { PlayerStatsTable } from '../components/players/PlayerStatsTable'

export function PlayerPage() {
  const { id } = useParams<{ id: string }>()
  const playerId = Number(id)
  const [season, setSeason] = useState(currentSeasonYear())

  const { data, loading, error, refetch } = useApi((signal) => getPlayerProfile(playerId, season, signal), [playerId, season])

  const entry = data?.[0]
  const primaryStat = useMemo(() => {
    if (!entry?.statistics?.length) return null
    return [...entry.statistics].sort((a, b) => (b.games.minutes ?? 0) - (a.games.minutes ?? 0))[0]
  }, [entry])

  if (loading) return <Loader label="Loading player…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!entry) return null

  const { player } = entry

  return (
    <div className="space-y-5">
      <Snapshottable filename={`${player.name}.png`} className="rounded-2xl">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border-soft bg-surface/40 p-5">
          <PlayerAvatar src={player.photo} alt={player.name} size={72} />
          <div>
            <h1 className="text-xl font-semibold text-text">{player.name}</h1>
            <p className="text-sm text-text-faint">
              {player.nationality}
              {player.age ? ` · ${player.age} yrs` : ''}
              {player.height ? ` · ${player.height}` : ''}
              {player.weight ? ` · ${player.weight}` : ''}
            </p>
            {player.injured && <p className="mt-1 text-xs font-medium text-live">Currently injured</p>}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-text-faint" htmlFor="season">
              Season
            </label>
            <select
              id="season"
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
              className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text outline-none"
            >
              {Array.from({ length: 5 }, (_, i) => currentSeasonYear() - i).map((y) => (
                <option key={y} value={y} className="bg-surface-2">
                  {y}/{y + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Snapshottable>

      {entry.statistics.length === 0 && <p className="text-sm text-text-faint">No statistics available for this season.</p>}

      {primaryStat && <PlayerRadarChart stat={primaryStat} />}
      {entry.statistics.length > 0 && <PlayerStatsTable stats={entry.statistics} />}
    </div>
  )
}
