// ─────────────────────────────────────────────────────────────────────────────
// NotificationsController — HUB-5
//
// Resolves the authenticated user from the Bearer token via accountBridgeService.
// Falls back to empty notifications when no token is present (unauthenticated
// access returns empty instead of 401 so the UI degrades gracefully).
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { getNotifications, getUnreadCount } from "../services/notificationsService";
import { accountBridgeService } from "../container";
import { type NotificationType } from "../data/notificationsData";

const VALID_TYPES: NotificationType[] = [
  "reward", "transaction", "system", "social", "marketplace",
];

export async function handleGetNotifications(req: Request, res: Response): Promise<void> {
  try {
    const auth = req.headers["authorization"] as string | undefined;

    // Resolve userId from real Account API token; return empty if unauthenticated
    let userId: string | null = null;
    if (auth) {
      try {
        const profile = await accountBridgeService.getProfileCached(auth);
        userId = profile.userId || profile.id || null;
      } catch {
        // Invalid or expired token — return empty notifications
      }
    }

    if (!userId) {
      res.json({ ok: true, data: [], total: 0, unreadCount: 0 });
      return;
    }

    const rawType = req.query["type"] as string | undefined;
    const unreadOnly = req.query["unread"] === "true";
    const type = rawType && VALID_TYPES.includes(rawType as NotificationType)
      ? (rawType as NotificationType)
      : undefined;

    const notifications = await getNotifications(userId, type, unreadOnly);
    const unreadCount   = await getUnreadCount(userId);

    res.json({
      ok: true,
      data: notifications,
      total: notifications.length,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải thông báo." });
  }
}
