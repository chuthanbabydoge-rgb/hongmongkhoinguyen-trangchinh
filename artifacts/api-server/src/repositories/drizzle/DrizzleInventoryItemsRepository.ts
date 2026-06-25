import { and, eq, sql } from "drizzle-orm";
import { db, inventoryItemsTable } from "@workspace/db";
import type {
  IInventoryItemsRepository,
  InventoryItem,
  InventorySummary,
  ItemFilters,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
} from "../inventoryItemsRepository";

function rowToItem(row: typeof inventoryItemsTable.$inferSelect): InventoryItem {
  return {
    id:          row.id,
    category:    row.category as InventoryItem["category"],
    name:        row.name,
    description: row.description ?? null,
    rarity:      row.rarity as InventoryItem["rarity"],
    status:      row.status as InventoryItem["status"],
    quantity:    row.quantity ?? 1,
    image:       row.image ?? null,
    metadata:    (row.metadata as Record<string, unknown> | null) ?? null,
    acquiredAt:  typeof row.acquiredAt === "string" ? row.acquiredAt : new Date(row.acquiredAt).toISOString(),
  };
}

export class DrizzleInventoryItemsRepository implements IInventoryItemsRepository {
  async getItems(userId: string, filters: ItemFilters = {}, limit = 50): Promise<InventoryItem[]> {
    const conditions = [eq(inventoryItemsTable.userId, userId)];
    if (filters.category) conditions.push(eq(inventoryItemsTable.category, filters.category));
    if (filters.rarity)   conditions.push(eq(inventoryItemsTable.rarity,   filters.rarity));
    if (filters.status)   conditions.push(eq(inventoryItemsTable.status,   filters.status));

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

  async getById(id: string, userId: string): Promise<InventoryItem | null> {
    const rows = await db
      .select()
      .from(inventoryItemsTable)
      .where(and(eq(inventoryItemsTable.id, userId ? inventoryItemsTable.id : inventoryItemsTable.id), eq(inventoryItemsTable.id, id)))
      .limit(1);
    if (!rows[0]) return null;
    const item = rowToItem(rows[0]);
    if (rows[0].userId !== userId) return null;
    return item;
  }

  async create(userId: string, input: CreateInventoryItemInput): Promise<InventoryItem> {
    const id  = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(inventoryItemsTable).values({
      id,
      userId,
      category:    input.category,
      name:        input.name,
      description: input.description ?? null,
      rarity:      input.rarity,
      status:      input.status ?? "active",
      quantity:    input.quantity ?? 1,
      image:       input.image ?? null,
      metadata:    input.metadata ?? null,
      acquiredAt:  now,
    });
    const rows = await db.select().from(inventoryItemsTable).where(eq(inventoryItemsTable.id, id)).limit(1);
    return rowToItem(rows[0]!);
  }

  async update(id: string, userId: string, input: UpdateInventoryItemInput): Promise<InventoryItem | null> {
    const existing = await this.getById(id, userId);
    if (!existing) return null;

    const patch: Partial<typeof inventoryItemsTable.$inferInsert> = {};
    if (input.name        !== undefined) patch.name        = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.rarity      !== undefined) patch.rarity      = input.rarity;
    if (input.status      !== undefined) patch.status      = input.status;
    if (input.quantity    !== undefined) patch.quantity    = input.quantity;
    if (input.image       !== undefined) patch.image       = input.image;
    if (input.metadata    !== undefined) patch.metadata    = input.metadata;

    if (Object.keys(patch).length === 0) return existing;

    await db.update(inventoryItemsTable).set(patch).where(eq(inventoryItemsTable.id, id));
    const rows = await db.select().from(inventoryItemsTable).where(eq(inventoryItemsTable.id, id)).limit(1);
    return rows[0] ? rowToItem(rows[0]) : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.getById(id, userId);
    if (!existing) return false;
    await db.delete(inventoryItemsTable).where(eq(inventoryItemsTable.id, id));
    return true;
  }
}
