// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceAnalyticsRepository
//
// Comprehensive analytics backed by Supabase tables:
//   marketplace_listings        — active listing counts
//   marketplace_auctions        — active auction counts
//   marketplace_transactions    — item sales (always exists)
//   marketplace_wallet_transactions — payment history (graceful fallback)
//
// When marketplace_wallet_transactions doesn't exist yet (payment repo is still
// in-memory), all fee/volume/seller/buyer stats fall back to zeros gracefully.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type {
  IMarketplaceAnalyticsRepository,
  MarketplaceOverviewStats,
  TopSeller,
  TopBuyer,
  TopItem,
  VolumeStats,
} from "../marketplaceStatsRepository";

type Row = Record<string, unknown>;

export class SupabaseMarketplaceAnalyticsRepository implements IMarketplaceAnalyticsRepository {
  private get db() { return getSupabaseClient(); }

  async getMarketplaceStats(): Promise<MarketplaceOverviewStats> {
    const [
      { count: activeListings },
      { count: activeAuctions },
      txResult,
      walletResult,
    ] = await Promise.all([
      this.db.from("marketplace_listings").select("*", { count: "exact", head: true }).eq("status", "active"),
      this.db.from("marketplace_auctions").select("*", { count: "exact", head: true }).eq("status", "live"),
      this.db.from("marketplace_transactions").select("price"),
      this.db.from("marketplace_wallet_transactions").select("total_amount, fee_amount"),
    ]);

    const txRows     = (txResult.data     ?? []) as Row[];
    const walletRows = walletResult.error ? [] : (walletResult.data ?? []) as Row[];

    const totalTransactions      = txRows.length;
    const totalMarketplaceVolume = walletRows.length > 0
      ? walletRows.reduce((s, r) => s + Number(r["total_amount"] ?? 0), 0)
      : txRows.reduce((s, r) => s + Number(r["price"] ?? 0), 0);
    const totalRevenue           = walletRows.reduce((s, r) => s + Number(r["fee_amount"] ?? 0), 0);

    return {
      activeListings:         activeListings         ?? 0,
      activeAuctions:         activeAuctions         ?? 0,
      totalTransactions,
      totalMarketplaceVolume,
      totalRevenue,
    };
  }

  async getTopSellers(limit: number): Promise<TopSeller[]> {
    const { data, error } = await this.db
      .from("marketplace_wallet_transactions")
      .select("seller_id, total_amount, net_amount");

    if (error) return [];

    const rows  = (data ?? []) as Row[];
    const map   = new Map<string, TopSeller>();

    for (const row of rows) {
      const sellerId = String(row["seller_id"] ?? "");
      const existing = map.get(sellerId) ?? { sellerId, transactionCount: 0, volume: 0, revenue: 0 };
      map.set(sellerId, {
        sellerId,
        transactionCount: existing.transactionCount + 1,
        volume:           existing.volume  + Number(row["total_amount"] ?? 0),
        revenue:          existing.revenue + Number(row["net_amount"]   ?? 0),
      });
    }

    return [...map.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getTopBuyers(limit: number): Promise<TopBuyer[]> {
    const { data, error } = await this.db
      .from("marketplace_wallet_transactions")
      .select("buyer_id, total_amount");

    if (error) return [];

    const rows = (data ?? []) as Row[];
    const map  = new Map<string, TopBuyer>();

    for (const row of rows) {
      const buyerId  = String(row["buyer_id"] ?? "");
      const existing = map.get(buyerId) ?? { buyerId, transactionCount: 0, volume: 0 };
      map.set(buyerId, {
        buyerId,
        transactionCount: existing.transactionCount + 1,
        volume:           existing.volume + Number(row["total_amount"] ?? 0),
      });
    }

    return [...map.values()]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  }

  async getTopItems(limit: number): Promise<TopItem[]> {
    // marketplace_transactions has item_name and price — always exists
    const { data, error } = await this.db
      .from("marketplace_transactions")
      .select("item_name, price");

    if (error) return [];

    const rows = (data ?? []) as Row[];
    const map  = new Map<string, TopItem>();

    for (const row of rows) {
      const itemName = String(row["item_name"] ?? "");
      const existing = map.get(itemName) ?? { itemName, sales: 0, volume: 0 };
      map.set(itemName, {
        itemName,
        sales:  existing.sales  + 1,
        volume: existing.volume + Number(row["price"] ?? 0),
      });
    }

    return [...map.values()]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }

  async getVolumeStats(): Promise<VolumeStats> {
    // Try marketplace_wallet_transactions first; fall back to marketplace_transactions
    const { data: walletData, error: walletError } = await this.db
      .from("marketplace_wallet_transactions")
      .select("total_amount, created_at");

    const rows: Row[] = walletError
      ? await this.db
          .from("marketplace_transactions")
          .select("price, created_at")
          .then(r => (r.data ?? []) as Row[])
      : (walletData ?? []) as Row[];

    const amountKey = walletError ? "price" : "total_amount";

    const now   = Date.now();
    const ms24h = 24 * 60 * 60 * 1000;
    const ms7d  = 7  * ms24h;
    const ms30d = 30 * ms24h;

    let last24h = 0;
    let last7d  = 0;
    let last30d = 0;
    let allTime = 0;

    for (const row of rows) {
      const amount = Number(row[amountKey] ?? 0);
      const age    = now - new Date(String(row["created_at"] ?? "")).getTime();

      allTime += amount;
      if (age <= ms30d) last30d += amount;
      if (age <= ms7d)  last7d  += amount;
      if (age <= ms24h) last24h += amount;
    }

    return { last24h, last7d, last30d, allTime };
  }
}
