import { randomUUID } from "crypto";
import type {
  IListingsRepository,
  ITransactionsRepository,
  IAuctionsRepository,
  IBidsRepository,
  IMarketplaceStatsRepository,
  Listing,
  MarketplaceTransaction,
  Auction,
  Bid,
  MarketplaceStats,
  ListingQueryParams,
  AuctionQueryParams,
  CreateListingInput,
  CreateAuctionInput,
  PlaceBidInput,
  ListingStatus,
  AuctionStatus,
  MarketplaceCurrency,
} from "./marketplaceRepository";
import type { IInventoryItemsMutationRepository, InventoryItemRecord } from "./inventoryItemsMutationRepository";

const now = () => new Date().toISOString();
const future = (days: number) => new Date(Date.now() + days * 864e5).toISOString();

const MOCK_LISTINGS: Listing[] = [
  { id: "lst-001", sellerId: "user-001", itemId: "inv-003", itemName: "Striker Alpha",       category: "football",     rarity: "legendary", price: 50000,  currency: "credits", status: "active",    createdAt: "2024-04-01T10:00:00Z", updatedAt: "2024-04-01T10:00:00Z", expiresAt: future(7) },
  { id: "lst-002", sellerId: "user-002", itemId: "inv-001", itemName: "Rồng Lửa",            category: "pets",         rarity: "legendary", price: 120000, currency: "credits", status: "active",    createdAt: "2024-04-02T09:00:00Z", updatedAt: "2024-04-02T09:00:00Z", expiresAt: future(5) },
  { id: "lst-003", sellerId: "user-003", itemId: "inv-005", itemName: "Đảo Thiên Hà",        category: "world-assets", rarity: "mythic",    price: 5000,   currency: "stars",   status: "active",    createdAt: "2024-04-03T08:00:00Z", updatedAt: "2024-04-03T08:00:00Z", expiresAt: future(3) },
  { id: "lst-004", sellerId: "user-001", itemId: "inv-007", itemName: "Vé Giải Vô Địch S5",  category: "tickets",      rarity: "rare",      price: 8000,   currency: "credits", status: "sold",      createdAt: "2024-03-15T12:00:00Z", updatedAt: "2024-03-16T12:00:00Z", expiresAt: null },
  { id: "lst-005", sellerId: "user-002", itemId: "inv-009", itemName: "Giáp Plasma Mk.III",  category: "items",        rarity: "legendary", price: 35000,  currency: "credits", status: "active",    createdAt: "2024-04-04T11:00:00Z", updatedAt: "2024-04-04T11:00:00Z", expiresAt: future(10) },
];

const MOCK_TRANSACTIONS: MarketplaceTransaction[] = [
  { id: "txn-001", listingId: "lst-004", buyerId: "user-002", sellerId: "user-001", itemName: "Vé Giải Vô Địch S5", price: 8000,  currency: "credits", createdAt: "2024-03-16T12:00:00Z" },
  { id: "txn-002", listingId: "lst-006", buyerId: "user-001", sellerId: "user-003", itemName: "Keeper Prime",        price: 15000, currency: "credits", createdAt: "2024-03-20T08:00:00Z" },
];

const MOCK_AUCTIONS: Auction[] = [
  { id: "auc-001", sellerId: "user-003", itemId: "inv-006", itemName: "Trạm Không Gian K7", category: "world-assets", rarity: "epic",      startingPrice: 10000, currentPrice: 12500, currency: "credits", status: "live",   bidCount: 3, startsAt: "2024-04-01T00:00:00Z", endsAt: future(2),  createdAt: "2024-04-01T00:00:00Z" },
  { id: "auc-002", sellerId: "user-001", itemId: "inv-002", itemName: "Sói Băng",            category: "pets",         rarity: "epic",      startingPrice: 20000, currentPrice: 20000, currency: "stars",   status: "live",   bidCount: 0, startsAt: "2024-04-03T00:00:00Z", endsAt: future(4),  createdAt: "2024-04-03T00:00:00Z" },
  { id: "auc-003", sellerId: "user-002", itemId: "inv-008", itemName: "Vé VIP Galaxy Cup",   category: "tickets",      rarity: "epic",      startingPrice: 5000,  currentPrice: 7200,  currency: "credits", status: "ended",  bidCount: 5, startsAt: "2024-03-01T00:00:00Z", endsAt: "2024-03-10T00:00:00Z", createdAt: "2024-03-01T00:00:00Z" },
];

const MOCK_BIDS: Bid[] = [
  { id: "bid-001", auctionId: "auc-001", bidderId: "user-001", amount: 11000, currency: "credits", createdAt: "2024-04-02T10:00:00Z" },
  { id: "bid-002", auctionId: "auc-001", bidderId: "user-002", amount: 12000, currency: "credits", createdAt: "2024-04-02T11:00:00Z" },
  { id: "bid-003", auctionId: "auc-001", bidderId: "user-001", amount: 12500, currency: "credits", createdAt: "2024-04-02T12:00:00Z" },
  { id: "bid-004", auctionId: "auc-003", bidderId: "user-001", amount: 7200,  currency: "credits", createdAt: "2024-03-09T15:00:00Z" },
];

export class MockListingsRepository implements IListingsRepository {
  private store: Listing[] = [...MOCK_LISTINGS];

  async getAll(params: ListingQueryParams = {}): Promise<Listing[]> {
    let items = [...this.store];
    if (params.status)   items = items.filter(l => l.status   === params.status);
    if (params.category) items = items.filter(l => l.category === params.category);
    if (params.rarity)   items = items.filter(l => l.rarity   === params.rarity);
    if (params.currency) items = items.filter(l => l.currency === params.currency);
    if (params.sellerId) items = items.filter(l => l.sellerId === params.sellerId);
    if (params.minPrice) items = items.filter(l => l.price >= params.minPrice!);
    if (params.maxPrice) items = items.filter(l => l.price <= params.maxPrice!);
    if (params.q)        items = items.filter(l => l.itemName.toLowerCase().includes(params.q!.toLowerCase()));
    if (params.limit)    items = items.slice(params.offset ?? 0, (params.offset ?? 0) + params.limit);
    return items;
  }

  async getById(id: string): Promise<Listing | null> {
    return this.store.find(l => l.id === id) ?? null;
  }

  async create(input: CreateListingInput): Promise<Listing> {
    const listing: Listing = {
      id:        randomUUID(),
      sellerId:  input.sellerId,
      itemId:    input.itemId,
      itemName:  input.itemName,
      category:  input.category,
      rarity:    input.rarity,
      price:     input.price,
      currency:  input.currency,
      status:    "active",
      createdAt: now(),
      updatedAt: now(),
      expiresAt: input.expiresAt ?? null,
    };
    this.store.push(listing);
    return listing;
  }

  async updateStatus(id: string, status: ListingStatus): Promise<Listing | null> {
    const l = this.store.find(l => l.id === id);
    if (!l) return null;
    l.status = status;
    l.updatedAt = now();
    return { ...l };
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.store.findIndex(l => l.id === id);
    if (idx === -1) return false;
    this.store.splice(idx, 1);
    return true;
  }
}

export class MockTransactionsRepository implements ITransactionsRepository {
  private store: MarketplaceTransaction[] = [...MOCK_TRANSACTIONS];

  async getAll(limit = 50): Promise<MarketplaceTransaction[]> {
    return [...this.store].reverse().slice(0, limit);
  }

  async getByUserId(userId: string, limit = 50): Promise<MarketplaceTransaction[]> {
    return [...this.store]
      .filter(t => t.buyerId === userId || t.sellerId === userId)
      .reverse()
      .slice(0, limit);
  }

  async create(tx: Omit<MarketplaceTransaction, "id" | "createdAt">): Promise<MarketplaceTransaction> {
    const t: MarketplaceTransaction = { id: randomUUID(), createdAt: now(), ...tx };
    this.store.push(t);
    return t;
  }
}

export class MockAuctionsRepository implements IAuctionsRepository {
  private store: Auction[] = [...MOCK_AUCTIONS];

  async getAll(params: AuctionQueryParams = {}): Promise<Auction[]> {
    let items = [...this.store];
    if (params.status)   items = items.filter(a => a.status   === params.status);
    if (params.category) items = items.filter(a => a.category === params.category);
    if (params.rarity)   items = items.filter(a => a.rarity   === params.rarity);
    if (params.currency) items = items.filter(a => a.currency === params.currency);
    if (params.sellerId) items = items.filter(a => a.sellerId === params.sellerId);
    if (params.q)        items = items.filter(a => a.itemName.toLowerCase().includes(params.q!.toLowerCase()));
    if (params.limit)    items = items.slice(params.offset ?? 0, (params.offset ?? 0) + params.limit);
    return items;
  }

  async getById(id: string): Promise<Auction | null> {
    return this.store.find(a => a.id === id) ?? null;
  }

  async getExpired(): Promise<Auction[]> {
    return this.store.filter(a => a.status === "live" && new Date(a.endsAt) < new Date());
  }

  async create(input: CreateAuctionInput): Promise<Auction> {
    const auction: Auction = {
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
      startsAt:      now(),
      endsAt:        input.endsAt,
      createdAt:     now(),
    };
    this.store.push(auction);
    return auction;
  }

  async updateBid(id: string, currentPrice: number, bidCount: number): Promise<Auction | null> {
    const a = this.store.find(a => a.id === id);
    if (!a) return null;
    a.currentPrice = currentPrice;
    a.bidCount = bidCount;
    return { ...a };
  }

  async updateStatus(id: string, status: AuctionStatus): Promise<Auction | null> {
    const a = this.store.find(a => a.id === id);
    if (!a) return null;
    a.status = status;
    return { ...a };
  }
}

export class MockBidsRepository implements IBidsRepository {
  private store: Bid[] = [...MOCK_BIDS];

  async getByAuctionId(auctionId: string, limit = 50): Promise<Bid[]> {
    return [...this.store]
      .filter(b => b.auctionId === auctionId)
      .reverse()
      .slice(0, limit);
  }

  async getHighestBid(auctionId: string): Promise<Bid | null> {
    const bids = this.store.filter(b => b.auctionId === auctionId);
    if (!bids.length) return null;
    return bids.reduce((max, b) => b.amount > max.amount ? b : max);
  }

  async create(auctionId: string, input: PlaceBidInput, currency: MarketplaceCurrency): Promise<Bid> {
    const bid: Bid = {
      id:        randomUUID(),
      auctionId,
      bidderId:  input.bidderId,
      amount:    input.amount,
      currency,
      createdAt: now(),
    };
    this.store.push(bid);
    return bid;
  }
}

export class MockMarketplaceStatsRepository implements IMarketplaceStatsRepository {
  async getStats(): Promise<MarketplaceStats> {
    return {
      totalListings:     5,
      activeListings:    4,
      soldListings:      1,
      totalAuctions:     3,
      liveAuctions:      2,
      totalTransactions: 2,
      marketVolume:      23000,
    };
  }
}

export class MockInventoryItemsMutationRepository implements IInventoryItemsMutationRepository {
  private items: Map<string, InventoryItemRecord> = new Map([
    ["inv-001", { id: "inv-001", userId: "user-002", status: "active", name: "Rồng Lửa" }],
    ["inv-002", { id: "inv-002", userId: "user-001", status: "equipped", name: "Sói Băng" }],
    ["inv-003", { id: "inv-003", userId: "user-001", status: "active", name: "Striker Alpha" }],
    ["inv-005", { id: "inv-005", userId: "user-003", status: "active", name: "Đảo Thiên Hà" }],
    ["inv-006", { id: "inv-006", userId: "user-003", status: "active", name: "Trạm Không Gian K7" }],
    ["inv-007", { id: "inv-007", userId: "user-001", status: "active", name: "Vé Giải Vô Địch S5" }],
    ["inv-008", { id: "inv-008", userId: "user-002", status: "active", name: "Vé VIP Galaxy Cup" }],
    ["inv-009", { id: "inv-009", userId: "user-002", status: "equipped", name: "Giáp Plasma Mk.III" }],
  ]);

  async getById(id: string): Promise<InventoryItemRecord | null> {
    return this.items.get(id) ?? null;
  }

  async setStatus(id: string, status: string): Promise<void> {
    const item = this.items.get(id);
    if (item) item.status = status;
  }

  async transferOwnership(id: string, newUserId: string): Promise<void> {
    const item = this.items.get(id);
    if (item) item.userId = newUserId;
  }
}
