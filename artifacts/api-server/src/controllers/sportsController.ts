// ─────────────────────────────────────────────────────────────────────────────
// SportsController — HUB-26
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { sportsService, accountBridgeService } from "../container.js";
import { SportsError } from "../services/sportsService.js";

async function getUserId(req: Request): Promise<string> {
  const auth = req.headers["authorization"] as string;
  const profile = await accountBridgeService.getProfileCached(auth);
  const p = profile as unknown as Record<string, unknown>;
  const id = (p["userId"] ?? p["id"]) as string | undefined;
  if (!id) throw new SportsError("Không thể xác thực người dùng", "UNAUTHORIZED", 401);
  return id;
}

function handleErr(res: Response, err: unknown) {
  if (err instanceof SportsError) {
    res.status(err.status).json({ ok: false, error: err.message, code: err.code });
  } else {
    res.status(500).json({ ok: false, error: "Lỗi hệ thống" });
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function handleDashboard(_req: Request, res: Response) {
  try {
    const data = await sportsService.getDashboard();
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── Sports ────────────────────────────────────────────────────────────────────

export async function handleListSports(_req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.listSports() });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetSport(req: Request, res: Response) {
  try {
    const data = await sportsService.getSport(req.params["id"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy môn thể thao" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetSportBySlug(req: Request, res: Response) {
  try {
    const data = await sportsService.getSportBySlug(req.params["slug"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy môn thể thao" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateSport(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.status(201).json({ ok: true, data: await sportsService.createSport(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleUpdateSport(req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.updateSport(req.params["id"] as string, req.body as Record<string, unknown>) });
  } catch (err) { handleErr(res, err); }
}

// ── Leagues ───────────────────────────────────────────────────────────────────

export async function handleListLeagues(req: Request, res: Response) {
  try {
    const sportId = req.query["sportId"] as string | undefined;
    res.json({ ok: true, data: await sportsService.listLeagues(sportId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetLeague(req: Request, res: Response) {
  try {
    const data = await sportsService.getLeague(req.params["id"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy giải đấu" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateLeague(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.status(201).json({ ok: true, data: await sportsService.createLeague(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleUpdateLeague(req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.updateLeague(req.params["id"] as string, req.body as Record<string, unknown>) });
  } catch (err) { handleErr(res, err); }
}

// ── Seasons ───────────────────────────────────────────────────────────────────

export async function handleListSeasons(req: Request, res: Response) {
  try {
    const leagueId = req.query["leagueId"] as string | undefined;
    res.json({ ok: true, data: await sportsService.listSeasons(leagueId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetSeason(req: Request, res: Response) {
  try {
    const data = await sportsService.getSeason(req.params["id"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy mùa giải" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateSeason(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.status(201).json({ ok: true, data: await sportsService.createSeason(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

// ── Clubs ─────────────────────────────────────────────────────────────────────

export async function handleListClubs(req: Request, res: Response) {
  try {
    const sportId = req.query["sportId"] as string | undefined;
    res.json({ ok: true, data: await sportsService.listClubs(sportId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetClub(req: Request, res: Response) {
  try {
    const data = await sportsService.getClub(req.params["id"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy câu lạc bộ" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateClub(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.status(201).json({ ok: true, data: await sportsService.createClub(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

// ── Teams ─────────────────────────────────────────────────────────────────────

export async function handleListTeams(req: Request, res: Response) {
  try {
    const { clubId, seasonId } = req.query as Record<string, string>;
    res.json({ ok: true, data: await sportsService.listTeams(clubId, seasonId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetTeam(req: Request, res: Response) {
  try {
    const data = await sportsService.getTeam(req.params["id"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy đội bóng" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateTeam(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.status(201).json({ ok: true, data: await sportsService.createTeam(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleUpdateTeam(req: Request, res: Response) {
  try {
    const data = await sportsService["repo" as never] as never;
    void data;
    res.json({ ok: true, data: await sportsService.getTeam(req.params["id"] as string) });
  } catch (err) { handleErr(res, err); }
}

// ── Players ───────────────────────────────────────────────────────────────────

export async function handleListPlayers(req: Request, res: Response) {
  try {
    const { teamId, clubId, search, limit, offset } = req.query as Record<string, string>;
    const data = await sportsService.listPlayers({
      teamId, clubId, search,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
    });
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetPlayer(req: Request, res: Response) {
  try {
    const data = await sportsService.getPlayer(req.params["id"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy cầu thủ" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleAddPlayer(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.status(201).json({ ok: true, data: await sportsService.addPlayer(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleUpdatePlayer(req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.updatePlayer(req.params["id"] as string, req.body as Record<string, unknown>) });
  } catch (err) { handleErr(res, err); }
}

export async function handleTransferPlayer(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.json({ ok: true, data: await sportsService.transferPlayer(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetPlayerStatistics(req: Request, res: Response) {
  try {
    const seasonId = req.query["seasonId"] as string | undefined;
    const data = await sportsService.getPlayerStatistics(req.params["id"] as string, seasonId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── Coaches ───────────────────────────────────────────────────────────────────

export async function handleListCoaches(req: Request, res: Response) {
  try {
    const teamId = req.query["teamId"] as string | undefined;
    res.json({ ok: true, data: await sportsService.listCoaches(teamId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetCoach(req: Request, res: Response) {
  try {
    const data = await sportsService.getCoach(req.params["id"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy huấn luyện viên" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleAssignCoach(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.status(201).json({ ok: true, data: await sportsService.assignCoach(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

// ── Stadiums ──────────────────────────────────────────────────────────────────

export async function handleListStadiums(_req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.listStadiums() });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetStadium(req: Request, res: Response) {
  try {
    const data = await sportsService.getStadium(req.params["id"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy sân vận động" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateStadium(req: Request, res: Response) {
  try {
    res.status(201).json({ ok: true, data: await sportsService.createStadium(req.body as Record<string, unknown>) });
  } catch (err) { handleErr(res, err); }
}

// ── Matches ───────────────────────────────────────────────────────────────────

export async function handleListMatches(req: Request, res: Response) {
  try {
    const { seasonId, status, limit } = req.query as Record<string, string>;
    const data = await sportsService.listMatches({ seasonId, status, limit: limit ? Number(limit) : 50 });
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetMatch(req: Request, res: Response) {
  try {
    const data = await sportsService.getMatch(req.params["id"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy trận đấu" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleScheduleMatch(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.status(201).json({ ok: true, data: await sportsService.scheduleMatch(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleStartMatch(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.json({ ok: true, data: await sportsService.startMatch(req.params["id"] as string, userId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleFinishMatch(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.json({ ok: true, data: await sportsService.finishMatch(req.params["id"] as string, req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleUpdateMatch(req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.updateMatch(req.params["id"] as string, req.body as Record<string, unknown>) });
  } catch (err) { handleErr(res, err); }
}

export async function handleAddMatchEvent(req: Request, res: Response) {
  try {
    res.status(201).json({ ok: true, data: await sportsService.addMatchEvent(req.params["id"] as string, req.body as Record<string, unknown>) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetMatchEvents(req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.getMatchEvents(req.params["id"] as string) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetMatchStatistics(req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.getMatchStats(req.params["id"] as string) });
  } catch (err) { handleErr(res, err); }
}

export async function handleUpdateMatchStatistics(req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.updateMatchStatistics(req.params["id"] as string, req.body as Record<string, unknown>) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetLiveMatches(_req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.getLiveMatches() });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetTodayMatches(_req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.getTodayMatches() });
  } catch (err) { handleErr(res, err); }
}

// ── Tournaments ───────────────────────────────────────────────────────────────

export async function handleListTournaments(req: Request, res: Response) {
  try {
    const sportId = req.query["sportId"] as string | undefined;
    res.json({ ok: true, data: await sportsService.listTournaments(sportId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetTournament(req: Request, res: Response) {
  try {
    const data = await sportsService.getTournament(req.params["id"] as string);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy giải đấu" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateTournament(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.status(201).json({ ok: true, data: await sportsService.createTournament(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleFinishTournament(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const { winnerId } = req.body as { winnerId: string };
    res.json({ ok: true, data: await sportsService.finishTournament(req.params["id"] as string, winnerId, userId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGenerateBracket(req: Request, res: Response) {
  try {
    const { teamIds } = req.body as { teamIds: string[] };
    res.json({ ok: true, data: await sportsService.generateBracket(req.params["id"] as string, teamIds) });
  } catch (err) { handleErr(res, err); }
}

export async function handleListRounds(req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.listRounds(req.params["id"] as string) });
  } catch (err) { handleErr(res, err); }
}

// ── Rankings ──────────────────────────────────────────────────────────────────

export async function handleGetRankings(req: Request, res: Response) {
  try {
    const seasonId = req.params["seasonId"] as string;
    res.json({ ok: true, data: await sportsService.getRankings(seasonId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGenerateRankings(req: Request, res: Response) {
  try {
    const seasonId = req.params["seasonId"] as string;
    res.json({ ok: true, data: await sportsService.generateRankings(seasonId) });
  } catch (err) { handleErr(res, err); }
}

// ── Awards ────────────────────────────────────────────────────────────────────

export async function handleListAwards(req: Request, res: Response) {
  try {
    const sportId = req.query["sportId"] as string | undefined;
    res.json({ ok: true, data: await sportsService.listAwards(sportId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGrantAward(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    res.status(201).json({ ok: true, data: await sportsService.grantAward(req.body as Record<string, unknown>, userId) });
  } catch (err) { handleErr(res, err); }
}

// ── Statistics ────────────────────────────────────────────────────────────────

export async function handleGetStatistics(req: Request, res: Response) {
  try {
    const seasonId = req.query["seasonId"] as string | undefined;
    res.json({ ok: true, data: await sportsService.getStatisticsSummary(seasonId) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetTopScorers(req: Request, res: Response) {
  try {
    const { seasonId, limit } = req.query as Record<string, string>;
    res.json({ ok: true, data: await sportsService.getTopScorers(seasonId, limit ? Number(limit) : 10) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetTeamStatistics(req: Request, res: Response) {
  try {
    const seasonId = req.query["seasonId"] as string | undefined;
    res.json({ ok: true, data: await sportsService.getTeamStatistics(req.params["id"] as string, seasonId) });
  } catch (err) { handleErr(res, err); }
}

// ── Transfers ─────────────────────────────────────────────────────────────────

export async function handleListTransfers(req: Request, res: Response) {
  try {
    const playerId = req.query["playerId"] as string | undefined;
    res.json({ ok: true, data: await sportsService.listTransfers(playerId) });
  } catch (err) { handleErr(res, err); }
}

// ── Contracts ─────────────────────────────────────────────────────────────────

export async function handleSignContract(req: Request, res: Response) {
  try {
    res.status(201).json({ ok: true, data: await sportsService.signContract(req.body as Record<string, unknown>) });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetActiveContract(req: Request, res: Response) {
  try {
    res.json({ ok: true, data: await sportsService.getActiveContract(req.params["playerId"] as string) });
  } catch (err) { handleErr(res, err); }
}
