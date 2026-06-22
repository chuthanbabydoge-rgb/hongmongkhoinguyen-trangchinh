// ─────────────────────────────────────────────────────────────────────────────
// Marketplace service — GET /api/marketplace, /listings, /auctions
// ─────────────────────────────────────────────────────────────────────────────

import { apiFetch } from "@/lib/apiClient";

export interface ApiListing {
  id: string;
  sellerId: string;
  sellerName: string;
  itemId: string;
  itemName: string;
  itemRarity: string;
  category: string;
  price: number;
  currency: "credits" | "coins";
  status: "active" | "sold" | "cancelled" | "expired";
  listedAt: string;
}

export interface ApiAuction {
  id: string;
  sellerId: string;
  sellerName: string;
  itemId: string;
  itemName: string;
  itemRarity: string;
  startingBid: number;
  currentBid: number;
  bidCount: number;
  topBidderId: string | null;
  topBidderName: string | null;
  currency: "credits" | "coins";
  status: "live" | "ended" | "cancelled";
  endsAt: string;
  startedAt: string;
}

export interface ApiTrade {
  id: string;
  initiatorId: string;
  initiatorName: string;
  receiverId: string;
  receiverName: string;
  offeredItemId: string;
  offeredItemName: string;
  requestedItemId: string;
  requestedItemName: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
}

export interface ApiMarketplace {
  listings: ApiListing[];
  auctions: ApiAuction[];
  trades: ApiTrade[];
}

export async function fetchMarketplace(): Promise<ApiMarketplace> {
  return apiFetch<ApiMarketplace>("/marketplace");
}

export async function fetchListings(
  status?: ApiListing["status"],
): Promise<ApiListing[]> {
  const params = status ? `?status=${status}` : "";
  return apiFetch<ApiListing[]>(`/marketplace/listings${params}`);
}

export async function fetchAuctions(
  status?: ApiAuction["status"],
): Promise<ApiAuction[]> {
  const params = status ? `?status=${status}` : "";
  return apiFetch<ApiAuction[]>(`/marketplace/auctions${params}`);
}
