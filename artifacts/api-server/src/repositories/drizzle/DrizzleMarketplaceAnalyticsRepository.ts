import { sql, gte } from "drizzle-orm";
import { db, marketplaceTransactionsTable, marketplaceListingsTable, marketplaceAuctionsTable } from "@workspace/db";
import type { IMarketplaceAnalyticsRepository, MarketplaceOverviewStats, TopSeller, TopBuyer, TopItem, VolumeStats } from "../marketplaceStatsRepository";

export class DrizzleMarketplaceAnalyticsRepository implements IMarketplaceAnalyticsRepository {
  async getMarketplaceStats(): Promise<MarketplaceOverviewStats> {
    const [listing] = await db.select({ count: sql<number>`count(*)::int`, active: sql<number>`count(*) filter (where status='active')::int` }).from(marketplaceListingsTable);
    const [auction] = await db.select({ count: sql<number>`count(*)::int`, active: sql<number>`count(*) filter (where status='live')::int` }).from(marketplaceAuctionsTable);
    const [tx] = await db.select({ count: sql<number>`count(*)::int`, volume: sql<number>`coalesce(sum(price),0)::int`, revenue: sql<number>`coalesce(sum(price)*0.05,0)::int` }).from(marketplaceTransactionsTable);
    return {
      activeListings:         listing?.active ?? 0,
      activeAuctions:         auction?.active ?? 0,
      totalTransactions:      tx?.count       ?? 0,
      totalMarketplaceVolume: tx?.volume      ?? 0,
      totalRevenue:           tx?.revenue     ?? 0,
    };
  }

  async getTopSellers(limit: number): Promise<TopSeller[]> {
    const rows = await db
      .select({
        sellerId:        marketplaceTransactionsTable.sellerId,
        transactionCount: sql<number>`count(*)::int`,
        volume:          sql<number>`coalesce(sum(price),0)::int`,
        revenue:         sql<number>`coalesce(sum(price)*0.05,0)::int`,
      })
      .from(marketplaceTransactionsTable)
      .groupBy(marketplaceTransactionsTable.sellerId)
      .orderBy(sql`count(*) desc`)
      .limit(limit);
    return rows.map(r => ({ sellerId: r.sellerId, transactionCount: r.transactionCount, volume: r.volume, revenue: r.revenue }));
  }

  async getTopBuyers(limit: number): Promise<TopBuyer[]> {
    const rows = await db
      .select({
        buyerId:         marketplaceTransactionsTable.buyerId,
        transactionCount: sql<number>`count(*)::int`,
        volume:          sql<number>`coalesce(sum(price),0)::int`,
      })
      .from(marketplaceTransactionsTable)
      .groupBy(marketplaceTransactionsTable.buyerId)
      .orderBy(sql`count(*) desc`)
      .limit(limit);
    return rows.map(r => ({ buyerId: r.buyerId, transactionCount: r.transactionCount, volume: r.volume }));
  }

  async getTopItems(limit: number): Promise<TopItem[]> {
    const rows = await db
      .select({
        itemName: marketplaceTransactionsTable.itemName,
        sales:    sql<number>`count(*)::int`,
        volume:   sql<number>`coalesce(sum(price),0)::int`,
      })
      .from(marketplaceTransactionsTable)
      .groupBy(marketplaceTransactionsTable.itemName)
      .orderBy(sql`count(*) desc`)
      .limit(limit);
    return rows.map(r => ({ itemName: r.itemName, sales: r.sales, volume: r.volume }));
  }

  async getVolumeStats(): Promise<VolumeStats> {
    const now   = new Date();
    const d1    = new Date(now.getTime() - 86400_000).toISOString();
    const d7    = new Date(now.getTime() - 7 * 86400_000).toISOString();
    const d30   = new Date(now.getTime() - 30 * 86400_000).toISOString();

    const [s1]  = await db.select({ v: sql<number>`coalesce(sum(price),0)::int` }).from(marketplaceTransactionsTable).where(gte(marketplaceTransactionsTable.createdAt, d1));
    const [s7]  = await db.select({ v: sql<number>`coalesce(sum(price),0)::int` }).from(marketplaceTransactionsTable).where(gte(marketplaceTransactionsTable.createdAt, d7));
    const [s30] = await db.select({ v: sql<number>`coalesce(sum(price),0)::int` }).from(marketplaceTransactionsTable).where(gte(marketplaceTransactionsTable.createdAt, d30));
    const [all] = await db.select({ v: sql<number>`coalesce(sum(price),0)::int` }).from(marketplaceTransactionsTable);

    return { last24h: s1?.v ?? 0, last7d: s7?.v ?? 0, last30d: s30?.v ?? 0, allTime: all?.v ?? 0 };
  }
}
