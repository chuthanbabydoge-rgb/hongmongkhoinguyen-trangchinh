// ─── Currency ─────────────────────────────────────────────────────────────────

export type MarketCurrency = "CR" | "COIN" | "TOKEN";

export const CURRENCY_META: Record<MarketCurrency, { label: string; symbol: string; color: string }> = {
  CR:    { label: "Credits",  symbol: "CR",    color: "text-emerald-400" },
  COIN:  { label: "Xu",      symbol: "XU",    color: "text-amber-400" },
  TOKEN: { label: "Token",   symbol: "TK",    color: "text-purple-400" },
};

// ─── Category ─────────────────────────────────────────────────────────────────

export type MarketCategory = "pets" | "football" | "world-assets" | "tickets" | "items";

// ─── Listing ──────────────────────────────────────────────────────────────────

export type ListingStatus = "active" | "sold" | "expired" | "cancelled";

export interface Listing {
  id: string;
  itemId: string;
  itemName: string;
  category: MarketCategory;
  seller: string;
  price: number;
  currency: MarketCurrency;
  status: ListingStatus;
  createdAt: string;
}

// ─── Auction ──────────────────────────────────────────────────────────────────

export type AuctionStatus = "active" | "ended" | "cancelled";

export interface Auction {
  id: string;
  itemId: string;
  itemName: string;
  currentBid: number;
  minimumBid: number;
  endDate: string;
  status: AuctionStatus;
}

// ─── Trade ────────────────────────────────────────────────────────────────────

export type TradeStatus = "pending" | "accepted" | "declined" | "cancelled" | "expired";

export interface Trade {
  id: string;
  offeredItem: string;
  requestedItem: string;
  status: TradeStatus;
}
