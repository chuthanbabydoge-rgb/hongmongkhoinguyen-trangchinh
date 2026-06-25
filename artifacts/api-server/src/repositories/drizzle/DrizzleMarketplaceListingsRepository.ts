import { eq, and, gte, lte, ilike, asc, desc } from "drizzle-orm";
import { db, marketplaceListingsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import type { IListingsRepository, Listing, ListingQueryParams, CreateListingInput, ListingStatus } from "../marketplaceRepository";

function rowToListing(row: typeof marketplaceListingsTable.$inferSelect): Listing {
  return {
    id:        row.id,
    sellerId:  row.sellerId,
    itemId:    row.itemId,
    itemName:  row.itemName,
    category:  row.category as Listing["category"],
    rarity:    row.rarity as Listing["rarity"],
    price:     row.price,
    currency:  row.currency as Listing["currency"],
    status:    row.status as ListingStatus,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt).toISOString(),
    expiresAt: row.expiresAt ? (typeof row.expiresAt === "string" ? row.expiresAt : new Date(row.expiresAt).toISOString()) : null,
  };
}

export class DrizzleMarketplaceListingsRepository implements IListingsRepository {
  async getAll(params: ListingQueryParams = {}): Promise<Listing[]> {
    const conditions = [];
    if (params.status)   conditions.push(eq(marketplaceListingsTable.status, params.status));
    if (params.category) conditions.push(eq(marketplaceListingsTable.category, params.category));
    if (params.rarity)   conditions.push(eq(marketplaceListingsTable.rarity, params.rarity));
    if (params.currency) conditions.push(eq(marketplaceListingsTable.currency, params.currency));
    if (params.sellerId) conditions.push(eq(marketplaceListingsTable.sellerId, params.sellerId));
    if (params.minPrice) conditions.push(gte(marketplaceListingsTable.price, params.minPrice));
    if (params.maxPrice) conditions.push(lte(marketplaceListingsTable.price, params.maxPrice));
    if (params.q)        conditions.push(ilike(marketplaceListingsTable.itemName, `%${params.q}%`));

    const sort  = params.sort  ?? "createdAt";
    const order = params.order ?? "desc";
    const col   = marketplaceListingsTable[sort as keyof typeof marketplaceListingsTable] as Parameters<typeof asc>[0] ?? marketplaceListingsTable.createdAt;
    const orderFn = order === "asc" ? asc : desc;

    let query = db.select().from(marketplaceListingsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(orderFn(col));

    if (params.limit)  query = query.limit(params.limit) as typeof query;
    if (params.offset) query = query.offset(params.offset) as typeof query;

    const rows = await query;
    return rows.map(rowToListing);
  }

  async getById(id: string): Promise<Listing | null> {
    const rows = await db.select().from(marketplaceListingsTable).where(eq(marketplaceListingsTable.id, id)).limit(1);
    return rows[0] ? rowToListing(rows[0]) : null;
  }

  async create(input: CreateListingInput): Promise<Listing> {
    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(marketplaceListingsTable)
      .values({
        id:        randomUUID(),
        sellerId:  input.sellerId,
        itemId:    input.itemId,
        itemName:  input.itemName,
        category:  input.category,
        rarity:    input.rarity,
        price:     input.price,
        currency:  input.currency,
        status:    "active",
        createdAt: now,
        updatedAt: now,
        expiresAt: input.expiresAt ?? null,
      })
      .returning();
    return rowToListing(inserted!);
  }

  async updateStatus(id: string, status: ListingStatus): Promise<Listing | null> {
    const [updated] = await db
      .update(marketplaceListingsTable)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(marketplaceListingsTable.id, id))
      .returning();
    return updated ? rowToListing(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(marketplaceListingsTable).where(eq(marketplaceListingsTable.id, id)).returning();
    return result.length > 0;
  }
}
