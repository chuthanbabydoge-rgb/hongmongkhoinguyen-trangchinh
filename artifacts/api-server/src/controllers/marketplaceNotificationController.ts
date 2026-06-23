// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceNotificationController
//
// Routes (registered in routes/marketplace.ts):
//   GET    /api/marketplace/notifications               — list (userId required)
//   GET    /api/marketplace/notifications/unread        — unread only
//   GET    /api/marketplace/notifications/count         — unread count
//   PATCH  /api/marketplace/notifications/read-all      — mark all read
//   PATCH  /api/marketplace/notifications/:id/read      — mark one read
//   DELETE /api/marketplace/notifications/:id           — delete
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { marketplaceNotificationService } from "../container";

function requireUserId(req: Request, res: Response): string | null {
  const userId = req.query["userId"] as string | undefined;
  if (!userId) {
    res.status(400).json({ ok: false, error: "userId là bắt buộc." });
    return null;
  }
  return userId;
}

// ─── GET /api/marketplace/notifications ───────────────────────────────────────

export async function handleGetNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const limit  = req.query["limit"]  ? Math.max(1, Number(req.query["limit"]))  : 50;
    const offset = req.query["offset"] ? Math.max(0, Number(req.query["offset"])) : 0;

    const result = await marketplaceNotificationService.getNotifications(userId, limit, offset);
    res.json({ ok: true, total: result.total, data: result.data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `notificationController.getNotifications: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải thông báo." });
  }
}

// ─── GET /api/marketplace/notifications/unread ────────────────────────────────

export async function handleGetUnread(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const data = await marketplaceNotificationService.getUnread(userId);
    res.json({ ok: true, total: data.length, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `notificationController.getUnread: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải thông báo chưa đọc." });
  }
}

// ─── GET /api/marketplace/notifications/count ─────────────────────────────────

export async function handleGetUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const unread = await marketplaceNotificationService.getUnreadCount(userId);
    res.json({ ok: true, unread });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `notificationController.getUnreadCount: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể đếm thông báo chưa đọc." });
  }
}

// ─── PATCH /api/marketplace/notifications/read-all ────────────────────────────

export async function handleMarkAllAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const updated = await marketplaceNotificationService.markAllAsRead(userId);
    res.json({ ok: true, updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `notificationController.markAllAsRead: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể đánh dấu tất cả đã đọc." });
  }
}

// ─── PATCH /api/marketplace/notifications/:id/read ────────────────────────────

export async function handleMarkAsRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const notif  = await marketplaceNotificationService.markAsRead(id);

    if (!notif) {
      res.status(404).json({ ok: false, error: `Thông báo ${id} không tìm thấy.` });
      return;
    }

    res.json({ ok: true, data: notif });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `notificationController.markAsRead: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể đánh dấu đã đọc." });
  }
}

// ─── DELETE /api/marketplace/notifications/:id ────────────────────────────────

export async function handleDeleteNotification(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const deleted = await marketplaceNotificationService.delete(id);

    if (!deleted) {
      res.status(404).json({ ok: false, error: `Thông báo ${id} không tìm thấy.` });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `notificationController.deleteNotification: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể xóa thông báo." });
  }
}
