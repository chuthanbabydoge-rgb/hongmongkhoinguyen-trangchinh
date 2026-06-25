import { eq, and, gte, lte, ilike, lt, asc, desc } from "drizzle-orm";
import { db, marketplaceAuctionsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import type { IAuctionsRepository, Auction, AuctionQueryParams, CreateAuctionInput, AuctionStatus } from "../marketplaceRepository";

function rowToAuction(row: typeof marketplaceAuctionsTable.$inferSelect): Auction {
  return {
    id:            row.id,
    sellerId:      row.sellerId,
    itemId:        row.itemId,
    itemName:      row.itemName,
    category:      row.category as Auction["category"],
    rarity:        row.rarity as Auction["rarity"],
    startingPrice: row.startingPrice,
    currentPrice:  row.currentPrice,
    currency:      row.currency as Auction["currency"],
    status:        row.status as AuctionStatus,
    bidCount:      row.bidCount,
    startsAt:      typeof row.startsAt === "string" ? row.startsAt : new Date(row.startsAt).toISOString(),
    endsAt:        typeof row.endsAt === "string" ? row.endsAt : new Date(row.endsAt).toISOString(),
    createdAt:     typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
  };
}

export class DrizzleMarketplaceAuctionsRepository implements IAuctionsRepository {
  async getAll(params: AuctionQueryParams = {}): Promise<Auction[]> {
    const conditions = [];
    if (params.status)   conditions.push(eq(marketplaceAuctionsTable.status, params.status));
    if (params.category) conditions.push(eq(marketplaceAuctionsTable.category, params.category));
    if (params.rarity)   conditions.push(eq(marketplaceAuctionsTable.rarity, params.rarity));
    if (params.currency) conditions.push(eq(marketplaceAuctionsTable.currency, params.currency));
    if (params.sellerId) conditions.push(eq(marketplaceAuctionsTable.sellerId, params.sellerId));
    if (params.minPrice) conditions.push(gte(marketplaceAuctionsTable.currentPrice, params.minPrice));
    if (params.maxPrice) conditions.push(lte(marketplaceAuctionsTable.currentPrice, params.maxPrice));
    if (params.q)        conditions.push(ilike(marketplaceAuctionsTable.itemName, `%${params.q}%`));

    const sort  = params.sort  ?? "createdAt";
    const order = params.order ?? "desc";
    const colMap: Record<string, Parameters<typeof asc>[0]> = {
      createdAt:    marketplaceAuctionsTable.createdAt,
      currentPrice: marketplaceAuctionsTable.currentPrice,
      bidCount:     marketplaceAuctionsTable.bidCount,
      endsAt:       marketplaceAuctionsTable.endsAt,
      itemName:     marketplaceAuctionsTable.itemName,
      rarity:       marketplaceAuctionsTable.rarity,
      price:        marketplaceAuctionsTable.currentPrice,
    };
    const col = colMap[sort] ?? marketplaceAuctionsTable.createdAt;
    const orderFn = order === "asc" ? asc : desc;

    let query = db.select().from(marketplaceAuctionsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(orderFn(col));

    if (params.limit)  query = query.limit(params.limit) as typeof query;
    if (params.offset) query = query.offset(params.offset) as typeof query;

    const rows = await query;
    return rows.map(rowToAuction);
  }

  async getById(id: string): Promise<Auction | null> {
    const rows = await db.select().from(marketplaceAuctionsTable).where(eq(marketplaceAuctionsTable.id, id)).limit(1);
    return rows[0] ? rowToAuction(rows[0]) : null;
  }

  async getExpired(): Promise<Auction[]> {
    const rows = await db
      .select()
      .from(marketplaceAuctionsTable)
      .where(and(
        eq(marketplaceAuctionsTable.status, "live"),
        lt(marketplaceAuctionsTable.endsAt, new Date().toISOString()),
      ));
    return rows.map(rowToAuction);
  }

  async create(input: CreateAuctionInput): Promise<Auction> {
    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(marketplaceAuctionsTable)
      .values({
        id:            randomUUID(),
        sellerId:      input.sellerId,
        itemId:        input.itemId,
        itemName:      input.itemName,
        category:      input.category,
        rarity:        input.rarity,
        startingPrice: input.startingPrice,
        currentPrice:  input.startingPrice,
        currency:      input.currency,
        status:        "live",
        bidCount:      0,
        startsAt:      now,
        endsAt:        input.endsAt,
        createdAt:     now,
      })
      .returning();
    return rowToAuction(inserted!);
  }

  async updateBid(id: string, currentPrice: number, bidCount: number): Promise<Auction | null> {
    const [updated] = await db
      .update(marketplaceAuctionsTable)
      .set({ currentPrice, bidCount })
      .where(eq(marketplaceAuctionsTable.id, id))
      .returning();
    return updated ? rowToAuction(updated) : null;
  }

  async updateStatus(id: string, status: AuctionStatus): Promise<Auction | null> {
    const [updated] = await db
      .update(marketplaceAuctionsTable)
      .set({ status })
      .where(eq(marketplaceAuctionsTable.id, id))
      .returning();
    return updated ? rowToAuction(updated) : null;
  }
}
