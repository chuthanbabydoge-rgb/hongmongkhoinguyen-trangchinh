import { eq } from "drizzle-orm";
import { db, notificationSyncStateTable } from "@workspace/db";
import type { INotificationSyncRepository } from "../notificationSyncRepository";
import type { NotificationSyncState } from "../../models/notificationSync";

function rowToState(row: typeof notificationSyncStateTable.$inferSelect): NotificationSyncState {
  return {
    id:                 row.id,
    userId:             row.userId,
    lastSyncAt:         row.lastSyncAt ?? null,
    lastNotificationId: row.lastNotificationId ?? null,
    unreadCount:        row.unreadCount,
    createdAt:          typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt!).toISOString(),
    updatedAt:          typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt!).toISOString(),
  };
}

export class DrizzleNotificationSyncRepository implements INotificationSyncRepository {
  async findByUserId(userId: string): Promise<NotificationSyncState | null> {
    const rows = await db.select().from(notificationSyncStateTable).where(eq(notificationSyncStateTable.userId, userId)).limit(1);
    return rows[0] ? rowToState(rows[0]) : null;
  }

  async save(state: NotificationSyncState): Promise<NotificationSyncState> {
    const now = new Date().toISOString();
    const [result] = await db
      .insert(notificationSyncStateTable)
      .values({
        id:                 state.id,
        userId:             state.userId,
        lastSyncAt:         state.lastSyncAt ?? null,
        lastNotificationId: state.lastNotificationId ?? null,
        unreadCount:        state.unreadCount,
        createdAt:          state.createdAt ?? now,
        updatedAt:          now,
      })
      .onConflictDoUpdate({
        target: notificationSyncStateTable.userId,
        set: {
          lastSyncAt:         state.lastSyncAt ?? null,
          lastNotificationId: state.lastNotificationId ?? null,
          unreadCount:        state.unreadCount,
          updatedAt:          now,
        },
      })
      .returning();
    return rowToState(result!);
  }

  async update(state: NotificationSyncState): Promise<NotificationSyncState | null> {
    const [updated] = await db
      .update(notificationSyncStateTable)
      .set({
        lastSyncAt:         state.lastSyncAt ?? null,
        lastNotificationId: state.lastNotificationId ?? null,
        unreadCount:        state.unreadCount,
        updatedAt:          new Date().toISOString(),
      })
      .where(eq(notificationSyncStateTable.userId, state.userId))
      .returning();
    return updated ? rowToState(updated) : null;
  }

  async delete(userId: string): Promise<boolean> {
    const result = await db.delete(notificationSyncStateTable).where(eq(notificationSyncStateTable.userId, userId)).returning();
    return result.length > 0;
  }
}
