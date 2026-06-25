import { eq, desc, sql } from "drizzle-orm";
import { db, marketplaceBidsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import type { IBidsRepository, Bid, PlaceBidInput, MarketplaceCurrency } from "../marketplaceRepository";

function rowToBid(row: typeof marketplaceBidsTable.$inferSelect): Bid {
  return {
    id:        row.id,
    auctionId: row.auctionId,
    bidderId:  row.bidderId,
    amount:    row.amount,
    currency:  row.currency as MarketplaceCurrency,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
  };
}

export class DrizzleMarketplaceBidsRepository implements IBidsRepository {
  async getByAuctionId(auctionId: string, limit = 50): Promise<Bid[]> {
    const rows = await db
      .select()
      .from(marketplaceBidsTable)
      .where(eq(marketplaceBidsTable.auctionId, auctionId))
      .orderBy(desc(marketplaceBidsTable.createdAt))
      .limit(limit);
    return rows.map(rowToBid);
  }

  async getHighestBid(auctionId: string): Promise<Bid | null> {
    const rows = await db
      .select()
      .from(marketplaceBidsTable)
      .where(eq(marketplaceBidsTable.auctionId, auctionId))
      .orderBy(desc(marketplaceBidsTable.amount))
      .limit(1);
    return rows[0] ? rowToBid(rows[0]) : null;
  }

  async create(auctionId: string, input: PlaceBidInput, currency: MarketplaceCurrency): Promise<Bid> {
    const [inserted] = await db
      .insert(marketplaceBidsTable)
      .values({
        id:        randomUUID(),
        auctionId,
        bidderId:  input.bidderId,
        amount:    input.amount,
        currency,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return rowToBid(inserted!);
  }
}
