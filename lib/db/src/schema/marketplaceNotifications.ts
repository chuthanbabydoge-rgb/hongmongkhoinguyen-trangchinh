import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const marketplaceNotificationsTable = pgTable("marketplace_notifications", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull(),
  type:      text("type").notNull(),
  title:     text("title").notNull(),
  message:   text("message").notNull(),
  isRead:    boolean("is_read").notNull().default(false),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplaceNotificationRow = typeof marketplaceNotificationsTable.$inferSelect;
