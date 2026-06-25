import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const inventoryReferencesTable = pgTable("inventory_references", {
  userId:        text("user_id").primaryKey(),
  inventoryId:   text("inventory_id").notNull(),
  countPets:     integer("count_pets").notNull().default(0),
  countPlayers:  integer("count_players").notNull().default(0),
  countTickets:  integer("count_tickets").notNull().default(0),
  countDigital:  integer("count_digital").notNull().default(0),
  countItems:    integer("count_items").notNull().default(0),
  countTotal:    integer("count_total").notNull().default(0),
  lastSyncedAt:  timestamp("last_synced_at", { mode: "string" }).notNull().defaultNow(),
});

export type InventoryReferenceRow = typeof inventoryReferencesTable.$inferSelect;
