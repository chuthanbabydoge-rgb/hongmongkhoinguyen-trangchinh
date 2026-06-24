import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletReferencesTable = pgTable("wallet_references", {
  userId:       text("user_id").primaryKey(),
  walletId:     text("wallet_id").notNull(),
  credits:      integer("credits").notNull().default(0),
  coins:        integer("coins").notNull().default(0),
  tokens:       integer("tokens").notNull().default(0),
  rewardPoints: integer("reward_points").notNull().default(0),
  lastSyncedAt: timestamp("last_synced_at", { mode: "string" }).notNull().defaultNow(),
});

export const insertWalletReferenceSchema = createInsertSchema(walletReferencesTable);
export type InsertWalletReference = z.infer<typeof insertWalletReferenceSchema>;
export type WalletReferenceRow = typeof walletReferencesTable.$inferSelect;
