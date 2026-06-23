// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplacePricingRepository (V2.8)
//
// Queries the marketplace_transactions table (and optionally auction history)
// to supply historical sale records for pricing computation.
// Never throws — returns [] on any Supabase error.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type {
  IMarketplacePricingRepository,
  SaleRecord,
} from "../marketplacePricingRepository";

export class SupabaseMarketplacePricingRepository
  implements IMarketplacePricingRepository
{
  private mapRow(r: Record<string, unknown>): SaleRecord {
    return {
      id:       r["id"] as string,
      itemId:   (r["item_id"] as string) ?? (r["listing_id"] as string) ?? "",
      itemName: (r["item_name"] as string) ?? "",
      category: (r["category"] as string) ?? "",
      rarity:   (r["rarity"] as string) ?? "",
      price:    r["price"] as number,
      currency: (r["currency"] as string) ?? "credits",
      soldAt:   (r["created_at"] as string) ?? "",
    };
  }

  async getSalesByItemId(itemId: string): Promise<SaleRecord[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("marketplace_transactions")
        .select("id, item_id, item_name, category, rarity, price, currency, created_at")
        .eq("item_id", itemId)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error || !data) return [];
      return data.map(r => this.mapRow(r as Record<string, unknown>));
    } catch {
      return [];
    }
  }

  async getSalesByCategory(category: string, limit = 500): Promise<SaleRecord[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("marketplace_transactions")
        .select("id, item_id, item_name, category, rarity, price, currency, created_at")
        .eq("category", category)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data.map(r => this.mapRow(r as Record<string, unknown>));
    } catch {
      return [];
    }
  }

  async getAllRecentSales(limitDays = 30, limit = 1000): Promise<SaleRecord[]> {
    try {
      const cutoff = new Date(Date.now() - limitDays * 86_400_000).toISOString();
      const { data, error } = await getSupabaseClient()
        .from("marketplace_transactions")
        .select("id, item_id, item_name, category, rarity, price, currency, created_at")
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data.map(r => this.mapRow(r as Record<string, unknown>));
    } catch {
      return [];
    }
  }
}
