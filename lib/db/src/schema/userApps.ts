import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const userAppsTable = pgTable("user_apps", {
  id:            text("id").primaryKey(),
  userId:        text("user_id").notNull(),
  applicationId: text("application_id").notNull(),
  installedAt:   timestamp("installed_at", { mode: "string" }).defaultNow(),
  lastOpenedAt:  timestamp("last_opened_at", { mode: "string" }),
}, (t) => ({
  uniq: unique().on(t.userId, t.applicationId),
}));

export type UserAppRow = typeof userAppsTable.$inferSelect;
