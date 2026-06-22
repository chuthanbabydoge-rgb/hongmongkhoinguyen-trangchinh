import { type Request, type Response } from "express";
import { getNotifications, getUnreadCount } from "../services/notificationsService";
import { type NotificationType } from "../data/notificationsData";

const MOCK_USER_ID = "user-001";

const VALID_TYPES: NotificationType[] = [
  "reward", "transaction", "system", "social", "marketplace",
];

export async function handleGetNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? MOCK_USER_ID;
    const rawType = req.query["type"] as string | undefined;
    const unreadOnly = req.query["unread"] === "true";

    const type = rawType && VALID_TYPES.includes(rawType as NotificationType)
      ? (rawType as NotificationType)
      : undefined;

    const notifications = await getNotifications(userId, type, unreadOnly);
    const unreadCount = await getUnreadCount(userId);

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
