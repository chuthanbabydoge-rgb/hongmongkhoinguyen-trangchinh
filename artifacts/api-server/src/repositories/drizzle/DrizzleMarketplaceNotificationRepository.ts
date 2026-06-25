import { eq, desc, sql, count } from "drizzle-orm";
import { db, marketplaceNotificationsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import type { IMarketplaceNotificationRepository, MarketplaceNotification, CreateNotificationInput } from "../marketplaceNotificationRepository";

function rowToNotif(row: typeof marketplaceNotificationsTable.$inferSelect): MarketplaceNotification {
  return {
    id:        row.id,
    userId:    row.userId,
    type:      row.type as MarketplaceNotification["type"],
    title:     row.title,
    message:   row.message,
    isRead:    row.isRead,
    metadata:  (row.metadata as Record<string, unknown>) ?? undefined,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
  };
}

export class DrizzleMarketplaceNotificationRepository implements IMarketplaceNotificationRepository {
  async create(input: CreateNotificationInput): Promise<MarketplaceNotification> {
    const [inserted] = await db
      .insert(marketplaceNotificationsTable)
      .values({
        id:        randomUUID(),
        userId:    input.userId,
        type:      input.type,
        title:     input.title,
        message:   input.message,
        isRead:    false,
        metadata:  input.metadata ?? null,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return rowToNotif(inserted!);
  }

  async getByUserId(userId: string, limit = 20, offset = 0): Promise<{ data: MarketplaceNotification[]; total: number }> {
    const [totalRow] = await db
      .select({ count: count() })
      .from(marketplaceNotificationsTable)
      .where(eq(marketplaceNotificationsTable.userId, userId));

    const rows = await db
      .select()
      .from(marketplaceNotificationsTable)
      .where(eq(marketplaceNotificationsTable.userId, userId))
      .orderBy(desc(marketplaceNotificationsTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { data: rows.map(rowToNotif), total: totalRow?.count ?? 0 };
  }

  async getUnreadByUserId(userId: string): Promise<MarketplaceNotification[]> {
    const rows = await db
      .select()
      .from(marketplaceNotificationsTable)
      .where(eq(marketplaceNotificationsTable.userId, userId))
      .orderBy(desc(marketplaceNotificationsTable.createdAt));
    return rows.filter(r => !r.isRead).map(rowToNotif);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*) filter (where is_read = false)::int` })
      .from(marketplaceNotificationsTable)
      .where(eq(marketplaceNotificationsTable.userId, userId));
    return row?.count ?? 0;
  }

  async markAsRead(id: string): Promise<MarketplaceNotification | null> {
    const [updated] = await db
      .update(marketplaceNotificationsTable)
      .set({ isRead: true })
      .where(eq(marketplaceNotificationsTable.id, id))
      .returning();
    return updated ? rowToNotif(updated) : null;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await db
      .update(marketplaceNotificationsTable)
      .set({ isRead: true })
      .where(eq(marketplaceNotificationsTable.userId, userId))
      .returning();
    return result.length;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(marketplaceNotificationsTable).where(eq(marketplaceNotificationsTable.id, id)).returning();
    return result.length > 0;
  }
}
