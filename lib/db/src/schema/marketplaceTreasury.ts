import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const marketplaceTreasuryTable = pgTable("marketplace_treasury", {
  id:      text("id").primaryKey().default("singleton"),
  credits: integer("credits").notNull().default(0),
  coins:   integer("coins").notNull().default(0),
  tokens:  integer("tokens").notNull().default(0),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplaceTreasuryRow = typeof marketplaceTreasuryTable.$inferSelect;
