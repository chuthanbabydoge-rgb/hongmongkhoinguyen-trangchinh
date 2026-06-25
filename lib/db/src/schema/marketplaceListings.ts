import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const marketplaceListingsTable = pgTable("marketplace_listings", {
  id:        text("id").primaryKey(),
  sellerId:  text("seller_id").notNull(),
  itemId:    text("item_id").notNull(),
  itemName:  text("item_name").notNull(),
  category:  text("category").notNull(),
  rarity:    text("rarity").notNull(),
  price:     integer("price").notNull(),
  currency:  text("currency").notNull(),
  status:    text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { mode: "string" }),
});

export type MarketplaceListingRow = typeof marketplaceListingsTable.$inferSelect;
