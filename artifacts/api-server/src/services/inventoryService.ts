// ─────────────────────────────────────────────────────────────────────────────
// Inventory service
// Swap the return values with DB queries when integrating a database.
// Example: return await db.query.inventoryItems.findMany({ where: eq(items.userId, userId) });
// ─────────────────────────────────────────────────────────────────────────────

import {
  INVENTORY,
  type InventoryData,
  type InventoryItem,
  type InventoryCategory,
} from "../data/inventoryData";

export async function getInventory(_userId: string): Promise<InventoryData> {
  return INVENTORY;
}

export async function getInventoryItems(
  _userId: string,
  category?: InventoryCategory,
  limit = 50,
): Promise<InventoryItem[]> {
  let items = INVENTORY.items;
  if (category) {
    items = items.filter((i) => i.category === category);
  }
  return items.slice(0, limit);
}
