// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceService
//
// Orchestrates listings, transactions, auctions, bids, and inventory sync.
// All repository dependencies are injected — no direct DB imports here.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IListingsRepository,
  ITransactionsRepository,
  IAuctionsRepository,
  IBidsRepository,
  IMarketplaceStatsRepository,
  Listing,
  ListingStatus,
  MarketplaceTransaction,
  MarketplaceStats,
  Auction,
  AuctionStatus,
  Bid,
  CreateListingInput,
  CreateAuctionInput,
  PlaceBidInput,
  PurchaseListingInput,
} from "../repositories/marketplaceRepository";
import type { IInventoryItemsMutationRepository } from "../repositories/inventoryItemsMutationRepository";

const STATUS_TRADING = "đang giao dịch";
const STATUS_ACTIVE  = "đang hoạt động";

export class MarketplaceService {
  constructor(
    private readonly listings:     IListingsRepository,
    private readonly transactions: ITransactionsRepository,
    private readonly auctions:     IAuctionsRepository,
    private readonly bids:         IBidsRepository,
    private readonly stats:        IMarketplaceStatsRepository,
    private readonly inventory:    IInventoryItemsMutationRepository,
  ) {}

  // ─── Stats ──────────────────────────────────────────────────────────────────

  async getStats(): Promise<MarketplaceStats> {
    return this.stats.getStats();
  }

  // ─── Listings ──────────────────────────────────────────────────────────────

  async getListings(status?: ListingStatus, limit = 50): Promise<Listing[]> {
    return this.listings.getAll(status, limit);
  }

  async getListing(id: string): Promise<Listing | null> {
    return this.listings.getById(id);
  }

  async createListing(input: CreateListingInput): Promise<Listing> {
    if (!input.sellerId)  throw new Error("sellerId là bắt buộc.");
    if (!input.itemId)    throw new Error("itemId là bắt buộc.");
    if (!input.itemName)  throw new Error("itemName là bắt buộc.");
    if (!input.category)  throw new Error("category là bắt buộc.");
    if (!input.rarity)    throw new Error("rarity là bắt buộc.");
    if (input.price <= 0) throw new Error("price phải lớn hơn 0.");
    if (!input.currency)  throw new Error("currency là bắt buộc.");

    // ── Inventory ownership check ─────────────────────────────────────────────
    const item = await this.inventory.getById(input.itemId);
    if (!item) {
      throw new Error(`Vật phẩm ${input.itemId} không tồn tại trong kho hàng.`);
    }
    if (item.userId !== input.sellerId) {
      throw new Error(
        `Người bán ${input.sellerId} không sở hữu vật phẩm ${input.itemId}.`,
      );
    }

    // ── Mark item as trading ──────────────────────────────────────────────────
    await this.inventory.setStatus(input.itemId, STATUS_TRADING);

    return this.listings.create(input);
  }

  async deleteListing(id: string): Promise<boolean> {
    const listing = await this.listings.getById(id);
    if (!listing) throw new Error(`Niêm yết ${id} không tìm thấy.`);

    const deleted = await this.listings.delete(id);

    // ── Restore item to active ────────────────────────────────────────────────
    if (deleted) {
      await this.inventory.setStatus(listing.itemId, STATUS_ACTIVE);
    }

    return deleted;
  }

  // ─── Purchase (complete transaction) ───────────────────────────────────────

  async purchaseListing(
    listingId: string,
    input: PurchaseListingInput,
  ): Promise<{ transaction: MarketplaceTransaction; listing: Listing }> {
    if (!input.buyerId) throw new Error("buyerId là bắt buộc.");

    const listing = await this.listings.getById(listingId);
    if (!listing) throw new Error(`Niêm yết ${listingId} không tìm thấy.`);
    if (listing.status !== "active") {
      throw new Error(`Niêm yết ${listingId} không còn hoạt động (trạng thái: ${listing.status}).`);
    }
    if (listing.sellerId === input.buyerId) {
      throw new Error("Người bán không thể mua chính niêm yết của mình.");
    }

    // 1. Transfer item ownership seller → buyer + set status active
    await this.inventory.transferOwnership(listing.itemId, input.buyerId);

    // 2. Mark listing as sold
    const updatedListing = await this.listings.updateStatus(listingId, "sold");

    // 3. Record transaction
    const transaction = await this.transactions.create({
      listingId,
      buyerId:  input.buyerId,
      sellerId: listing.sellerId,
      itemName: listing.itemName,
      price:    listing.price,
      currency: listing.currency,
    });

    return { transaction, listing: updatedListing ?? listing };
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
    if (!input.sellerId)          throw new Error("sellerId là bắt buộc.");
    if (!input.itemId)            throw new Error("itemId là bắt buộc.");
    if (!input.itemName)          throw new Error("itemName là bắt buộc.");
    if (!input.category)          throw new Error("category là bắt buộc.");
    if (!input.rarity)            throw new Error("rarity là bắt buộc.");
    if (input.startingPrice <= 0) throw new Error("startingPrice phải lớn hơn 0.");
    if (!input.currency)          throw new Error("currency là bắt buộc.");
    if (!input.endsAt)            throw new Error("endsAt là bắt buộc.");

    const endsAt = new Date(input.endsAt);
    if (isNaN(endsAt.getTime()) || endsAt <= new Date()) {
      throw new Error("endsAt phải là ngày hợp lệ trong tương lai.");
    }

    return this.auctions.create(input);
  }

  // ─── Bids ──────────────────────────────────────────────────────────────────

  async placeBid(auctionId: string, input: PlaceBidInput): Promise<{ bid: Bid; auction: Auction }> {
    const auction = await this.auctions.getById(auctionId);
    if (!auction)                  throw new Error(`Phiên đấu giá ${auctionId} không tìm thấy.`);
    if (auction.status !== "live") throw new Error("Phiên đấu giá không còn hoạt động.");
    if (new Date(auction.endsAt) <= new Date()) throw new Error("Phiên đấu giá đã kết thúc.");
    if (!input.bidderId)           throw new Error("bidderId là bắt buộc.");
    if (input.amount <= auction.currentPrice) {
      throw new Error(`Giá đặt phải vượt quá giá hiện tại ${auction.currentPrice} ${auction.currency}.`);
    }
    if (auction.sellerId === input.bidderId) {
      throw new Error("Người bán không thể đặt giá trên phiên đấu giá của chính mình.");
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
