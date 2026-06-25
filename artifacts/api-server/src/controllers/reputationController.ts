import { type Request, type Response } from "express";
import { accountBridgeService, userReputationService, achievementService } from "../container";
import type { ReputationEventType } from "../repositories/userReputationRepository";

const VALID_EVENTS: ReputationEventType[] = [
  "LOGIN",
  "MARKETPLACE_LISTING",
  "MARKETPLACE_SALE",
  "MARKETPLACE_PURCHASE",
  "WALLET_TRANSFER",
  "INVENTORY_ACQUIRED",
];

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

export async function handleGetMyReputation(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Authorization header bắt buộc." });
      return;
    }
    const reputation = await userReputationService.getReputation(userId);
    res.json({ ok: true, data: reputation });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}

export async function handleGetLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query["limit"] ? Math.min(Number(req.query["limit"]), 100) : 20;
    const leaderboard = await userReputationService.getLeaderboard(limit);
    res.json({ ok: true, data: leaderboard, total: leaderboard.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}

export async function handleGetHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Authorization header bắt buộc." });
      return;
    }
    const limit   = req.query["limit"] ? Math.min(Number(req.query["limit"]), 200) : 50;
    const history = await userReputationService.getHistory(userId, limit);
    res.json({ ok: true, data: history, total: history.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}

export async function handleAddEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Authorization header bắt buộc." });
      return;
    }

    const { eventType, metadata } = req.body as {
      eventType?: string;
      metadata?:  unknown;
    };

    if (!eventType || !VALID_EVENTS.includes(eventType as ReputationEventType)) {
      res.status(400).json({
        ok: false,
        error: `eventType phải là một trong: ${VALID_EVENTS.join(", ")}.`,
      });
      return;
    }

    const type = eventType as ReputationEventType;
    const { event, reputation } = await userReputationService.addEvent(userId, type, metadata);

    const unlocked = await achievementService.checkAndUnlock(userId, type, {
      totalPoints: reputation.totalPoints,
    });

    res.status(201).json({
      ok: true,
      data: { event, reputation, unlockedAchievements: unlocked.map(u => u.achievement) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}
