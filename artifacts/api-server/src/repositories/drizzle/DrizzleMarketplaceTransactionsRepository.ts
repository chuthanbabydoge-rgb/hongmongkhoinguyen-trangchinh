import { eq, or, desc } from "drizzle-orm";
import { db, marketplaceTransactionsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import type { ITransactionsRepository, MarketplaceTransaction } from "../marketplaceRepository";

function rowToTx(row: typeof marketplaceTransactionsTable.$inferSelect): MarketplaceTransaction {
  return {
    id:        row.id,
    listingId: row.listingId,
    buyerId:   row.buyerId,
    sellerId:  row.sellerId,
    itemName:  row.itemName,
    price:     row.price,
    currency:  row.currency as MarketplaceTransaction["currency"],
    createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
  };
}

export class DrizzleMarketplaceTransactionsRepository implements ITransactionsRepository {
  async getAll(limit = 50): Promise<MarketplaceTransaction[]> {
    const rows = await db
      .select()
      .from(marketplaceTransactionsTable)
      .orderBy(desc(marketplaceTransactionsTable.createdAt))
      .limit(limit);
    return rows.map(rowToTx);
  }

  async getByUserId(userId: string, limit = 50): Promise<MarketplaceTransaction[]> {
    const rows = await db
      .select()
      .from(marketplaceTransactionsTable)
      .where(or(
        eq(marketplaceTransactionsTable.buyerId, userId),
        eq(marketplaceTransactionsTable.sellerId, userId),
      ))
      .orderBy(desc(marketplaceTransactionsTable.createdAt))
      .limit(limit);
    return rows.map(rowToTx);
  }

  async create(tx: Omit<MarketplaceTransaction, "id" | "createdAt">): Promise<MarketplaceTransaction> {
    const [inserted] = await db
      .insert(marketplaceTransactionsTable)
      .values({
        id:        randomUUID(),
        listingId: tx.listingId,
        buyerId:   tx.buyerId,
        sellerId:  tx.sellerId,
        itemName:  tx.itemName,
        price:     tx.price,
        currency:  tx.currency,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return rowToTx(inserted!);
  }
}
