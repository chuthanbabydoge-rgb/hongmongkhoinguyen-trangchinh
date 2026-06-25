import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const marketplacePaymentsTable = pgTable("marketplace_payments", {
  id:          text("id").primaryKey(),
  buyerId:     text("buyer_id").notNull(),
  sellerId:    text("seller_id").notNull(),
  totalAmount: integer("total_amount").notNull(),
  feeAmount:   integer("fee_amount").notNull(),
  netAmount:   integer("net_amount").notNull(),
  currency:    text("currency").notNull(),
  sourceType:  text("source_type").notNull(),
  sourceId:    text("source_id").notNull(),
  createdAt:   timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplacePaymentRow = typeof marketplacePaymentsTable.$inferSelect;
