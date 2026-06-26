// ─────────────────────────────────────────────────────────────────────────────
// dungeonController — HUB-21
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { dungeonService, raidService, accountBridgeService } from "../container.js";
import { DungeonError } from "../services/dungeonService.js";
import { RaidError } from "../services/raidService.js";

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
  if (err instanceof DungeonError || err instanceof RaidError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
}

// ─── Dungeon endpoints ────────────────────────────────────────────────────────

export async function handleListDungeons(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await dungeonService.listDungeons() }); }
  catch (err) { handleError(err, res); }
}

export async function handleGetDungeon(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await dungeonService.getDungeon(req.params["id"] as string) }); }
  catch (err) { handleError(err, res); }
}

export async function handleCreateDungeonInstance(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { dungeonId, difficulty } = req.body as { dungeonId: string; difficulty?: string };
    if (!dungeonId) { res.status(400).json({ ok: false, error: "dungeonId là bắt buộc" }); return; }
    const inst = await dungeonService.createInstance(userId, { dungeonId, difficulty: difficulty as never });
    res.status(201).json({ ok: true, data: inst });
  } catch (err) { handleError(err, res); }
}

export async function handleGetDungeonInstance(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await dungeonService.getInstance(req.params["id"] as string) }); }
  catch (err) { handleError(err, res); }
}

export async function handleListDungeonInstances(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query["status"] as string | undefined;
    const data = await dungeonService.listInstances(status as never);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleJoinDungeon(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const member = await dungeonService.joinDungeon(req.params["id"] as string, userId);
    res.json({ ok: true, data: member });
  } catch (err) { handleError(err, res); }
}

export async function handleLeaveDungeon(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    await dungeonService.leaveDungeon(req.params["id"] as string, userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

export async function handleStartDungeon(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const inst = await dungeonService.startDungeon(req.params["id"] as string, userId);
    res.json({ ok: true, data: inst });
  } catch (err) { handleError(err, res); }
}

export async function handleSpawnMonster(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const result = await dungeonService.spawnMonster(req.params["id"] as string, userId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

export async function handleSpawnBoss(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const boss = await dungeonService.spawnBoss(req.params["id"] as string, userId);
    res.json({ ok: true, data: boss });
  } catch (err) { handleError(err, res); }
}

export async function handleKillBoss(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    await dungeonService.killBoss(req.params["id"] as string, userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

export async function handleFinishDungeon(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { success = true } = req.body as { success?: boolean };
    const result = await dungeonService.finishDungeon(req.params["id"] as string, userId, success);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

export async function handleReviveMember(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { targetUserId } = req.body as { targetUserId: string };
    await dungeonService.reviveMember(req.params["id"] as string, userId, targetUserId ?? userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

export async function handleDungeonHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await dungeonService.getHistory(userId) });
  } catch (err) { handleError(err, res); }
}

export async function handleDungeonStatistics(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await dungeonService.getStatistics(userId) });
  } catch (err) { handleError(err, res); }
}

// ─── Raid endpoints ───────────────────────────────────────────────────────────

export async function handleListRaidBosses(req: Request, res: Response): Promise<void> {
  try {
    const difficulty = req.query["difficulty"] as string | undefined;
    res.json({ ok: true, data: await raidService.listBosses(difficulty) });
  } catch (err) { handleError(err, res); }
}

export async function handleListRaids(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query["status"] as string | undefined;
    res.json({ ok: true, data: await raidService.listRaids(status) });
  } catch (err) { handleError(err, res); }
}

export async function handleCreateRaid(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { raidBossId, difficulty, groupId } = req.body as { raidBossId: string; difficulty?: string; groupId?: string };
    if (!raidBossId) { res.status(400).json({ ok: false, error: "raidBossId là bắt buộc" }); return; }
    const inst = await raidService.createRaid(userId, { raidBossId, difficulty: difficulty as never, groupId });
    res.status(201).json({ ok: true, data: inst });
  } catch (err) { handleError(err, res); }
}

export async function handleGetRaid(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await raidService.getRaid(req.params["id"] as string) }); }
  catch (err) { handleError(err, res); }
}

export async function handleJoinRaid(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { role } = req.body as { role?: string };
    await raidService.joinRaid(req.params["id"] as string, userId, role as never);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

export async function handleStartRaid(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const inst = await raidService.startRaid(req.params["id"] as string, userId);
    res.json({ ok: true, data: inst });
  } catch (err) { handleError(err, res); }
}

export async function handleRaidDamage(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { damage, healing, skill } = req.body as { damage: number; healing?: number; skill?: string };
    if (!damage) { res.status(400).json({ ok: false, error: "damage là bắt buộc" }); return; }
    const result = await raidService.recordDamage(req.params["id"] as string, userId, damage, healing, skill);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

export async function handleFinishRaid(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { success = true } = req.body as { success?: boolean };
    const inst = await raidService.finishRaid(req.params["id"] as string, userId, success);
    res.json({ ok: true, data: inst });
  } catch (err) { handleError(err, res); }
}

export async function handleRaidLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const bossId = req.query["bossId"] as string;
    if (!bossId) { res.status(400).json({ ok: false, error: "bossId là bắt buộc" }); return; }
    const limit = parseInt(req.query["limit"] as string ?? "20");
    res.json({ ok: true, data: await raidService.leaderboard(bossId, limit) });
  } catch (err) { handleError(err, res); }
}

export async function handleRaidHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await raidService.history(userId) });
  } catch (err) { handleError(err, res); }
}

// ─── Raid group endpoints ──────────────────────────────────────────────────────

export async function handleListRaidGroups(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await raidService.listGroups() }); }
  catch (err) { handleError(err, res); }
}

export async function handleCreateRaidGroup(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { name, maxMembers } = req.body as { name: string; maxMembers?: number };
    if (!name) { res.status(400).json({ ok: false, error: "name là bắt buộc" }); return; }
    const group = await raidService.createGroup(userId, name, maxMembers);
    res.status(201).json({ ok: true, data: group });
  } catch (err) { handleError(err, res); }
}

export async function handleJoinRaidGroup(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { role } = req.body as { role?: string };
    const member = await raidService.joinGroup(req.params["id"] as string, userId, role as never);
    res.json({ ok: true, data: member });
  } catch (err) { handleError(err, res); }
}

export async function handleLeaveRaidGroup(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    await raidService.leaveGroup(req.params["id"] as string, userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

export async function handleGetRaidGroupMembers(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await raidService.getGroupMembers(req.params["id"] as string) }); }
  catch (err) { handleError(err, res); }
}
