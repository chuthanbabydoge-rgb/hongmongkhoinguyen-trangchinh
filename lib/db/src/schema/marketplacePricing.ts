import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const marketplacePricingTable = pgTable("marketplace_pricing", {
  id:       text("id").primaryKey(),
  itemId:   text("item_id").notNull(),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  rarity:   text("rarity").notNull(),
  price:    integer("price").notNull(),
  currency: text("currency").notNull(),
  soldAt:   timestamp("sold_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplacePricingRow = typeof marketplacePricingTable.$inferSelect;
