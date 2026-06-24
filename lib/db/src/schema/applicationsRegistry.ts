import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const applicationsRegistryTable = pgTable("applications_registry", {
  id:          text("id").primaryKey(),
  slug:        text("slug").unique().notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  iconUrl:     text("icon_url"),
  bannerUrl:   text("banner_url"),
  category:    text("category").notNull(),
  launchUrl:   text("launch_url").notNull(),
  ownerApp:    text("owner_app"),
  status:      text("status").notNull().default("ACTIVE"),
  featured:    boolean("featured").notNull().default(false),
  createdAt:   timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt:   timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export type ApplicationRegistryRow = typeof applicationsRegistryTable.$inferSelect;
