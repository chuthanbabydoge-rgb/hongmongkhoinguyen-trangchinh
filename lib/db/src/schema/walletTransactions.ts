import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id:          text("id").primaryKey(),
  userId:      text("user_id").notNull(),
  walletType:  text("wallet_type").notNull(),
  amount:      integer("amount").notNull(),
  direction:   text("direction").notNull(),
  description: text("description").notNull(),
  status:      text("status").notNull().default("completed"),
  createdAt:   timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  reference:   text("reference"),
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactionsTable);
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransactionRow = typeof walletTransactionsTable.$inferSelect;
