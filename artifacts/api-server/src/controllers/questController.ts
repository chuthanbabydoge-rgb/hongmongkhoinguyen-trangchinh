import type { Request, Response } from "express";
import { questService, accountBridgeService } from "../container.js";
import {
  QuestNotFoundError,
  UserQuestNotFoundError,
  QuestAlreadyStartedError,
  QuestNotCompletedError,
  QuestAlreadyClaimedError,
} from "../services/questService.js";

async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers["authorization"];
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return profile?.id ?? null;
  } catch {
    return null;
  }
}

// GET /api/quests
export async function handleGetQuests(req: Request, res: Response): Promise<void> {
  try {
    const quests = await questService.getAvailableQuests();
    res.json({ ok: true, data: quests });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

// GET /api/quests/daily
export async function handleGetDailyQuests(req: Request, res: Response): Promise<void> {
  try {
    const quests = await questService.getDailyQuests();
    res.json({ ok: true, data: quests });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

// GET /api/quests/weekly
export async function handleGetWeeklyQuests(req: Request, res: Response): Promise<void> {
  try {
    const quests = await questService.getWeeklyQuests();
    res.json({ ok: true, data: quests });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

// GET /api/quests/me
export async function handleGetMyQuests(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await questService.getMyQuests(userId);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

// GET /api/quests/completed
export async function handleGetCompletedQuests(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await questService.getCompletedQuests(userId);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

// GET /api/quests/:id
export async function handleGetQuestById(req: Request, res: Response): Promise<void> {
  try {
    const quest = await questService.getQuestById(req.params["id"] as string);
    res.json({ ok: true, data: quest });
  } catch (err) {
    if (err instanceof QuestNotFoundError) {
      res.status(404).json({ ok: false, error: err.message });
    } else {
      res.status(500).json({ ok: false, error: String(err) });
    }
  }
}

// POST /api/quests/:id/start
export async function handleStartQuest(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const userQuest = await questService.startQuest(userId, req.params["id"] as string);
    res.status(201).json({ ok: true, data: userQuest });
  } catch (err) {
    if (err instanceof QuestNotFoundError) {
      res.status(404).json({ ok: false, error: err.message });
    } else if (err instanceof QuestAlreadyStartedError) {
      res.status(409).json({ ok: false, error: err.message });
    } else {
      res.status(400).json({ ok: false, error: String(err) });
    }
  }
}

// POST /api/quests/:id/claim
export async function handleClaimQuest(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const result = await questService.claimReward(userId, req.params["id"] as string);
    res.json({ ok: true, data: result });
  } catch (err) {
    if (err instanceof UserQuestNotFoundError) {
      res.status(404).json({ ok: false, error: err.message });
    } else if (err instanceof QuestAlreadyClaimedError) {
      res.status(409).json({ ok: false, error: err.message });
    } else if (err instanceof QuestNotCompletedError) {
      res.status(400).json({ ok: false, error: err.message });
    } else {
      res.status(400).json({ ok: false, error: String(err) });
    }
  }
}

// POST /api/quests/:id/cancel
export async function handleCancelQuest(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const userQuest = await questService.cancelQuest(userId, req.params["id"] as string);
    res.json({ ok: true, data: userQuest });
  } catch (err) {
    if (err instanceof UserQuestNotFoundError) {
      res.status(404).json({ ok: false, error: err.message });
    } else {
      res.status(400).json({ ok: false, error: String(err) });
    }
  }
}

// POST /api/quests/track (internal: track objective event)
export async function handleTrackEvent(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const { eventType, amount } = req.body as { eventType?: string; amount?: number };
  if (!eventType) { res.status(400).json({ ok: false, error: "eventType bắt buộc." }); return; }
  try {
    await questService.trackObjectiveEvent(userId, eventType as never, amount ?? 1);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
