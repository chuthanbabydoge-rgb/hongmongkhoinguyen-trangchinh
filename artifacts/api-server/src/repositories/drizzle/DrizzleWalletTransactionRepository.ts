import { eq, and, desc } from "drizzle-orm";
import { db, walletTransactionsTable } from "@workspace/db";
import type { IWalletTransactionRepository } from "../walletTransactionRepository";
import type { Transaction } from "../../data/walletData";

function rowToTx(row: typeof walletTransactionsTable.$inferSelect): Transaction {
  return {
    id:          row.id,
    walletType:  row.walletType as Transaction["walletType"],
    amount:      row.amount,
    direction:   row.direction as Transaction["direction"],
    description: row.description,
    status:      row.status as Transaction["status"],
    createdAt:   typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
    reference:   row.reference ?? undefined,
  };
}

export class DrizzleWalletTransactionRepository implements IWalletTransactionRepository {
  async getByUserId(userId: string, limit = 50, walletType?: string): Promise<Transaction[]> {
    const conditions = walletType
      ? and(
          eq(walletTransactionsTable.userId, userId),
          eq(walletTransactionsTable.walletType, walletType),
        )
      : eq(walletTransactionsTable.userId, userId);

    const rows = await db
      .select()
      .from(walletTransactionsTable)
      .where(conditions)
      .orderBy(desc(walletTransactionsTable.createdAt))
      .limit(limit);

    return rows.map(rowToTx);
  }

  async create(tx: Transaction): Promise<Transaction> {
    const [inserted] = await db
      .insert(walletTransactionsTable)
      .values({
        id:          tx.id,
        userId:      "user-001",
        walletType:  tx.walletType,
        amount:      tx.amount,
        direction:   tx.direction,
        description: tx.description,
        status:      tx.status,
        reference:   tx.reference ?? null,
      })
      .returning();
    return rowToTx(inserted!);
  }
}
