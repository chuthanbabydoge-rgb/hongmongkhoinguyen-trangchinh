import { eq } from "drizzle-orm";
import { db, inventoryReferencesTable } from "@workspace/db";
import type { IInventoryRepository } from "../inventoryRepository";
import type { InventoryReference, InventoryItemCounts } from "../../models/inventoryReference";

function rowToRef(row: typeof inventoryReferencesTable.$inferSelect): InventoryReference {
  return {
    userId:      row.userId,
    inventoryId: row.inventoryId,
    itemCounts: {
      pets:          row.countPets,
      players:       row.countPlayers,
      tickets:       row.countTickets,
      digitalAssets: row.countDigital,
      items:         row.countItems,
      total:         row.countTotal,
    },
    lastSyncedAt: typeof row.lastSyncedAt === "string" ? row.lastSyncedAt : new Date(row.lastSyncedAt).toISOString(),
  };
}

export class DrizzleInventoryRepository implements IInventoryRepository {
  async getByUserId(userId: string): Promise<InventoryReference | null> {
    const rows = await db.select().from(inventoryReferencesTable).where(eq(inventoryReferencesTable.userId, userId)).limit(1);
    return rows[0] ? rowToRef(rows[0]) : null;
  }

  async create(ref: InventoryReference): Promise<InventoryReference> {
    const [inserted] = await db
      .insert(inventoryReferencesTable)
      .values({
        userId:       ref.userId,
        inventoryId:  ref.inventoryId,
        countPets:    ref.itemCounts.pets,
        countPlayers: ref.itemCounts.players,
        countTickets: ref.itemCounts.tickets,
        countDigital: ref.itemCounts.digitalAssets,
        countItems:   ref.itemCounts.items,
        countTotal:   ref.itemCounts.total,
        lastSyncedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: inventoryReferencesTable.userId,
        set: {
          inventoryId:  ref.inventoryId,
          countPets:    ref.itemCounts.pets,
          countPlayers: ref.itemCounts.players,
          countTickets: ref.itemCounts.tickets,
          countDigital: ref.itemCounts.digitalAssets,
          countItems:   ref.itemCounts.items,
          countTotal:   ref.itemCounts.total,
          lastSyncedAt: new Date().toISOString(),
        },
      })
      .returning();
    return rowToRef(inserted!);
  }

  async update(ref: InventoryReference): Promise<InventoryReference | null> {
    const [updated] = await db
      .update(inventoryReferencesTable)
      .set({
        inventoryId:  ref.inventoryId,
        countPets:    ref.itemCounts.pets,
        countPlayers: ref.itemCounts.players,
        countTickets: ref.itemCounts.tickets,
        countDigital: ref.itemCounts.digitalAssets,
        countItems:   ref.itemCounts.items,
        countTotal:   ref.itemCounts.total,
        lastSyncedAt: new Date().toISOString(),
      })
      .where(eq(inventoryReferencesTable.userId, ref.userId))
      .returning();
    return updated ? rowToRef(updated) : null;
  }

  async syncCounts(userId: string, counts: InventoryItemCounts): Promise<InventoryReference | null> {
    const [updated] = await db
      .update(inventoryReferencesTable)
      .set({
        countPets:    counts.pets,
        countPlayers: counts.players,
        countTickets: counts.tickets,
        countDigital: counts.digitalAssets,
        countItems:   counts.items,
        countTotal:   counts.total,
        lastSyncedAt: new Date().toISOString(),
      })
      .where(eq(inventoryReferencesTable.userId, userId))
      .returning();
    return updated ? rowToRef(updated) : null;
  }

  async delete(userId: string): Promise<boolean> {
    const result = await db.delete(inventoryReferencesTable).where(eq(inventoryReferencesTable.userId, userId)).returning();
    return result.length > 0;
  }
}
