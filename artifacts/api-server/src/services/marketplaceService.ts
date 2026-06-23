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
  ListingQueryParams,
  MarketplaceTransaction,
  MarketplaceStats,
  Auction,
  AuctionStatus,
  AuctionQueryParams,
  Bid,
  CreateListingInput,
  CreateAuctionInput,
  PlaceBidInput,
  PurchaseListingInput,
} from "../repositories/marketplaceRepository";
import type { IInventoryItemsMutationRepository } from "../repositories/inventoryItemsMutationRepository";
import type { IMarketplacePaymentService }        from "./marketplacePaymentService";
import type { IMarketplaceNotificationService }   from "./marketplaceNotificationService";
import type { MarketplaceReputationService }       from "./marketplaceReputationService";
import type { MarketplaceRealtimeService }         from "./marketplaceRealtimeService";

const STATUS_ACTIVE   = "đang hoạt động";
const STATUS_TRADING  = "đang giao dịch";

// Legacy English value written by the original Supabase schema;
// treat it as equivalent to STATUS_ACTIVE so existing items can still be listed.
const STATUS_ACTIVE_LEGACY = "active";

/** Statuses that explicitly block listing — any other non-active status is also blocked. */
const BLOCKED_REASON: Record<string, string> = {
  "đang giao dịch": "Vật phẩm đang được niêm yết trên thị trường.",
  "đã trang bị":    "Vật phẩm đang được trang bị, cần tháo ra trước.",
  "bị khóa":        "Vật phẩm đang bị khóa và không thể giao dịch.",
  "đã hết hạn":     "Vật phẩm đã hết hạn và không thể niêm yết.",
  "đã sử dụng":     "Vật phẩm đã được sử dụng và không thể niêm yết.",
};

function isListable(status: string): boolean {
  return status === STATUS_ACTIVE || status === STATUS_ACTIVE_LEGACY;
}

export class MarketplaceService {
  constructor(
    private readonly listings:     IListingsRepository,
    private readonly transactions: ITransactionsRepository,
    private readonly auctions:     IAuctionsRepository,
    private readonly bids:         IBidsRepository,
    private readonly stats:        IMarketplaceStatsRepository,
    private readonly inventory:    IInventoryItemsMutationRepository,
    private readonly payment:      IMarketplacePaymentService | null = null,
    private readonly notif:        IMarketplaceNotificationService | null = null,
    private readonly reputation:   MarketplaceReputationService | null = null,
    private readonly realtime:     MarketplaceRealtimeService | null = null,
  ) {}

  // ─── Stats ──────────────────────────────────────────────────────────────────

  async getStats(): Promise<MarketplaceStats> {
    return this.stats.getStats();
  }

  // ─── Listings ──────────────────────────────────────────────────────────────

  async getListings(params?: ListingQueryParams): Promise<Listing[]> {
    return this.listings.getAll(params);
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

    // ── Inventory ownership + status check ───────────────────────────────────
    const item = await this.inventory.getById(input.itemId);
    if (!item) {
      throw new Error(`Vật phẩm ${input.itemId} không tồn tại trong kho hàng.`);
    }
    if (item.userId !== input.sellerId) {
      throw new Error(
        `Người bán ${input.sellerId} không sở hữu vật phẩm ${input.itemId}.`,
      );
    }

    // Only active items may be listed — reject all blocked/unknown statuses
    if (!isListable(item.status)) {
      const reason = BLOCKED_REASON[item.status]
        ?? `Vật phẩm đang ở trạng thái "${item.status}" và không thể niêm yết.`;
      throw new Error(reason);
    }

    // ── Mark item as trading ──────────────────────────────────────────────────
    await this.inventory.setStatus(input.itemId, STATUS_TRADING);

    const listing = await this.listings.create(input);
    this.notif?.onListingCreated(listing.sellerId, listing).catch(() => {});
    this.realtime?.emit("LISTING_CREATED", { listingId: listing.id, itemName: listing.itemName, price: listing.price, currency: listing.currency, sellerId: listing.sellerId }, listing.sellerId);
    return listing;
  }

  async deleteListing(id: string): Promise<boolean> {
    const listing = await this.listings.getById(id);
    if (!listing) throw new Error(`Niêm yết ${id} không tìm thấy.`);

    const deleted = await this.listings.delete(id);

    // ── Restore item to active ────────────────────────────────────────────────
    if (deleted) {
      await this.inventory.setStatus(listing.itemId, STATUS_ACTIVE);
      this.notif?.onListingCancelled(listing.sellerId, listing).catch(() => {});
      this.realtime?.emit("LISTING_REMOVED", { listingId: listing.id, itemName: listing.itemName, sellerId: listing.sellerId }, listing.sellerId);
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

    // 1. Process wallet payment — validates balance, debits buyer, credits seller.
    //    Runs first so any balance failure aborts before touching inventory.
    if (this.payment) {
      await this.payment.processPayment({
        buyerId:    input.buyerId,
        sellerId:   listing.sellerId,
        amount:     listing.price,
        currency:   listing.currency,
        sourceType: "listing",
        sourceId:   listingId,
      });
    }

    // 2. Transfer item ownership seller → buyer + set status active
    await this.inventory.transferOwnership(listing.itemId, input.buyerId);

    // 3. Mark listing as sold
    const updatedListing = await this.listings.updateStatus(listingId, "sold");

    // 4. Record marketplace transaction
    const transaction = await this.transactions.create({
      listingId,
      buyerId:  input.buyerId,
      sellerId: listing.sellerId,
      itemName: listing.itemName,
      price:    listing.price,
      currency: listing.currency,
    });

    this.notif?.onListingSold(listing.sellerId, input.buyerId, listing).catch(() => {});
    this.reputation?.recordSale(listing.sellerId, listing.price).catch(() => {});
    this.realtime?.emit("LISTING_SOLD", { listingId: listing.id, itemName: listing.itemName, price: listing.price, currency: listing.currency, sellerId: listing.sellerId, buyerId: input.buyerId });

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

  async getAuctions(params?: AuctionQueryParams): Promise<Auction[]> {
    return this.auctions.getAll(params);
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

    // ── Inventory ownership + status check ───────────────────────────────────
    const item = await this.inventory.getById(input.itemId);
    if (!item) {
      throw new Error(`Vật phẩm ${input.itemId} không tồn tại trong kho hàng.`);
    }
    if (item.userId !== input.sellerId) {
      throw new Error(
        `Người bán ${input.sellerId} không sở hữu vật phẩm ${input.itemId}.`,
      );
    }

    // Only active items may be auctioned — blocks duplicates with marketplace listings too
    if (!isListable(item.status)) {
      const reason = BLOCKED_REASON[item.status]
        ?? `Vật phẩm đang ở trạng thái "${item.status}" và không thể đưa ra đấu giá.`;
      throw new Error(reason);
    }

    // ── Mark item as trading ──────────────────────────────────────────────────
    await this.inventory.setStatus(input.itemId, STATUS_TRADING);

    const auction = await this.auctions.create(input);
    this.notif?.onAuctionCreated(auction.sellerId, auction).catch(() => {});
    this.realtime?.emit("AUCTION_CREATED", { auctionId: auction.id, itemName: auction.itemName, startingPrice: auction.startingPrice, currency: auction.currency, sellerId: auction.sellerId }, auction.sellerId);
    return auction;
  }

  async cancelAuction(id: string): Promise<Auction> {
    const auction = await this.auctions.getById(id);
    if (!auction) throw new Error(`Phiên đấu giá ${id} không tìm thấy.`);
    if (auction.status !== "live") {
      throw new Error(
        `Phiên đấu giá ${id} không thể hủy (trạng thái: ${auction.status}).`,
      );
    }

    // ── Restore item to active for seller ─────────────────────────────────────
    await this.inventory.setStatus(auction.itemId, STATUS_ACTIVE);

    const updated = await this.auctions.updateStatus(id, "cancelled");
    this.notif?.onAuctionCancelled(auction.sellerId, auction).catch(() => {});
    this.realtime?.emit("AUCTION_CANCELLED", { auctionId: auction.id, itemName: auction.itemName, sellerId: auction.sellerId }, auction.sellerId);
    return updated ?? auction;
  }

  async completeAuction(
    id: string,
  ): Promise<{ auction: Auction; winnerId: string | null }> {
    const auction = await this.auctions.getById(id);
    if (!auction) throw new Error(`Phiên đấu giá ${id} không tìm thấy.`);
    if (auction.status !== "live") {
      throw new Error(
        `Phiên đấu giá ${id} không thể hoàn tất (trạng thái: ${auction.status}).`,
      );
    }

    const [highestBid, allBids] = await Promise.all([
      this.bids.getHighestBid(id),
      this.bids.getByAuctionId(id),
    ]);
    let winnerId: string | null = null;

    if (highestBid) {
      // 1. Process wallet payment first — validates winner balance, debits winner,
      //    credits seller.  Any failure here aborts before touching inventory.
      if (this.payment) {
        await this.payment.processPayment({
          buyerId:    highestBid.bidderId,
          sellerId:   auction.sellerId,
          amount:     highestBid.amount,
          currency:   auction.currency,
          sourceType: "auction",
          sourceId:   id,
        });
      }

      // 2. Transfer item to winner — transferOwnership sets status → "đang hoạt động"
      await this.inventory.transferOwnership(auction.itemId, highestBid.bidderId);
      winnerId = highestBid.bidderId;

      // 3. Notify winner, seller, and unique losers (fire-and-forget)
      const loserIds = [...new Set(
        allBids.map(b => b.bidderId).filter(bid => bid !== highestBid.bidderId),
      )];
      this.notif?.onAuctionCompleted(
        highestBid.bidderId,
        auction.sellerId,
        loserIds,
        { id: auction.id, itemId: auction.itemId, itemName: auction.itemName, startingPrice: auction.startingPrice, currency: auction.currency, amount: highestBid.amount },
      ).catch(() => {});
      this.reputation?.recordSale(auction.sellerId, highestBid.amount).catch(() => {});
    } else {
      // No bids — restore item to seller
      await this.inventory.setStatus(auction.itemId, STATUS_ACTIVE);
      this.notif?.onAuctionEndedNoBids(auction.sellerId, auction).catch(() => {});
    }

    const updated = await this.auctions.updateStatus(id, "ended");
    this.realtime?.emit("AUCTION_COMPLETED", { auctionId: auction.id, itemName: auction.itemName, sellerId: auction.sellerId, winnerId });
    return { auction: updated ?? auction, winnerId };
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

    this.notif?.onBidPlaced(input.bidderId, auction, input.amount).catch(() => {});
    this.realtime?.emit("BID_PLACED", { auctionId, bidderId: input.bidderId, amount: input.amount, currency: auction.currency, itemName: auction.itemName }, input.bidderId);

    return { bid, auction: updatedAuction ?? auction };
  }

  async getBids(auctionId: string): Promise<Bid[]> {
    return this.bids.getByAuctionId(auctionId);
  }

  // ─── Settle expired auctions ────────────────────────────────────────────────

  async settleExpiredAuctions(): Promise<{
    processed: number;
    completed: number;
    restored:  number;
    errors:    number;
  }> {
    const expired = await this.auctions.getExpired();

    let completed = 0;
    let restored  = 0;
    let errors    = 0;

    for (const auction of expired) {
      try {
        const { winnerId } = await this.completeAuction(auction.id);
        if (winnerId) {
          completed++;
        } else {
          restored++;
        }
      } catch {
        errors++;
      }
    }

    return { processed: expired.length, completed, restored, errors };
  }
}
