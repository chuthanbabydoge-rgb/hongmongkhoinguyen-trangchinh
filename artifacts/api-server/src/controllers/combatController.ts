// ─────────────────────────────────────────────────────────────────────────────
// combatController — HUB-19
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { combatService, accountBridgeService } from "../container.js";
import { CombatError } from "../services/combatService.js";
import type { BattleType } from "../repositories/combatRepository.js";

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
  if (err instanceof CombatError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
}

// GET /api/combat
export async function handleListBattles(req: Request, res: Response): Promise<void> {
  try {
    const { status, type } = req.query as Record<string, string | undefined>;
    const battles = await combatService.listBattles(
      status as "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED" | undefined,
      type as BattleType | undefined,
    );
    res.json({ ok: true, data: battles });
  } catch (err) { handleError(err, res); }
}

// POST /api/combat
export async function handleCreateBattle(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { type = "PVE", bossId, dungeonId, isRealtime } = req.body as Record<string, unknown>;
    const battle = await combatService.createBattle(userId, type as BattleType, {
      bossId: bossId as string | undefined,
      dungeonId: dungeonId as string | undefined,
      isRealtime: Boolean(isRealtime),
    });
    res.status(201).json({ ok: true, data: battle });
  } catch (err) { handleError(err, res); }
}

// GET /api/combat/history
export async function handleHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const limit  = Math.min(50, Number(req.query["limit"]  ?? 20));
    const offset = Number(req.query["offset"] ?? 0);
    const data = await combatService.history(userId, limit, offset);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// GET /api/combat/leaderboard
export async function handleLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const season = Number(req.query["season"] ?? 1);
    const limit  = Math.min(100, Number(req.query["limit"] ?? 50));
    const data = await combatService.leaderboard(season, limit);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// GET /api/combat/bosses
export async function handleListBosses(req: Request, res: Response): Promise<void> {
  try {
    const data = await combatService.listBosses();
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// POST /api/combat/bosses/:id/start
export async function handleStartBossBattle(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const bossId = req.params["id"] as string;
    const battle = await combatService.startBossBattle(userId, bossId);
    res.status(201).json({ ok: true, data: battle });
  } catch (err) { handleError(err, res); }
}

// GET /api/combat/arena
export async function handleArena(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const [rank, lb] = await Promise.all([
      combatService.getArenaRank(userId),
      combatService.leaderboard(1, 10),
    ]);
    res.json({ ok: true, data: { rank, leaderboard: lb } });
  } catch (err) { handleError(err, res); }
}

// POST /api/combat/arena/queue
export async function handleArenaQueue(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const result = await combatService.joinArenaQueue(userId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

// GET /api/combat/skills
export async function handleListSkills(req: Request, res: Response): Promise<void> {
  try {
    const data = await combatService.getSkills();
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// GET /api/combat/statistics
export async function handleStatistics(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const data = await combatService.getStatistics(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// GET /api/combat/:id
export async function handleGetBattle(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const battle = await combatService.getBattle(id);
    if (!battle) { res.status(404).json({ ok: false, error: "Trận chiến không tồn tại" }); return; }
    res.json({ ok: true, data: battle });
  } catch (err) { handleError(err, res); }
}

// POST /api/combat/:id/join
export async function handleJoinBattle(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const battleId     = req.params["id"] as string;
    const { characterId } = req.body as Record<string, string | undefined>;
    const participant  = await combatService.joinBattle(battleId, userId, characterId);
    res.json({ ok: true, data: participant });
  } catch (err) { handleError(err, res); }
}

// POST /api/combat/:id/start
export async function handleStartBattle(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const battleId = req.params["id"] as string;
    const battle   = await combatService.startBattle(battleId, userId);
    res.json({ ok: true, data: battle });
  } catch (err) { handleError(err, res); }
}

// POST /api/combat/:id/attack
export async function handleAttack(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const battleId  = req.params["id"] as string;
    const { targetUserId } = req.body as { targetUserId: string };
    if (!targetUserId) { res.status(400).json({ ok: false, error: "targetUserId là bắt buộc" }); return; }
    const result = await combatService.attack(battleId, userId, targetUserId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

// POST /api/combat/:id/skill
export async function handleCastSkill(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const battleId = req.params["id"] as string;
    const { targetUserId, skillId } = req.body as { targetUserId: string; skillId: string };
    if (!targetUserId || !skillId) {
      res.status(400).json({ ok: false, error: "targetUserId và skillId là bắt buộc" }); return;
    }
    const result = await combatService.castSkill(battleId, userId, targetUserId, skillId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

// POST /api/combat/:id/surrender
export async function handleSurrender(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const battleId = req.params["id"] as string;
    const battle   = await combatService.surrender(battleId, userId);
    res.json({ ok: true, data: battle });
  } catch (err) { handleError(err, res); }
}

// POST /api/combat/:id/finish
export async function handleFinishBattle(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const battleId = req.params["id"] as string;
    const { winnerId } = req.body as { winnerId?: string };
    const battle = await combatService.surrender(battleId, winnerId ?? userId);
    res.json({ ok: true, data: battle });
  } catch (err) { handleError(err, res); }
}
