// ─────────────────────────────────────────────────────────────────────────────
// Supabase Inventory Repository
//
// Table: inventories
// Columns:
//   user_id, inventory_id, pet_count, player_count, ticket_count,
//   digital_asset_count, item_count, total_count, last_synced_at
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type { IInventoryRepository } from "../inventoryRepository";
import type { InventoryReference, InventoryItemCounts } from "../../models/inventoryReference";

// ─── Row → Domain mapping ─────────────────────────────────────────────────────

function toInventoryRef(row: Record<string, unknown>): InventoryReference {
  return {
    userId:      row["user_id"] as string,
    inventoryId: row["inventory_id"] as string,
    itemCounts: {
      pets:          row["pet_count"] as number,
      players:       row["player_count"] as number,
      tickets:       row["ticket_count"] as number,
      digitalAssets: row["digital_asset_count"] as number,
      items:         row["item_count"] as number,
      total:         row["total_count"] as number,
    },
    lastSyncedAt: row["last_synced_at"] as string,
  };
}

function toRow(ref: InventoryReference): Record<string, unknown> {
  return {
    user_id:             ref.userId,
    inventory_id:        ref.inventoryId,
    pet_count:           ref.itemCounts.pets,
    player_count:        ref.itemCounts.players,
    ticket_count:        ref.itemCounts.tickets,
    digital_asset_count: ref.itemCounts.digitalAssets,
    item_count:          ref.itemCounts.items,
    total_count:         ref.itemCounts.total,
    last_synced_at:      new Date().toISOString(),
  };
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class SupabaseInventoryRepository implements IInventoryRepository {
  private get db() { return getSupabaseClient(); }

  async getByUserId(userId: string): Promise<InventoryReference | null> {
    const { data, error } = await this.db
      .from("inventories")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`SupabaseInventoryRepository.getByUserId: ${error.message}`);
    return data ? toInventoryRef(data) : null;
  }

  async create(ref: InventoryReference): Promise<InventoryReference> {
    const { data, error } = await this.db
      .from("inventories")
      .insert(toRow(ref))
      .select()
      .single();
    if (error) throw new Error(`SupabaseInventoryRepository.create: ${error.message}`);
    return toInventoryRef(data);
  }

  async update(ref: InventoryReference): Promise<InventoryReference | null> {
    const { data, error } = await this.db
      .from("inventories")
      .update(toRow(ref))
      .eq("user_id", ref.userId)
      .select()
      .maybeSingle();
    if (error) throw new Error(`SupabaseInventoryRepository.update: ${error.message}`);
    return data ? toInventoryRef(data) : null;
  }

  async syncCounts(userId: string, counts: InventoryItemCounts): Promise<InventoryReference | null> {
    const { data, error } = await this.db
      .from("inventories")
      .update({
        pet_count:           counts.pets,
        player_count:        counts.players,
        ticket_count:        counts.tickets,
        digital_asset_count: counts.digitalAssets,
        item_count:          counts.items,
        total_count:         counts.total,
        last_synced_at:      new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (error) throw new Error(`SupabaseInventoryRepository.syncCounts: ${error.message}`);
    return data ? toInventoryRef(data) : null;
  }

  async delete(userId: string): Promise<boolean> {
    const { error } = await this.db.from("inventories").delete().eq("user_id", userId);
    if (error) throw new Error(`SupabaseInventoryRepository.delete: ${error.message}`);
    return true;
  }
}
