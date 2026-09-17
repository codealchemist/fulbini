import { apiGet, apiGetObject } from './client'
import type {
  CoachProfile,
  Fixture,
  FixtureEvent,
  FixtureLineup,
  FixturePlayersStat,
  FixtureStatistics,
  League,
  PlayerProfile,
  PlayerProfileOnly,
  SquadResponse,
  StandingsResponse,
  TeamInfoResponse,
  TeamStatisticsResponse,
} from './types'

export function getFixturesByDate(date: string, signal?: AbortSignal) {
  return apiGet<Fixture>('/fixtures', { date }, signal)
}

export function getLiveFixtures(signal?: AbortSignal) {
  return apiGet<Fixture>('/fixtures', { live: 'all' }, signal)
}

export function getFixtureById(id: number, signal?: AbortSignal) {
  return apiGet<Fixture>('/fixtures', { id }, signal)
}

export function getFixturesByTeam(teamId: number, season: number, signal?: AbortSignal) {
  return apiGet<Fixture>('/fixtures', { team: teamId, season }, signal)
}

export function getHeadToHead(teamIdA: number, teamIdB: number, signal?: AbortSignal) {
  return apiGet<Fixture>('/fixtures/headtohead', { h2h: `${teamIdA}-${teamIdB}` }, signal)
}

export function getFixtureEvents(fixtureId: number, signal?: AbortSignal) {
  return apiGet<FixtureEvent>('/fixtures/events', { fixture: fixtureId }, signal)
}

export function getFixtureLineups(fixtureId: number, signal?: AbortSignal) {
  return apiGet<FixtureLineup>('/fixtures/lineups', { fixture: fixtureId }, signal)
}

export function getFixtureStatistics(fixtureId: number, signal?: AbortSignal) {
  return apiGet<FixtureStatistics>('/fixtures/statistics', { fixture: fixtureId }, signal)
}

export function getFixturePlayersStats(fixtureId: number, signal?: AbortSignal) {
  return apiGet<FixturePlayersStat>('/fixtures/players', { fixture: fixtureId }, signal)
}

export function searchLeagues(name: string, signal?: AbortSignal) {
  return apiGet<League>('/leagues', { search: name }, signal)
}

export function getLeagues(signal?: AbortSignal) {
  return apiGet<League>('/leagues', { current: 'true' }, signal)
}

export function getStandings(leagueId: number, season: number, signal?: AbortSignal) {
  return apiGet<StandingsResponse>('/standings', { league: leagueId, season }, signal)
}

export function searchTeams(name: string, signal?: AbortSignal) {
  return apiGet<TeamInfoResponse>('/teams', { search: name }, signal)
}

export function getTeamInfo(teamId: number, signal?: AbortSignal) {
  return apiGet<TeamInfoResponse>('/teams', { id: teamId }, signal)
}

export function getTeamsByLeague(leagueId: number, season: number, signal?: AbortSignal) {
  return apiGet<TeamInfoResponse>('/teams', { league: leagueId, season }, signal)
}

export function getTeamStatistics(teamId: number, leagueId: number, season: number, signal?: AbortSignal) {
  return apiGetObject<TeamStatisticsResponse>('/teams/statistics', { team: teamId, league: leagueId, season }, signal)
}

export function getTeamSquad(teamId: number, signal?: AbortSignal) {
  return apiGet<SquadResponse>('/players/squads', { team: teamId }, signal)
}

// /players requires a `league` or `team` alongside `search` (per the API docs),
// so it can't power a global name search. /players/profiles takes a bare
// `search` (>= 4 chars, matched against lastname) with no other params needed.
export function searchPlayerProfiles(name: string, signal?: AbortSignal) {
  return apiGet<PlayerProfileOnly>('/players/profiles', { search: name }, signal)
}

export function getPlayerProfile(playerId: number, season: number, signal?: AbortSignal) {
  return apiGet<PlayerProfile>('/players', { id: playerId, season }, signal)
}

export function searchCoaches(name: string, signal?: AbortSignal) {
  return apiGet<CoachProfile>('/coachs', { search: name }, signal)
}

export function getCoach(coachId: number, signal?: AbortSignal) {
  return apiGet<CoachProfile>('/coachs', { id: coachId }, signal)
}

export function getCoachesByTeam(teamId: number, signal?: AbortSignal) {
  return apiGet<CoachProfile>('/coachs', { team: teamId }, signal)
}
