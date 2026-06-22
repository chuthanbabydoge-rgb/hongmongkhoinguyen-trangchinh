// ─────────────────────────────────────────────────────────────────────────────
// InventoryReference model
//
// A lightweight reference from a User to their Inventory service record.
// Stores aggregate counts so the hub can show totals without fetching every
// item from the Inventory Service on every page load.
//
// Full item data lives in the Inventory Service.
//
// PostgreSQL migration path:
//   One row per user in `inventory_references`.
//   `inventoryId` is a foreign key into the Inventory Service DB.
//   Counts are refreshed via inventory change webhooks or a periodic sync job.
// ─────────────────────────────────────────────────────────────────────────────

export interface InventoryItemCounts {
  pets: number;
  players: number;
  tickets: number;
  digitalAssets: number;
  items: number;
  total: number;
}

export interface InventoryReference {
  userId: string;
  inventoryId: string;
  itemCounts: InventoryItemCounts;
  lastSyncedAt: string;
}
