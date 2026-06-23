// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceListingsRepository
// Table: marketplace_listings
//
// V1.8: All filtering, sorting, and pagination pushed to Supabase query layer.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type {
  IListingsRepository,
  Listing,
  ListingStatus,
  ListingSortField,
  ListingQueryParams,
  ItemCategory,
  ItemRarity,
  MarketplaceCurrency,
  CreateListingInput,
} from "../marketplaceRepository";

const SORT_COL: Record<ListingSortField, string> = {
  price:     "price",
  createdAt: "created_at",
  updatedAt: "updated_at",
  rarity:    "rarity",
  itemName:  "item_name",
};

function toListing(row: Record<string, unknown>): Listing {
  return {
    id:        row["id"]         as string,
    sellerId:  row["seller_id"]  as string,
    itemId:    row["item_id"]    as string,
    itemName:  row["item_name"]  as string,
    category:  row["category"]   as ItemCategory,
    rarity:    row["rarity"]     as ItemRarity,
    price:     Number(row["price"]),
    currency:  row["currency"]   as MarketplaceCurrency,
    status:    row["status"]     as ListingStatus,
    createdAt: row["created_at"] as string,
    updatedAt: row["updated_at"] as string,
    expiresAt: row["expires_at"] != null ? (row["expires_at"] as string) : null,
  };
}

export class SupabaseMarketplaceListingsRepository implements IListingsRepository {
  private get db() { return getSupabaseClient(); }

  async getAll(params: ListingQueryParams = {}): Promise<Listing[]> {
    const {
      q, category, rarity, currency, sellerId, minPrice, maxPrice, status,
      sort = "createdAt", order = "desc", limit = 50, offset = 0,
    } = params;

    let query = this.db.from("marketplace_listings").select("*");

    if (q)                       query = query.ilike("item_name", `%${q}%`);
    if (category)                query = query.eq("category", category);
    if (rarity)                  query = query.eq("rarity", rarity);
    if (currency)                query = query.eq("currency", currency);
    if (sellerId)                query = query.eq("seller_id", sellerId);
    if (status)                  query = query.eq("status", status);
    if (minPrice != null)        query = query.gte("price", minPrice);
    if (maxPrice != null)        query = query.lte("price", maxPrice);

    const col = SORT_COL[sort] ?? "created_at";
    query = query
      .order(col, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw new Error(`SupabaseMarketplaceListingsRepository.getAll: ${error.message}`);
    return (data ?? []).map(r => toListing(r as Record<string, unknown>));
  }

  async getById(id: string): Promise<Listing | null> {
    if (!isValidUuid(id)) return null;
    const { data, error } = await this.db
      .from("marketplace_listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`SupabaseMarketplaceListingsRepository.getById: ${error.message}`);
    return data ? toListing(data as Record<string, unknown>) : null;
  }

  async create(input: CreateListingInput): Promise<Listing> {
    const row = {
      seller_id:  input.sellerId,
      item_id:    input.itemId,
      item_name:  input.itemName,
      category:   input.category,
      rarity:     input.rarity,
      price:      input.price,
      currency:   input.currency,
      status:     "active" as ListingStatus,
      expires_at: input.expiresAt ?? null,
    };
    const { data, error } = await this.db
      .from("marketplace_listings")
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`SupabaseMarketplaceListingsRepository.create: ${error.message}`);
    return toListing(data as Record<string, unknown>);
  }

  async updateStatus(id: string, status: ListingStatus): Promise<Listing | null> {
    if (!isValidUuid(id)) return null;
    const { data, error } = await this.db
      .from("marketplace_listings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`SupabaseMarketplaceListingsRepository.updateStatus: ${error.message}`);
    return data ? toListing(data as Record<string, unknown>) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!isValidUuid(id)) return false;
    const { error } = await this.db
      .from("marketplace_listings")
      .delete()
      .eq("id", id);
    if (error) throw new Error(`SupabaseMarketplaceListingsRepository.delete: ${error.message}`);
    return true;
  }
}
