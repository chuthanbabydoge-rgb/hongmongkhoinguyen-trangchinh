// ─────────────────────────────────────────────────────────────────────────────
// MarketplacePricePoller (V2.2)
//
// Automatically scans all watchlist entries on a fixed interval and fires
// PRICE_DROP notifications whenever the current market price falls below the
// last-seen price for a watched item.
//
// Configuration:
//   MARKETPLACE_PRICE_POLL_INTERVAL_MS  — poll interval in ms (default 300 000)
//
// Usage:
//   poller.start()    — begins the interval timer
//   poller.stop()     — clears the timer
//   poller.runOnce()  — single manual scan (also used by admin endpoint)
// ─────────────────────────────────────────────────────────────────────────────

import { logger } from "../lib/logger";
import type { IMarketplaceWatchlistRepository } from "../repositories/marketplaceWatchlistRepository";
import type { IListingsRepository, IAuctionsRepository } from "../repositories/marketplaceRepository";
import type { IMarketplaceWatchlistService } from "./marketplaceWatchlistService";

export interface RunOnceResult {
  scanned: number;
  drops:   number;
}

export class MarketplacePricePoller {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly watchlistRepo:    IMarketplaceWatchlistRepository,
    private readonly listingsRepo:     IListingsRepository,
    private readonly auctionsRepo:     IAuctionsRepository,
    private readonly watchlistService: IMarketplaceWatchlistService,
    private readonly intervalMs:       number = 300_000,
  ) {}

  start(): void {
    if (this.timer !== null) return;
    logger.info("[MarketplacePoller] đã khởi động");
    this.timer = setInterval(() => {
      this.runOnce().catch((err: unknown) => {
        logger.warn({ err }, "[MarketplacePoller] lỗi trong chu kỳ quét");
      });
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  async runOnce(): Promise<RunOnceResult> {
    let entries;
    try {
      entries = await this.watchlistRepo.getAll();
    } catch (err) {
      logger.warn({ err }, "[MarketplacePoller] Không thể tải danh sách theo dõi");
      return { scanned: 0, drops: 0 };
    }

    let scanned = 0;
    let drops   = 0;

    for (const entry of entries) {
      try {
        scanned++;

        let currentPrice: number | null = null;

        if (entry.targetType === "listing") {
          const listing  = await this.listingsRepo.getById(entry.targetId);
          currentPrice   = listing?.price ?? null;
        } else {
          const auction  = await this.auctionsRepo.getById(entry.targetId);
          currentPrice   = auction?.currentPrice ?? null;
        }

        if (currentPrice === null) continue;

        const result = await this.watchlistService.checkPrice(entry.id, currentPrice);
        if (result?.dropped) drops++;
      } catch (err) {
        logger.warn({ err, entryId: entry.id }, "[MarketplacePoller] lỗi khi quét mục");
      }
    }

    logger.info(`[MarketplacePoller] đã quét ${scanned} các mục`);
    logger.info(`[MarketplacePoller] phát hiện ${drops} lần giảm giá`);

    return { scanned, drops };
  }
}
