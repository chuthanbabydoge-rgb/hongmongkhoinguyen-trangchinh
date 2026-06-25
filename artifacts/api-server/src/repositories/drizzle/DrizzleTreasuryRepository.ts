import { eq, sql } from "drizzle-orm";
import { db, marketplaceTreasuryTable, marketplacePaymentsTable } from "@workspace/db";
import type { ITreasuryRepository, TreasuryWallet, TreasuryStats } from "../marketplaceTreasuryRepository";

export class DrizzleTreasuryRepository implements ITreasuryRepository {
  async getTreasuryWallet(): Promise<TreasuryWallet> {
    const rows = await db.select().from(marketplaceTreasuryTable).where(eq(marketplaceTreasuryTable.id, "singleton")).limit(1);
    if (rows[0]) {
      return { userId: "treasury", credits: rows[0].credits, coins: rows[0].coins, tokens: rows[0].tokens };
    }
    await db.insert(marketplaceTreasuryTable).values({ id: "singleton", credits: 0, coins: 0, tokens: 0 }).onConflictDoNothing();
    return { userId: "treasury", credits: 0, coins: 0, tokens: 0 };
  }

  async getTreasuryStats(): Promise<TreasuryStats> {
    const [stats] = await db
      .select({
        totalTransactions: sql<number>`count(*)::int`,
        totalFeesCredits:  sql<number>`coalesce(sum(fee_amount) filter (where currency = 'credits'), 0)::int`,
        totalFeesCoins:    sql<number>`coalesce(sum(fee_amount) filter (where currency = 'coins'), 0)::int`,
        totalFeesTokens:   sql<number>`coalesce(sum(fee_amount) filter (where currency = 'tokens'), 0)::int`,
        totalVolumeCredits: sql<number>`coalesce(sum(total_amount) filter (where currency = 'credits'), 0)::int`,
        totalVolumeCoins:   sql<number>`coalesce(sum(total_amount) filter (where currency = 'coins'), 0)::int`,
        totalVolumeTokens:  sql<number>`coalesce(sum(total_amount) filter (where currency = 'tokens'), 0)::int`,
      })
      .from(marketplacePaymentsTable);

    return {
      totalTransactions:  stats?.totalTransactions  ?? 0,
      totalFeesCredits:   stats?.totalFeesCredits   ?? 0,
      totalFeesCoins:     stats?.totalFeesCoins     ?? 0,
      totalFeesTokens:    stats?.totalFeesTokens    ?? 0,
      totalVolumeCredits: stats?.totalVolumeCredits ?? 0,
      totalVolumeCoins:   stats?.totalVolumeCoins   ?? 0,
      totalVolumeTokens:  stats?.totalVolumeTokens  ?? 0,
    };
  }
}
