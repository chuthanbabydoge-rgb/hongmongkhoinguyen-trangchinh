// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceModerationService — V2.5
//
// Admin-level operations: remove listings / auctions, suspend / ban sellers,
// audit log, and dashboard counters.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IModerationRepository,
  ModerationAction,
  ReportedItem,
} from "../repositories/marketplaceModerationRepository";
import type { IListingsRepository }  from "../repositories/marketplaceRepository";
import type { IAuctionsRepository }  from "../repositories/marketplaceRepository";

// Minimal notification surface needed by moderation.
export interface IModerationNotifier {
  onListingRemoved(sellerId: string, listingId: string, reason: string):  Promise<void>;
  onAuctionRemoved(sellerId: string, auctionId: string, reason: string):  Promise<void>;
  onSellerSuspended(sellerId: string, reason: string):                    Promise<void>;
  onSellerBanned(sellerId: string, reason: string):                       Promise<void>;
}

export interface DashboardData {
  activeListings:    number;
  activeAuctions:    number;
  reportedItems:     number;
  suspendedSellers:  number;
  bannedSellers:     number;
}

export class MarketplaceModerationService {
  constructor(
    private readonly repo:      IModerationRepository,
    private readonly listings:  IListingsRepository,
    private readonly auctions:  IAuctionsRepository,
    private readonly notif:     IModerationNotifier | null = null,
  ) {}

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard(): Promise<DashboardData> {
    const [
      activeListingsList,
      activeAuctionsList,
      reportedItems,
      suspendedSellers,
      bannedSellers,
    ] = await Promise.all([
      this.listings.getAll({ status: "active" }),
      this.auctions.getAll({ status: "live"   }),
      this.repo.countReported(),
      this.repo.countSellers("suspended"),
      this.repo.countSellers("banned"),
    ]);

    return {
      activeListings:   activeListingsList.length,
      activeAuctions:   activeAuctionsList.length,
      reportedItems,
      suspendedSellers,
      bannedSellers,
    };
  }

  // ─── Reported items ─────────────────────────────────────────────────────────

  async getReported(): Promise<ReportedItem[]> {
    return this.repo.getReported();
  }

  // ─── Remove listing ─────────────────────────────────────────────────────────

  async removeListing(adminId: string, listingId: string, reason: string): Promise<ModerationAction> {
    const listing = await this.listings.getById(listingId);
    if (!listing) throw new Error(`Niêm yết ${listingId} không tìm thấy.`);

    await this.listings.updateStatus(listingId, "cancelled");

    const action = await this.repo.addAction({
      adminId,
      action:     "REMOVE_LISTING",
      targetType: "listing",
      targetId:   listingId,
      reason,
    });

    this.notif?.onListingRemoved(listing.sellerId, listingId, reason).catch(() => {});
    return action;
  }

  // ─── Remove auction ─────────────────────────────────────────────────────────

  async removeAuction(adminId: string, auctionId: string, reason: string): Promise<ModerationAction> {
    const auction = await this.auctions.getById(auctionId);
    if (!auction) throw new Error(`Phiên đấu giá ${auctionId} không tìm thấy.`);

    await this.auctions.updateStatus(auctionId, "cancelled");

    const action = await this.repo.addAction({
      adminId,
      action:     "REMOVE_AUCTION",
      targetType: "auction",
      targetId:   auctionId,
      reason,
    });

    this.notif?.onAuctionRemoved(auction.sellerId, auctionId, reason).catch(() => {});
    return action;
  }

  // ─── Suspend seller ─────────────────────────────────────────────────────────

  async suspendSeller(adminId: string, sellerId: string, reason: string): Promise<ModerationAction> {
    const current = await this.repo.getSellerStatus(sellerId);
    if (current?.status === "suspended") {
      throw new Error(`Người bán ${sellerId} đã bị tạm ngừng hoạt động.`);
    }
    if (current?.status === "banned") {
      throw new Error(`Người bán ${sellerId} đã bị cấm — không thể tạm ngừng.`);
    }

    await this.repo.setSellerStatus(sellerId, "suspended");

    const action = await this.repo.addAction({
      adminId,
      action:     "SUSPEND_SELLER",
      targetType: "seller",
      targetId:   sellerId,
      reason,
    });

    this.notif?.onSellerSuspended(sellerId, reason).catch(() => {});
    return action;
  }

  // ─── Ban seller ─────────────────────────────────────────────────────────────

  async banSeller(adminId: string, sellerId: string, reason: string): Promise<ModerationAction> {
    const current = await this.repo.getSellerStatus(sellerId);
    if (current?.status === "banned") {
      throw new Error(`Người bán ${sellerId} đã bị cấm.`);
    }

    await this.repo.setSellerStatus(sellerId, "banned");

    const action = await this.repo.addAction({
      adminId,
      action:     "BAN_SELLER",
      targetType: "seller",
      targetId:   sellerId,
      reason,
    });

    this.notif?.onSellerBanned(sellerId, reason).catch(() => {});
    return action;
  }

  // ─── Audit log ──────────────────────────────────────────────────────────────

  async getActions(limit?: number): Promise<ModerationAction[]> {
    return this.repo.getActions(limit);
  }
}
