import { type Request, type Response } from "express";
import { accountBridgeService, achievementService } from "../container";

async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return profile.userId || profile.id || null;
  } catch {
    return null;
  }
}

export async function handleGetAllAchievements(req: Request, res: Response): Promise<void> {
  try {
    const achievements = await achievementService.getAllAchievements();
    res.json({ ok: true, data: achievements, total: achievements.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}

export async function handleGetMyAchievements(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Authorization header bắt buộc." });
      return;
    }
    const userAchievements = await achievementService.getUserAchievements(userId);
    res.json({ ok: true, data: userAchievements, total: userAchievements.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}
