import { type Request, type Response } from "express";
import { accountBridgeService, activitiesService } from "../container";
import type { ActivityType } from "../repositories/activitiesRepository";

const VALID_TYPES: ActivityType[] = ["marketplace", "wallet", "inventory", "launcher", "system", "social"];

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

export async function handleGetActivities(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.json({ ok: true, data: [], total: 0 });
      return;
    }

    const rawType = req.query["type"] as string | undefined;
    const limit   = req.query["limit"] ? Math.min(Number(req.query["limit"]), 200) : 50;
    const type    = rawType && VALID_TYPES.includes(rawType as ActivityType)
      ? (rawType as ActivityType)
      : undefined;

    const activities = await activitiesService.getActivities(userId, type, limit);
    res.json({ ok: true, data: activities, total: activities.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải hoạt động." });
  }
}

export async function handleCreateActivity(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Authorization header bắt buộc." });
      return;
    }

    const { type, title, description, metadata, sourceApp } = req.body as {
      type?:        string;
      title?:       string;
      description?: string;
      metadata?:    unknown;
      sourceApp?:   string;
    };

    if (!type || !VALID_TYPES.includes(type as ActivityType)) {
      res.status(400).json({ ok: false, error: `type phải là: ${VALID_TYPES.join(", ")}.` });
      return;
    }
    if (!title?.trim()) {
      res.status(400).json({ ok: false, error: "title là bắt buộc." });
      return;
    }

    const activity = await activitiesService.createActivity({
      userId,
      type:        type as ActivityType,
      title:       title.trim(),
      description: (description ?? "").trim(),
      metadata,
      sourceApp,
    });

    res.status(201).json({ ok: true, data: activity });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}
