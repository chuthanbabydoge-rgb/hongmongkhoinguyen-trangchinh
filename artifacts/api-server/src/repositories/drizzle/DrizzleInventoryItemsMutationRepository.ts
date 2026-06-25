import { eq } from "drizzle-orm";
import { db, inventoryItemsTable } from "@workspace/db";
import type { IInventoryItemsMutationRepository, InventoryItemRecord } from "../inventoryItemsMutationRepository";

export class DrizzleInventoryItemsMutationRepository implements IInventoryItemsMutationRepository {
  async getById(id: string): Promise<InventoryItemRecord | null> {
    const rows = await db
      .select({ id: inventoryItemsTable.id, userId: inventoryItemsTable.userId, status: inventoryItemsTable.status, name: inventoryItemsTable.name })
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async setStatus(id: string, status: string): Promise<void> {
    await db
      .update(inventoryItemsTable)
      .set({ status })
      .where(eq(inventoryItemsTable.id, id));
  }

  async transferOwnership(id: string, newUserId: string): Promise<void> {
    await db
      .update(inventoryItemsTable)
      .set({ userId: newUserId })
      .where(eq(inventoryItemsTable.id, id));
  }
}
