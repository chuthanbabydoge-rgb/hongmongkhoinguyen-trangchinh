// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceNotificationService
//
// Handles CRUD for user notifications and provides typed domain-event methods
// called fire-and-forget by MarketplaceService after each operation.
//
// Event methods never throw — callers wrap with .catch(() => {}) to ensure
// notification failures never abort the primary marketplace operation.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IMarketplaceNotificationRepository,
  MarketplaceNotification,
  NotificationType,
} from "../repositories/marketplaceNotificationRepository";
import type { MarketplaceRealtimeService } from "./marketplaceRealtimeService";

// ─── Lightweight event payloads (avoid circular deps with full model types) ───

export interface ListingPayload  { id: string; itemId: string; itemName: string; price: number; currency: string; }
export interface AuctionPayload  { id: string; itemId: string; itemName: string; startingPrice: number; currency: string; }
export interface AuctionWinPayload extends AuctionPayload { amount: number; }

// ─── Interface ────────────────────────────────────────────────────────────────

export interface PriceDropPayload {
  targetId:   string;
  targetType: string;
  itemName:   string;
  oldPrice:   number;
  newPrice:   number;
  dropPct:    number;
}

export interface SavedSearchMatchPayload {
  searchId:   string;
  searchName: string;
  listingId:  string;
  itemName:   string;
  price:      number;
  currency:   string;
}

export interface IMarketplaceNotificationService {
  getNotifications(userId: string, limit?: number, offset?: number): Promise<{ data: MarketplaceNotification[]; total: number }>;
  getUnread(userId: string): Promise<MarketplaceNotification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(id: string): Promise<MarketplaceNotification | null>;
  markAllAsRead(userId: string): Promise<number>;
  delete(id: string): Promise<boolean>;

  // ── Domain events ──────────────────────────────────────────────────────────
  onListingCreated(sellerId: string, listing: ListingPayload): Promise<void>;
  onListingCancelled(sellerId: string, listing: Pick<ListingPayload, "id" | "itemId" | "itemName">): Promise<void>;
  onListingSold(sellerId: string, buyerId: string, listing: ListingPayload): Promise<void>;
  onAuctionCreated(sellerId: string, auction: AuctionPayload): Promise<void>;
  onAuctionCancelled(sellerId: string, auction: Pick<AuctionPayload, "id" | "itemId" | "itemName">): Promise<void>;
  onBidPlaced(bidderId: string, auction: Pick<AuctionWinPayload, "id" | "itemId" | "itemName" | "currency">, amount: number): Promise<void>;
  onAuctionCompleted(winnerId: string, sellerId: string, loserIds: string[], auction: AuctionWinPayload): Promise<void>;
  onAuctionEndedNoBids(sellerId: string, auction: Pick<AuctionPayload, "id" | "itemId" | "itemName">): Promise<void>;
  onPriceDrop(userId: string, payload: PriceDropPayload): Promise<void>;
  onSavedSearchMatch(userId: string, payload: SavedSearchMatchPayload): Promise<void>;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketplaceNotificationService implements IMarketplaceNotificationService {
  constructor(
    private readonly repo:     IMarketplaceNotificationRepository,
    private readonly realtime: MarketplaceRealtimeService | null = null,
  ) {}

  // ── CRUD ──────────────────────────────────────────────────────────────────

  getNotifications(userId: string, limit = 50, offset = 0) {
    return this.repo.getByUserId(userId, limit, offset);
  }

  getUnread(userId: string) {
    return this.repo.getUnreadByUserId(userId);
  }

  getUnreadCount(userId: string) {
    return this.repo.getUnreadCount(userId);
  }

  markAsRead(id: string) {
    return this.repo.markAsRead(id);
  }

  markAllAsRead(userId: string) {
    return this.repo.markAllAsRead(userId);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }

  // ── Internal helper ───────────────────────────────────────────────────────

  private async emit(
    userId: string,
    type:   NotificationType,
    title:  string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const notification = await this.repo.create({ userId, type, title, message, metadata });
    this.realtime?.emit("NOTIFICATION_CREATED", { notificationId: notification.id, type, title, message, metadata }, userId);
  }

  // ── Domain events ─────────────────────────────────────────────────────────

  async onListingCreated(sellerId: string, listing: ListingPayload): Promise<void> {
    await this.emit(
      sellerId,
      "LISTING_CREATED",
      "Niêm yết thành công",
      `${listing.itemName} đã được niêm yết với giá ${listing.price} ${listing.currency}`,
      { listingId: listing.id, itemId: listing.itemId, amount: listing.price, currency: listing.currency },
    );
  }

  async onListingCancelled(sellerId: string, listing: Pick<ListingPayload, "id" | "itemId" | "itemName">): Promise<void> {
    await this.emit(
      sellerId,
      "LISTING_CANCELLED",
      "Niêm yết đã hủy",
      `Niêm yết ${listing.itemName} đã được hủy`,
      { listingId: listing.id, itemId: listing.itemId },
    );
  }

  async onListingSold(sellerId: string, buyerId: string, listing: ListingPayload): Promise<void> {
    await Promise.all([
      // Seller: LISTING_SOLD + PAYMENT_RECEIVED
      this.emit(
        sellerId,
        "LISTING_SOLD",
        "Vật phẩm đã bán",
        `${listing.itemName} đã được bán với giá ${listing.price} ${listing.currency}`,
        { listingId: listing.id, itemId: listing.itemId, amount: listing.price, currency: listing.currency },
      ),
      this.emit(
        sellerId,
        "PAYMENT_RECEIVED",
        "Đã nhận thanh toán",
        `Bạn đã nhận thanh toán cho ${listing.itemName}`,
        { listingId: listing.id, itemId: listing.itemId, amount: listing.price, currency: listing.currency },
      ),
      // Buyer: PAYMENT_SENT
      this.emit(
        buyerId,
        "PAYMENT_SENT",
        "Thanh toán đã gửi",
        `Bạn đã mua ${listing.itemName} với giá ${listing.price} ${listing.currency}`,
        { listingId: listing.id, itemId: listing.itemId, amount: listing.price, currency: listing.currency },
      ),
    ]);
  }

  async onAuctionCreated(sellerId: string, auction: AuctionPayload): Promise<void> {
    await this.emit(
      sellerId,
      "AUCTION_CREATED",
      "Phiên đấu giá đã tạo",
      `${auction.itemName} đã được đưa ra đấu giá từ ${auction.startingPrice} ${auction.currency}`,
      { auctionId: auction.id, itemId: auction.itemId, amount: auction.startingPrice, currency: auction.currency },
    );
  }

  async onAuctionCancelled(sellerId: string, auction: Pick<AuctionPayload, "id" | "itemId" | "itemName">): Promise<void> {
    await this.emit(
      sellerId,
      "AUCTION_CANCELLED",
      "Phiên đấu giá đã hủy",
      `Phiên đấu giá ${auction.itemName} đã được hủy`,
      { auctionId: auction.id, itemId: auction.itemId },
    );
  }

  async onBidPlaced(
    bidderId: string,
    auction:  Pick<AuctionWinPayload, "id" | "itemId" | "itemName" | "currency">,
    amount:   number,
  ): Promise<void> {
    await this.emit(
      bidderId,
      "BID_PLACED",
      "Đặt giá thành công",
      `Bạn đã đặt giá ${amount} ${auction.currency} cho ${auction.itemName}`,
      { auctionId: auction.id, itemId: auction.itemId, amount, currency: auction.currency },
    );
  }

  async onAuctionCompleted(
    winnerId:  string,
    sellerId:  string,
    loserIds:  string[],
    auction:   AuctionWinPayload,
  ): Promise<void> {
    const notifications: Promise<void>[] = [
      // Winner: AUCTION_WON
      this.emit(
        winnerId,
        "AUCTION_WON",
        "Đấu giá thắng",
        `Bạn đã thắng phiên đấu giá ${auction.itemName} với giá ${auction.amount} ${auction.currency}`,
        { auctionId: auction.id, itemId: auction.itemId, amount: auction.amount, currency: auction.currency },
      ),
      // Seller: PAYMENT_RECEIVED
      this.emit(
        sellerId,
        "PAYMENT_RECEIVED",
        "Đã nhận thanh toán",
        `Bạn đã nhận thanh toán cho ${auction.itemName} từ phiên đấu giá`,
        { auctionId: auction.id, itemId: auction.itemId, amount: auction.amount, currency: auction.currency },
      ),
      // Losers: AUCTION_LOST
      ...loserIds.map(loserId =>
        this.emit(
          loserId,
          "AUCTION_LOST",
          "Đấu giá thua",
          `Bạn đã thua phiên đấu giá ${auction.itemName}`,
          { auctionId: auction.id, itemId: auction.itemId },
        ),
      ),
    ];

    await Promise.all(notifications);
  }

  async onAuctionEndedNoBids(
    sellerId: string,
    auction:  Pick<AuctionPayload, "id" | "itemId" | "itemName">,
  ): Promise<void> {
    await this.emit(
      sellerId,
      "AUCTION_ENDED_NO_BIDS",
      "Đấu giá kết thúc không có giá thầu",
      `Phiên đấu giá ${auction.itemName} đã kết thúc mà không có người trả giá`,
      { auctionId: auction.id, itemId: auction.itemId },
    );
  }

  async onPriceDrop(userId: string, payload: PriceDropPayload): Promise<void> {
    const fmtCR = (v: number) =>
      v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR`
      : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K CR`
      : `${v.toLocaleString("vi-VN")} CR`;

    await this.emit(
      userId,
      "PRICE_DROP",
      "Giảm giá!",
      `${payload.itemName} đã giảm từ ${fmtCR(payload.oldPrice)} xuống ${fmtCR(payload.newPrice)} (↓${payload.dropPct}%)`,
      {
        targetId:   payload.targetId,
        targetType: payload.targetType,
        oldPrice:   payload.oldPrice,
        newPrice:   payload.newPrice,
        dropPct:    payload.dropPct,
      },
    );
  }

  async onSavedSearchMatch(userId: string, payload: SavedSearchMatchPayload): Promise<void> {
    const fmtCR = (v: number) =>
      v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR`
      : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K CR`
      : `${v.toLocaleString("vi-VN")} CR`;

    await this.emit(
      userId,
      "SAVED_SEARCH_MATCH",
      "Kết quả tìm kiếm mới",
      `Có vật phẩm mới phù hợp với tìm kiếm '${payload.searchName}': ${payload.itemName} (${fmtCR(payload.price)})`,
      {
        searchId:  payload.searchId,
        listingId: payload.listingId,
        price:     payload.price,
        currency:  payload.currency,
      },
    );
  }
}
