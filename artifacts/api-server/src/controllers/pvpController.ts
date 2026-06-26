// ─────────────────────────────────────────────────────────────────────────────
// pvpController — HUB-23
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import {
  pvpService, matchmakingService, rankingService, tournamentService,
  accountBridgeService,
} from "../container.js";
import { PvpError } from "../services/pvpService.js";
import { MatchmakingError } from "../services/matchmakingService.js";
import { TournamentError } from "../services/tournamentService.js";

async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return (profile as { userId?: string; id?: string }).userId
        || (profile as { userId?: string; id?: string }).id
        || null;
  } catch { return null; }
}

function requireUser(userId: string | null, res: Response): userId is string {
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return false; }
  return true;
}

function handleError(err: unknown, res: Response): void {
  if (err instanceof PvpError || err instanceof MatchmakingError || err instanceof TournamentError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
}

// ─── PvP Dashboard ────────────────────────────────────────────────────────────

export async function handlePvpDashboard(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const data = await pvpService.getDashboard(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function handleLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const seasonId = req.query["seasonId"] as string | undefined;
    const limit = parseInt(req.query["limit"] as string ?? "100");
    const data = await rankingService.getLeaderboard(seasonId, isNaN(limit) ? 100 : limit);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ─── Match History ────────────────────────────────────────────────────────────

export async function handleMatchHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const data = await pvpService.getDashboard(userId);
    res.json({ ok: true, data: data.recentMatches });
  } catch (err) { handleError(err, res); }
}

// ─── Queue ────────────────────────────────────────────────────────────────────

export async function handleJoinQueue(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { matchType, isRanked } = req.body as { matchType?: string; isRanked?: boolean };
    if (!matchType) { res.status(400).json({ ok: false, error: "matchType bắt buộc" }); return; }
    const season = await rankingService.getCurrentSeason();
    const entry = await matchmakingService.joinQueue(userId, matchType as never, season?.id, isRanked ?? true);
    res.json({ ok: true, data: entry });
  } catch (err) { handleError(err, res); }
}

export async function handleLeaveQueue(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    await matchmakingService.leaveQueue(userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

// ─── Match ────────────────────────────────────────────────────────────────────

export async function handleGetMatch(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const data = await pvpService.getMatch(id);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleReadyUp(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const data = await pvpService.readyUp(id, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleAttack(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const { targetId, damage } = req.body as { targetId?: string; damage?: number };
    if (!targetId) { res.status(400).json({ ok: false, error: "targetId bắt buộc" }); return; }
    const data = await pvpService.attack(id, userId, targetId, damage);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleSkill(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const { skillName, targetId } = req.body as { skillName?: string; targetId?: string };
    if (!skillName) { res.status(400).json({ ok: false, error: "skillName bắt buộc" }); return; }
    const data = await pvpService.useSkill(id, userId, skillName, targetId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleSurrender(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const data = await pvpService.surrender(id, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ─── Seasons ──────────────────────────────────────────────────────────────────

export async function handleGetSeasons(req: Request, res: Response): Promise<void> {
  try {
    const data = await rankingService.getSeasons();
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleGetCurrentSeason(req: Request, res: Response): Promise<void> {
  try {
    const data = await rankingService.getCurrentSeason();
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

export async function handleListTournaments(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query["status"] as string | undefined;
    const data = await tournamentService.listTournaments(status);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleCreateTournament(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const body = req.body as {
      name?: string; description?: string; type?: string;
      matchType?: string; maxParticipants?: number;
      entryFee?: number; prizePool?: number;
      minMmr?: number; maxMmr?: number; guildId?: string;
    };
    if (!body.name) { res.status(400).json({ ok: false, error: "name bắt buộc" }); return; }
    const data = await tournamentService.createTournament({
      name: body.name,
      description: body.description,
      type: (body.type ?? "SINGLE") as never,
      matchType: (body.matchType ?? "DUEL") as never,
      organizerId: userId,
      guildId: body.guildId,
      maxParticipants: body.maxParticipants,
      entryFee: body.entryFee,
      prizePool: body.prizePool,
      minMmr: body.minMmr,
      maxMmr: body.maxMmr,
    });
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleJoinTournament(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const data = await tournamentService.joinTournament(id, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleGetBracket(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const data = await tournamentService.getBracket(id);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleStartTournament(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const data = await tournamentService.startTournament(id, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleFinishTournament(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const data = await tournamentService.finishTournament(id, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}
