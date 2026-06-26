import { pgTable, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const activityTypeEnum = pgEnum("activity_type", [
  "marketplace",
  "wallet",
  "inventory",
  "launcher",
  "system",
  "social",
  "quest",
  "mail",
  "chat",
]);

export const activitiesTable = pgTable("activities", {
  id:          text("id").primaryKey(),
  userId:      text("user_id").notNull(),
  type:        activityTypeEnum("type").notNull(),
  title:       text("title").notNull(),
  description: text("description").notNull().default(""),
  metadata:    jsonb("metadata"),
  sourceApp:   text("source_app").notNull().default("universe-hub"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
