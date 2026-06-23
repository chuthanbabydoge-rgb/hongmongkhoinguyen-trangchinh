// ─────────────────────────────────────────────────────────────────────────────
// SupabaseInventoryItemsMutationRepository
//
// Write-path for inventory_items used by MarketplaceService.
// Table: inventory_items (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type {
  IInventoryItemsMutationRepository,
  InventoryItemRecord,
} from "../inventoryItemsMutationRepository";

export class SupabaseInventoryItemsMutationRepository
  implements IInventoryItemsMutationRepository
{
  private get db() { return getSupabaseClient(); }

  async getById(id: string): Promise<InventoryItemRecord | null> {
    if (!isValidUuid(id)) return null;

    const { data, error } = await this.db
      .from("inventory_items")
      .select("id, user_id, status, name")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`SupabaseInventoryItemsMutationRepository.getById: ${error.message}`);
    }
    if (!data) return null;

    const row = data as Record<string, unknown>;
    return {
      id:     row["id"]      as string,
      userId: row["user_id"] as string,
      status: row["status"]  as string,
      name:   row["name"]    as string,
    };
  }

  async setStatus(id: string, status: string): Promise<void> {
    if (!isValidUuid(id)) throw new Error(`Invalid UUID: ${id}`);

    const { error } = await this.db
      .from("inventory_items")
      .update({ status })
      .eq("id", id);

    if (error) {
      throw new Error(`SupabaseInventoryItemsMutationRepository.setStatus: ${error.message}`);
    }
  }

  async transferOwnership(id: string, newUserId: string): Promise<void> {
    if (!isValidUuid(id))        throw new Error(`Invalid item UUID: ${id}`);
    if (!isValidUuid(newUserId)) throw new Error(`Invalid user UUID: ${newUserId}`);

    const { error } = await this.db
      .from("inventory_items")
      .update({ user_id: newUserId, status: "active" })
      .eq("id", id);

    if (error) {
      throw new Error(
        `SupabaseInventoryItemsMutationRepository.transferOwnership: ${error.message}`,
      );
    }
  }
}
