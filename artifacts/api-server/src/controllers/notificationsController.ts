import { type Request, type Response } from "express";
import { accountBridgeService, notificationsService } from "../container";
import type { NotificationType } from "../repositories/notificationsRepository";

const VALID_TYPES: NotificationType[] = [
  "reward", "transaction", "system", "social", "marketplace",
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

// GET /api/notifications?type=reward&unread=true
export async function handleGetNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.json({ ok: true, data: [], total: 0, unreadCount: 0 });
      return;
    }

    const rawType   = req.query["type"] as string | undefined;
    const unreadOnly = req.query["unread"] === "true";
    const type = rawType && VALID_TYPES.includes(rawType as NotificationType)
      ? (rawType as NotificationType)
      : undefined;

    const notifications = await notificationsService.getNotifications(userId, type, unreadOnly);
    const unreadCount   = await notificationsService.getUnreadCount(userId);

    res.json({ ok: true, data: notifications, total: notifications.length, unreadCount });
  } catch {
    res.status(500).json({ ok: false, error: "Không thể tải thông báo." });
  }
}

// POST /api/notifications
export async function handleCreateNotification(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Authorization header bắt buộc." });
      return;
    }

    const { type, title, message } = req.body as {
      type?:    string;
      title?:   string;
      message?: string;
    };

    if (!type || !VALID_TYPES.includes(type as NotificationType)) {
      res.status(400).json({ ok: false, error: `type phải là: ${VALID_TYPES.join(", ")}.` });
      return;
    }
    if (!title?.trim()) {
      res.status(400).json({ ok: false, error: "title là bắt buộc." });
      return;
    }
    if (!message?.trim()) {
      res.status(400).json({ ok: false, error: "message là bắt buộc." });
      return;
    }

    const notification = await notificationsService.createNotification(
      userId,
      type as NotificationType,
      title.trim(),
      message.trim(),
    );

    res.status(201).json({ ok: true, data: notification });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}

// PATCH /api/notifications/:id/read
export async function handleMarkRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await notificationsService.markRead(id);
    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}

// PATCH /api/notifications/read-all
export async function handleMarkAllRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Authorization header bắt buộc." });
      return;
    }
    await notificationsService.markAllRead(userId);
    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}

// DELETE /api/notifications/:id
export async function handleDeleteNotification(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await notificationsService.deleteNotification(id);
    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}
