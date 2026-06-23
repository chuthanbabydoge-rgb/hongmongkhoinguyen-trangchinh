// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplacePricingService (V2.8)
//
// All tests use fully in-memory mock data — no Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { MockMarketplacePricingRepository }  from "../../repositories/marketplacePricingRepository.js";
import { MarketplacePricingService }         from "../marketplacePricingService.js";

// ─── Seed helpers ─────────────────────────────────────────────────────────────

function makeRepo() {
  return new MockMarketplacePricingRepository();
}

function makeService(repo: MockMarketplacePricingRepository) {
  return new MarketplacePricingService(repo);
}

// ─── Average price ─────────────────────────────────────────────────────────────

describe("MarketplacePricingService — average price", () => {
  test("computes correct average", async () => {
    const repo = makeRepo();
    repo.addSale("item-1", "Rùa Thần Kim", "pets", "legendary", 1000);
    repo.addSale("item-1", "Rùa Thần Kim", "pets", "legendary", 1200);
    repo.addSale("item-1", "Rùa Thần Kim", "pets", "legendary", 1100);

    const result = await makeService(repo).getItemPricing("item-1");
    assert.ok(result, "should return result");
    assert.equal(result!.averagePrice, 1100, "average should be (1000+1200+1100)/3");
  });
});

// ─── Median price ─────────────────────────────────────────────────────────────

describe("MarketplacePricingService — median price", () => {
  test("computes correct median for odd count", async () => {
    const repo = makeRepo();
    repo.addSale("item-2", "Item X", "items", "rare", 500);
    repo.addSale("item-2", "Item X", "items", "rare", 300);
    repo.addSale("item-2", "Item X", "items", "rare", 700);

    const result = await makeService(repo).getItemPricing("item-2");
    assert.equal(result!.medianPrice, 500, "median of [300,500,700] is 500");
  });

  test("computes correct median for even count", async () => {
    const repo = makeRepo();
    repo.addSale("item-3", "Item Y", "items", "rare", 400);
    repo.addSale("item-3", "Item Y", "items", "rare", 600);
    repo.addSale("item-3", "Item Y", "items", "rare", 200);
    repo.addSale("item-3", "Item Y", "items", "rare", 800);

    const result = await makeService(repo).getItemPricing("item-3");
    assert.equal(result!.medianPrice, 500, "median of [200,400,600,800] is 500");
  });
});

// ─── Highest / lowest price ────────────────────────────────────────────────────

describe("MarketplacePricingService — highest and lowest price", () => {
  test("returns correct min and max", async () => {
    const repo = makeRepo();
    repo.addSale("item-4", "Item Z", "tickets", "epic", 900);
    repo.addSale("item-4", "Item Z", "tickets", "epic", 300);
    repo.addSale("item-4", "Item Z", "tickets", "epic", 1400);

    const result = await makeService(repo).getItemPricing("item-4");
    assert.equal(result!.lowestPrice,  300,  "min should be 300");
    assert.equal(result!.highestPrice, 1400, "max should be 1400");
  });
});

// ─── Volume ───────────────────────────────────────────────────────────────────

describe("MarketplacePricingService — volume", () => {
  test("volume equals sum of all sale prices", async () => {
    const repo = makeRepo();
    repo.addSale("item-5", "Item V", "football", "rare", 1000);
    repo.addSale("item-5", "Item V", "football", "rare",  500);
    repo.addSale("item-5", "Item V", "football", "rare",  700);

    const result = await makeService(repo).getItemPricing("item-5");
    assert.equal(result!.volume, 2200, "volume should be sum 2200");
    assert.equal(result!.saleCount, 3, "saleCount should be 3");
  });
});

// ─── Fair value calculation ─────────────────────────────────────────────────────

describe("MarketplacePricingService — fair value calculation", () => {
  test("returns Giá hợp lý when price is within 10% of market average", async () => {
    const repo = makeRepo();
    // avg = 1000
    repo.addSale("item-6", "Fair Item", "items", "rare", 1000);
    repo.addSale("item-6", "Fair Item", "items", "rare", 1000);
    repo.addSale("item-6", "Fair Item", "items", "rare", 1000);

    const result = await makeService(repo).getItemPricing("item-6", 1050);
    assert.equal(result!.fairValue.status, "Giá hợp lý");
    assert.equal(result!.fairValue.fairPrice, 1000);
    assert.equal(result!.fairValue.marketAverage, 1000);
  });
});

// ─── Undervalued detection ──────────────────────────────────────────────────────

describe("MarketplacePricingService — undervalued detection", () => {
  test("detects price more than 10% below market average as undervalued", async () => {
    const repo = makeRepo();
    // avg = 1000
    repo.addSale("item-7", "Cheap Item", "items", "rare", 1000);
    repo.addSale("item-7", "Cheap Item", "items", "rare", 1000);

    const result = await makeService(repo).getItemPricing("item-7", 800); // 20% below
    assert.equal(result!.fairValue.status, "Giá thấp hơn giá trị thực");
  });

  test("boundary: exactly 10% below is still considered fair", async () => {
    const repo = makeRepo();
    repo.addSale("item-8", "Edge Item", "items", "rare", 1000);

    const result = await makeService(repo).getItemPricing("item-8", 900); // exactly 10% below
    // 900 < 1000 * 0.9 = 900 → NOT undervalued (boundary is exclusive)
    assert.equal(result!.fairValue.status, "Giá hợp lý");
  });
});

// ─── Overvalued detection ────────────────────────────────────────────────────────

describe("MarketplacePricingService — overvalued detection", () => {
  test("detects price more than 10% above market average as overvalued", async () => {
    const repo = makeRepo();
    // avg = 1000
    repo.addSale("item-9", "Expensive Item", "items", "epic", 1000);
    repo.addSale("item-9", "Expensive Item", "items", "epic", 1000);

    const result = await makeService(repo).getItemPricing("item-9", 1200); // 20% above
    assert.equal(result!.fairValue.status, "Giá cao hơn giá trị thực");
  });
});

// ─── Category analysis ──────────────────────────────────────────────────────────

describe("MarketplacePricingService — category analysis", () => {
  test("aggregates category stats correctly", async () => {
    const repo = makeRepo();
    repo.addSale("cat-item-1", "Dragon",  "pets", "legendary", 5000);
    repo.addSale("cat-item-1", "Dragon",  "pets", "legendary", 5000);
    repo.addSale("cat-item-2", "Unicorn", "pets", "epic",      2000);
    repo.addSale("cat-item-2", "Unicorn", "pets", "epic",      2000);
    repo.addSale("cat-item-2", "Unicorn", "pets", "epic",      2000);

    const result = await makeService(repo).getCategoryPricing("pets");
    assert.ok(result, "should return result");
    assert.equal(result!.totalSales, 5);
    assert.equal(result!.totalVolume, 5000 * 2 + 2000 * 3); // 16000
  });

  test("topByVolume orders items by total revenue desc", async () => {
    const repo = makeRepo();
    repo.addSale("A", "Item A", "items", "rare", 100);
    repo.addSale("B", "Item B", "items", "rare", 500);
    repo.addSale("B", "Item B", "items", "rare", 500);

    const result = await makeService(repo).getCategoryPricing("items");
    assert.equal(result!.topByVolume[0]!.itemId, "B",
      "Item B has higher volume (1000 vs 100)");
  });

  test("topByTransactions orders items by transaction count desc", async () => {
    const repo = makeRepo();
    repo.addSale("X", "Item X", "football", "common", 200);
    repo.addSale("X", "Item X", "football", "common", 200);
    repo.addSale("X", "Item X", "football", "common", 200);
    repo.addSale("Y", "Item Y", "football", "rare",  1000);

    const result = await makeService(repo).getCategoryPricing("football");
    assert.equal(result!.topByTransactions[0]!.itemId, "X",
      "Item X has more transactions (3 vs 1)");
  });

  test("returns null when category has no sales", async () => {
    const repo = makeRepo();
    const result = await makeService(repo).getCategoryPricing("empty-cat");
    assert.equal(result, null);
  });
});

// ─── Trend ranking ─────────────────────────────────────────────────────────────

describe("MarketplacePricingService — trend ranking", () => {
  test("returns three trend arrays", async () => {
    const repo = makeRepo();
    // Add some sales within the last 30 days
    repo.addSale("t1", "Trend A", "pets",    "rare", 1000, "credits",  2);
    repo.addSale("t2", "Trend B", "tickets", "epic",  500, "credits", 12);
    repo.addSale("t3", "Trend C", "items",   "epic", 2000, "credits",  5);

    const result = await makeService(repo).getTrends(5);
    assert.ok(Array.isArray(result.risingFastest),  "risingFastest should be array");
    assert.ok(Array.isArray(result.fallingFastest), "fallingFastest should be array");
    assert.ok(Array.isArray(result.highestVolume),  "highestVolume should be array");
    assert.ok(result.highestVolume.length > 0,      "should have at least one item");
  });

  test("highestVolume orders by total volume desc", async () => {
    const repo = makeRepo();
    repo.addSale("low",  "Low Vol",  "pets", "common",  100, "credits", 5);
    repo.addSale("high", "High Vol", "pets", "common", 5000, "credits", 5);
    repo.addSale("high", "High Vol", "pets", "common", 5000, "credits", 3);

    const result = await makeService(repo).getTrends(10);
    assert.equal(result.highestVolume[0]!.itemId, "high",
      "item with highest volume should rank first");
  });

  test("returns empty arrays when no sales exist", async () => {
    const repo    = makeRepo();
    const result  = await makeService(repo).getTrends(10);
    assert.deepEqual(result.risingFastest,  []);
    assert.deepEqual(result.fallingFastest, []);
    assert.deepEqual(result.highestVolume,  []);
  });
});

// ─── Empty history ─────────────────────────────────────────────────────────────

describe("MarketplacePricingService — empty history", () => {
  test("getItemPricing returns null for unknown itemId", async () => {
    const repo   = makeRepo();
    const result = await makeService(repo).getItemPricing("unknown-item");
    assert.equal(result, null);
  });

  test("getCategoryPricing returns null for empty category", async () => {
    const repo   = makeRepo();
    const result = await makeService(repo).getCategoryPricing("no-such-cat");
    assert.equal(result, null);
  });
});

// ─── Pagination via limit ──────────────────────────────────────────────────────

describe("MarketplacePricingService — limit controls trend results", () => {
  test("getTrends respects limit parameter", async () => {
    const repo = makeRepo();
    for (let i = 0; i < 20; i++) {
      repo.addSale(`item-${i}`, `Item ${i}`, "items", "common", 1000 * (i + 1), "credits", i);
    }

    const result = await makeService(repo).getTrends(5);
    assert.ok(result.highestVolume.length <= 5,  "highestVolume should respect limit of 5");
    assert.ok(result.risingFastest.length <= 5,  "risingFastest should respect limit of 5");
    assert.ok(result.fallingFastest.length <= 5, "fallingFastest should respect limit of 5");
  });
});
