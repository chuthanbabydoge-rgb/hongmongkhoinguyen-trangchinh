import { eq, and } from "drizzle-orm";
import { db, marketplaceWatchlistsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import type { IMarketplaceWatchlistRepository, WatchlistEntry, CreateWatchlistInput, WatchlistTargetType, PriceCheckResult } from "../marketplaceWatchlistRepository";

function rowToEntry(row: typeof marketplaceWatchlistsTable.$inferSelect): WatchlistEntry {
  return {
    id:                row.id,
    userId:            row.userId,
    targetType:        row.targetType as WatchlistTargetType,
    targetId:          row.targetId,
    itemName:          row.itemName ?? undefined,
    price:             row.price ?? undefined,
    rarity:            row.rarity ?? undefined,
    status:            row.status ?? undefined,
    watchPrice:        row.watchPrice ?? undefined,
    lastSeenPrice:     row.lastSeenPrice ?? undefined,
    priceDropCount:    row.priceDropCount,
    lastPriceChangeAt: row.lastPriceChangeAt ?? undefined,
    createdAt:         typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
  };
}

export class DrizzleWatchlistRepository implements IMarketplaceWatchlistRepository {
  async create(input: CreateWatchlistInput): Promise<{ entry: WatchlistEntry; created: boolean }> {
    const existing = await this.findEntry(input.userId, input.targetType, input.targetId);
    if (existing) return { entry: existing, created: false };
    const [inserted] = await db
      .insert(marketplaceWatchlistsTable)
      .values({
        id:             randomUUID(),
        userId:         input.userId,
        targetType:     input.targetType,
        targetId:       input.targetId,
        itemName:       input.itemName ?? null,
        price:          input.price ?? null,
        rarity:         input.rarity ?? null,
        status:         input.status ?? null,
        watchPrice:     null,
        lastSeenPrice:  input.price ?? null,
        priceDropCount: 0,
        createdAt:      new Date().toISOString(),
      })
      .returning();
    return { entry: rowToEntry(inserted!), created: true };
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(marketplaceWatchlistsTable).where(eq(marketplaceWatchlistsTable.id, id)).returning();
    return result.length > 0;
  }

  async getByUserId(userId: string): Promise<WatchlistEntry[]> {
    const rows = await db.select().from(marketplaceWatchlistsTable).where(eq(marketplaceWatchlistsTable.userId, userId));
    return rows.map(rowToEntry);
  }

  async getAll(): Promise<WatchlistEntry[]> {
    const rows = await db.select().from(marketplaceWatchlistsTable);
    return rows.map(rowToEntry);
  }

  async countByUserId(userId: string): Promise<number> {
    const rows = await db.select({ id: marketplaceWatchlistsTable.id }).from(marketplaceWatchlistsTable).where(eq(marketplaceWatchlistsTable.userId, userId));
    return rows.length;
  }

  async findEntry(userId: string, targetType: WatchlistTargetType, targetId: string): Promise<WatchlistEntry | null> {
    const rows = await db
      .select()
      .from(marketplaceWatchlistsTable)
      .where(and(
        eq(marketplaceWatchlistsTable.userId, userId),
        eq(marketplaceWatchlistsTable.targetType, targetType),
        eq(marketplaceWatchlistsTable.targetId, targetId),
      ))
      .limit(1);
    return rows[0] ? rowToEntry(rows[0]) : null;
  }

  async checkPrice(id: string, currentPrice: number): Promise<PriceCheckResult | null> {
    const rows = await db.select().from(marketplaceWatchlistsTable).where(eq(marketplaceWatchlistsTable.id, id)).limit(1);
    if (!rows[0]) return null;
    const entry = rowToEntry(rows[0]);
    const oldPrice = entry.lastSeenPrice ?? currentPrice;
    const dropped = currentPrice < oldPrice;
    const dropPct = oldPrice > 0 ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;
    if (dropped) {
      await db
        .update(marketplaceWatchlistsTable)
        .set({
          price:             currentPrice,
          lastSeenPrice:     currentPrice,
          priceDropCount:    (entry.priceDropCount ?? 0) + 1,
          lastPriceChangeAt: new Date().toISOString(),
        })
        .where(eq(marketplaceWatchlistsTable.id, id));
    }
    return { entry: { ...entry, price: currentPrice }, dropped, oldPrice, newPrice: currentPrice, dropPct };
  }

  async getPriceDropsByUserId(userId: string): Promise<WatchlistEntry[]> {
    const rows = await db.select().from(marketplaceWatchlistsTable).where(eq(marketplaceWatchlistsTable.userId, userId));
    return rows.map(rowToEntry).filter(e => (e.priceDropCount ?? 0) > 0);
  }
}
