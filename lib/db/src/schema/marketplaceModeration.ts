import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const marketplaceModerationActionsTable = pgTable("marketplace_moderation_actions", {
  id:         text("id").primaryKey(),
  adminId:    text("admin_id").notNull(),
  action:     text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId:   text("target_id").notNull(),
  reason:     text("reason").notNull(),
  createdAt:  timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const marketplaceSellerStatusTable = pgTable("marketplace_seller_status", {
  userId:    text("user_id").primaryKey(),
  status:    text("status").notNull().default("active"),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export type MarketplaceModerationActionRow = typeof marketplaceModerationActionsTable.$inferSelect;
export type MarketplaceSellerStatusRow = typeof marketplaceSellerStatusTable.$inferSelect;
