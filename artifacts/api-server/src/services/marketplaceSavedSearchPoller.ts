// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceSavedSearchPoller (V2.3)
//
// Scans all saved searches on a fixed interval.  For each saved search it
// queries active marketplace listings matching the stored criteria, compares
// against the previously notified listing IDs, and fires a SAVED_SEARCH_MATCH
// notification for every genuinely new match.
//
// Configuration:
//   MARKETPLACE_SEARCH_POLL_INTERVAL_MS  — poll interval in ms (default 300 000)
// ─────────────────────────────────────────────────────────────────────────────

import { logger } from "../lib/logger";
import type { ISavedSearchRepository, SavedSearch } from "../repositories/marketplaceSavedSearchRepository";
import type { IListingsRepository, ListingQueryParams } from "../repositories/marketplaceRepository";
import type { IMarketplaceNotificationService } from "./marketplaceNotificationService";

export interface ScanResult {
  savedSearches: number;
  newMatches:    number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toListingParams(search: SavedSearch): ListingQueryParams {
  const params: ListingQueryParams = { status: "active" };
  if (search.query    ) params.q        = search.query;
  if (search.category ) params.category = search.category as ListingQueryParams["category"];
  if (search.rarity   ) params.rarity   = search.rarity   as ListingQueryParams["rarity"];
  if (search.currency ) params.currency = search.currency as ListingQueryParams["currency"];
  if (search.minPrice != null) params.minPrice = search.minPrice;
  if (search.maxPrice != null) params.maxPrice = search.maxPrice;
  return params;
}

// ─── Poller class ─────────────────────────────────────────────────────────────

export class MarketplaceSavedSearchPoller {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly savedSearchRepo: ISavedSearchRepository,
    private readonly listingsRepo:    IListingsRepository,
    private readonly notifications:   IMarketplaceNotificationService,
    private readonly intervalMs:      number = 300_000,
  ) {}

  start(): void {
    if (this.timer !== null) return;
    logger.info("[SavedSearchPoller] đã khởi động");
    this.timer = setInterval(() => {
      this.runOnce().catch((err: unknown) => {
        logger.warn({ err }, "[SavedSearchPoller] lỗi trong chu kỳ quét");
      });
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  async runOnce(): Promise<ScanResult> {
    let searches: SavedSearch[];
    try {
      searches = await this.savedSearchRepo.getAll();
    } catch (err) {
      logger.warn({ err }, "[SavedSearchPoller] Không thể tải danh sách tìm kiếm đã lưu");
      return { savedSearches: 0, newMatches: 0 };
    }

    let newMatches = 0;

    for (const search of searches) {
      try {
        const params   = toListingParams(search);
        const listings = await this.listingsRepo.getAll(params);
        const seenIds  = new Set(await this.savedSearchRepo.getMatchIds(search.id));

        const fresh = listings.filter(l => !seenIds.has(l.id));
        if (fresh.length === 0) continue;

        for (const listing of fresh) {
          await this.notifications
            .onSavedSearchMatch(search.userId, {
              searchId:   search.id,
              searchName: search.name,
              listingId:  listing.id,
              itemName:   listing.itemName,
              price:      listing.price,
              currency:   listing.currency,
            })
            .catch(() => {});
          newMatches++;
        }

        const updatedIds = [...seenIds, ...fresh.map(l => l.id)];
        await this.savedSearchRepo.setMatchIds(search.id, updatedIds);
      } catch (err) {
        logger.warn({ err, searchId: search.id }, "[SavedSearchPoller] lỗi khi quét tìm kiếm");
      }
    }

    logger.info(`[SavedSearchPoller] đã quét ${searches.length} tìm kiếm đã lưu`);
    logger.info(`[SavedSearchPoller] phát hiện ${newMatches} kết quả phù hợp mới`);

    return { savedSearches: searches.length, newMatches };
  }
}
