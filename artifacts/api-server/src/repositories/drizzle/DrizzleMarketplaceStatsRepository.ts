import { eq, sql } from "drizzle-orm";
import { db, marketplaceListingsTable, marketplaceAuctionsTable, marketplaceTransactionsTable } from "@workspace/db";
import type { IMarketplaceStatsRepository, MarketplaceStats } from "../marketplaceRepository";

export class DrizzleMarketplaceStatsRepository implements IMarketplaceStatsRepository {
  async getStats(): Promise<MarketplaceStats> {
    const [listingStats] = await db
      .select({
        total:   sql<number>`count(*)::int`,
        active:  sql<number>`count(*) filter (where status = 'active')::int`,
        sold:    sql<number>`count(*) filter (where status = 'sold')::int`,
      })
      .from(marketplaceListingsTable);

    const [auctionStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        live:  sql<number>`count(*) filter (where status = 'live')::int`,
      })
      .from(marketplaceAuctionsTable);

    const [txStats] = await db
      .select({
        total:  sql<number>`count(*)::int`,
        volume: sql<number>`coalesce(sum(price), 0)::int`,
      })
      .from(marketplaceTransactionsTable);

    return {
      totalListings:     listingStats?.total     ?? 0,
      activeListings:    listingStats?.active    ?? 0,
      soldListings:      listingStats?.sold      ?? 0,
      totalAuctions:     auctionStats?.total     ?? 0,
      liveAuctions:      auctionStats?.live      ?? 0,
      totalTransactions: txStats?.total          ?? 0,
      marketVolume:      txStats?.volume         ?? 0,
    };
  }
}
