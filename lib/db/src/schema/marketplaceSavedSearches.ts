import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const marketplaceSavedSearchesTable = pgTable("marketplace_saved_searches", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull(),
  name:      text("name").notNull(),
  query:     text("query"),
  category:  text("category"),
  rarity:    text("rarity"),
  currency:  text("currency"),
  minPrice:  integer("min_price"),
  maxPrice:  integer("max_price"),
  matchIds:  jsonb("match_ids").notNull().default([]),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplaceSavedSearchRow = typeof marketplaceSavedSearchesTable.$inferSelect;
