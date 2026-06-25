import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const inventoryItemsTable = pgTable("inventory_items", {
  id:         text("id").primaryKey(),
  userId:     text("user_id").notNull(),
  category:   text("category").notNull(),
  name:       text("name").notNull(),
  rarity:     text("rarity").notNull(),
  status:     text("status").notNull().default("active"),
  acquiredAt: timestamp("acquired_at", { mode: "string" }).notNull().defaultNow(),
});

export type InventoryItemRow = typeof inventoryItemsTable.$inferSelect;
