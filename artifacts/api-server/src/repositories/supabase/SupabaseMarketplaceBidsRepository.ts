// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceBidsRepository
// Table: marketplace_bids
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type {
  IBidsRepository,
  Bid,
  PlaceBidInput,
  MarketplaceCurrency,
} from "../marketplaceRepository";

function toBid(row: Record<string, unknown>): Bid {
  return {
    id:        row["id"]          as string,
    auctionId: row["auction_id"]  as string,
    bidderId:  row["bidder_id"]   as string,
    amount:    Number(row["amount"]),
    currency:  row["currency"]    as MarketplaceCurrency,
    createdAt: row["created_at"]  as string,
  };
}

export class SupabaseMarketplaceBidsRepository implements IBidsRepository {
  private get db() { return getSupabaseClient(); }

  async getByAuctionId(auctionId: string, limit = 50): Promise<Bid[]> {
    if (!isValidUuid(auctionId)) return [];
    const { data, error } = await this.db
      .from("marketplace_bids")
      .select("*")
      .eq("auction_id", auctionId)
      .order("amount", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`SupabaseMarketplaceBidsRepository.getByAuctionId: ${error.message}`);
    return (data ?? []).map(toBid);
  }

  async getHighestBid(auctionId: string): Promise<Bid | null> {
    if (!isValidUuid(auctionId)) return null;
    const { data, error } = await this.db
      .from("marketplace_bids")
      .select("*")
      .eq("auction_id", auctionId)
      .order("amount", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`SupabaseMarketplaceBidsRepository.getHighestBid: ${error.message}`);
    return data ? toBid(data) : null;
  }

  async create(
    auctionId: string,
    input: PlaceBidInput,
    currency: MarketplaceCurrency,
  ): Promise<Bid> {
    const row = {
      auction_id: auctionId,
      bidder_id:  input.bidderId,
      amount:     input.amount,
      currency,
    };
    const { data, error } = await this.db
      .from("marketplace_bids")
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`SupabaseMarketplaceBidsRepository.create: ${error.message}`);
    return toBid(data);
  }
}
