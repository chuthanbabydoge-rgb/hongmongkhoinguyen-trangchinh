// ─────────────────────────────────────────────────────────────────────────────
// Marketplace service
// Swap the return values with DB queries when integrating a database.
// Example: return await db.query.listings.findMany({ where: eq(listings.status, "active") });
// ─────────────────────────────────────────────────────────────────────────────

import {
  MARKETPLACE,
  type MarketplaceData,
  type Listing,
  type Auction,
  type Trade,
} from "../data/marketplaceData";

export async function getMarketplace(): Promise<MarketplaceData> {
  return MARKETPLACE;
}

export async function getListings(status?: Listing["status"]): Promise<Listing[]> {
  if (status) {
    return MARKETPLACE.listings.filter((l) => l.status === status);
  }
  return MARKETPLACE.listings;
}

export async function getAuctions(status?: Auction["status"]): Promise<Auction[]> {
  if (status) {
    return MARKETPLACE.auctions.filter((a) => a.status === status);
  }
  return MARKETPLACE.auctions;
}

export async function getTrades(userId: string): Promise<Trade[]> {
  return MARKETPLACE.trades.filter(
    (t) => t.initiatorId === userId || t.receiverId === userId,
  );
}
