// ─────────────────────────────────────────────────────────────────────────────
// InventoryReference Repository
//
// Stores aggregate item counts per user so the hub can display totals without
// querying the full Inventory Service on every load.
//
// PostgreSQL migration path:
//   Query the `inventory_references` table.
//   `syncCounts` should be triggered by inventory-changed webhooks from the
//   Inventory Service, keeping counts eventually consistent.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  InventoryReference,
  InventoryItemCounts,
} from "../models/inventoryReference";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IInventoryReferenceRepository {
  findByUserId(userId: string): Promise<InventoryReference | null>;
  save(ref: InventoryReference): Promise<InventoryReference>;
  syncCounts(
    userId: string,
    counts: InventoryItemCounts,
  ): Promise<InventoryReference | null>;
}

// ─── Mock seed data ───────────────────────────────────────────────────────────

const SEED_INVENTORY_REFS: InventoryReference[] = [
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

export class MockInventoryReferenceRepository
  implements IInventoryReferenceRepository
{
  private store = new Map<string, InventoryReference>(
    SEED_INVENTORY_REFS.map((r) => [
      r.userId,
      { ...r, itemCounts: { ...r.itemCounts } },
    ]),
  );

  async findByUserId(userId: string): Promise<InventoryReference | null> {
    return this.store.get(userId) ?? null;
  }

  async save(ref: InventoryReference): Promise<InventoryReference> {
    const record: InventoryReference = {
      ...ref,
      lastSyncedAt: new Date().toISOString(),
    };
    this.store.set(record.userId, record);
    return record;
  }

  async syncCounts(
    userId: string,
    counts: InventoryItemCounts,
  ): Promise<InventoryReference | null> {
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
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const inventoryReferenceRepository: IInventoryReferenceRepository =
  new MockInventoryReferenceRepository();
