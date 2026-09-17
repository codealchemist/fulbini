import { FINISHED_STATUS_CODES, LIVE_STATUS_CODES, type Fixture } from '../api/types'

export interface CategorizedFixtures {
  live: Fixture[]
  played: Fixture[]
  upcoming: Fixture[]
}

export function categorizeFixtures(fixtures: Fixture[]): CategorizedFixtures {
  const live: Fixture[] = []
  const played: Fixture[] = []
  const upcoming: Fixture[] = []

  for (const fx of fixtures) {
    const code = fx.fixture.status.short
    if (LIVE_STATUS_CODES.has(code)) live.push(fx)
    else if (FINISHED_STATUS_CODES.has(code)) played.push(fx)
    else upcoming.push(fx)
  }

  live.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)
  played.sort((a, b) => b.fixture.timestamp - a.fixture.timestamp)
  upcoming.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)

  return { live, played, upcoming }
}

export function groupByLeague(fixtures: Fixture[]): Array<{ league: Fixture['league']; fixtures: Fixture[] }> {
  const map = new Map<number, { league: Fixture['league']; fixtures: Fixture[] }>()
  for (const fx of fixtures) {
    const key = fx.league.id
    if (!map.has(key)) map.set(key, { league: fx.league, fixtures: [] })
    map.get(key)!.fixtures.push(fx)
  }
  return Array.from(map.values()).sort((a, b) => a.league.name.localeCompare(b.league.name))
}
