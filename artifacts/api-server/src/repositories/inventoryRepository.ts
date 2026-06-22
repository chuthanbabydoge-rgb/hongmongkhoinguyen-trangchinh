// ─────────────────────────────────────────────────────────────────────────────
// Inventory Repository
//
// Stores a per-user inventory reference with aggregate item-count snapshots.
// Full item details live in the Inventory Service; this repo holds only
// the foreign key + cached counts for fast hub-side display.
//
// PostgreSQL migration path:
//   `inventory_references` table, one row per user.
//   `syncCounts` is triggered by Inventory Service webhooks.
//   Implement DrizzleInventoryRepository and swap the singleton.
// ─────────────────────────────────────────────────────────────────────────────

import type { InventoryReference, InventoryItemCounts } from "../models/inventoryReference";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IInventoryRepository {
  getByUserId(userId: string): Promise<InventoryReference | null>;
  create(ref: InventoryReference): Promise<InventoryReference>;
  update(ref: InventoryReference): Promise<InventoryReference | null>;
  syncCounts(userId: string, counts: InventoryItemCounts): Promise<InventoryReference | null>;
  delete(userId: string): Promise<boolean>;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_INVENTORIES: InventoryReference[] = [
  {
    userId: "user-001",
    inventoryId: "inventory-001",
    itemCounts: {
      pets: 12,
      players: 47,
      tickets: 8,
      digitalAssets: 234,
      items: 156,
      total: 457,
    },
    lastSyncedAt: "2024-12-01T10:00:00Z",
  },
];

// ─── Mock implementation ──────────────────────────────────────────────────────

export class MockInventoryRepository implements IInventoryRepository {
  private store = new Map<string, InventoryReference>(
    SEED_INVENTORIES.map((r) => [r.userId, { ...r, itemCounts: { ...r.itemCounts } }]),
  );

  async getByUserId(userId: string): Promise<InventoryReference | null> {
    return this.store.get(userId) ?? null;
  }

  async create(ref: InventoryReference): Promise<InventoryReference> {
    const record: InventoryReference = { ...ref, lastSyncedAt: new Date().toISOString() };
    this.store.set(record.userId, record);
    return record;
  }

  async update(ref: InventoryReference): Promise<InventoryReference | null> {
    if (!this.store.has(ref.userId)) return null;
    const updated: InventoryReference = { ...ref, lastSyncedAt: new Date().toISOString() };
    this.store.set(ref.userId, updated);
    return updated;
  }

  async syncCounts(userId: string, counts: InventoryItemCounts): Promise<InventoryReference | null> {
    const existing = this.store.get(userId);
    if (!existing) return null;
    const updated: InventoryReference = {
      ...existing,
      itemCounts: { ...counts },
      lastSyncedAt: new Date().toISOString(),
    };
    this.store.set(userId, updated);
    return updated;
  }

  async delete(userId: string): Promise<boolean> {
    return this.store.delete(userId);
  }
}

// ─── Singleton (swap here for Drizzle) ───────────────────────────────────────
export const inventoryRepository: IInventoryRepository = new MockInventoryRepository();
