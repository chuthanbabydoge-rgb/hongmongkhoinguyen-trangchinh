// ─────────────────────────────────────────────────────────────────────────────
// Inventory Service
//
// Queries inventory_items and inventory_categories from Supabase.
// All filtering (category, rarity, status) is pushed down to the repository.
// ─────────────────────────────────────────────────────────────────────────────

import type { IInventoryItemsRepository, ItemFilters, InventoryItem, InventorySummary } from "../repositories/inventoryItemsRepository";

export interface InventoryData {
  userId:  string;
  summary: InventorySummary;
  items:   InventoryItem[];
}

export class InventoryService {
  constructor(private readonly repo: IInventoryItemsRepository) {}

  async getInventory(userId: string): Promise<InventoryData> {
    const [summary, items] = await Promise.all([
      this.repo.getSummary(userId),
      this.repo.getItems(userId, {}, 50),
    ]);
    return { userId, summary, items };
  }

  async getInventoryItems(userId: string, filters: ItemFilters = {}, limit = 50): Promise<InventoryItem[]> {
    return this.repo.getItems(userId, filters, limit);
  }
}
