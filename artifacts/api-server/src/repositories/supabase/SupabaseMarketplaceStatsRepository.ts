// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceStatsRepository
//
// Runs parallel count queries against marketplace_listings,
// marketplace_auctions, and marketplace_transactions.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type { MarketplaceStats } from "../marketplaceRepository";

export class SupabaseMarketplaceStatsRepository {
  private get db() { return getSupabaseClient(); }

  async getStats(): Promise<MarketplaceStats> {
    const [
      { count: totalListings },
      { count: activeListings },
      { count: soldListings },
      { count: totalAuctions },
      { count: liveAuctions },
      { count: totalTransactions },
      txResult,
    ] = await Promise.all([
      this.db.from("marketplace_listings").select("*", { count: "exact", head: true }),
      this.db.from("marketplace_listings").select("*", { count: "exact", head: true }).eq("status", "active"),
      this.db.from("marketplace_listings").select("*", { count: "exact", head: true }).eq("status", "sold"),
      this.db.from("marketplace_auctions").select("*", { count: "exact", head: true }),
      this.db.from("marketplace_auctions").select("*", { count: "exact", head: true }).eq("status", "live"),
      this.db.from("marketplace_transactions").select("*", { count: "exact", head: true }),
      this.db.from("marketplace_transactions").select("price"),
    ]);

    const prices = (txResult.data ?? []) as Array<Record<string, unknown>>;
    const marketVolume = prices.reduce((sum, row) => sum + Number(row["price"] ?? 0), 0);

    return {
      totalListings:     totalListings     ?? 0,
      activeListings:    activeListings    ?? 0,
      soldListings:      soldListings      ?? 0,
      totalAuctions:     totalAuctions     ?? 0,
      liveAuctions:      liveAuctions      ?? 0,
      totalTransactions: totalTransactions ?? 0,
      marketVolume,
    };
  }
}
