// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceService
//
// Orchestrates listings, transactions, auctions, and bids.
// All repository dependencies are injected — no direct DB imports here.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IListingsRepository,
  ITransactionsRepository,
  IAuctionsRepository,
  IBidsRepository,
  Listing,
  ListingStatus,
  MarketplaceTransaction,
  Auction,
  AuctionStatus,
  Bid,
  CreateListingInput,
  CreateAuctionInput,
  PlaceBidInput,
} from "../repositories/marketplaceRepository";

export class MarketplaceService {
  constructor(
    private readonly listings:      IListingsRepository,
    private readonly transactions:  ITransactionsRepository,
    private readonly auctions:      IAuctionsRepository,
    private readonly bids:          IBidsRepository,
  ) {}

  // ─── Listings ──────────────────────────────────────────────────────────────

  async getListings(status?: ListingStatus, limit = 50): Promise<Listing[]> {
    return this.listings.getAll(status, limit);
  }

  async getListing(id: string): Promise<Listing | null> {
    return this.listings.getById(id);
  }

  async createListing(input: CreateListingInput): Promise<Listing> {
    if (!input.sellerId)  throw new Error("sellerId is required.");
    if (!input.itemId)    throw new Error("itemId is required.");
    if (!input.itemName)  throw new Error("itemName is required.");
    if (!input.category)  throw new Error("category is required.");
    if (!input.rarity)    throw new Error("rarity is required.");
    if (input.price <= 0) throw new Error("price must be greater than 0.");
    if (!input.currency)  throw new Error("currency is required.");
    return this.listings.create(input);
  }

  async deleteListing(id: string): Promise<boolean> {
    const listing = await this.listings.getById(id);
    if (!listing) throw new Error(`Listing ${id} not found.`);
    return this.listings.delete(id);
  }

  // ─── Transactions ──────────────────────────────────────────────────────────

  async getTransactions(limit = 50): Promise<MarketplaceTransaction[]> {
    return this.transactions.getAll(limit);
  }

  async getTransactionsByUser(userId: string, limit = 50): Promise<MarketplaceTransaction[]> {
    return this.transactions.getByUserId(userId, limit);
  }

  // ─── Auctions ──────────────────────────────────────────────────────────────

  async getAuctions(status?: AuctionStatus, limit = 50): Promise<Auction[]> {
    return this.auctions.getAll(status, limit);
  }

  async getAuction(id: string): Promise<Auction | null> {
    return this.auctions.getById(id);
  }

  async createAuction(input: CreateAuctionInput): Promise<Auction> {
    if (!input.sellerId)          throw new Error("sellerId is required.");
    if (!input.itemId)            throw new Error("itemId is required.");
    if (!input.itemName)          throw new Error("itemName is required.");
    if (!input.category)          throw new Error("category is required.");
    if (!input.rarity)            throw new Error("rarity is required.");
    if (input.startingPrice <= 0) throw new Error("startingPrice must be greater than 0.");
    if (!input.currency)          throw new Error("currency is required.");
    if (!input.endsAt)            throw new Error("endsAt is required.");

    const endsAt = new Date(input.endsAt);
    if (isNaN(endsAt.getTime()) || endsAt <= new Date()) {
      throw new Error("endsAt must be a valid future date.");
    }

    return this.auctions.create(input);
  }

  // ─── Bids ──────────────────────────────────────────────────────────────────

  async placeBid(auctionId: string, input: PlaceBidInput): Promise<{ bid: Bid; auction: Auction }> {
    const auction = await this.auctions.getById(auctionId);
    if (!auction)                   throw new Error(`Auction ${auctionId} not found.`);
    if (auction.status !== "live")  throw new Error("Auction is not active.");
    if (new Date(auction.endsAt) <= new Date()) throw new Error("Auction has ended.");
    if (!input.bidderId)            throw new Error("bidderId is required.");
    if (input.amount <= auction.currentPrice) {
      throw new Error(`Bid must exceed current price of ${auction.currentPrice} ${auction.currency}.`);
    }
    if (auction.sellerId === input.bidderId) {
      throw new Error("Seller cannot bid on their own auction.");
    }

    const bid = await this.bids.create(auctionId, input, auction.currency);
    const updatedAuction = await this.auctions.updateBid(
      auctionId,
      input.amount,
      auction.bidCount + 1,
    );

    return { bid, auction: updatedAuction ?? auction };
  }

  async getBids(auctionId: string): Promise<Bid[]> {
    return this.bids.getByAuctionId(auctionId);
  }
}
