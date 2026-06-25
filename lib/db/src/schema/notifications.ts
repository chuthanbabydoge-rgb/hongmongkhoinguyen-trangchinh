import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const notificationTypeEnum = pgEnum("notification_type", [
  "reward",
  "transaction",
  "system",
  "social",
  "marketplace",
]);

export const notificationsTable = pgTable("notifications", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull(),
  type:      notificationTypeEnum("type").notNull(),
  title:     text("title").notNull(),
  message:   text("message").notNull(),
  isRead:    boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
