// ─────────────────────────────────────────────────────────────────────────────
// SportsService — HUB-26
// ─────────────────────────────────────────────────────────────────────────────

import type { ISportsRepository } from "../repositories/drizzle/DrizzleSportsRepository.js";
import type { NotificationsService }    from "./notificationsService.js";
import type { ActivitiesService }       from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { sportsEventBus } from "../realtime/sportsEventBus.js";

// ─── Error ────────────────────────────────────────────────────────────────────

export class SportsError extends Error {
  constructor(message: string, public code: string, public status = 400) {
    super(message);
    this.name = "SportsError";
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class SportsService {
  constructor(
    private readonly repo:          ISportsRepository,
    private readonly notifService:  NotificationsService,
    private readonly actService:    ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  // ── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard() {
    const stats        = await this.repo.getDashboardStats();
    const recentMatch  = await this.repo.listMatches({ limit: 5 });
    const liveMatches  = await this.repo.getLiveMatches();
    const sports       = await this.repo.listSports();
    const leagues      = await this.repo.listLeagues();
    return { stats, recentMatches: recentMatch, liveMatches, sports, leagues };
  }

  // ── Sports ─────────────────────────────────────────────────────────────────

  async listSports()                  { return this.repo.listSports(); }
  async getSport(id: string)          { return this.repo.getSport(id); }
  async getSportBySlug(slug: string)  { return this.repo.getSportBySlug(slug); }

  async createSport(input: Record<string, unknown>, userId?: string) {
    if (!input["name"] || !input["slug"] || !input["type"]) {
      throw new SportsError("name, slug, type là bắt buộc", "VALIDATION");
    }
    const sport = await this.repo.createSport({
      name:        input["name"] as string,
      slug:        input["slug"] as string,
      icon:        (input["icon"] as string) ?? "🏆",
      description: input["description"] as string | undefined,
      type:        input["type"] as never,
      isActive:    true,
      metadata:    null,
    });
    sportsEventBus.emit("SPORT_CREATED", { sportId: sport.id, name: sport.name });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: `Tạo môn thể thao: ${sport.name}`, description: "" });
    }
    return sport;
  }

  async updateSport(id: string, input: Record<string, unknown>) {
    const sport = await this.repo.updateSport(id, input as never);
    if (!sport) throw new SportsError("Không tìm thấy môn thể thao", "NOT_FOUND", 404);
    return sport;
  }

  // ── Leagues ────────────────────────────────────────────────────────────────

  async listLeagues(sportId?: string)   { return this.repo.listLeagues(sportId); }
  async getLeague(id: string)           { return this.repo.getLeague(id); }

  async createLeague(input: Record<string, unknown>, userId?: string) {
    if (!input["sportId"] || !input["name"] || !input["slug"]) {
      throw new SportsError("sportId, name, slug là bắt buộc", "VALIDATION");
    }
    const league = await this.repo.createLeague({
      sportId:    input["sportId"] as string,
      name:       input["name"] as string,
      slug:       input["slug"] as string,
      country:    input["country"] as string | undefined,
      leagueType: (input["leagueType"] as never) ?? "DOMESTIC",
      description: input["description"] as string | undefined,
      logo:       input["logo"] as string | undefined,
      isActive:   true,
      metadata:   null,
    });
    sportsEventBus.emit("LEAGUE_CREATED", { leagueId: league.id, name: league.name });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: `Tạo giải đấu: ${league.name}`, description: "" });
    }
    return league;
  }

  async updateLeague(id: string, input: Record<string, unknown>) {
    const league = await this.repo.updateLeague(id, input as never);
    if (!league) throw new SportsError("Không tìm thấy giải đấu", "NOT_FOUND", 404);
    return league;
  }

  // ── Seasons ────────────────────────────────────────────────────────────────

  async listSeasons(leagueId?: string)  { return this.repo.listSeasons(leagueId); }
  async getSeason(id: string)           { return this.repo.getSeason(id); }

  async createSeason(input: Record<string, unknown>, userId?: string) {
    if (!input["leagueId"] || !input["name"] || !input["startDate"] || !input["endDate"]) {
      throw new SportsError("leagueId, name, startDate, endDate là bắt buộc", "VALIDATION");
    }
    const season = await this.repo.createSeason({
      leagueId:  input["leagueId"] as string,
      name:      input["name"] as string,
      startDate: new Date(input["startDate"] as string),
      endDate:   new Date(input["endDate"] as string),
      status:    (input["status"] as never) ?? "UPCOMING",
      metadata:  null,
    });
    sportsEventBus.emit("SEASON_CREATED", { seasonId: season.id, name: season.name });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: `Tạo mùa giải: ${season.name}`, description: "" });
    }
    return season;
  }

  // ── Clubs ──────────────────────────────────────────────────────────────────

  async listClubs(sportId?: string)     { return this.repo.listClubs(sportId); }
  async getClub(id: string)             { return this.repo.getClub(id); }

  async createClub(input: Record<string, unknown>, userId?: string) {
    if (!input["sportId"] || !input["name"] || !input["slug"]) {
      throw new SportsError("sportId, name, slug là bắt buộc", "VALIDATION");
    }
    return this.repo.createClub({
      sportId:     input["sportId"] as string,
      name:        input["name"] as string,
      slug:        input["slug"] as string,
      city:        input["city"] as string | undefined,
      country:     input["country"] as string | undefined,
      logo:        input["logo"] as string | undefined,
      founded:     input["founded"] ? Number(input["founded"]) : undefined,
      description: input["description"] as string | undefined,
      isActive:    true,
      metadata:    null,
    });
  }

  // ── Teams ──────────────────────────────────────────────────────────────────

  async listTeams(clubId?: string, seasonId?: string) { return this.repo.listTeams(clubId, seasonId); }
  async getTeam(id: string)                           { return this.repo.getTeam(id); }

  async createTeam(input: Record<string, unknown>, userId?: string) {
    if (!input["clubId"] || !input["name"]) {
      throw new SportsError("clubId, name là bắt buộc", "VALIDATION");
    }
    const team = await this.repo.createTeam({
      clubId:    input["clubId"] as string,
      seasonId:  input["seasonId"] as string | undefined,
      name:      input["name"] as string,
      shortName: input["shortName"] as string | undefined,
      logo:      input["logo"] as string | undefined,
      color:     input["color"] as string | undefined,
      metadata:  null,
    });
    sportsEventBus.emit("TEAM_CREATED", { teamId: team.id, name: team.name });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: `Tạo đội: ${team.name}`, description: "" });
    }
    return team;
  }

  // ── Players ────────────────────────────────────────────────────────────────

  async listPlayers(opts: { teamId?: string; clubId?: string; search?: string; limit?: number; offset?: number } = {}) {
    return this.repo.listPlayers(opts);
  }
  async getPlayer(id: string) { return this.repo.getPlayer(id); }

  async addPlayer(input: Record<string, unknown>, userId?: string) {
    if (!input["name"] || !input["slug"]) {
      throw new SportsError("name, slug là bắt buộc", "VALIDATION");
    }
    return this.repo.createPlayer({
      teamId:      input["teamId"] as string | undefined,
      clubId:      input["clubId"] as string | undefined,
      name:        input["name"] as string,
      slug:        input["slug"] as string,
      position:    input["position"] as string | undefined,
      nationality: input["nationality"] as string | undefined,
      dateOfBirth: input["dateOfBirth"] as string | undefined,
      number:      input["number"] ? Number(input["number"]) : undefined,
      photo:       input["photo"] as string | undefined,
      isActive:    true,
      metadata:    null,
    });
  }

  async updatePlayer(id: string, input: Record<string, unknown>) {
    const player = await this.repo.updatePlayer(id, input as never);
    if (!player) throw new SportsError("Không tìm thấy cầu thủ", "NOT_FOUND", 404);
    return player;
  }

  async transferPlayer(input: Record<string, unknown>, userId?: string) {
    if (!input["playerId"] || !input["toTeamId"]) {
      throw new SportsError("playerId, toTeamId là bắt buộc", "VALIDATION");
    }
    const transfer = await this.repo.createTransfer({
      playerId:    input["playerId"] as string,
      fromTeamId:  input["fromTeamId"] as string | undefined,
      toTeamId:    input["toTeamId"] as string | undefined,
      fee:         Number(input["fee"]) || 0,
      transferDate: new Date(),
      description: input["description"] as string | undefined,
      metadata:    null,
    });
    await this.repo.updatePlayer(input["playerId"] as string, { teamId: input["toTeamId"] as string });
    sportsEventBus.emit("PLAYER_TRANSFERRED", { playerId: input["playerId"] as string, transfer });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: "Chuyển nhượng cầu thủ", description: "" });
    }
    return transfer;
  }

  // ── Coaches ────────────────────────────────────────────────────────────────

  async listCoaches(teamId?: string) { return this.repo.listCoaches(teamId); }
  async getCoach(id: string)         { return this.repo.getCoach(id); }

  async assignCoach(input: Record<string, unknown>, userId?: string) {
    if (!input["name"]) throw new SportsError("name là bắt buộc", "VALIDATION");
    return this.repo.createCoach({
      teamId:      input["teamId"] as string | undefined,
      clubId:      input["clubId"] as string | undefined,
      name:        input["name"] as string,
      nationality: input["nationality"] as string | undefined,
      dateOfBirth: input["dateOfBirth"] as string | undefined,
      photo:       input["photo"] as string | undefined,
      role:        (input["role"] as string) ?? "HEAD_COACH",
      isActive:    true,
      metadata:    null,
    });
  }

  // ── Stadiums ───────────────────────────────────────────────────────────────

  async listStadiums()       { return this.repo.listStadiums(); }
  async getStadium(id: string) { return this.repo.getStadium(id); }

  async createStadium(input: Record<string, unknown>) {
    if (!input["name"] || !input["slug"]) throw new SportsError("name, slug là bắt buộc", "VALIDATION");
    return this.repo.createStadium({
      clubId:    input["clubId"] as string | undefined,
      name:      input["name"] as string,
      slug:      input["slug"] as string,
      city:      input["city"] as string | undefined,
      country:   input["country"] as string | undefined,
      capacity:  input["capacity"] ? Number(input["capacity"]) : undefined,
      venueType: (input["venueType"] as never) ?? "STADIUM",
      photo:     input["photo"] as string | undefined,
      metadata:  null,
    });
  }

  // ── Matches ────────────────────────────────────────────────────────────────

  async listMatches(opts: { seasonId?: string; status?: string; limit?: number } = {}) {
    return this.repo.listMatches(opts);
  }
  async getMatch(id: string)       { return this.repo.getMatch(id); }
  async getLiveMatches()           { return this.repo.getLiveMatches(); }
  async getTodayMatches()          { return this.repo.getTodayMatches(); }
  async getMatchEvents(matchId: string) { return this.repo.listMatchEvents(matchId); }
  async getMatchStats(matchId: string)  { return this.repo.getMatchStatistics(matchId); }

  async scheduleMatch(input: Record<string, unknown>, userId?: string) {
    if (!input["homeTeamId"] || !input["awayTeamId"] || !input["scheduledAt"]) {
      throw new SportsError("homeTeamId, awayTeamId, scheduledAt là bắt buộc", "VALIDATION");
    }
    const match = await this.repo.createMatch({
      homeTeamId:  input["homeTeamId"] as string,
      awayTeamId:  input["awayTeamId"] as string,
      stadiumId:   input["stadiumId"] as string | undefined,
      seasonId:    input["seasonId"] as string | undefined,
      scheduledAt: new Date(input["scheduledAt"] as string),
      status:      "SCHEDULED",
      homeScore:   0,
      awayScore:   0,
      minute:      null,
      metadata:    null,
    });
    sportsEventBus.emit("MATCH_CREATED", { matchId: match.id });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: "Lên lịch trận đấu", description: "" });
    }
    return match;
  }

  async startMatch(id: string, userId?: string) {
    const match = await this.repo.updateMatch(id, { status: "LIVE", minute: 0 });
    if (!match) throw new SportsError("Không tìm thấy trận đấu", "NOT_FOUND", 404);
    sportsEventBus.emit("MATCH_STARTED", { matchId: id });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: "Trận đấu bắt đầu", description: "" });
    }
    return match;
  }

  async finishMatch(id: string, input: Record<string, unknown>, userId?: string) {
    const match = await this.repo.updateMatch(id, {
      status:    "FINISHED",
      homeScore: Number(input["homeScore"]) || 0,
      awayScore: Number(input["awayScore"]) || 0,
    });
    if (!match) throw new SportsError("Không tìm thấy trận đấu", "NOT_FOUND", 404);
    sportsEventBus.emit("MATCH_FINISHED", { matchId: id, homeScore: match.homeScore, awayScore: match.awayScore });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: "Trận đấu kết thúc", description: "" });
      await this.reputationRepo.upsert(userId, 5);
    }
    return match;
  }

  async addMatchEvent(matchId: string, input: Record<string, unknown>) {
    if (!input["teamId"] || !input["eventType"] || input["minute"] === undefined) {
      throw new SportsError("teamId, eventType, minute là bắt buộc", "VALIDATION");
    }
    const event = await this.repo.addMatchEvent({
      matchId,
      playerId:    input["playerId"] as string | undefined,
      teamId:      input["teamId"] as string,
      eventType:   input["eventType"] as string,
      minute:      Number(input["minute"]),
      description: input["description"] as string | undefined,
      metadata:    null,
    });
    if (input["eventType"] === "GOAL") sportsEventBus.emit("GOAL_SCORED", { matchId, event });
    if (input["eventType"] === "POINT") sportsEventBus.emit("POINT_SCORED", { matchId, event });
    return event;
  }

  async updateMatchStatistics(matchId: string, input: Record<string, unknown>) {
    return this.repo.upsertMatchStatistics({ matchId, ...input } as never);
  }

  async updateMatch(id: string, input: Record<string, unknown>) {
    const match = await this.repo.updateMatch(id, input as never);
    if (!match) throw new SportsError("Không tìm thấy trận đấu", "NOT_FOUND", 404);
    return match;
  }

  // ── Tournaments ────────────────────────────────────────────────────────────

  async listTournaments(sportId?: string) { return this.repo.listTournaments(sportId); }
  async getTournament(id: string)         { return this.repo.getTournament(id); }

  async createTournament(input: Record<string, unknown>, userId?: string) {
    if (!input["sportId"] || !input["name"] || !input["slug"] || !input["startDate"] || !input["endDate"]) {
      throw new SportsError("sportId, name, slug, startDate, endDate là bắt buộc", "VALIDATION");
    }
    const tournament = await this.repo.createTournament({
      sportId:     input["sportId"] as string,
      name:        input["name"] as string,
      slug:        input["slug"] as string,
      startDate:   new Date(input["startDate"] as string),
      endDate:     new Date(input["endDate"] as string),
      status:      "UPCOMING",
      maxTeams:    Number(input["maxTeams"]) || 16,
      prizePool:   Number(input["prizePool"]) || 0,
      format:      (input["format"] as string) ?? "SINGLE_ELIMINATION",
      description: input["description"] as string | undefined,
      metadata:    null,
    });
    sportsEventBus.emit("TOURNAMENT_CREATED", { tournamentId: tournament.id, name: tournament.name });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: `Tạo giải đấu: ${tournament.name}`, description: "" });
    }
    return tournament;
  }

  async finishTournament(id: string, winnerId: string, userId?: string) {
    const tournament = await this.repo.updateTournament(id, { status: "FINISHED" });
    if (!tournament) throw new SportsError("Không tìm thấy giải đấu", "NOT_FOUND", 404);
    sportsEventBus.emit("TOURNAMENT_FINISHED", { tournamentId: id });
    sportsEventBus.emit("CHAMPION_CROWNED", { tournamentId: id, winnerId });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: "Giải đấu kết thúc", description: "" });
      await this.reputationRepo.upsert(userId, 50);
    }
    return tournament;
  }

  async generateBracket(tournamentId: string, teamIds: string[]) {
    const rounds: TournamentRound[] = [];
    const roundCount = Math.ceil(Math.log2(teamIds.length));
    for (let r = 0; r < roundCount; r++) {
      const round = await this.repo.createRound({
        tournamentId,
        roundNumber: r + 1,
        name: r === roundCount - 1 ? "Final" : r === roundCount - 2 ? "Semi Final" : `Round ${r + 1}`,
        startDate: null,
        endDate: null,
      });
      rounds.push(round);
    }
    // Create fixtures for round 1
    if (rounds[0]) {
      for (let i = 0; i < teamIds.length - 1; i += 2) {
        if (teamIds[i] && teamIds[i + 1]) {
          await this.repo.createFixture({
            roundId:    rounds[0].id,
            homeTeamId: teamIds[i]!,
            awayTeamId: teamIds[i + 1]!,
            scheduledAt: new Date(),
            status:     "SCHEDULED",
            homeScore:  0,
            awayScore:  0,
            metadata:   null,
          });
        }
      }
    }
    return { tournament: tournamentId, rounds, message: "Bracket generated" };
  }

  async listRounds(tournamentId: string) { return this.repo.listRounds(tournamentId); }

  // ── Rankings ───────────────────────────────────────────────────────────────

  async getRankings(seasonId: string) { return this.repo.listRankings(seasonId); }

  async generateRankings(seasonId: string) {
    const rankings = await this.repo.listRankings(seasonId);
    const sorted = [...rankings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalDifference - a.goalDifference;
    });
    for (let i = 0; i < sorted.length; i++) {
      await this.repo.upsertRanking({ ...sorted[i]!, position: i + 1 });
    }
    return this.repo.listRankings(seasonId);
  }

  // ── Awards ─────────────────────────────────────────────────────────────────

  async listAwards(sportId?: string) { return this.repo.listAwards(sportId); }

  async grantAward(input: Record<string, unknown>, userId?: string) {
    if (!input["sportId"] || !input["name"] || !input["awardType"]) {
      throw new SportsError("sportId, name, awardType là bắt buộc", "VALIDATION");
    }
    const award = await this.repo.createAward({
      sportId:    input["sportId"] as string,
      seasonId:   input["seasonId"] as string | undefined,
      name:       input["name"] as string,
      awardType:  input["awardType"] as never,
      description: input["description"] as string | undefined,
      winnerId:   input["winnerId"] as string | undefined,
      winnerName: input["winnerName"] as string | undefined,
      winnerType: input["winnerType"] as string | undefined,
      grantedAt:  new Date(),
      metadata:   null,
    });
    sportsEventBus.emit("AWARD_GRANTED", { awardId: award.id, name: award.name });
    if (userId) {
      await this.actService.createActivity({ userId, type: "sports", title: `Trao giải: ${award.name}`, description: "" });
      await this.reputationRepo.upsert(userId, 20);
    }
    return award;
  }

  // ── Statistics ─────────────────────────────────────────────────────────────

  async getPlayerStatistics(playerId: string, seasonId?: string) {
    return this.repo.getPlayerStatistics(playerId, seasonId);
  }

  async getTeamStatistics(teamId: string, seasonId?: string) {
    return this.repo.getTeamStatistics(teamId, seasonId);
  }

  async getTopScorers(seasonId?: string, limit = 10) {
    return this.repo.topScorers(seasonId, limit);
  }

  async getStatisticsSummary(seasonId?: string) {
    const topScorers = await this.repo.topScorers(seasonId, 10);
    return { topScorers };
  }

  // ── Transfers ──────────────────────────────────────────────────────────────

  async listTransfers(playerId?: string) { return this.repo.listTransfers(playerId); }

  // ── Contracts ──────────────────────────────────────────────────────────────

  async getActiveContract(playerId: string) { return this.repo.getActiveContract(playerId); }

  async signContract(input: Record<string, unknown>) {
    if (!input["playerId"] || !input["teamId"] || !input["startDate"] || !input["endDate"]) {
      throw new SportsError("playerId, teamId, startDate, endDate là bắt buộc", "VALIDATION");
    }
    return this.repo.createContract({
      playerId:  input["playerId"] as string,
      teamId:    input["teamId"] as string,
      startDate: new Date(input["startDate"] as string),
      endDate:   new Date(input["endDate"] as string),
      salary:    Number(input["salary"]) || 0,
      status:    "ACTIVE",
      metadata:  null,
    });
  }
}

type TournamentRound = Awaited<ReturnType<ISportsRepository["createRound"]>>;
