// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceAuctionsRepository
// Table: marketplace_auctions
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type {
  IAuctionsRepository,
  Auction,
  AuctionStatus,
  ItemCategory,
  ItemRarity,
  MarketplaceCurrency,
  CreateAuctionInput,
} from "../marketplaceRepository";

function toAuction(row: Record<string, unknown>): Auction {
  return {
    id:            row["id"]             as string,
    sellerId:      row["seller_id"]      as string,
    itemId:        row["item_id"]        as string,
    itemName:      row["item_name"]      as string,
    category:      row["category"]       as ItemCategory,
    rarity:        row["rarity"]         as ItemRarity,
    startingPrice: Number(row["starting_price"]),
    currentPrice:  Number(row["current_price"]),
    currency:      row["currency"]       as MarketplaceCurrency,
    status:        row["status"]         as AuctionStatus,
    bidCount:      Number(row["bid_count"]),
    startsAt:      row["starts_at"]      as string,
    endsAt:        row["ends_at"]        as string,
    createdAt:     row["created_at"]     as string,
  };
}

export class SupabaseMarketplaceAuctionsRepository implements IAuctionsRepository {
  private get db() { return getSupabaseClient(); }

  async getAll(status?: AuctionStatus, limit = 50): Promise<Auction[]> {
    let query = this.db
      .from("marketplace_auctions")
      .select("*")
      .order("ends_at", { ascending: true })
      .limit(limit);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw new Error(`SupabaseMarketplaceAuctionsRepository.getAll: ${error.message}`);
    return (data ?? []).map(toAuction);
  }

  async getById(id: string): Promise<Auction | null> {
    if (!isValidUuid(id)) return null;
    const { data, error } = await this.db
      .from("marketplace_auctions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`SupabaseMarketplaceAuctionsRepository.getById: ${error.message}`);
    return data ? toAuction(data) : null;
  }

  async create(input: CreateAuctionInput): Promise<Auction> {
    const row = {
      seller_id:      input.sellerId,
      item_id:        input.itemId,
      item_name:      input.itemName,
      category:       input.category,
      rarity:         input.rarity,
      starting_price: input.startingPrice,
      current_price:  input.startingPrice,
      currency:       input.currency,
      status:         "live" as AuctionStatus,
      bid_count:      0,
      starts_at:      new Date().toISOString(),
      ends_at:        input.endsAt,
    };
    const { data, error } = await this.db
      .from("marketplace_auctions")
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`SupabaseMarketplaceAuctionsRepository.create: ${error.message}`);
    return toAuction(data);
  }

  async updateBid(id: string, currentPrice: number, bidCount: number): Promise<Auction | null> {
    if (!isValidUuid(id)) return null;
    const { data, error } = await this.db
      .from("marketplace_auctions")
      .update({ current_price: currentPrice, bid_count: bidCount })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`SupabaseMarketplaceAuctionsRepository.updateBid: ${error.message}`);
    return data ? toAuction(data) : null;
  }

  async updateStatus(id: string, status: AuctionStatus): Promise<Auction | null> {
    if (!isValidUuid(id)) return null;
    const { data, error } = await this.db
      .from("marketplace_auctions")
      .update({ status })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`SupabaseMarketplaceAuctionsRepository.updateStatus: ${error.message}`);
    return data ? toAuction(data) : null;
  }
}
