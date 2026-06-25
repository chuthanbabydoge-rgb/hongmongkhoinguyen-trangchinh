import { eq, desc } from "drizzle-orm";
import { db, marketplaceSellerReputationTable, marketplaceReputationRatingsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import type { IReputationRepository as IMarketplaceReputationRepository, SellerReputation, ReputationRating, RateInput } from "../marketplaceReputationRepository";

function rowToRep(row: typeof marketplaceSellerReputationTable.$inferSelect): SellerReputation {
  return {
    userId:          row.userId,
    score:           row.score,
    level:           row.level,
    totalSales:      row.totalSales,
    totalVolume:     row.totalVolume,
    positiveRatings: row.positiveRatings,
    negativeRatings: row.negativeRatings,
    createdAt:       typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
    updatedAt:       typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt).toISOString(),
  };
}

function rowToRating(row: typeof marketplaceReputationRatingsTable.$inferSelect): ReputationRating {
  return {
    id:            row.id,
    buyerId:       row.buyerId,
    sellerId:      row.sellerId,
    transactionId: row.transactionId,
    rating:        row.rating as 1 | -1,
    createdAt:     typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
  };
}

export class DrizzleMarketplaceReputationRepository implements IMarketplaceReputationRepository {
  async getByUserId(userId: string): Promise<SellerReputation | null> {
    const rows = await db.select().from(marketplaceSellerReputationTable).where(eq(marketplaceSellerReputationTable.userId, userId)).limit(1);
    return rows[0] ? rowToRep(rows[0]) : null;
  }

  async upsert(rep: SellerReputation): Promise<SellerReputation> {
    const now = new Date().toISOString();
    const [result] = await db
      .insert(marketplaceSellerReputationTable)
      .values({ ...rep, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: marketplaceSellerReputationTable.userId,
        set: {
          score:           rep.score,
          level:           rep.level,
          totalSales:      rep.totalSales,
          totalVolume:     rep.totalVolume,
          positiveRatings: rep.positiveRatings,
          negativeRatings: rep.negativeRatings,
          updatedAt:       now,
        },
      })
      .returning();
    return rowToRep(result!);
  }

  async getTopSellers(limit = 10): Promise<SellerReputation[]> {
    const rows = await db
      .select()
      .from(marketplaceSellerReputationTable)
      .orderBy(desc(marketplaceSellerReputationTable.score))
      .limit(limit);
    return rows.map(rowToRep);
  }

  async addRating(input: RateInput): Promise<ReputationRating> {
    const [inserted] = await db
      .insert(marketplaceReputationRatingsTable)
      .values({
        id:            randomUUID(),
        buyerId:       input.buyerId,
        sellerId:      input.sellerId,
        transactionId: input.transactionId,
        rating:        input.rating,
        createdAt:     new Date().toISOString(),
      })
      .returning();
    return rowToRating(inserted!);
  }

  async hasRating(buyerId: string, transactionId: string): Promise<boolean> {
    const rows = await db
      .select({ id: marketplaceReputationRatingsTable.id })
      .from(marketplaceReputationRatingsTable)
      .where(eq(marketplaceReputationRatingsTable.transactionId, transactionId))
      .limit(1);
    return rows.length > 0 && rows[0]!.id !== undefined;
  }
}
