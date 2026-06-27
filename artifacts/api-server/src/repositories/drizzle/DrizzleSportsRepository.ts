// ─────────────────────────────────────────────────────────────────────────────
// DrizzleSportsRepository — HUB-26
// ─────────────────────────────────────────────────────────────────────────────

import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@workspace/db";
import {
  sportsTable, leaguesTable, seasonsTable, clubsTable, teamsTable,
  playersTable, coachesTable, stadiumsTable, matchesTable, matchEventsTable,
  matchStatisticsTable, tournamentsTable, tournamentRoundsTable, fixturesTable,
  rankingsTable, awardsTable, playerStatisticsTable, teamStatisticsTable,
  transfersTable, contractsTable,
  type Sport, type League, type Season, type Club, type Team,
  type Player, type Coach, type Stadium, type Match, type MatchEvent,
  type MatchStatistic, type Tournament, type TournamentRound, type Fixture,
  type Ranking, type Award, type PlayerStatistic, type TeamStatistic,
  type Transfer, type Contract,
} from "@workspace/db/schema";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ISportsRepository {
  // Sports
  listSports(): Promise<Sport[]>;
  getSport(id: string): Promise<Sport | null>;
  getSportBySlug(slug: string): Promise<Sport | null>;
  createSport(input: Omit<Sport, "id" | "createdAt" | "updatedAt">): Promise<Sport>;
  updateSport(id: string, input: Partial<Sport>): Promise<Sport | null>;

  // Leagues
  listLeagues(sportId?: string): Promise<League[]>;
  getLeague(id: string): Promise<League | null>;
  createLeague(input: Omit<League, "id" | "createdAt" | "updatedAt">): Promise<League>;
  updateLeague(id: string, input: Partial<League>): Promise<League | null>;

  // Seasons
  listSeasons(leagueId?: string): Promise<Season[]>;
  getSeason(id: string): Promise<Season | null>;
  createSeason(input: Omit<Season, "id" | "createdAt" | "updatedAt">): Promise<Season>;
  updateSeason(id: string, input: Partial<Season>): Promise<Season | null>;

  // Clubs
  listClubs(sportId?: string): Promise<Club[]>;
  getClub(id: string): Promise<Club | null>;
  createClub(input: Omit<Club, "id" | "createdAt" | "updatedAt">): Promise<Club>;
  updateClub(id: string, input: Partial<Club>): Promise<Club | null>;

  // Teams
  listTeams(clubId?: string, seasonId?: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | null>;
  createTeam(input: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team>;
  updateTeam(id: string, input: Partial<Team>): Promise<Team | null>;

  // Players
  listPlayers(opts?: { teamId?: string; clubId?: string; search?: string; limit?: number; offset?: number }): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  createPlayer(input: Omit<Player, "id" | "createdAt" | "updatedAt">): Promise<Player>;
  updatePlayer(id: string, input: Partial<Player>): Promise<Player | null>;

  // Coaches
  listCoaches(teamId?: string): Promise<Coach[]>;
  getCoach(id: string): Promise<Coach | null>;
  createCoach(input: Omit<Coach, "id" | "createdAt" | "updatedAt">): Promise<Coach>;
  updateCoach(id: string, input: Partial<Coach>): Promise<Coach | null>;

  // Stadiums
  listStadiums(): Promise<Stadium[]>;
  getStadium(id: string): Promise<Stadium | null>;
  createStadium(input: Omit<Stadium, "id" | "createdAt" | "updatedAt">): Promise<Stadium>;

  // Matches
  listMatches(opts?: { seasonId?: string; status?: string; limit?: number }): Promise<Match[]>;
  getMatch(id: string): Promise<Match | null>;
  createMatch(input: Omit<Match, "id" | "createdAt" | "updatedAt">): Promise<Match>;
  updateMatch(id: string, input: Partial<Match>): Promise<Match | null>;
  getLiveMatches(): Promise<Match[]>;
  getTodayMatches(): Promise<Match[]>;

  // Match Events
  listMatchEvents(matchId: string): Promise<MatchEvent[]>;
  addMatchEvent(input: Omit<MatchEvent, "id" | "createdAt">): Promise<MatchEvent>;

  // Match Statistics
  getMatchStatistics(matchId: string): Promise<MatchStatistic[]>;
  upsertMatchStatistics(input: Omit<MatchStatistic, "id" | "createdAt">): Promise<MatchStatistic>;

  // Tournaments
  listTournaments(sportId?: string): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | null>;
  createTournament(input: Omit<Tournament, "id" | "createdAt" | "updatedAt">): Promise<Tournament>;
  updateTournament(id: string, input: Partial<Tournament>): Promise<Tournament | null>;

  // Tournament Rounds
  listRounds(tournamentId: string): Promise<TournamentRound[]>;
  createRound(input: Omit<TournamentRound, "id" | "createdAt">): Promise<TournamentRound>;

  // Fixtures
  listFixtures(roundId: string): Promise<Fixture[]>;
  createFixture(input: Omit<Fixture, "id" | "createdAt" | "updatedAt">): Promise<Fixture>;
  updateFixture(id: string, input: Partial<Fixture>): Promise<Fixture | null>;

  // Rankings
  listRankings(seasonId: string): Promise<Ranking[]>;
  upsertRanking(input: Omit<Ranking, "id" | "updatedAt">): Promise<Ranking>;

  // Awards
  listAwards(sportId?: string): Promise<Award[]>;
  createAward(input: Omit<Award, "id" | "createdAt">): Promise<Award>;

  // Player Statistics
  getPlayerStatistics(playerId: string, seasonId?: string): Promise<PlayerStatistic | null>;
  upsertPlayerStatistics(input: Omit<PlayerStatistic, "id" | "updatedAt">): Promise<PlayerStatistic>;
  topScorers(seasonId?: string, limit?: number): Promise<PlayerStatistic[]>;

  // Team Statistics
  getTeamStatistics(teamId: string, seasonId?: string): Promise<TeamStatistic | null>;
  upsertTeamStatistics(input: Omit<TeamStatistic, "id" | "updatedAt">): Promise<TeamStatistic>;

  // Transfers
  listTransfers(playerId?: string): Promise<Transfer[]>;
  createTransfer(input: Omit<Transfer, "id" | "createdAt">): Promise<Transfer>;

  // Contracts
  getActiveContract(playerId: string): Promise<Contract | null>;
  createContract(input: Omit<Contract, "id" | "createdAt" | "updatedAt">): Promise<Contract>;

  // Dashboard
  getDashboardStats(): Promise<{
    totalSports: number; totalLeagues: number; totalTeams: number;
    totalPlayers: number; liveMatches: number; todayMatches: number;
    totalTournaments: number; totalMatches: number;
  }>;

  // Seed
  seedData(): Promise<void>;
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class DrizzleSportsRepository implements ISportsRepository {

  // ── Sports ────────────────────────────────────────────────────────────────

  async listSports(): Promise<Sport[]> {
    return db.select().from(sportsTable).orderBy(sportsTable.name);
  }

  async getSport(id: string): Promise<Sport | null> {
    const [row] = await db.select().from(sportsTable).where(eq(sportsTable.id, id));
    return row ?? null;
  }

  async getSportBySlug(slug: string): Promise<Sport | null> {
    const [row] = await db.select().from(sportsTable).where(eq(sportsTable.slug, slug));
    return row ?? null;
  }

  async createSport(input: Omit<Sport, "id" | "createdAt" | "updatedAt">): Promise<Sport> {
    const [row] = await db.insert(sportsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async updateSport(id: string, input: Partial<Sport>): Promise<Sport | null> {
    const [row] = await db.update(sportsTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(sportsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Leagues ───────────────────────────────────────────────────────────────

  async listLeagues(sportId?: string): Promise<League[]> {
    const q = db.select().from(leaguesTable);
    if (sportId) return q.where(eq(leaguesTable.sportId, sportId)).orderBy(leaguesTable.name);
    return q.orderBy(leaguesTable.name);
  }

  async getLeague(id: string): Promise<League | null> {
    const [row] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, id));
    return row ?? null;
  }

  async createLeague(input: Omit<League, "id" | "createdAt" | "updatedAt">): Promise<League> {
    const [row] = await db.insert(leaguesTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async updateLeague(id: string, input: Partial<League>): Promise<League | null> {
    const [row] = await db.update(leaguesTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(leaguesTable.id, id)).returning();
    return row ?? null;
  }

  // ── Seasons ───────────────────────────────────────────────────────────────

  async listSeasons(leagueId?: string): Promise<Season[]> {
    const q = db.select().from(seasonsTable);
    if (leagueId) return q.where(eq(seasonsTable.leagueId, leagueId)).orderBy(desc(seasonsTable.startDate));
    return q.orderBy(desc(seasonsTable.startDate));
  }

  async getSeason(id: string): Promise<Season | null> {
    const [row] = await db.select().from(seasonsTable).where(eq(seasonsTable.id, id));
    return row ?? null;
  }

  async createSeason(input: Omit<Season, "id" | "createdAt" | "updatedAt">): Promise<Season> {
    const [row] = await db.insert(seasonsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async updateSeason(id: string, input: Partial<Season>): Promise<Season | null> {
    const [row] = await db.update(seasonsTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(seasonsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Clubs ─────────────────────────────────────────────────────────────────

  async listClubs(sportId?: string): Promise<Club[]> {
    const q = db.select().from(clubsTable);
    if (sportId) return q.where(eq(clubsTable.sportId, sportId)).orderBy(clubsTable.name);
    return q.orderBy(clubsTable.name);
  }

  async getClub(id: string): Promise<Club | null> {
    const [row] = await db.select().from(clubsTable).where(eq(clubsTable.id, id));
    return row ?? null;
  }

  async createClub(input: Omit<Club, "id" | "createdAt" | "updatedAt">): Promise<Club> {
    const [row] = await db.insert(clubsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async updateClub(id: string, input: Partial<Club>): Promise<Club | null> {
    const [row] = await db.update(clubsTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(clubsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Teams ─────────────────────────────────────────────────────────────────

  async listTeams(clubId?: string, seasonId?: string): Promise<Team[]> {
    const conditions = [];
    if (clubId) conditions.push(eq(teamsTable.clubId, clubId));
    if (seasonId) conditions.push(eq(teamsTable.seasonId!, seasonId));
    const q = db.select().from(teamsTable);
    if (conditions.length) return q.where(and(...conditions)).orderBy(teamsTable.name);
    return q.orderBy(teamsTable.name);
  }

  async getTeam(id: string): Promise<Team | null> {
    const [row] = await db.select().from(teamsTable).where(eq(teamsTable.id, id));
    return row ?? null;
  }

  async createTeam(input: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team> {
    const [row] = await db.insert(teamsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async updateTeam(id: string, input: Partial<Team>): Promise<Team | null> {
    const [row] = await db.update(teamsTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(teamsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Players ───────────────────────────────────────────────────────────────

  async listPlayers(opts: { teamId?: string; clubId?: string; search?: string; limit?: number; offset?: number } = {}): Promise<Player[]> {
    const { teamId, clubId, search, limit = 50, offset = 0 } = opts;
    const conditions = [];
    if (teamId) conditions.push(eq(playersTable.teamId!, teamId));
    if (clubId) conditions.push(eq(playersTable.clubId!, clubId));
    if (search) conditions.push(ilike(playersTable.name, `%${search}%`));
    const q = db.select().from(playersTable);
    const base = conditions.length ? q.where(and(...conditions)) : q;
    return (base as typeof q).orderBy(playersTable.name).limit(limit).offset(offset);
  }

  async getPlayer(id: string): Promise<Player | null> {
    const [row] = await db.select().from(playersTable).where(eq(playersTable.id, id));
    return row ?? null;
  }

  async createPlayer(input: Omit<Player, "id" | "createdAt" | "updatedAt">): Promise<Player> {
    const [row] = await db.insert(playersTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async updatePlayer(id: string, input: Partial<Player>): Promise<Player | null> {
    const [row] = await db.update(playersTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(playersTable.id, id)).returning();
    return row ?? null;
  }

  // ── Coaches ───────────────────────────────────────────────────────────────

  async listCoaches(teamId?: string): Promise<Coach[]> {
    const q = db.select().from(coachesTable);
    if (teamId) return q.where(eq(coachesTable.teamId!, teamId)).orderBy(coachesTable.name);
    return q.orderBy(coachesTable.name);
  }

  async getCoach(id: string): Promise<Coach | null> {
    const [row] = await db.select().from(coachesTable).where(eq(coachesTable.id, id));
    return row ?? null;
  }

  async createCoach(input: Omit<Coach, "id" | "createdAt" | "updatedAt">): Promise<Coach> {
    const [row] = await db.insert(coachesTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async updateCoach(id: string, input: Partial<Coach>): Promise<Coach | null> {
    const [row] = await db.update(coachesTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(coachesTable.id, id)).returning();
    return row ?? null;
  }

  // ── Stadiums ──────────────────────────────────────────────────────────────

  async listStadiums(): Promise<Stadium[]> {
    return db.select().from(stadiumsTable).orderBy(stadiumsTable.name);
  }

  async getStadium(id: string): Promise<Stadium | null> {
    const [row] = await db.select().from(stadiumsTable).where(eq(stadiumsTable.id, id));
    return row ?? null;
  }

  async createStadium(input: Omit<Stadium, "id" | "createdAt" | "updatedAt">): Promise<Stadium> {
    const [row] = await db.insert(stadiumsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  // ── Matches ───────────────────────────────────────────────────────────────

  async listMatches(opts: { seasonId?: string; status?: string; limit?: number } = {}): Promise<Match[]> {
    const { seasonId, status, limit = 50 } = opts;
    const conditions = [];
    if (seasonId) conditions.push(eq(matchesTable.seasonId!, seasonId));
    if (status) conditions.push(eq(matchesTable.status, status as Match["status"]));
    const q = db.select().from(matchesTable);
    const base = conditions.length ? q.where(and(...conditions)) : q;
    return (base as typeof q).orderBy(desc(matchesTable.scheduledAt)).limit(limit);
  }

  async getMatch(id: string): Promise<Match | null> {
    const [row] = await db.select().from(matchesTable).where(eq(matchesTable.id, id));
    return row ?? null;
  }

  async createMatch(input: Omit<Match, "id" | "createdAt" | "updatedAt">): Promise<Match> {
    const [row] = await db.insert(matchesTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async updateMatch(id: string, input: Partial<Match>): Promise<Match | null> {
    const [row] = await db.update(matchesTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(matchesTable.id, id)).returning();
    return row ?? null;
  }

  async getLiveMatches(): Promise<Match[]> {
    return db.select().from(matchesTable)
      .where(eq(matchesTable.status, "LIVE"))
      .orderBy(desc(matchesTable.scheduledAt));
  }

  async getTodayMatches(): Promise<Match[]> {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    return db.select().from(matchesTable)
      .where(and(
        sql`${matchesTable.scheduledAt} >= ${start}`,
        sql`${matchesTable.scheduledAt} <= ${end}`,
      ))
      .orderBy(matchesTable.scheduledAt);
  }

  // ── Match Events ──────────────────────────────────────────────────────────

  async listMatchEvents(matchId: string): Promise<MatchEvent[]> {
    return db.select().from(matchEventsTable)
      .where(eq(matchEventsTable.matchId, matchId))
      .orderBy(matchEventsTable.minute);
  }

  async addMatchEvent(input: Omit<MatchEvent, "id" | "createdAt">): Promise<MatchEvent> {
    const [row] = await db.insert(matchEventsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  // ── Match Statistics ──────────────────────────────────────────────────────

  async getMatchStatistics(matchId: string): Promise<MatchStatistic[]> {
    return db.select().from(matchStatisticsTable).where(eq(matchStatisticsTable.matchId, matchId));
  }

  async upsertMatchStatistics(input: Omit<MatchStatistic, "id" | "createdAt">): Promise<MatchStatistic> {
    const [existing] = await db.select().from(matchStatisticsTable)
      .where(and(eq(matchStatisticsTable.matchId, input.matchId), eq(matchStatisticsTable.teamId, input.teamId)));
    if (existing) {
      const [row] = await db.update(matchStatisticsTable)
        .set(input as Partial<MatchStatistic>)
        .where(eq(matchStatisticsTable.id, existing.id)).returning();
      return row!;
    }
    const [row] = await db.insert(matchStatisticsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  // ── Tournaments ───────────────────────────────────────────────────────────

  async listTournaments(sportId?: string): Promise<Tournament[]> {
    const q = db.select().from(tournamentsTable);
    if (sportId) return q.where(eq(tournamentsTable.sportId, sportId)).orderBy(desc(tournamentsTable.startDate));
    return q.orderBy(desc(tournamentsTable.startDate));
  }

  async getTournament(id: string): Promise<Tournament | null> {
    const [row] = await db.select().from(tournamentsTable).where(eq(tournamentsTable.id, id));
    return row ?? null;
  }

  async createTournament(input: Omit<Tournament, "id" | "createdAt" | "updatedAt">): Promise<Tournament> {
    const [row] = await db.insert(tournamentsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async updateTournament(id: string, input: Partial<Tournament>): Promise<Tournament | null> {
    const [row] = await db.update(tournamentsTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(tournamentsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Rounds ────────────────────────────────────────────────────────────────

  async listRounds(tournamentId: string): Promise<TournamentRound[]> {
    return db.select().from(tournamentRoundsTable)
      .where(eq(tournamentRoundsTable.tournamentId, tournamentId))
      .orderBy(tournamentRoundsTable.roundNumber);
  }

  async createRound(input: Omit<TournamentRound, "id" | "createdAt">): Promise<TournamentRound> {
    const [row] = await db.insert(tournamentRoundsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  // ── Fixtures ──────────────────────────────────────────────────────────────

  async listFixtures(roundId: string): Promise<Fixture[]> {
    return db.select().from(fixturesTable)
      .where(eq(fixturesTable.roundId, roundId))
      .orderBy(fixturesTable.scheduledAt);
  }

  async createFixture(input: Omit<Fixture, "id" | "createdAt" | "updatedAt">): Promise<Fixture> {
    const [row] = await db.insert(fixturesTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async updateFixture(id: string, input: Partial<Fixture>): Promise<Fixture | null> {
    const [row] = await db.update(fixturesTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(fixturesTable.id, id)).returning();
    return row ?? null;
  }

  // ── Rankings ──────────────────────────────────────────────────────────────

  async listRankings(seasonId: string): Promise<Ranking[]> {
    return db.select().from(rankingsTable)
      .where(eq(rankingsTable.seasonId, seasonId))
      .orderBy(rankingsTable.position);
  }

  async upsertRanking(input: Omit<Ranking, "id" | "updatedAt">): Promise<Ranking> {
    const [existing] = await db.select().from(rankingsTable)
      .where(and(eq(rankingsTable.seasonId, input.seasonId), eq(rankingsTable.teamId, input.teamId)));
    if (existing) {
      const [row] = await db.update(rankingsTable)
        .set({ ...input as Partial<Ranking>, updatedAt: new Date() })
        .where(eq(rankingsTable.id, existing.id)).returning();
      return row!;
    }
    const [row] = await db.insert(rankingsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  // ── Awards ────────────────────────────────────────────────────────────────

  async listAwards(sportId?: string): Promise<Award[]> {
    const q = db.select().from(awardsTable);
    if (sportId) return q.where(eq(awardsTable.sportId, sportId)).orderBy(desc(awardsTable.grantedAt));
    return q.orderBy(desc(awardsTable.grantedAt));
  }

  async createAward(input: Omit<Award, "id" | "createdAt">): Promise<Award> {
    const [row] = await db.insert(awardsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  // ── Player Statistics ─────────────────────────────────────────────────────

  async getPlayerStatistics(playerId: string, seasonId?: string): Promise<PlayerStatistic | null> {
    const conditions = [eq(playerStatisticsTable.playerId, playerId)];
    if (seasonId) conditions.push(eq(playerStatisticsTable.seasonId!, seasonId));
    const [row] = await db.select().from(playerStatisticsTable).where(and(...conditions));
    return row ?? null;
  }

  async upsertPlayerStatistics(input: Omit<PlayerStatistic, "id" | "updatedAt">): Promise<PlayerStatistic> {
    const conditions = [eq(playerStatisticsTable.playerId, input.playerId)];
    if (input.seasonId) conditions.push(eq(playerStatisticsTable.seasonId!, input.seasonId));
    const [existing] = await db.select().from(playerStatisticsTable).where(and(...conditions));
    if (existing) {
      const [row] = await db.update(playerStatisticsTable)
        .set({ ...input as Partial<PlayerStatistic>, updatedAt: new Date() })
        .where(eq(playerStatisticsTable.id, existing.id)).returning();
      return row!;
    }
    const [row] = await db.insert(playerStatisticsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  async topScorers(seasonId?: string, limit = 10): Promise<PlayerStatistic[]> {
    const q = db.select().from(playerStatisticsTable);
    const base = seasonId ? q.where(eq(playerStatisticsTable.seasonId!, seasonId)) : q;
    return (base as typeof q).orderBy(desc(playerStatisticsTable.goals)).limit(limit);
  }

  // ── Team Statistics ───────────────────────────────────────────────────────

  async getTeamStatistics(teamId: string, seasonId?: string): Promise<TeamStatistic | null> {
    const conditions = [eq(teamStatisticsTable.teamId, teamId)];
    if (seasonId) conditions.push(eq(teamStatisticsTable.seasonId!, seasonId));
    const [row] = await db.select().from(teamStatisticsTable).where(and(...conditions));
    return row ?? null;
  }

  async upsertTeamStatistics(input: Omit<TeamStatistic, "id" | "updatedAt">): Promise<TeamStatistic> {
    const conditions = [eq(teamStatisticsTable.teamId, input.teamId)];
    if (input.seasonId) conditions.push(eq(teamStatisticsTable.seasonId!, input.seasonId));
    const [existing] = await db.select().from(teamStatisticsTable).where(and(...conditions));
    if (existing) {
      const [row] = await db.update(teamStatisticsTable)
        .set({ ...input as Partial<TeamStatistic>, updatedAt: new Date() })
        .where(eq(teamStatisticsTable.id, existing.id)).returning();
      return row!;
    }
    const [row] = await db.insert(teamStatisticsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  // ── Transfers ─────────────────────────────────────────────────────────────

  async listTransfers(playerId?: string): Promise<Transfer[]> {
    const q = db.select().from(transfersTable);
    if (playerId) return q.where(eq(transfersTable.playerId, playerId)).orderBy(desc(transfersTable.transferDate));
    return q.orderBy(desc(transfersTable.transferDate));
  }

  async createTransfer(input: Omit<Transfer, "id" | "createdAt">): Promise<Transfer> {
    const [row] = await db.insert(transfersTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  // ── Contracts ─────────────────────────────────────────────────────────────

  async getActiveContract(playerId: string): Promise<Contract | null> {
    const [row] = await db.select().from(contractsTable)
      .where(and(eq(contractsTable.playerId, playerId), eq(contractsTable.status, "ACTIVE")));
    return row ?? null;
  }

  async createContract(input: Omit<Contract, "id" | "createdAt" | "updatedAt">): Promise<Contract> {
    const [row] = await db.insert(contractsTable).values({ ...input, id: createId() }).returning();
    return row!;
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const [sports]      = await db.select({ count: sql<number>`count(*)::int` }).from(sportsTable);
    const [leagues]     = await db.select({ count: sql<number>`count(*)::int` }).from(leaguesTable);
    const [teams]       = await db.select({ count: sql<number>`count(*)::int` }).from(teamsTable);
    const [players]     = await db.select({ count: sql<number>`count(*)::int` }).from(playersTable);
    const [matches]     = await db.select({ count: sql<number>`count(*)::int` }).from(matchesTable);
    const [tournaments] = await db.select({ count: sql<number>`count(*)::int` }).from(tournamentsTable);
    const liveMatches   = await this.getLiveMatches();
    const todayMatches  = await this.getTodayMatches();
    return {
      totalSports:      sports?.count ?? 0,
      totalLeagues:     leagues?.count ?? 0,
      totalTeams:       teams?.count ?? 0,
      totalPlayers:     players?.count ?? 0,
      totalMatches:     matches?.count ?? 0,
      totalTournaments: tournaments?.count ?? 0,
      liveMatches:      liveMatches.length,
      todayMatches:     todayMatches.length,
    };
  }

  // ── Seed ──────────────────────────────────────────────────────────────────

  async seedData(): Promise<void> {
    const existing = await db.select().from(sportsTable).limit(1);
    if (existing.length > 0) return;

    // 5 Sports
    const sportRows = await db.insert(sportsTable).values([
      { id: createId(), name: "Football", slug: "football", icon: "⚽", type: "FOOTBALL", description: "The beautiful game" },
      { id: createId(), name: "Baseball", slug: "baseball", icon: "⚾", type: "BASEBALL", description: "America's pastime" },
      { id: createId(), name: "Basketball", slug: "basketball", icon: "🏀", type: "BASKETBALL", description: "Fast-paced court sport" },
      { id: createId(), name: "Volleyball", slug: "volleyball", icon: "🏐", type: "VOLLEYBALL", description: "Net-based team sport" },
      { id: createId(), name: "Martial Arts", slug: "martial-arts", icon: "🥊", type: "MARTIAL_ARTS", description: "Combat sports discipline" },
    ]).returning();

    // 5 Leagues (one per sport)
    const leagueRows = await db.insert(leaguesTable).values(sportRows.map((s, i) => ({
      id: createId(),
      sportId: s.id,
      name: `${s.name} Premier League`,
      slug: `${s.slug}-premier-league`,
      country: ["Vietnam", "USA", "USA", "Brazil", "Japan"][i],
      leagueType: "DOMESTIC" as const,
      description: `Top-tier ${s.name} league`,
    }))).returning();

    // 5 Seasons
    const now = new Date();
    const seasonRows = await db.insert(seasonsTable).values(leagueRows.map((l, i) => ({
      id: createId(),
      leagueId: l.id,
      name: `Season 2025-2026`,
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: new Date(now.getFullYear(), 11, 31),
      status: (i === 0 ? "ACTIVE" : i < 3 ? "UPCOMING" : "FINISHED") as "ACTIVE" | "UPCOMING" | "FINISHED",
    }))).returning();

    // 15 Stadiums
    const stadiumData = [
      { name: "Universe Arena", slug: "universe-arena", city: "Ho Chi Minh City", country: "Vietnam", capacity: 80000, venueType: "STADIUM" as const },
      { name: "Galaxy Field", slug: "galaxy-field", city: "Hanoi", country: "Vietnam", capacity: 60000, venueType: "STADIUM" as const },
      { name: "Star Court", slug: "star-court", city: "Da Nang", country: "Vietnam", capacity: 20000, venueType: "ARENA" as const },
      { name: "Cosmos Ring", slug: "cosmos-ring", city: "Can Tho", country: "Vietnam", capacity: 10000, venueType: "RING" as const },
      { name: "Nova Park", slug: "nova-park", city: "Hue", country: "Vietnam", capacity: 40000, venueType: "FIELD" as const },
      { name: "Titan Stadium", slug: "titan-stadium", city: "New York", country: "USA", capacity: 90000, venueType: "STADIUM" as const },
      { name: "Phoenix Arena", slug: "phoenix-arena", city: "Los Angeles", country: "USA", capacity: 75000, venueType: "ARENA" as const },
      { name: "Thunder Court", slug: "thunder-court", city: "Chicago", country: "USA", capacity: 25000, venueType: "COURT" as const },
      { name: "Lightning Field", slug: "lightning-field", city: "Houston", country: "USA", capacity: 50000, venueType: "FIELD" as const },
      { name: "Storm Ring", slug: "storm-ring", city: "Miami", country: "USA", capacity: 15000, venueType: "RING" as const },
      { name: "Dragon Arena", slug: "dragon-arena", city: "São Paulo", country: "Brazil", capacity: 70000, venueType: "STADIUM" as const },
      { name: "Samurai Dojo", slug: "samurai-dojo", city: "Tokyo", country: "Japan", capacity: 30000, venueType: "RING" as const },
      { name: "Majestic Bowl", slug: "majestic-bowl", city: "Seoul", country: "Korea", capacity: 65000, venueType: "STADIUM" as const },
      { name: "Iron Fortress", slug: "iron-fortress", city: "Beijing", country: "China", capacity: 80000, venueType: "ARENA" as const },
      { name: "Cyber Arena", slug: "cyber-arena", city: "Singapore", country: "Singapore", capacity: 5000, venueType: "ONLINE" as const },
    ];
    const stadiumRows = await db.insert(stadiumsTable).values(stadiumData.map(s => ({ ...s, id: createId() }))).returning();

    // 20 Clubs (4 per sport)
    const clubData = sportRows.flatMap((sport, si) =>
      Array.from({ length: 4 }, (_, ci) => ({
        id: createId(),
        sportId: sport.id,
        name: `${["Alpha", "Beta", "Gamma", "Delta"][ci]} ${sport.name} Club`,
        slug: `${["alpha", "beta", "gamma", "delta"][ci]}-${sport.slug}-club`,
        city: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Can Tho"][ci],
        country: "Vietnam",
        founded: 2000 + si * 4 + ci,
        description: `Professional ${sport.name} club`,
      }))
    );
    const clubRows = await db.insert(clubsTable).values(clubData).returning();

    // 20 Teams (1 per club)
    const teamRows = await db.insert(teamsTable).values(clubRows.map((club, i) => ({
      id: createId(),
      clubId: club.id,
      seasonId: seasonRows[Math.floor(i / 4) % seasonRows.length]?.id,
      name: `${club.name} First Team`,
      shortName: club.name.substring(0, 3).toUpperCase(),
      color: ["#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#FF00FF"][i % 5],
    }))).returning();

    // 200 Players (10 per team)
    const positions = {
      football: ["GK", "CB", "LB", "RB", "CM", "LM", "RM", "CAM", "ST", "CF"],
      baseball: ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"],
      basketball: ["PG", "SG", "SF", "PF", "C", "PG", "SG", "SF", "PF", "C"],
      volleyball: ["OH", "MB", "S", "L", "OP", "OH", "MB", "S", "L", "OP"],
      "martial-arts": ["Striker", "Grappler", "Judoka", "Boxer", "Karateka", "Muay Thai", "Wrestler", "BJJ", "MMA", "Coach"],
    };
    const nationalities = ["Vietnam", "Brazil", "France", "England", "Germany", "Spain", "Italy", "Argentina"];
    const playerData = teamRows.flatMap((team, ti) => {
      const clubIdx = ti;
      const club = clubRows[clubIdx];
      const sport = sportRows[Math.floor(clubIdx / 4)];
      const posArr = positions[sport?.slug as keyof typeof positions] ?? positions.football;
      return Array.from({ length: 10 }, (_, pi) => ({
        id: createId(),
        teamId: team.id,
        clubId: club?.id,
        name: `Player ${ti * 10 + pi + 1}`,
        slug: `player-${ti * 10 + pi + 1}`,
        position: posArr[pi % posArr.length],
        nationality: nationalities[(ti + pi) % nationalities.length],
        number: pi + 1,
        isActive: true,
      }));
    });
    await db.insert(playersTable).values(playerData);

    // 30 Coaches (1-2 per team)
    const coachData = teamRows.slice(0, 30).map((team, i) => ({
      id: createId(),
      teamId: team.id,
      clubId: clubRows[i]?.id,
      name: `Coach ${i + 1}`,
      nationality: nationalities[i % nationalities.length],
      role: i % 3 === 0 ? "ASSISTANT_COACH" : "HEAD_COACH",
      isActive: true,
    }));
    await db.insert(coachesTable).values(coachData);

    // 20 Matches
    const matchData = Array.from({ length: 20 }, (_, i) => {
      const homeTeam = teamRows[i % teamRows.length]!;
      const awayTeam = teamRows[(i + 1) % teamRows.length]!;
      const statuses: Match["status"][] = ["SCHEDULED", "LIVE", "FINISHED", "FINISHED", "SCHEDULED"];
      return {
        id: createId(),
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        stadiumId: stadiumRows[i % stadiumRows.length]?.id,
        seasonId: seasonRows[i % seasonRows.length]?.id,
        scheduledAt: new Date(Date.now() + (i - 10) * 86400000),
        status: statuses[i % statuses.length]!,
        homeScore: i % 2 === 0 ? Math.floor(Math.random() * 4) : 0,
        awayScore: i % 2 === 0 ? Math.floor(Math.random() * 3) : 0,
      };
    });
    await db.insert(matchesTable).values(matchData);

    // 5 Tournaments
    const tournamentData = sportRows.map((sport, i) => ({
      id: createId(),
      sportId: sport.id,
      name: `${sport.name} World Cup 2025`,
      slug: `${sport.slug}-world-cup-2025`,
      startDate: new Date(now.getFullYear(), 5, 1),
      endDate: new Date(now.getFullYear(), 7, 31),
      status: (["UPCOMING", "ONGOING", "UPCOMING", "UPCOMING", "FINISHED"] as const)[i]!,
      maxTeams: 16,
      prizePool: 1000000 * (i + 1),
      format: "SINGLE_ELIMINATION",
      description: `The biggest ${sport.name} tournament in the universe`,
    }));
    await db.insert(tournamentsTable).values(tournamentData);

    // Rankings for season 0
    if (seasonRows[0]) {
      const rankData = teamRows.slice(0, 10).map((team, i) => ({
        id: createId(),
        seasonId: seasonRows[0]!.id,
        teamId: team.id,
        position: i + 1,
        points: (10 - i) * 3,
        played: 10,
        won: 10 - i - Math.floor(i / 2),
        drawn: Math.floor(i / 3),
        lost: Math.floor(i / 2),
        goalsFor: (10 - i) * 2,
        goalsAgainst: i * 2,
        goalDifference: (10 - i) * 2 - i * 2,
      }));
      await db.insert(rankingsTable).values(rankData);
    }
  }
}
