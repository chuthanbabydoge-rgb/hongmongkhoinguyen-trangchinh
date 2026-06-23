// ─────────────────────────────────────────────────────────────────────────────
// MarketplacePricingService (V2.8)
//
// Computes market intelligence metrics from historical sale records:
//
//   • Per-item: avg, median, min, max, last sale, volume, 24h/7d/30d change
//   • Per-category: top items by volume/transactions/average price
//   • Global trends: fastest rising, fastest falling, highest volume
//   • Fair-value tool: fair price, market average, over/under/fair status
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IMarketplacePricingRepository,
  SaleRecord,
} from "../repositories/marketplacePricingRepository";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface FairValueResult {
  fairPrice:     number;
  marketAverage: number;
  /** "Giá hợp lý" | "Giá thấp hơn giá trị thực" | "Giá cao hơn giá trị thực" */
  status:        string;
}

export interface ItemPricingResult {
  itemId:        string;
  itemName:      string;
  averagePrice:  number;
  medianPrice:   number;
  lowestPrice:   number;
  highestPrice:  number;
  lastSalePrice: number;
  saleCount:     number;
  volume:        number;
  change24h:     number;
  change7d:      number;
  change30d:     number;
  fairValue:     FairValueResult;
}

export interface CategoryItemStat {
  itemId:       string;
  itemName:     string;
  volume:       number;
  transactions: number;
  averagePrice: number;
}

export interface CategoryPricingResult {
  category:        string;
  totalVolume:     number;
  totalSales:      number;
  averagePrice:    number;
  topByVolume:     CategoryItemStat[];
  topByTransactions: CategoryItemStat[];
  topByAveragePrice: CategoryItemStat[];
}

export interface TrendItem {
  itemId:   string;
  itemName: string;
  change24h: number;
  volume:   number;
}

export interface TrendAnalysis {
  risingFastest:  TrendItem[];
  fallingFastest: TrendItem[];
  highestVolume:  TrendItem[];
}

// ─── Stat helpers ─────────────────────────────────────────────────────────────

function average(prices: number[]): number {
  if (prices.length === 0) return 0;
  return Math.round((prices.reduce((s, p) => s + p, 0) / prices.length) * 100) / 100;
}

function median(prices: number[]): number {
  if (prices.length === 0) return 0;
  const sorted = [...prices].sort((a, b) => a - b);
  const mid    = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid]!;
  return Math.round(((sorted[mid - 1]! + sorted[mid]!) / 2) * 100) / 100;
}

function pctChange(current: number[], previous: number[]): number {
  if (current.length === 0 || previous.length === 0) return 0;
  const curr = average(current);
  const prev = average(previous);
  if (prev === 0) return 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10; // one decimal
}

function windowFilter(records: SaleRecord[], fromMs: number, toMs: number): SaleRecord[] {
  return records.filter(r => {
    const t = new Date(r.soldAt).getTime();
    return t >= fromMs && t < toMs;
  });
}

function fairValue(averagePrice: number, currentPrice?: number): FairValueResult {
  const fairPrice     = averagePrice;
  const marketAverage = averagePrice;

  if (currentPrice == null || averagePrice === 0) {
    return { fairPrice, marketAverage, status: "Giá hợp lý" };
  }

  let status: string;
  if (currentPrice < averagePrice * 0.9) {
    status = "Giá thấp hơn giá trị thực";
  } else if (currentPrice > averagePrice * 1.1) {
    status = "Giá cao hơn giá trị thực";
  } else {
    status = "Giá hợp lý";
  }

  return { fairPrice, marketAverage, status };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketplacePricingService {
  constructor(private readonly repo: IMarketplacePricingRepository) {}

  // ─── Item pricing ──────────────────────────────────────────────────────────

  async getItemPricing(
    itemId:        string,
    currentPrice?: number,
  ): Promise<ItemPricingResult | null> {
    const records = await this.repo.getSalesByItemId(itemId);
    if (records.length === 0) return null;

    const now    = Date.now();
    const h24    = 24 * 3_600_000;
    const h48    = 48 * 3_600_000;
    const d7     = 7  * 86_400_000;
    const d14    = 14 * 86_400_000;
    const d30    = 30 * 86_400_000;
    const d60    = 60 * 86_400_000;

    const prices = records.map(r => r.price);

    const last24   = windowFilter(records, now - h24,  now);
    const prev24   = windowFilter(records, now - h48,  now - h24);
    const last7d   = windowFilter(records, now - d7,   now);
    const prev7d   = windowFilter(records, now - d14,  now - d7);
    const last30d  = windowFilter(records, now - d30,  now);
    const prev30d  = windowFilter(records, now - d60,  now - d30);

    const avg     = average(prices);
    const fv      = fairValue(avg, currentPrice);

    return {
      itemId,
      itemName:      records[0]!.itemName,
      averagePrice:  avg,
      medianPrice:   median(prices),
      lowestPrice:   Math.min(...prices),
      highestPrice:  Math.max(...prices),
      lastSalePrice: records[0]!.price,
      saleCount:     records.length,
      volume:        Math.round(prices.reduce((s, p) => s + p, 0)),
      change24h:     pctChange(last24.map(r => r.price), prev24.map(r => r.price)),
      change7d:      pctChange(last7d.map(r => r.price), prev7d.map(r => r.price)),
      change30d:     pctChange(last30d.map(r => r.price), prev30d.map(r => r.price)),
      fairValue:     fv,
    };
  }

  // ─── Category pricing ──────────────────────────────────────────────────────

  async getCategoryPricing(category: string): Promise<CategoryPricingResult | null> {
    const records = await this.repo.getSalesByCategory(category);
    if (records.length === 0) return null;

    // Aggregate per item
    const byItem = new Map<string, { itemName: string; prices: number[] }>();
    for (const r of records) {
      if (!byItem.has(r.itemId)) byItem.set(r.itemId, { itemName: r.itemName, prices: [] });
      byItem.get(r.itemId)!.prices.push(r.price);
    }

    const items: CategoryItemStat[] = [...byItem.entries()].map(([itemId, { itemName, prices }]) => ({
      itemId,
      itemName,
      volume:       Math.round(prices.reduce((s, p) => s + p, 0)),
      transactions: prices.length,
      averagePrice: average(prices),
    }));

    const allPrices    = records.map(r => r.price);
    const totalVolume  = Math.round(allPrices.reduce((s, p) => s + p, 0));

    return {
      category,
      totalVolume,
      totalSales:      records.length,
      averagePrice:    average(allPrices),
      topByVolume:           [...items].sort((a, b) => b.volume       - a.volume).slice(0, 10),
      topByTransactions:     [...items].sort((a, b) => b.transactions - a.transactions).slice(0, 10),
      topByAveragePrice:     [...items].sort((a, b) => b.averagePrice - a.averagePrice).slice(0, 10),
    };
  }

  // ─── Trend analysis ────────────────────────────────────────────────────────

  async getTrends(limit = 10): Promise<TrendAnalysis> {
    const records = await this.repo.getAllRecentSales(30);
    if (records.length === 0) {
      return { risingFastest: [], fallingFastest: [], highestVolume: [] };
    }

    const now  = Date.now();
    const h24  = 24 * 3_600_000;
    const h48  = 48 * 3_600_000;

    // Group by itemId
    const byItem = new Map<string, { itemName: string; records: SaleRecord[] }>();
    for (const r of records) {
      if (!byItem.has(r.itemId)) byItem.set(r.itemId, { itemName: r.itemName, records: [] });
      byItem.get(r.itemId)!.records.push(r);
    }

    const items: TrendItem[] = [...byItem.entries()].map(([itemId, { itemName, records: recs }]) => {
      const last24 = windowFilter(recs, now - h24, now);
      const prev24 = windowFilter(recs, now - h48, now - h24);
      const volume = Math.round(recs.reduce((s, r) => s + r.price, 0));
      return {
        itemId,
        itemName,
        change24h: pctChange(last24.map(r => r.price), prev24.map(r => r.price)),
        volume,
      };
    });

    return {
      risingFastest:  [...items].sort((a, b) => b.change24h - a.change24h).slice(0, limit),
      fallingFastest: [...items].sort((a, b) => a.change24h - b.change24h).slice(0, limit),
      highestVolume:  [...items].sort((a, b) => b.volume    - a.volume).slice(0, limit),
    };
  }
}
