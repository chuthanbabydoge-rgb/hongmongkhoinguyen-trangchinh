import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const notificationSyncStateTable = pgTable("notification_sync_state", {
  id:                 text("id").primaryKey(),
  userId:             text("user_id").notNull().unique(),
  lastSyncAt:         timestamp("last_sync_at", { mode: "string" }),
  lastNotificationId: text("last_notification_id"),
  unreadCount:        integer("unread_count").default(0).notNull(),
  createdAt:          timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt:          timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export type NotificationSyncStateRow = typeof notificationSyncStateTable.$inferSelect;
