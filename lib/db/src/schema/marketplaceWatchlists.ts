import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const marketplaceWatchlistsTable = pgTable("marketplace_watchlists", {
  id:                text("id").primaryKey(),
  userId:            text("user_id").notNull(),
  targetType:        text("target_type").notNull(),
  targetId:          text("target_id").notNull(),
  itemName:          text("item_name"),
  price:             integer("price"),
  rarity:            text("rarity"),
  status:            text("status"),
  watchPrice:        integer("watch_price"),
  lastSeenPrice:     integer("last_seen_price"),
  priceDropCount:    integer("price_drop_count").notNull().default(0),
  lastPriceChangeAt: timestamp("last_price_change_at", { mode: "string" }),
  createdAt:         timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplaceWatchlistRow = typeof marketplaceWatchlistsTable.$inferSelect;
