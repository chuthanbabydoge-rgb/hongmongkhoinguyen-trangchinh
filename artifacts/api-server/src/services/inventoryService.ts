// ─────────────────────────────────────────────────────────────────────────────
// Inventory Service
//
// Orchestrates inventory queries and mutations.
// All data access goes through IInventoryItemsRepository.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IInventoryItemsRepository,
  ItemFilters,
  InventoryItem,
  InventorySummary,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
} from "../repositories/inventoryItemsRepository";
import type { ActivitiesService } from "./activitiesService";

export interface InventoryData {
  userId:  string;
  summary: InventorySummary;
  items:   InventoryItem[];
}

export interface InventorySummaryResponse {
  totalAssets:  number;
  pets:         number;
  items:        number;
  tickets:      number;
  worldAssets:  number;
  collectibles: number;
}

export class ItemNotFoundError extends Error {
  constructor(id: string) {
    super(`Vật phẩm không tồn tại hoặc không thuộc về bạn: ${id}`);
    this.name = "ItemNotFoundError";
  }
}

export class InventoryService {
  constructor(
    private readonly repo: IInventoryItemsRepository,
    private readonly activities: ActivitiesService | null = null,
  ) {}

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

  async getInventorySummary(userId: string): Promise<InventorySummaryResponse> {
    const s = await this.repo.getSummary(userId);
    return {
      totalAssets:  s.total,
      pets:         s.pets,
      items:        s.items,
      tickets:      s.tickets,
      worldAssets:  s.worldAssets,
      collectibles: s.footballPlayers,
    };
  }

  async getItemById(userId: string, id: string): Promise<InventoryItem> {
    const item = await this.repo.getById(id, userId);
    if (!item) throw new ItemNotFoundError(id);
    return item;
  }

  async createItem(userId: string, input: CreateInventoryItemInput): Promise<InventoryItem> {
    const item = await this.repo.create(userId, input);
    this.activities?.fire({
      userId,
      type:        "inventory",
      title:       `Nhận vật phẩm: ${item.name}`,
      description: `Đã thêm ${item.name} (${item.rarity}) vào kho đồ.`,
      metadata:    { itemId: item.id, name: item.name, rarity: item.rarity, category: item.category },
      sourceApp:   "universe-hub",
    });
    return item;
  }

  async updateItem(userId: string, id: string, input: UpdateInventoryItemInput): Promise<InventoryItem> {
    const updated = await this.repo.update(id, userId, input);
    if (!updated) throw new ItemNotFoundError(id);
    this.activities?.fire({
      userId,
      type:        "inventory",
      title:       `Cập nhật vật phẩm: ${updated.name}`,
      description: `Vật phẩm ${updated.name} đã được cập nhật.`,
      metadata:    { itemId: updated.id, name: updated.name, rarity: updated.rarity },
      sourceApp:   "universe-hub",
    });
    return updated;
  }

  async deleteItem(userId: string, id: string): Promise<void> {
    const deleted = await this.repo.delete(id, userId);
    if (!deleted) throw new ItemNotFoundError(id);
  }
}
