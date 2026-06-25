import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const marketplaceAuctionsTable = pgTable("marketplace_auctions", {
  id:            text("id").primaryKey(),
  sellerId:      text("seller_id").notNull(),
  itemId:        text("item_id").notNull(),
  itemName:      text("item_name").notNull(),
  category:      text("category").notNull(),
  rarity:        text("rarity").notNull(),
  startingPrice: integer("starting_price").notNull(),
  currentPrice:  integer("current_price").notNull(),
  currency:      text("currency").notNull(),
  status:        text("status").notNull().default("live"),
  bidCount:      integer("bid_count").notNull().default(0),
  startsAt:      timestamp("starts_at", { mode: "string" }).notNull(),
  endsAt:        timestamp("ends_at", { mode: "string" }).notNull(),
  createdAt:     timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplaceAuctionRow = typeof marketplaceAuctionsTable.$inferSelect;
