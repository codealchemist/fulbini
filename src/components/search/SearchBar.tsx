import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Search, Users, Shield, Whistle, X } from 'lucide-react'
import { searchCoaches, searchPlayerProfiles, searchTeams } from '../../api/endpoints'
import type { CoachProfile, PlayerProfileOnly, TeamInfoResponse } from '../../api/types'
import { useDebouncedValue } from '../../hooks/useApi'
import { TeamLogo } from '../common/TeamLogo'

interface Results {
  teams: TeamInfoResponse[]
  players: PlayerProfileOnly[]
  coaches: CoachProfile[]
}

const EMPTY: Results = { teams: [], players: [], coaches: [] }
const TEAM_COACH_MIN_CHARS = 3
// /players/profiles requires >= 4 characters for its `search` param.
const PLAYER_MIN_CHARS = 4

export function SearchBar({ className, autoFocus, onNavigate }: { className?: string; autoFocus?: boolean; onNavigate?: () => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Results>(EMPTY)
  const debounced = useDebouncedValue(query.trim(), 350)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (debounced.length < TEAM_COACH_MIN_CHARS) {
      setResults(EMPTY)
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    Promise.allSettled([
      searchTeams(debounced, controller.signal),
      debounced.length >= PLAYER_MIN_CHARS ? searchPlayerProfiles(debounced, controller.signal) : Promise.resolve([]),
      searchCoaches(debounced, controller.signal),
    ])
      .then(([teams, players, coaches]) => {
        if (controller.signal.aborted) return
        setResults({
          teams: teams.status === 'fulfilled' ? teams.value.slice(0, 6) : [],
          players: players.status === 'fulfilled' ? players.value.slice(0, 6) : [],
          coaches: coaches.status === 'fulfilled' ? coaches.value.slice(0, 6) : [],
        })
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [debounced])

  const hasResults = results.teams.length + results.players.length + results.coaches.length > 0
  const showDropdown = open && debounced.length >= TEAM_COACH_MIN_CHARS

  function go(path: string) {
    navigate(path)
    setOpen(false)
    setQuery('')
    onNavigate?.()
  }

  return (
    <div className={className} ref={containerRef}>
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search teams, players, coaches…"
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-9 pr-9 text-sm text-text placeholder:text-text-faint outline-none focus:border-accent/60"
        />
        {loading ? (
          <Loader2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-text-faint" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('')
              setResults(EMPTY)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {showDropdown && (
        <div className="absolute z-40 mt-2 max-h-[70vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface-2 p-2 shadow-2xl">
          {!hasResults && !loading && <p className="px-3 py-4 text-sm text-text-faint">No matches for "{debounced}"</p>}

          {results.teams.length > 0 && (
            <ResultGroup icon={<Shield size={13} />} label="Teams">
              {results.teams.map((t) => (
                <ResultRow key={t.team.id} onClick={() => go(`/teams/${t.team.id}`)}>
                  <TeamLogo src={t.team.logo} alt={t.team.name} size={22} />
                  <span className="truncate">{t.team.name}</span>
                  <span className="ml-auto text-xs text-text-faint">{t.team.country}</span>
                </ResultRow>
              ))}
            </ResultGroup>
          )}

          {results.players.length > 0 && (
            <ResultGroup icon={<Users size={13} />} label="Players">
              {results.players.map((p) => (
                <ResultRow key={p.player.id} onClick={() => go(`/players/${p.player.id}`)}>
                  <TeamLogo src={p.player.photo} alt={p.player.name} size={22} className="rounded-full" />
                  <span className="truncate">{p.player.name}</span>
                  <span className="ml-auto truncate text-xs text-text-faint">{p.player.nationality ?? ''}</span>
                </ResultRow>
              ))}
            </ResultGroup>
          )}

          {results.coaches.length > 0 && (
            <ResultGroup icon={<Whistle size={13} />} label="Coaches">
              {results.coaches.map((c) => (
                <ResultRow key={c.id} onClick={() => go(`/coaches/${c.id}`)}>
                  <TeamLogo src={c.photo} alt={c.name} size={22} className="rounded-full" />
                  <span className="truncate">{c.name}</span>
                  <span className="ml-auto truncate text-xs text-text-faint">{c.team?.name ?? ''}</span>
                </ResultRow>
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  )
}

function ResultGroup({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1 last:mb-0">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] uppercase tracking-wide text-text-faint">
        {icon}
        {label}
      </div>
      {children}
    </div>
  )
}

function ResultRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text hover:bg-surface-hover">
      {children}
    </button>
  )
}
