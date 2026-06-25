import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const marketplaceTransactionsTable = pgTable("marketplace_transactions", {
  id:        text("id").primaryKey(),
  listingId: text("listing_id").notNull(),
  buyerId:   text("buyer_id").notNull(),
  sellerId:  text("seller_id").notNull(),
  itemName:  text("item_name").notNull(),
  price:     integer("price").notNull(),
  currency:  text("currency").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplaceTransactionRow = typeof marketplaceTransactionsTable.$inferSelect;
