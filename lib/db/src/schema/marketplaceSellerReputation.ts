import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const marketplaceSellerReputationTable = pgTable("marketplace_seller_reputation", {
  userId:          text("user_id").primaryKey(),
  score:           integer("score").notNull().default(0),
  level:           text("level").notNull().default("new"),
  totalSales:      integer("total_sales").notNull().default(0),
  totalVolume:     integer("total_volume").notNull().default(0),
  positiveRatings: integer("positive_ratings").notNull().default(0),
  negativeRatings: integer("negative_ratings").notNull().default(0),
  createdAt:       timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt:       timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const marketplaceReputationRatingsTable = pgTable("marketplace_reputation_ratings", {
  id:            text("id").primaryKey(),
  buyerId:       text("buyer_id").notNull(),
  sellerId:      text("seller_id").notNull(),
  transactionId: text("transaction_id").notNull().unique(),
  rating:        integer("rating").notNull(),
  createdAt:     timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplaceSellerReputationRow = typeof marketplaceSellerReputationTable.$inferSelect;
export type MarketplaceReputationRatingRow = typeof marketplaceReputationRatingsTable.$inferSelect;
