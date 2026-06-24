import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const ecosystemAppsTable = pgTable("ecosystem_apps", {
  id:          text("id").primaryKey(),
  slug:        text("slug").unique().notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  iconUrl:     text("icon_url"),
  baseUrl:     text("base_url").notNull(),
  category:    text("category").notNull(),
  status:      text("status").notNull().default("ACTIVE"),
  version:     text("version").notNull(),
  createdAt:   timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt:   timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export type EcosystemAppRow = typeof ecosystemAppsTable.$inferSelect;
