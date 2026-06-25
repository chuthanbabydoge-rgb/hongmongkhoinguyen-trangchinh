import { eq } from "drizzle-orm";
import { db, marketplaceSavedSearchesTable } from "@workspace/db";
import { randomUUID } from "crypto";
import type { ISavedSearchRepository, SavedSearch, CreateSavedSearchInput, UpdateSavedSearchInput } from "../marketplaceSavedSearchRepository";

function rowToSearch(row: typeof marketplaceSavedSearchesTable.$inferSelect): SavedSearch {
  return {
    id:        row.id,
    userId:    row.userId,
    name:      row.name,
    query:     row.query ?? undefined,
    category:  row.category as SavedSearch["category"] ?? undefined,
    rarity:    row.rarity as SavedSearch["rarity"] ?? undefined,
    currency:  row.currency as SavedSearch["currency"] ?? undefined,
    minPrice:  row.minPrice ?? undefined,
    maxPrice:  row.maxPrice ?? undefined,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt).toISOString(),
  };
}

export class DrizzleSavedSearchRepository implements ISavedSearchRepository {
  async create(input: CreateSavedSearchInput): Promise<SavedSearch> {
    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(marketplaceSavedSearchesTable)
      .values({
        id:        randomUUID(),
        userId:    input.userId,
        name:      input.name,
        query:     input.query ?? null,
        category:  input.category ?? null,
        rarity:    input.rarity ?? null,
        currency:  input.currency ?? null,
        minPrice:  input.minPrice ?? null,
        maxPrice:  input.maxPrice ?? null,
        matchIds:  [],
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return rowToSearch(inserted!);
  }

  async update(id: string, patch: UpdateSavedSearchInput): Promise<SavedSearch | null> {
    const [updated] = await db
      .update(marketplaceSavedSearchesTable)
      .set({ ...patch, updatedAt: new Date().toISOString() })
      .where(eq(marketplaceSavedSearchesTable.id, id))
      .returning();
    return updated ? rowToSearch(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(marketplaceSavedSearchesTable).where(eq(marketplaceSavedSearchesTable.id, id)).returning();
    return result.length > 0;
  }

  async findById(id: string): Promise<SavedSearch | null> {
    const rows = await db.select().from(marketplaceSavedSearchesTable).where(eq(marketplaceSavedSearchesTable.id, id)).limit(1);
    return rows[0] ? rowToSearch(rows[0]) : null;
  }

  async findByUser(userId: string): Promise<SavedSearch[]> {
    const rows = await db.select().from(marketplaceSavedSearchesTable).where(eq(marketplaceSavedSearchesTable.userId, userId));
    return rows.map(rowToSearch);
  }

  async getAll(): Promise<SavedSearch[]> {
    const rows = await db.select().from(marketplaceSavedSearchesTable);
    return rows.map(rowToSearch);
  }

  async getMatchIds(id: string): Promise<string[]> {
    const rows = await db.select({ matchIds: marketplaceSavedSearchesTable.matchIds }).from(marketplaceSavedSearchesTable).where(eq(marketplaceSavedSearchesTable.id, id)).limit(1);
    return (rows[0]?.matchIds as string[]) ?? [];
  }

  async setMatchIds(id: string, ids: string[]): Promise<void> {
    await db.update(marketplaceSavedSearchesTable).set({ matchIds: ids }).where(eq(marketplaceSavedSearchesTable.id, id));
  }
}
