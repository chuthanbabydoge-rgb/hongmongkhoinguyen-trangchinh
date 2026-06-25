import { eq, and, desc } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import type { INotificationsRepository, Notification, NotificationType } from "../notificationsRepository";

function rowToNotif(row: typeof notificationsTable.$inferSelect): Notification {
  return {
    id:        row.id,
    userId:    row.userId,
    type:      row.type as NotificationType,
    title:     row.title,
    message:   row.message,
    isRead:    row.isRead,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

export class DrizzleNotificationsRepository implements INotificationsRepository {
  async getByUserId(userId: string, type?: NotificationType, unreadOnly = false): Promise<Notification[]> {
    const conditions = [eq(notificationsTable.userId, userId)];
    if (type) conditions.push(eq(notificationsTable.type, type));
    if (unreadOnly) conditions.push(eq(notificationsTable.isRead, false));

    const rows = await db
      .select()
      .from(notificationsTable)
      .where(and(...conditions))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(100);

    return rows.map(rowToNotif);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const rows = await db
      .select()
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));
    return rows.length;
  }

  async create(n: Notification): Promise<Notification> {
    const [inserted] = await db
      .insert(notificationsTable)
      .values({
        id:      n.id,
        userId:  n.userId,
        type:    n.type,
        title:   n.title,
        message: n.message,
        isRead:  n.isRead,
      })
      .returning();
    return rowToNotif(inserted!);
  }

  async markRead(id: string): Promise<void> {
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id));
  }

  async markAllRead(userId: string): Promise<void> {
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, userId));
  }
}
