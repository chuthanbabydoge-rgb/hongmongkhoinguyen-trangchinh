// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceTransactionsRepository
// Table: marketplace_transactions
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type {
  ITransactionsRepository,
  MarketplaceTransaction,
  MarketplaceCurrency,
} from "../marketplaceRepository";

function toTransaction(row: Record<string, unknown>): MarketplaceTransaction {
  return {
    id:        row["id"]          as string,
    listingId: row["listing_id"]  as string,
    buyerId:   row["buyer_id"]    as string,
    sellerId:  row["seller_id"]   as string,
    itemName:  row["item_name"]   as string,
    price:     Number(row["price"]),
    currency:  row["currency"]    as MarketplaceCurrency,
    createdAt: row["created_at"]  as string,
  };
}

export class SupabaseMarketplaceTransactionsRepository implements ITransactionsRepository {
  private get db() { return getSupabaseClient(); }

  async getAll(limit = 50): Promise<MarketplaceTransaction[]> {
    const { data, error } = await this.db
      .from("marketplace_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`SupabaseMarketplaceTransactionsRepository.getAll: ${error.message}`);
    return (data ?? []).map(toTransaction);
  }

  async getByUserId(userId: string, limit = 50): Promise<MarketplaceTransaction[]> {
    if (!isValidUuid(userId)) return [];
    const { data, error } = await this.db
      .from("marketplace_transactions")
      .select("*")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`SupabaseMarketplaceTransactionsRepository.getByUserId: ${error.message}`);
    return (data ?? []).map(toTransaction);
  }

  async create(
    tx: Omit<MarketplaceTransaction, "id" | "createdAt">,
  ): Promise<MarketplaceTransaction> {
    const row = {
      listing_id: tx.listingId,
      buyer_id:   tx.buyerId,
      seller_id:  tx.sellerId,
      item_name:  tx.itemName,
      price:      tx.price,
      currency:   tx.currency,
    };
    const { data, error } = await this.db
      .from("marketplace_transactions")
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`SupabaseMarketplaceTransactionsRepository.create: ${error.message}`);
    return toTransaction(data);
  }
}
