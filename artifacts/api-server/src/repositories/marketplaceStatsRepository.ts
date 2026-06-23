// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceStatsRepository (Analytics)
//
// Comprehensive analytics on top of marketplace payment history.
// Used by MarketplaceStatsService to power the stats dashboard endpoints.
//
// NOTE: This is separate from IMarketplaceStatsRepository in marketplaceRepository.ts,
//       which handles only the basic counts used by MarketplaceService.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Domain models ────────────────────────────────────────────────────────────

export interface MarketplaceOverviewStats {
  activeListings:         number;
  activeAuctions:         number;
  totalTransactions:      number;
  totalMarketplaceVolume: number;
  totalRevenue:           number;
}

export interface TopSeller {
  sellerId:         string;
  transactionCount: number;
  volume:           number;
  revenue:          number;
}

export interface TopBuyer {
  buyerId:          string;
  transactionCount: number;
  volume:           number;
}

export interface TopItem {
  itemName: string;
  sales:    number;
  volume:   number;
}

export interface VolumeStats {
  last24h:  number;
  last7d:   number;
  last30d:  number;
  allTime:  number;
}

// ─── Repository interface ─────────────────────────────────────────────────────

export interface IMarketplaceAnalyticsRepository {
  getMarketplaceStats(): Promise<MarketplaceOverviewStats>;
  getTopSellers(limit: number): Promise<TopSeller[]>;
  getTopBuyers(limit: number): Promise<TopBuyer[]>;
  getTopItems(limit: number): Promise<TopItem[]>;
  getVolumeStats(): Promise<VolumeStats>;
}

// ─── Seed type for mock (includes itemName & createdAt for aggregation) ───────

export interface AnalyticsSeedPayment {
  sellerId:    string;
  buyerId:     string;
  totalAmount: number;
  netAmount:   number;
  feeAmount:   number;
  itemName:    string;
  createdAt:   string; // ISO string
}

// ─── Mock implementation (in-memory, seeded) ─────────────────────────────────

export class MockMarketplaceAnalyticsRepository implements IMarketplaceAnalyticsRepository {
  constructor(
    private readonly overview: Partial<MarketplaceOverviewStats> = {},
    private readonly payments: AnalyticsSeedPayment[] = [],
  ) {}

  async getMarketplaceStats(): Promise<MarketplaceOverviewStats> {
    const totalTransactions      = this.payments.length;
    const totalMarketplaceVolume = this.payments.reduce((s, p) => s + p.totalAmount, 0);
    const totalRevenue           = this.payments.reduce((s, p) => s + p.feeAmount,   0);

    return {
      activeListings:         this.overview.activeListings         ?? 0,
      activeAuctions:         this.overview.activeAuctions         ?? 0,
      totalTransactions:      this.overview.totalTransactions      ?? totalTransactions,
      totalMarketplaceVolume: this.overview.totalMarketplaceVolume ?? totalMarketplaceVolume,
      totalRevenue:           this.overview.totalRevenue           ?? totalRevenue,
    };
  }

  async getTopSellers(limit: number): Promise<TopSeller[]> {
    const map = new Map<string, TopSeller>();

    for (const p of this.payments) {
      const existing = map.get(p.sellerId) ?? {
        sellerId: p.sellerId, transactionCount: 0, volume: 0, revenue: 0,
      };
      map.set(p.sellerId, {
        sellerId:         p.sellerId,
        transactionCount: existing.transactionCount + 1,
        volume:           existing.volume  + p.totalAmount,
        revenue:          existing.revenue + p.netAmount,
      });
    }

    return [...map.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getTopBuyers(limit: number): Promise<TopBuyer[]> {
    const map = new Map<string, TopBuyer>();

    for (const p of this.payments) {
      const existing = map.get(p.buyerId) ?? {
        buyerId: p.buyerId, transactionCount: 0, volume: 0,
      };
      map.set(p.buyerId, {
        buyerId:          p.buyerId,
        transactionCount: existing.transactionCount + 1,
        volume:           existing.volume + p.totalAmount,
      });
    }

    return [...map.values()]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  }

  async getTopItems(limit: number): Promise<TopItem[]> {
    const map = new Map<string, TopItem>();

    for (const p of this.payments) {
      const existing = map.get(p.itemName) ?? {
        itemName: p.itemName, sales: 0, volume: 0,
      };
      map.set(p.itemName, {
        itemName: p.itemName,
        sales:    existing.sales  + 1,
        volume:   existing.volume + p.totalAmount,
      });
    }

    return [...map.values()]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }

  async getVolumeStats(): Promise<VolumeStats> {
    const now   = Date.now();
    const ms24h = 24 * 60 * 60 * 1000;
    const ms7d  = 7  * ms24h;
    const ms30d = 30 * ms24h;

    let last24h = 0;
    let last7d  = 0;
    let last30d = 0;
    let allTime = 0;

    for (const p of this.payments) {
      const age = now - new Date(p.createdAt).getTime();
      allTime += p.totalAmount;
      if (age <= ms30d) last30d += p.totalAmount;
      if (age <= ms7d)  last7d  += p.totalAmount;
      if (age <= ms24h) last24h += p.totalAmount;
    }

    return { last24h, last7d, last30d, allTime };
  }
}
