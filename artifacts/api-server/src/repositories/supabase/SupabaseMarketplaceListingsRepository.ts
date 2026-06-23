// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceListingsRepository
// Table: marketplace_listings
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type {
  IListingsRepository,
  Listing,
  ListingStatus,
  ItemCategory,
  ItemRarity,
  MarketplaceCurrency,
  CreateListingInput,
} from "../marketplaceRepository";

function tolisting(row: Record<string, unknown>): Listing {
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

  async getAll(status?: ListingStatus, limit = 50): Promise<Listing[]> {
    let query = this.db
      .from("marketplace_listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw new Error(`SupabaseMarketplaceListingsRepository.getAll: ${error.message}`);
    return (data ?? []).map(tolisting);
  }

  async getById(id: string): Promise<Listing | null> {
    if (!isValidUuid(id)) return null;
    const { data, error } = await this.db
      .from("marketplace_listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`SupabaseMarketplaceListingsRepository.getById: ${error.message}`);
    return data ? tolisting(data) : null;
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
    return tolisting(data);
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
    return data ? tolisting(data) : null;
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
