// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceSavedSearchRepository (V2.3)
//
// Reads/writes the marketplace_saved_searches table via Supabase PostgREST.
// Gracefully returns empty results if the table doesn't exist yet.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type {
  ISavedSearchRepository,
  SavedSearch,
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
} from "../marketplaceSavedSearchRepository";

type Row = Record<string, unknown>;

function toEntry(row: Row): SavedSearch {
  return {
    id:        String(row["id"]         ?? ""),
    userId:    String(row["user_id"]    ?? ""),
    name:      String(row["name"]       ?? ""),
    query:     row["query"]     != null ? String(row["query"])     : null,
    category:  row["category"]  != null ? String(row["category"])  : null,
    rarity:    row["rarity"]    != null ? String(row["rarity"])    : null,
    currency:  row["currency"]  != null ? String(row["currency"])  : null,
    minPrice:  row["min_price"] != null ? Number(row["min_price"]) : null,
    maxPrice:  row["max_price"] != null ? Number(row["max_price"]) : null,
    createdAt: String(row["created_at"] ?? ""),
    updatedAt: String(row["updated_at"] ?? ""),
  };
}

const TABLE = "marketplace_saved_searches";

export class SupabaseMarketplaceSavedSearchRepository implements ISavedSearchRepository {
  private get db() { return getSupabaseClient(); }

  async create(input: CreateSavedSearchInput): Promise<SavedSearch> {
    const { data, error } = await this.db
      .from(TABLE)
      .insert({
        user_id:   input.userId,
        name:      input.name,
        query:     input.query    ?? null,
        category:  input.category ?? null,
        rarity:    input.rarity   ?? null,
        currency:  input.currency ?? null,
        min_price: input.minPrice ?? null,
        max_price: input.maxPrice ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`SupabaseSavedSearch.create: ${error.message}`);
    return toEntry(data as Row);
  }

  async update(id: string, patch: UpdateSavedSearchInput): Promise<SavedSearch | null> {
    const updates: Record<string, unknown> = {};
    if (patch.name      !== undefined) updates["name"]      = patch.name;
    if (patch.query     !== undefined) updates["query"]     = patch.query;
    if (patch.category  !== undefined) updates["category"]  = patch.category;
    if (patch.rarity    !== undefined) updates["rarity"]    = patch.rarity;
    if (patch.currency  !== undefined) updates["currency"]  = patch.currency;
    if (patch.minPrice  !== undefined) updates["min_price"] = patch.minPrice;
    if (patch.maxPrice  !== undefined) updates["max_price"] = patch.maxPrice;
    updates["updated_at"] = new Date().toISOString();

    const { data, error } = await this.db
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !data) return null;
    return toEntry(data as Row);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.db.from(TABLE).delete().eq("id", id);
    return !error;
  }

  async findById(id: string): Promise<SavedSearch | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return toEntry(data as Row);
  }

  async findByUser(userId: string): Promise<SavedSearch[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []).map(r => toEntry(r as Row));
  }

  async getAll(): Promise<SavedSearch[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []).map(r => toEntry(r as Row));
  }

  async getMatchIds(id: string): Promise<string[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("last_match_ids")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return [];
    const raw = (data as Row)["last_match_ids"];
    return Array.isArray(raw) ? (raw as string[]) : [];
  }

  async setMatchIds(id: string, ids: string[]): Promise<void> {
    await this.db
      .from(TABLE)
      .update({ last_match_ids: ids, updated_at: new Date().toISOString() })
      .eq("id", id);
  }
}
