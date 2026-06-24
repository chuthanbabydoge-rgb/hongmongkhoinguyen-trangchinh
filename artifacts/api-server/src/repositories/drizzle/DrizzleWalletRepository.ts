import { eq } from "drizzle-orm";
import { db, walletReferencesTable } from "@workspace/db";
import type { IWalletRepository } from "../walletRepository";
import type { WalletReference, WalletCurrency } from "../../models/walletReference";

function rowToRef(row: typeof walletReferencesTable.$inferSelect): WalletReference {
  return {
    userId:      row.userId,
    walletId:    row.walletId,
    currency: {
      credits:      row.credits,
      coins:        row.coins,
      tokens:       row.tokens,
      rewardPoints: row.rewardPoints,
    },
    lastSyncedAt: row.lastSyncedAt ?? new Date().toISOString(),
  };
}

export class DrizzleWalletRepository implements IWalletRepository {
  async getByUserId(userId: string): Promise<WalletReference | null> {
    const rows = await db
      .select()
      .from(walletReferencesTable)
      .where(eq(walletReferencesTable.userId, userId))
      .limit(1);
    return rows[0] ? rowToRef(rows[0]) : null;
  }

  async create(ref: WalletReference): Promise<WalletReference> {
    const [inserted] = await db
      .insert(walletReferencesTable)
      .values({
        userId:      ref.userId,
        walletId:    ref.walletId,
        credits:     ref.currency.credits,
        coins:       ref.currency.coins,
        tokens:      ref.currency.tokens,
        rewardPoints: ref.currency.rewardPoints,
      })
      .onConflictDoUpdate({
        target: walletReferencesTable.userId,
        set: {
          credits:      ref.currency.credits,
          coins:        ref.currency.coins,
          tokens:       ref.currency.tokens,
          rewardPoints: ref.currency.rewardPoints,
          lastSyncedAt: new Date().toISOString(),
        },
      })
      .returning();
    return rowToRef(inserted!);
  }

  async update(ref: WalletReference): Promise<WalletReference | null> {
    const [updated] = await db
      .update(walletReferencesTable)
      .set({
        walletId:     ref.walletId,
        credits:      ref.currency.credits,
        coins:        ref.currency.coins,
        tokens:       ref.currency.tokens,
        rewardPoints: ref.currency.rewardPoints,
        lastSyncedAt: new Date().toISOString(),
      })
      .where(eq(walletReferencesTable.userId, ref.userId))
      .returning();
    return updated ? rowToRef(updated) : null;
  }

  async syncBalance(userId: string, currency: WalletCurrency): Promise<WalletReference | null> {
    const [updated] = await db
      .update(walletReferencesTable)
      .set({
        credits:      currency.credits,
        coins:        currency.coins,
        tokens:       currency.tokens,
        rewardPoints: currency.rewardPoints,
        lastSyncedAt: new Date().toISOString(),
      })
      .where(eq(walletReferencesTable.userId, userId))
      .returning();
    return updated ? rowToRef(updated) : null;
  }

  async delete(userId: string): Promise<boolean> {
    const result = await db
      .delete(walletReferencesTable)
      .where(eq(walletReferencesTable.userId, userId))
      .returning();
    return result.length > 0;
  }
}
