// ─────────────────────────────────────────────────────────────────────────────
// InventoryItemsMutationRepository
//
// Narrow interface used exclusively by MarketplaceService to:
//   - Validate item ownership before listing/auction creation
//   - Update item status when listed, de-listed, or sold
//   - Transfer ownership on purchase completion
//
// This is separate from IInventoryItemsRepository (read-only query path).
// ─────────────────────────────────────────────────────────────────────────────

export interface InventoryItemRecord {
  id:       string;
  userId:   string;
  status:   string;
  name:     string;
  category: string;
  rarity:   string;
}

export interface IInventoryItemsMutationRepository {
  getById(id: string): Promise<InventoryItemRecord | null>;
  setStatus(id: string, status: string): Promise<void>;
  transferOwnership(id: string, newUserId: string): Promise<void>;
}
