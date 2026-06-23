// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceAuctionsRepository
// Table: marketplace_auctions
//
// V1.8: All filtering, sorting, and pagination pushed to Supabase query layer.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type {
  IAuctionsRepository,
  Auction,
  AuctionStatus,
  AuctionSortField,
  AuctionQueryParams,
  ItemCategory,
  ItemRarity,
  MarketplaceCurrency,
  CreateAuctionInput,
} from "../marketplaceRepository";

const SORT_COL: Record<AuctionSortField, string> = {
  price:        "starting_price",
  currentPrice: "current_price",
  createdAt:    "created_at",
  rarity:       "rarity",
  itemName:     "item_name",
  bidCount:     "bid_count",
  endsAt:       "ends_at",
};

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

  async getAll(params: AuctionQueryParams = {}): Promise<Auction[]> {
    const {
      q, category, rarity, currency, sellerId, minPrice, maxPrice, status,
      sort = "endsAt", order = "asc", limit = 50, offset = 0,
    } = params;

    let query = this.db.from("marketplace_auctions").select("*");

    if (q)                       query = query.ilike("item_name", `%${q}%`);
    if (category)                query = query.eq("category", category);
    if (rarity)                  query = query.eq("rarity", rarity);
    if (currency)                query = query.eq("currency", currency);
    if (sellerId)                query = query.eq("seller_id", sellerId);
    if (status)                  query = query.eq("status", status);
    if (minPrice != null)        query = query.gte("current_price", minPrice);
    if (maxPrice != null)        query = query.lte("current_price", maxPrice);

    const col = SORT_COL[sort] ?? "ends_at";
    query = query
      .order(col, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw new Error(`SupabaseMarketplaceAuctionsRepository.getAll: ${error.message}`);
    return (data ?? []).map(r => toAuction(r as Record<string, unknown>));
  }

  async getExpired(): Promise<Auction[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.db
      .from("marketplace_auctions")
      .select("*")
      .eq("status", "live")
      .lte("ends_at", now)
      .order("ends_at", { ascending: true });
    if (error) throw new Error(`SupabaseMarketplaceAuctionsRepository.getExpired: ${error.message}`);
    return (data ?? []).map(r => toAuction(r as Record<string, unknown>));
  }

  async getById(id: string): Promise<Auction | null> {
    if (!isValidUuid(id)) return null;
    const { data, error } = await this.db
      .from("marketplace_auctions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`SupabaseMarketplaceAuctionsRepository.getById: ${error.message}`);
    return data ? toAuction(data as Record<string, unknown>) : null;
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
    return toAuction(data as Record<string, unknown>);
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
    return data ? toAuction(data as Record<string, unknown>) : null;
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
    return data ? toAuction(data as Record<string, unknown>) : null;
  }
}
