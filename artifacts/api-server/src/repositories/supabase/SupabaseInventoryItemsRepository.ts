// ─────────────────────────────────────────────────────────────────────────────
// SupabaseInventoryItemsRepository
//
// Tables: inventory_items, inventory_categories
// Supports filtering by category, rarity and status.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type {
  IInventoryItemsRepository,
  InventoryItem,
  InventoryCategory,
  Rarity,
  ItemStatus,
  InventorySummary,
  ItemFilters,
} from "../inventoryItemsRepository";

// ─── Row → Domain ─────────────────────────────────────────────────────────────

function toItem(row: Record<string, unknown>): InventoryItem {
  return {
    id:         row["id"] as string,
    category:   row["category_id"] as InventoryCategory,
    name:       row["name"] as string,
    rarity:     row["rarity"] as Rarity,
    status:     row["status"] as ItemStatus,
    acquiredAt: row["acquired_at"] as string,
  };
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class SupabaseInventoryItemsRepository implements IInventoryItemsRepository {
  private get db() { return getSupabaseClient(); }

  async getItems(userId: string, filters: ItemFilters = {}, limit = 50): Promise<InventoryItem[]> {
    if (!isValidUuid(userId)) return [];

    let query = this.db
      .from("inventory_items")
      .select("id, category_id, name, rarity, status, acquired_at")
      .eq("user_id", userId)
      .order("acquired_at", { ascending: false })
      .limit(limit);

    if (filters.category) query = query.eq("category_id", filters.category);
    if (filters.rarity)   query = query.eq("rarity", filters.rarity);
    if (filters.status)   query = query.eq("status", filters.status);

    const { data, error } = await query;
    if (error) throw new Error(`SupabaseInventoryItemsRepository.getItems: ${error.message}`);
    return (data ?? []).map(toItem);
  }

  async getSummary(userId: string): Promise<InventorySummary> {
    if (!isValidUuid(userId)) {
      return { pets: 0, footballPlayers: 0, tickets: 0, worldAssets: 0, items: 0, total: 0 };
    }

    const { data, error } = await this.db
      .from("inventory_items")
      .select("category_id")
      .eq("user_id", userId);

    if (error) throw new Error(`SupabaseInventoryItemsRepository.getSummary: ${error.message}`);

    const rows = data ?? [];
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const cat = (row as Record<string, unknown>)["category_id"] as string;
      counts[cat] = (counts[cat] ?? 0) + 1;
    }

    return {
      pets:           counts["pets"]          ?? 0,
      footballPlayers: counts["football"]     ?? 0,
      tickets:        counts["tickets"]       ?? 0,
      worldAssets:    counts["world-assets"]  ?? 0,
      items:          counts["items"]         ?? 0,
      total:          rows.length,
    };
  }
}
