// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceReputationRepository — V2.4
//
// Tables required:
//   marketplace_reputations      (user_id PK, score, level, total_sales,
//                                 total_volume, positive_ratings,
//                                 negative_ratings, created_at, updated_at)
//   marketplace_reputation_ratings (id PK, buyer_id, seller_id,
//                                   transaction_id, rating, created_at)
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import type {
  IReputationRepository,
  SellerReputation,
  ReputationRating,
  RateInput,
} from "../marketplaceReputationRepository";

function getClient() {
  const url  = process.env["SUPABASE_URL"]!;
  const key  = process.env["SUPABASE_ANON_KEY"]!;
  return createClient(url, key);
}

function toRep(row: Record<string, unknown>): SellerReputation {
  return {
    userId:          row["user_id"]          as string,
    score:           row["score"]            as number,
    level:           row["level"]            as string,
    totalSales:      row["total_sales"]      as number,
    totalVolume:     row["total_volume"]     as number,
    positiveRatings: row["positive_ratings"] as number,
    negativeRatings: row["negative_ratings"] as number,
    createdAt:       row["created_at"]       as string,
    updatedAt:       row["updated_at"]       as string,
  };
}

function toRating(row: Record<string, unknown>): ReputationRating {
  return {
    id:            row["id"]             as string,
    buyerId:       row["buyer_id"]       as string,
    sellerId:      row["seller_id"]      as string,
    transactionId: row["transaction_id"] as string,
    rating:        row["rating"]         as 1 | -1,
    createdAt:     row["created_at"]     as string,
  };
}

export class SupabaseMarketplaceReputationRepository implements IReputationRepository {
  private get db() { return getClient(); }

  async getByUserId(userId: string): Promise<SellerReputation | null> {
    const { data } = await this.db
      .from("marketplace_reputations")
      .select("*")
      .eq("user_id", userId)
      .single();
    return data ? toRep(data as Record<string, unknown>) : null;
  }

  async upsert(rep: SellerReputation): Promise<SellerReputation> {
    const { data, error } = await this.db
      .from("marketplace_reputations")
      .upsert({
        user_id:          rep.userId,
        score:            rep.score,
        level:            rep.level,
        total_sales:      rep.totalSales,
        total_volume:     rep.totalVolume,
        positive_ratings: rep.positiveRatings,
        negative_ratings: rep.negativeRatings,
        updated_at:       new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single();
    if (error) throw error;
    return toRep(data as Record<string, unknown>);
  }

  async getTopSellers(limit = 20): Promise<SellerReputation[]> {
    const { data, error } = await this.db
      .from("marketplace_reputations")
      .select("*")
      .order("score",        { ascending: false })
      .order("total_volume", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(r => toRep(r as Record<string, unknown>));
  }

  async addRating(input: RateInput): Promise<ReputationRating> {
    const { data, error } = await this.db
      .from("marketplace_reputation_ratings")
      .insert({
        buyer_id:       input.buyerId,
        seller_id:      input.sellerId,
        transaction_id: input.transactionId,
        rating:         input.rating,
      })
      .select()
      .single();
    if (error) throw error;
    return toRating(data as Record<string, unknown>);
  }

  async hasRating(buyerId: string, transactionId: string): Promise<boolean> {
    const { count } = await this.db
      .from("marketplace_reputation_ratings")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id",       buyerId)
      .eq("transaction_id", transactionId);
    return (count ?? 0) > 0;
  }
}
