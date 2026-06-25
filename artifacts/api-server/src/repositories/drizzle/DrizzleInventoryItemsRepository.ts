import { and, eq, sql } from "drizzle-orm";
import { db, inventoryItemsTable } from "@workspace/db";
import type { IInventoryItemsRepository, InventoryItem, InventorySummary, ItemFilters } from "../inventoryItemsRepository";

function rowToItem(row: typeof inventoryItemsTable.$inferSelect): InventoryItem {
  return {
    id:         row.id,
    category:   row.category as InventoryItem["category"],
    name:       row.name,
    rarity:     row.rarity as InventoryItem["rarity"],
    status:     row.status as InventoryItem["status"],
    acquiredAt: typeof row.acquiredAt === "string" ? row.acquiredAt : new Date(row.acquiredAt).toISOString(),
  };
}

export class DrizzleInventoryItemsRepository implements IInventoryItemsRepository {
  async getItems(userId: string, filters: ItemFilters = {}, limit = 50): Promise<InventoryItem[]> {
    const conditions = [eq(inventoryItemsTable.userId, userId)];
    if (filters.category) conditions.push(eq(inventoryItemsTable.category, filters.category));
    if (filters.rarity)   conditions.push(eq(inventoryItemsTable.rarity, filters.rarity));
    if (filters.status)   conditions.push(eq(inventoryItemsTable.status, filters.status));

    const rows = await db
      .select()
      .from(inventoryItemsTable)
      .where(and(...conditions))
      .limit(limit);
    return rows.map(rowToItem);
  }

  async getSummary(userId: string): Promise<InventorySummary> {
    const rows = await db
      .select({ category: inventoryItemsTable.category, count: sql<number>`count(*)::int` })
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.userId, userId))
      .groupBy(inventoryItemsTable.category);

    const counts: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      counts[row.category] = row.count;
      total += row.count;
    }

    return {
      pets:            counts["pets"]          ?? 0,
      footballPlayers: counts["football"]      ?? 0,
      tickets:         counts["tickets"]       ?? 0,
      worldAssets:     counts["world-assets"]  ?? 0,
      items:           counts["items"]         ?? 0,
      total,
    };
  }
}
