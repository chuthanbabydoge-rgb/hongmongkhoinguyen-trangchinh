import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const appLaunchesTable = pgTable("app_launches", {
  id:           text("id").primaryKey(),
  userId:       text("user_id").notNull(),
  appSlug:      text("app_slug").notNull(),
  launchedAt:   timestamp("launched_at", { mode: "string" }).notNull(),
  launchSource: text("launch_source").notNull(),
  sessionId:    text("session_id"),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at", { mode: "string" }).defaultNow(),
});

export type AppLaunchRow = typeof appLaunchesTable.$inferSelect;
