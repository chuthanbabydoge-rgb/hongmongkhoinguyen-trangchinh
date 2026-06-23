// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceRecommendationRepository (V2.7)
//
// Reads from existing marketplace tables to supply candidate listings and
// user-context data for the recommendation scoring engine.
// Never throws — returns empty arrays / 0 on Supabase errors so the service
// degrades gracefully.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type {
  IMarketplaceRecommendationRepository,
  RecommendationItem,
  UserPurchase,
  UserWatchlistEntry,
  UserSavedSearch,
  ListingFilter,
} from "../marketplaceRecommendationRepository";

export class SupabaseMarketplaceRecommendationRepository
  implements IMarketplaceRecommendationRepository
{
  async getActiveListings(params?: ListingFilter): Promise<RecommendationItem[]> {
    try {
      const sb = getSupabaseClient();
      let q = sb
        .from("marketplace_listings")
        .select("id, item_name, category, rarity, price, currency, seller_id, created_at")
        .eq("status", "active");

      if (params?.category) q = q.eq("category", params.category);
      if (params?.rarity)   q = q.eq("rarity",   params.rarity);
      if (params?.currency) q = q.eq("currency",  params.currency);
      if (params?.minPrice != null) q = q.gte("price", params.minPrice);
      if (params?.maxPrice != null) q = q.lte("price", params.maxPrice);
      if (params?.excludeIds?.length) q = q.not("id", "in", `(${params.excludeIds.join(",")})`);

      const { data, error } = await q.order("created_at", { ascending: false }).limit(200);
      if (error || !data) return [];

      return data.map((r: Record<string, unknown>) => ({
        listingId:  r["id"] as string,
        itemName:   r["item_name"] as string,
        category:   r["category"] as string,
        rarity:     r["rarity"] as string,
        price:      r["price"] as number,
        currency:   r["currency"] as string,
        sellerId:   r["seller_id"] as string,
        bidCount:   0,
        createdAt:  r["created_at"] as string,
      }));
    } catch {
      return [];
    }
  }

  async getActiveAuctions(limit = 10): Promise<RecommendationItem[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("marketplace_auctions")
        .select("id, item_name, category, rarity, current_price, currency, seller_id, bid_count, created_at")
        .eq("status", "live")
        .order("bid_count", { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map((r: Record<string, unknown>) => ({
        listingId:  r["id"] as string,
        itemName:   r["item_name"] as string,
        category:   r["category"] as string,
        rarity:     r["rarity"] as string,
        price:      r["current_price"] as number,
        currency:   r["currency"] as string,
        sellerId:   r["seller_id"] as string,
        bidCount:   r["bid_count"] as number,
        createdAt:  r["created_at"] as string,
      }));
    } catch {
      return [];
    }
  }

  async getUserPurchases(userId: string): Promise<UserPurchase[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("marketplace_transactions")
        .select("listing_id, category, rarity")
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error || !data) return [];

      return data.map((r: Record<string, unknown>) => ({
        listingId: r["listing_id"] as string,
        category:  (r["category"] as string) ?? "",
        rarity:    (r["rarity"] as string) ?? "",
      }));
    } catch {
      return [];
    }
  }

  async getUserWatchlist(userId: string): Promise<UserWatchlistEntry[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("marketplace_watchlist")
        .select("target_id, rarity")
        .eq("user_id", userId);

      if (error || !data) return [];

      return data.map((r: Record<string, unknown>) => ({
        listingId: r["target_id"] as string,
        category:  null,
        rarity:    (r["rarity"] as string | null) ?? null,
      }));
    } catch {
      return [];
    }
  }

  async getUserSavedSearches(userId: string): Promise<UserSavedSearch[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("marketplace_saved_searches")
        .select("category, rarity, query, min_price, max_price")
        .eq("user_id", userId);

      if (error || !data) return [];

      return data.map((r: Record<string, unknown>) => ({
        category:  (r["category"] as string | null) ?? null,
        rarity:    (r["rarity"] as string | null) ?? null,
        query:     (r["query"] as string | null) ?? null,
        minPrice:  (r["min_price"] as number | null) ?? null,
        maxPrice:  (r["max_price"] as number | null) ?? null,
      }));
    } catch {
      return [];
    }
  }

  async getSellerScore(sellerId: string): Promise<number> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("marketplace_seller_reputations")
        .select("score")
        .eq("user_id", sellerId)
        .maybeSingle();

      if (error || !data) return 0;
      return (data as Record<string, unknown>)["score"] as number ?? 0;
    } catch {
      return 0;
    }
  }
}
