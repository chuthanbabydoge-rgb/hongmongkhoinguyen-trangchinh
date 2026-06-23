// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplaceStatsService
//
// Covers marketplace analytics dashboard (V1.6).
// Uses fully in-memory stubs — no Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert              from "node:assert/strict";

import { MarketplaceStatsService }          from "../marketplaceStatsService.js";
import { MockMarketplaceAnalyticsRepository } from "../../repositories/marketplaceStatsRepository.js";
import type { AnalyticsSeedPayment }        from "../../repositories/marketplaceStatsRepository.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function daysAgo(d: number): string {
  return hoursAgo(d * 24);
}

function makePayment(overrides: Partial<AnalyticsSeedPayment>): AnalyticsSeedPayment {
  return {
    sellerId:    "seller-001",
    buyerId:     "buyer-001",
    totalAmount: 1000,
    netAmount:   950,
    feeAmount:   50,
    itemName:    "Dragon",
    createdAt:   new Date().toISOString(),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplaceStatsService", () => {

  test("✔ Số lượng sản phẩm đang bán (active listings count)", async () => {
    const repo    = new MockMarketplaceAnalyticsRepository({ activeListings: 128 });
    const service = new MarketplaceStatsService(repo);

    const { overview } = await service.getDashboard();
    assert.equal(overview.activeListings, 128);
  });

  test("✔ Số lượng phiên đấu giá đang hoạt động (active auctions count)", async () => {
    const repo    = new MockMarketplaceAnalyticsRepository({ activeAuctions: 41 });
    const service = new MarketplaceStatsService(repo);

    const { overview } = await service.getDashboard();
    assert.equal(overview.activeAuctions, 41);
  });

  test("✔ Số lượng giao dịch (total transaction count)", async () => {
    const payments = [
      makePayment({}),
      makePayment({}),
      makePayment({}),
    ];
    const repo    = new MockMarketplaceAnalyticsRepository({}, payments);
    const service = new MarketplaceStatsService(repo);

    const { overview } = await service.getDashboard();
    assert.equal(overview.totalTransactions, 3);
  });

  test("✔ Khối lượng giao dịch trên thị trường (total marketplace volume)", async () => {
    const payments = [
      makePayment({ totalAmount: 5000 }),
      makePayment({ totalAmount: 3000 }),
      makePayment({ totalAmount: 2000 }),
    ];
    const repo    = new MockMarketplaceAnalyticsRepository({}, payments);
    const service = new MarketplaceStatsService(repo);

    const { overview } = await service.getDashboard();
    assert.equal(overview.totalMarketplaceVolume, 10000);
  });

  test("✔ Doanh thu trên thị trường (total marketplace revenue / fees)", async () => {
    const payments = [
      makePayment({ feeAmount: 250 }),
      makePayment({ feeAmount: 150 }),
      makePayment({ feeAmount: 100 }),
    ];
    const repo    = new MockMarketplaceAnalyticsRepository({}, payments);
    const service = new MarketplaceStatsService(repo);

    const { overview } = await service.getDashboard();
    assert.equal(overview.totalRevenue, 500);
  });

  test("✔ Xếp hạng người bán hàng đầu (top sellers ranking by revenue)", async () => {
    const payments = [
      makePayment({ sellerId: "seller-A", netAmount: 9500, totalAmount: 10000 }),
      makePayment({ sellerId: "seller-B", netAmount: 4750, totalAmount: 5000  }),
      makePayment({ sellerId: "seller-A", netAmount: 9500, totalAmount: 10000 }),
    ];
    const repo    = new MockMarketplaceAnalyticsRepository({}, payments);
    const service = new MarketplaceStatsService(repo);

    const topSellers = await service.getTopSellers(10);

    assert.equal(topSellers[0]!.sellerId,         "seller-A");
    assert.equal(topSellers[0]!.transactionCount, 2);
    assert.equal(topSellers[0]!.volume,           20000);
    assert.equal(topSellers[0]!.revenue,          19000);
    assert.equal(topSellers[1]!.sellerId,         "seller-B");
  });

  test("✔ Xếp hạng người mua hàng đầu (top buyers ranking by volume)", async () => {
    const payments = [
      makePayment({ buyerId: "buyer-X", totalAmount: 8000 }),
      makePayment({ buyerId: "buyer-Y", totalAmount: 3000 }),
      makePayment({ buyerId: "buyer-X", totalAmount: 8000 }),
    ];
    const repo    = new MockMarketplaceAnalyticsRepository({}, payments);
    const service = new MarketplaceStatsService(repo);

    const topBuyers = await service.getTopBuyers(10);

    assert.equal(topBuyers[0]!.buyerId,          "buyer-X");
    assert.equal(topBuyers[0]!.transactionCount, 2);
    assert.equal(topBuyers[0]!.volume,           16000);
    assert.equal(topBuyers[1]!.buyerId,          "buyer-Y");
  });

  test("✔ Xếp hạng sản phẩm hàng đầu (top items ranking by sales count)", async () => {
    const payments = [
      makePayment({ itemName: "Rồng",  totalAmount: 5000 }),
      makePayment({ itemName: "Rồng",  totalAmount: 5000 }),
      makePayment({ itemName: "Phượng", totalAmount: 3000 }),
      makePayment({ itemName: "Rồng",  totalAmount: 5000 }),
    ];
    const repo    = new MockMarketplaceAnalyticsRepository({}, payments);
    const service = new MarketplaceStatsService(repo);

    const topItems = await service.getTopItems(10);

    assert.equal(topItems[0]!.itemName, "Rồng");
    assert.equal(topItems[0]!.sales,    3);
    assert.equal(topItems[0]!.volume,   15000);
    assert.equal(topItems[1]!.itemName, "Phượng");
    assert.equal(topItems[1]!.sales,    1);
  });

  test("✔ Khối lượng giao dịch 24h (24h volume)", async () => {
    const payments = [
      makePayment({ totalAmount: 1000, createdAt: hoursAgo(1)   }),  // ✓ 24h
      makePayment({ totalAmount: 2000, createdAt: daysAgo(3)    }),  // ✗ 24h
      makePayment({ totalAmount: 3000, createdAt: daysAgo(10)   }),  // ✗ 24h
    ];
    const repo    = new MockMarketplaceAnalyticsRepository({}, payments);
    const service = new MarketplaceStatsService(repo);

    const { volume } = await service.getDashboard();
    assert.equal(volume.last24h, 1000);
  });

  test("✔ Khối lượng giao dịch 7 ngày (7-day volume)", async () => {
    const payments = [
      makePayment({ totalAmount: 1000, createdAt: hoursAgo(1)  }),  // ✓ 7d
      makePayment({ totalAmount: 2000, createdAt: daysAgo(3)   }),  // ✓ 7d
      makePayment({ totalAmount: 3000, createdAt: daysAgo(10)  }),  // ✗ 7d
    ];
    const repo    = new MockMarketplaceAnalyticsRepository({}, payments);
    const service = new MarketplaceStatsService(repo);

    const { volume } = await service.getDashboard();
    assert.equal(volume.last7d, 3000);
  });

  test("✔ Khối lượng giao dịch 30 ngày (30-day volume)", async () => {
    const payments = [
      makePayment({ totalAmount: 1000, createdAt: hoursAgo(1)  }),  // ✓ 30d
      makePayment({ totalAmount: 2000, createdAt: daysAgo(3)   }),  // ✓ 30d
      makePayment({ totalAmount: 3000, createdAt: daysAgo(10)  }),  // ✓ 30d
      makePayment({ totalAmount: 4000, createdAt: daysAgo(60)  }),  // ✗ 30d
    ];
    const repo    = new MockMarketplaceAnalyticsRepository({}, payments);
    const service = new MarketplaceStatsService(repo);

    const { volume } = await service.getDashboard();
    assert.equal(volume.last30d, 6000);
    assert.equal(volume.allTime, 10000);
  });

  test("✔ Cơ sở dữ liệu trống trả về giá trị 0 (empty DB returns zeros)", async () => {
    const repo    = new MockMarketplaceAnalyticsRepository();
    const service = new MarketplaceStatsService(repo);

    const { overview, volume, topSellers, topBuyers, topItems } = await service.getDashboard();

    assert.equal(overview.activeListings,         0);
    assert.equal(overview.activeAuctions,         0);
    assert.equal(overview.totalTransactions,      0);
    assert.equal(overview.totalMarketplaceVolume, 0);
    assert.equal(overview.totalRevenue,           0);
    assert.equal(volume.last24h,                  0);
    assert.equal(volume.last7d,                   0);
    assert.equal(volume.last30d,                  0);
    assert.equal(volume.allTime,                  0);
    assert.deepEqual(topSellers, []);
    assert.deepEqual(topBuyers,  []);
    assert.deepEqual(topItems,   []);
  });

});
