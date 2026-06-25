import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const marketplaceBidsTable = pgTable("marketplace_bids", {
  id:        text("id").primaryKey(),
  auctionId: text("auction_id").notNull(),
  bidderId:  text("bidder_id").notNull(),
  amount:    integer("amount").notNull(),
  currency:  text("currency").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplaceBidRow = typeof marketplaceBidsTable.$inferSelect;
