// Shapes matching the API-Football v3 response envelope and the subset of
// entities this dashboard renders. Fields are kept optional/loose where the
// upstream API is known to omit them depending on plan/endpoint.

export interface ApiEnvelope<T> {
  get: string
  parameters: Record<string, unknown>
  errors: unknown[] | Record<string, string>
  results: number
  paging: { current: number; total: number }
  response: T[]
}

export interface TeamRef {
  id: number
  name: string
  logo: string
  winner?: boolean | null
}

export interface VenueRef {
  id: number | null
  name: string | null
  city: string | null
}

export interface LeagueRef {
  id: number
  name: string
  country: string
  logo: string
  flag: string | null
  season: number
  round?: string
}

export interface FixtureStatus {
  long: string
  short: string
  elapsed: number | null
}

export interface Fixture {
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    timestamp: number
    venue: VenueRef
    status: FixtureStatus
  }
  league: LeagueRef
  teams: {
    home: TeamRef
    away: TeamRef
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: { home: number | null; away: number | null }
    fulltime: { home: number | null; away: number | null }
    extratime: { home: number | null; away: number | null }
    penalty: { home: number | null; away: number | null }
  }
}

export const LIVE_STATUS_CODES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])
export const FINISHED_STATUS_CODES = new Set(['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'])
export const UPCOMING_STATUS_CODES = new Set(['TBD', 'NS'])

export interface League {
  league: {
    id: number
    name: string
    type: string
    logo: string
  }
  country: {
    name: string
    code: string | null
    flag: string | null
  }
  seasons: Array<{
    year: number
    start: string
    end: string
    current: boolean
  }>
}

export interface StandingRow {
  rank: number
  team: TeamRef
  points: number
  goalsDiff: number
  group: string
  form: string | null
  status: string
  description: string | null
  all: {
    played: number
    win: number
    draw: number
    lose: number
    goals: { for: number; against: number }
  }
  home: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } }
  away: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } }
}

export interface StandingsResponse {
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string | null
    season: number
    standings: StandingRow[][]
  }
}

export interface TeamInfoResponse {
  team: {
    id: number
    name: string
    code: string | null
    country: string
    founded: number | null
    national: boolean
    logo: string
  }
  venue: {
    id: number | null
    name: string | null
    address: string | null
    city: string | null
    capacity: number | null
    surface: string | null
    image: string | null
  }
}

export interface TeamStatisticsResponse {
  league: { id: number; name: string; country: string; logo: string; season: number }
  team: TeamRef
  form: string
  fixtures: {
    played: { home: number; away: number; total: number }
    wins: { home: number; away: number; total: number }
    draws: { home: number; away: number; total: number }
    loses: { home: number; away: number; total: number }
  }
  goals: {
    for: {
      total: { home: number; away: number; total: number }
      average: { home: string; away: string; total: string }
    }
    against: {
      total: { home: number; away: number; total: number }
      average: { home: string; away: string; total: string }
    }
  }
  clean_sheet: { home: number; away: number; total: number }
  failed_to_score: { home: number; away: number; total: number }
  lineups: Array<{ formation: string; played: number }>
  cards: {
    yellow: Record<string, { total: number | null; percentage: string | null }>
    red: Record<string, { total: number | null; percentage: string | null }>
  }
}

export interface SquadPlayer {
  id: number
  name: string
  age: number
  number: number | null
  position: string
  photo: string
}

export interface SquadResponse {
  team: TeamRef
  players: SquadPlayer[]
}

export interface PlayerStat {
  team: TeamRef
  league: LeagueRef
  games: {
    appearences: number | null
    lineups: number | null
    minutes: number | null
    position: string
    rating: string | null
    captain: boolean
  }
  substitutes: { in: number | null; out: number | null; bench: number | null }
  shots: { total: number | null; on: number | null }
  goals: { total: number | null; conceded: number | null; assists: number | null; saves: number | null }
  passes: { total: number | null; key: number | null; accuracy: string | number | null }
  tackles: { total: number | null; blocks: number | null; interceptions: number | null }
  duels: { total: number | null; won: number | null }
  dribbles: { attempts: number | null; success: number | null }
  fouls: { drawn: number | null; committed: number | null }
  cards: { yellow: number | null; yellowred: number | null; red: number | null }
  penalty: { won: number | null; committed: number | null; scored: number | null; missed: number | null; saved: number | null }
}

export interface PlayerProfile {
  player: {
    id: number
    name: string
    firstname: string | null
    lastname: string | null
    age: number | null
    nationality: string | null
    height: string | null
    weight: string | null
    photo: string
    injured?: boolean
  }
  statistics: PlayerStat[]
}

// Shape of /players/profiles — a lightweight name/photo lookup with no
// statistics, used for free-text player search (the stats-bearing /players
// endpoint requires a league or team alongside `search`, so it can't be used
// for a global search box).
export interface PlayerProfileOnly {
  player: PlayerProfile['player']
}

export interface CoachProfile {
  id: number
  name: string
  firstname: string | null
  lastname: string | null
  age: number | null
  nationality: string | null
  photo: string
  team: TeamRef | null
  career: Array<{
    team: TeamRef
    start: string
    end: string | null
  }>
}

export interface LineupPlayer {
  player: {
    id: number
    name: string
    number: number
    pos: string | null
    grid: string | null
  }
}

export interface FixtureLineup {
  team: TeamRef
  coach: { id: number; name: string; photo: string | null }
  formation: string
  startXI: LineupPlayer[]
  substitutes: LineupPlayer[]
}

export interface FixtureEvent {
  time: { elapsed: number; extra: number | null }
  team: TeamRef
  player: { id: number | null; name: string | null }
  assist: { id: number | null; name: string | null }
  type: string
  detail: string
  comments: string | null
}

// Per API-Football docs, event `type` "Goal" covers detail values "Normal
// Goal", "Own Goal", "Penalty" and "Missed Penalty" — only the first three
// represent a goal actually being scored.
export const GOAL_EVENT_DETAILS = new Set(['Normal Goal', 'Own Goal', 'Penalty'])

export interface FixtureStatisticItem {
  type: string
  value: number | string | null
}

export interface FixtureStatistics {
  team: TeamRef
  statistics: FixtureStatisticItem[]
}

export interface FixturePlayersStat {
  team: TeamRef
  players: Array<{
    player: { id: number; name: string; photo: string }
    statistics: PlayerStat[]
  }>
}

export type SearchEntity =
  | { kind: 'team'; id: number; name: string; logo: string; country?: string }
  | { kind: 'player'; id: number; name: string; photo: string; team?: string }
  | { kind: 'coach'; id: number; name: string; photo: string; team?: string }
