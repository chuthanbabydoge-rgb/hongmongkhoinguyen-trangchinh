// ─────────────────────────────────────────────────────────────────────────────
// Marketplace Repository — interfaces, types, domain models
// Tables: marketplace_listings, marketplace_transactions,
//         marketplace_auctions, marketplace_bids
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared enums ────────────────────────────────────────────────────────────

export type ListingStatus   = "active" | "sold" | "cancelled" | "expired";
export type AuctionStatus   = "live"   | "ended" | "cancelled";
export type MarketplaceCurrency = "credits" | "stars" | "eth";
export type ItemRarity      = "common" | "rare" | "epic" | "legendary" | "mythic";
export type ItemCategory    = "pets" | "football" | "world-assets" | "tickets" | "items";

// ─── Domain models ────────────────────────────────────────────────────────────

export interface Listing {
  id:         string;
  sellerId:   string;
  itemId:     string;
  itemName:   string;
  category:   ItemCategory;
  rarity:     ItemRarity;
  price:      number;
  currency:   MarketplaceCurrency;
  status:     ListingStatus;
  createdAt:  string;
  updatedAt:  string;
  expiresAt:  string | null;
}

export interface MarketplaceTransaction {
  id:         string;
  listingId:  string;
  buyerId:    string;
  sellerId:   string;
  itemName:   string;
  price:      number;
  currency:   MarketplaceCurrency;
  createdAt:  string;
}

export interface Auction {
  id:            string;
  sellerId:      string;
  itemId:        string;
  itemName:      string;
  category:      ItemCategory;
  rarity:        ItemRarity;
  startingPrice: number;
  currentPrice:  number;
  currency:      MarketplaceCurrency;
  status:        AuctionStatus;
  bidCount:      number;
  startsAt:      string;
  endsAt:        string;
  createdAt:     string;
}

export interface Bid {
  id:        string;
  auctionId: string;
  bidderId:  string;
  amount:    number;
  currency:  MarketplaceCurrency;
  createdAt: string;
}

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateListingInput {
  sellerId:  string;
  itemId:    string;
  itemName:  string;
  category:  ItemCategory;
  rarity:    ItemRarity;
  price:     number;
  currency:  MarketplaceCurrency;
  expiresAt?: string;
}

export interface CreateAuctionInput {
  sellerId:      string;
  itemId:        string;
  itemName:      string;
  category:      ItemCategory;
  rarity:        ItemRarity;
  startingPrice: number;
  currency:      MarketplaceCurrency;
  endsAt:        string;
}

export interface PlaceBidInput {
  bidderId: string;
  amount:   number;
}

// ─── Repository interfaces ────────────────────────────────────────────────────

export interface IListingsRepository {
  getAll(status?: ListingStatus, limit?: number): Promise<Listing[]>;
  getById(id: string): Promise<Listing | null>;
  create(input: CreateListingInput): Promise<Listing>;
  updateStatus(id: string, status: ListingStatus): Promise<Listing | null>;
  delete(id: string): Promise<boolean>;
}

export interface ITransactionsRepository {
  getAll(limit?: number): Promise<MarketplaceTransaction[]>;
  getByUserId(userId: string, limit?: number): Promise<MarketplaceTransaction[]>;
  create(tx: Omit<MarketplaceTransaction, "id" | "createdAt">): Promise<MarketplaceTransaction>;
}

export interface IAuctionsRepository {
  getAll(status?: AuctionStatus, limit?: number): Promise<Auction[]>;
  getById(id: string): Promise<Auction | null>;
  create(input: CreateAuctionInput): Promise<Auction>;
  updateBid(id: string, currentPrice: number, bidCount: number): Promise<Auction | null>;
  updateStatus(id: string, status: AuctionStatus): Promise<Auction | null>;
}

export interface IBidsRepository {
  getByAuctionId(auctionId: string, limit?: number): Promise<Bid[]>;
  getHighestBid(auctionId: string): Promise<Bid | null>;
  create(auctionId: string, input: PlaceBidInput, currency: MarketplaceCurrency): Promise<Bid>;
}
