// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceStatsService
//
// Aggregates marketplace analytics into a single dashboard response for
// GET /api/marketplace/stats.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IMarketplaceAnalyticsRepository,
  MarketplaceOverviewStats,
  TopSeller,
  TopBuyer,
  TopItem,
  VolumeStats,
} from "../repositories/marketplaceStatsRepository";

// ─── Response shape ───────────────────────────────────────────────────────────

export interface StatsDashboard {
  overview:   MarketplaceOverviewStats;
  volume:     VolumeStats;
  topSellers: TopSeller[];
  topBuyers:  TopBuyer[];
  topItems:   TopItem[];
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IMarketplaceStatsService {
  getDashboard(limit?: number): Promise<StatsDashboard>;
  getTopSellers(limit?: number): Promise<TopSeller[]>;
  getTopBuyers(limit?: number): Promise<TopBuyer[]>;
  getTopItems(limit?: number): Promise<TopItem[]>;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketplaceStatsService implements IMarketplaceStatsService {
  constructor(private readonly analytics: IMarketplaceAnalyticsRepository) {}

  async getDashboard(limit = 10): Promise<StatsDashboard> {
    const [overview, volume, topSellers, topBuyers, topItems] = await Promise.all([
      this.analytics.getMarketplaceStats(),
      this.analytics.getVolumeStats(),
      this.analytics.getTopSellers(limit),
      this.analytics.getTopBuyers(limit),
      this.analytics.getTopItems(limit),
    ]);

    return { overview, volume, topSellers, topBuyers, topItems };
  }

  async getTopSellers(limit = 10): Promise<TopSeller[]> {
    return this.analytics.getTopSellers(limit);
  }

  async getTopBuyers(limit = 10): Promise<TopBuyer[]> {
    return this.analytics.getTopBuyers(limit);
  }

  async getTopItems(limit = 10): Promise<TopItem[]> {
    return this.analytics.getTopItems(limit);
  }
}
