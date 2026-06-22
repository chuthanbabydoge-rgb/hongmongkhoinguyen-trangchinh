// ─────────────────────────────────────────────────────────────────────────────
// Notifications service
// Swap the return values with DB queries when integrating a database.
// Example: return await db.query.notifications.findMany({ where: eq(notifs.userId, userId) });
// ─────────────────────────────────────────────────────────────────────────────

import {
  NOTIFICATIONS,
  type Notification,
  type NotificationType,
} from "../data/notificationsData";

export async function getNotifications(
  userId: string,
  type?: NotificationType,
  unreadOnly = false,
): Promise<Notification[]> {
  let items = NOTIFICATIONS.filter((n) => n.userId === userId);
  if (type) items = items.filter((n) => n.type === type);
  if (unreadOnly) items = items.filter((n) => !n.isRead);
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getUnreadCount(userId: string): Promise<number> {
  return NOTIFICATIONS.filter((n) => n.userId === userId && !n.isRead).length;
}
