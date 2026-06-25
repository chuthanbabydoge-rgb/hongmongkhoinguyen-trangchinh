import { eq, and, desc, sql } from "drizzle-orm";
import { db, marketplaceListingsTable, marketplaceAuctionsTable, marketplaceTransactionsTable, marketplaceWatchlistsTable, marketplaceSavedSearchesTable, marketplaceSellerReputationTable } from "@workspace/db";
import type { IMarketplaceRecommendationRepository, RecommendationItem, UserPurchase, UserWatchlistEntry, UserSavedSearch, ListingFilter } from "../marketplaceRecommendationRepository";

export class DrizzleRecommendationRepository implements IMarketplaceRecommendationRepository {
  async getActiveListings(params: ListingFilter = {}): Promise<RecommendationItem[]> {
    const conditions = [eq(marketplaceListingsTable.status, "active")];
    if (params.category) conditions.push(eq(marketplaceListingsTable.category, params.category));
    if (params.rarity)   conditions.push(eq(marketplaceListingsTable.rarity, params.rarity));
    if (params.currency) conditions.push(eq(marketplaceListingsTable.currency, params.currency));

    const rows = await db
      .select()
      .from(marketplaceListingsTable)
      .where(and(...conditions))
      .orderBy(desc(marketplaceListingsTable.createdAt))
      .limit(50);

    return rows
      .filter(r => !params.excludeIds?.includes(r.id))
      .filter(r => params.minPrice === undefined || r.price >= params.minPrice)
      .filter(r => params.maxPrice === undefined || r.price <= params.maxPrice)
      .map(r => ({
        listingId: r.id,
        itemName:  r.itemName,
        category:  r.category,
        rarity:    r.rarity,
        price:     r.price,
        currency:  r.currency,
        sellerId:  r.sellerId,
        bidCount:  0,
        createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt).toISOString(),
      }));
  }

  async getActiveAuctions(limit = 10): Promise<RecommendationItem[]> {
    const rows = await db
      .select()
      .from(marketplaceAuctionsTable)
      .where(eq(marketplaceAuctionsTable.status, "live"))
      .orderBy(desc(marketplaceAuctionsTable.bidCount))
      .limit(limit);
    return rows.map(r => ({
      listingId: r.id,
      itemName:  r.itemName,
      category:  r.category,
      rarity:    r.rarity,
      price:     r.currentPrice,
      currency:  r.currency,
      sellerId:  r.sellerId,
      bidCount:  r.bidCount,
      createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt).toISOString(),
    }));
  }

  async getUserPurchases(userId: string): Promise<UserPurchase[]> {
    const txRows = await db
      .select({ listingId: marketplaceTransactionsTable.listingId })
      .from(marketplaceTransactionsTable)
      .where(eq(marketplaceTransactionsTable.buyerId, userId));

    if (!txRows.length) return [];

    const listingIds = txRows.map(r => r.listingId);
    const listings = await db.select().from(marketplaceListingsTable).where(sql`${marketplaceListingsTable.id} = ANY(${listingIds})`);
    return listings.map(l => ({ listingId: l.id, category: l.category, rarity: l.rarity }));
  }

  async getUserWatchlist(userId: string): Promise<UserWatchlistEntry[]> {
    const rows = await db
      .select()
      .from(marketplaceWatchlistsTable)
      .where(and(eq(marketplaceWatchlistsTable.userId, userId), eq(marketplaceWatchlistsTable.targetType, "listing")));
    return rows.map(r => ({ listingId: r.targetId, category: r.rarity ?? "", rarity: r.rarity ?? "" }));
  }

  async getUserSavedSearches(userId: string): Promise<UserSavedSearch[]> {
    const rows = await db
      .select()
      .from(marketplaceSavedSearchesTable)
      .where(eq(marketplaceSavedSearchesTable.userId, userId));
    return rows.map(r => ({
      category: r.category ?? undefined,
      rarity:   r.rarity ?? undefined,
      query:    r.query ?? undefined,
      minPrice: r.minPrice ?? undefined,
      maxPrice: r.maxPrice ?? undefined,
    }));
  }

  async getSellerScore(sellerId: string): Promise<number> {
    const rows = await db
      .select({ score: marketplaceSellerReputationTable.score })
      .from(marketplaceSellerReputationTable)
      .where(eq(marketplaceSellerReputationTable.userId, sellerId))
      .limit(1);
    return rows[0]?.score ?? 0;
  }
}
