// ─────────────────────────────────────────────────────────────────────────────
// bossController — HUB-22
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { bossAIService, worldEventService, weatherService, accountBridgeService } from "../container.js";
import { BossAIError } from "../services/bossAIService.js";
import { WorldEventError } from "../services/worldEventService.js";

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
  if (err instanceof BossAIError || err instanceof WorldEventError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
}

// ─── Boss endpoints ───────────────────────────────────────────────────────────

export async function handleListBosses(req: Request, res: Response): Promise<void> {
  try {
    const type = req.query["type"] as string | undefined;
    res.json({ ok: true, data: await bossAIService.listBosses(type) });
  } catch (err) { handleError(err, res); }
}

export async function handleGetActiveBosses(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await bossAIService.getActiveBosses() }); }
  catch (err) { handleError(err, res); }
}

export async function handleGetBoss(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await bossAIService.getBoss(req.params["id"] as string) }); }
  catch (err) { handleError(err, res); }
}

export async function handleSpawnBoss(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    const boss = await bossAIService.spawnBoss(req.params["id"] as string, userId ?? undefined);
    res.json({ ok: true, data: boss });
  } catch (err) { handleError(err, res); }
}

export async function handleJoinBoss(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const boss = await bossAIService.joinBattle(req.params["id"] as string, userId);
    res.json({ ok: true, data: boss });
  } catch (err) { handleError(err, res); }
}

export async function handleAttackBoss(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { damage, healing, skillName } = req.body as { damage: number; healing?: number; skillName?: string };
    if (!damage || damage <= 0) { res.status(400).json({ ok: false, error: "damage phải > 0" }); return; }
    const result = await bossAIService.attackBoss(req.params["id"] as string, userId, damage, healing, skillName);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

export async function handleCastSkill(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { skillId } = req.body as { skillId: string };
    if (!skillId) { res.status(400).json({ ok: false, error: "skillId là bắt buộc" }); return; }
    const result = await bossAIService.castSkill(req.params["id"] as string, skillId, userId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

export async function handleGetBossLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query["limit"] as string ?? "20");
    res.json({ ok: true, data: await bossAIService.leaderboard(req.params["id"] as string, limit) });
  } catch (err) { handleError(err, res); }
}

export async function handleGetBossSkills(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await bossAIService.getSkills(req.params["id"] as string) }); }
  catch (err) { handleError(err, res); }
}

export async function handleGetBossParticipants(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await bossAIService.getParticipants(req.params["id"] as string) }); }
  catch (err) { handleError(err, res); }
}

export async function handleBossHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await bossAIService.getHistory(userId) });
  } catch (err) { handleError(err, res); }
}

export async function handleBossStatistics(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await bossAIService.getStatistics(userId) });
  } catch (err) { handleError(err, res); }
}

export async function handleThreatTable(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: bossAIService.getThreatTable(req.params["id"] as string) }); }
  catch (err) { handleError(err, res); }
}

// ─── World Event endpoints ────────────────────────────────────────────────────

export async function handleListWorldEvents(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query["status"] as string | undefined;
    res.json({ ok: true, data: await worldEventService.listEvents(status) });
  } catch (err) { handleError(err, res); }
}

export async function handleGetWorldEvent(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await worldEventService.getEvent(req.params["id"] as string) }); }
  catch (err) { handleError(err, res); }
}

export async function handleCreateWorldEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const data = req.body as { name: string; description?: string; type: string; region?: string; maxParticipants?: number; rewardCredits?: number; rewardXp?: number; icon?: string };
    if (!data.name || !data.type) { res.status(400).json({ ok: false, error: "name và type là bắt buộc" }); return; }
    const event = await worldEventService.createEvent(userId, data);
    res.status(201).json({ ok: true, data: event });
  } catch (err) { handleError(err, res); }
}

export async function handleJoinWorldEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const participant = await worldEventService.joinEvent(req.params["id"] as string, userId);
    res.json({ ok: true, data: participant });
  } catch (err) { handleError(err, res); }
}

export async function handleStartWorldEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const event = await worldEventService.startEvent(req.params["id"] as string, userId);
    res.json({ ok: true, data: event });
  } catch (err) { handleError(err, res); }
}

export async function handleContributeObjective(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { objectiveId, amount } = req.body as { objectiveId: string; amount?: number };
    if (!objectiveId) { res.status(400).json({ ok: false, error: "objectiveId là bắt buộc" }); return; }
    const event = await worldEventService.contributeObjective(req.params["id"] as string, objectiveId, userId, amount);
    res.json({ ok: true, data: event });
  } catch (err) { handleError(err, res); }
}

export async function handleCompleteWorldEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { success = true } = req.body as { success?: boolean };
    const event = await worldEventService.completeEvent(req.params["id"] as string, userId, success);
    res.json({ ok: true, data: event });
  } catch (err) { handleError(err, res); }
}

export async function handleWorldEventHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await worldEventService.getHistory(userId) });
  } catch (err) { handleError(err, res); }
}

// ─── Weather endpoints ────────────────────────────────────────────────────────

export async function handleGetWeather(req: Request, res: Response): Promise<void> {
  try {
    const region = req.query["region"] as string | undefined;
    res.json({ ok: true, data: await weatherService.getCurrentWeather(region) });
  } catch (err) { handleError(err, res); }
}

export async function handleListWeather(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await weatherService.listWeather() }); }
  catch (err) { handleError(err, res); }
}

export async function handleSetWeather(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { region, weather, intensity, durationSec } = req.body as { region: string; weather: string; intensity?: number; durationSec?: number };
    if (!region || !weather) { res.status(400).json({ ok: false, error: "region và weather là bắt buộc" }); return; }
    const w = await weatherService.setWeather(userId, region, weather, intensity, durationSec);
    res.json({ ok: true, data: w });
  } catch (err) { handleError(err, res); }
}
