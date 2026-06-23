// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplaceRecommendationService (V2.7)
//
// All tests use fully in-memory mock data — no Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  MockMarketplaceRecommendationRepository,
} from "../../repositories/marketplaceRecommendationRepository.js";
import {
  MarketplaceRecommendationService,
} from "../marketplaceRecommendationService.js";

// ─── Seed helpers ─────────────────────────────────────────────────────────────

function makeListing(
  id: string,
  category: string,
  rarity: string,
  price: number,
  sellerId = "seller-1",
  bidCount = 0,
) {
  return {
    listingId: id,
    itemName:  `${rarity} ${category} Item ${id}`,
    category,
    rarity,
    price,
    currency:  "credits",
    sellerId,
    bidCount,
    createdAt: new Date().toISOString(),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplaceRecommendationService — purchase history", () => {
  test("boosts score for categories the user has bought before", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    repo.addListing(makeListing("l1", "pets", "rare", 1000));
    repo.addListing(makeListing("l2", "tickets", "common", 500));
    repo.addPurchase("user-1", { listingId: "old-l", category: "pets", rarity: "rare" });

    const svc = new MarketplaceRecommendationService(repo);
    const recs = await svc.getRecommendations("user-1");

    const petRec  = recs.find(r => r.listingId === "l1")!;
    const tickRec = recs.find(r => r.listingId === "l2")!;

    assert.ok(petRec,  "pets listing should appear");
    assert.ok(tickRec, "tickets listing should appear");
    assert.ok(petRec.score > tickRec.score, "bought category should score higher");
    assert.equal(petRec.reason, "Dựa trên lịch sử mua hàng của bạn");
  });
});

describe("MarketplaceRecommendationService — watchlist", () => {
  test("boosts score for rarities matching watchlist entries", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    repo.addListing(makeListing("l1", "pets",    "legendary", 5000));
    repo.addListing(makeListing("l2", "tickets", "common",     200));
    repo.addWatchlistEntry("user-1", { listingId: "old", category: "pets", rarity: "legendary" });

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getRecommendations("user-1");

    const legendRec  = recs.find(r => r.listingId === "l1")!;
    const commonRec  = recs.find(r => r.listingId === "l2")!;

    assert.ok(legendRec.score > commonRec.score, "watchlist rarity should score higher");
    assert.equal(legendRec.reason, "Tương tự với các mặt hàng trong danh sách theo dõi của bạn");
  });
});

describe("MarketplaceRecommendationService — saved searches", () => {
  test("boosts score for listings matching saved search criteria", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    repo.addListing(makeListing("l1", "items", "epic", 3000));
    repo.addListing(makeListing("l2", "items", "common", 100));
    repo.addSavedSearch("user-1", {
      category: "items",
      rarity:   "epic",
      query:    null,
      minPrice: null,
      maxPrice: null,
    });

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getRecommendations("user-1");

    const epicRec   = recs.find(r => r.listingId === "l1")!;
    const commonRec = recs.find(r => r.listingId === "l2")!;

    assert.ok(epicRec.score > commonRec.score, "saved-search match should score higher");
    assert.equal(epicRec.reason, "Phù hợp với tìm kiếm đã lưu của bạn");
  });

  test("saved search price range filter works correctly", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    repo.addListing(makeListing("l1", "items", "rare", 500));
    repo.addListing(makeListing("l2", "items", "rare", 5000));
    repo.addSavedSearch("user-1", {
      category: "items",
      rarity:   null,
      query:    null,
      minPrice: 100,
      maxPrice: 1000,
    });

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getRecommendations("user-1");

    const inRange  = recs.find(r => r.listingId === "l1")!;
    const outRange = recs.find(r => r.listingId === "l2")!;

    assert.ok(inRange.score > outRange.score, "in-range listing should score higher");
  });
});

describe("MarketplaceRecommendationService — trending", () => {
  test("returns topListings, topAuctions, topCategories, topKeywords", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    repo.addListing(makeListing("l1", "pets",    "rare", 1000, "s1", 0));
    repo.addListing(makeListing("l2", "tickets", "rare", 500,  "s2", 0));
    repo.addListing(makeListing("l3", "pets",    "epic", 2000, "s3", 0));
    repo.addListing({ ...makeListing("a1", "pets", "legendary", 5000, "s4", 10), createdAt: new Date(0).toISOString() });

    const svc    = new MarketplaceRecommendationService(repo);
    const result = await svc.getTrending(5);

    assert.ok(Array.isArray(result.topListings),   "topListings should be array");
    assert.ok(Array.isArray(result.topAuctions),   "topAuctions should be array");
    assert.ok(Array.isArray(result.topCategories), "topCategories should be array");
    assert.ok(Array.isArray(result.topKeywords),   "topKeywords should be array");
    assert.ok(result.topCategories.length > 0,     "should have at least one category");

    const petsCat = result.topCategories.find(c => c.category === "pets");
    assert.ok(petsCat, "pets should appear in top categories");
    assert.ok(petsCat!.count >= 2, "pets count should reflect multiple listings");
  });

  test("top categories ordered by count descending", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    for (let i = 0; i < 5; i++) repo.addListing(makeListing(`p${i}`, "pets",    "rare", 100));
    for (let i = 0; i < 2; i++) repo.addListing(makeListing(`t${i}`, "tickets", "rare", 100));

    const svc    = new MarketplaceRecommendationService(repo);
    const result = await svc.getTrending(10);

    assert.equal(result.topCategories[0]!.category, "pets",
      "most frequent category should be first");
  });
});

describe("MarketplaceRecommendationService — similar items", () => {
  test("returns listings with same category and rarity", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    repo.addListing(makeListing("target", "pets", "epic", 1000));
    repo.addListing(makeListing("sim1",   "pets", "epic", 1100));
    repo.addListing(makeListing("sim2",   "pets", "epic",  900));
    repo.addListing(makeListing("diff",   "pets", "rare", 1000));
    repo.addListing(makeListing("diff2",  "tickets", "epic", 1000));

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getSimilar("target");

    const ids = recs.map(r => r.listingId);
    assert.ok(ids.includes("sim1"),  "similar listing in range should appear");
    assert.ok(ids.includes("sim2"),  "similar listing in range should appear");
    assert.ok(!ids.includes("target"), "target should not appear in results");
    assert.ok(!ids.includes("diff"),   "different rarity should not appear");
    assert.ok(!ids.includes("diff2"),  "different category should not appear");
  });

  test("excludes listings outside ±50% price range", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    repo.addListing(makeListing("target",  "items", "rare", 1000));
    repo.addListing(makeListing("tooHigh", "items", "rare", 2000)); // 100% above — excluded
    repo.addListing(makeListing("tooLow",  "items", "rare",  400)); // 60% below — excluded
    repo.addListing(makeListing("inRange", "items", "rare", 1400)); // 40% above — included

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getSimilar("target");
    const ids  = recs.map(r => r.listingId);

    assert.ok(ids.includes("inRange"),  "in-range listing should appear");
    assert.ok(!ids.includes("tooHigh"), "too-high listing should be excluded");
    assert.ok(!ids.includes("tooLow"),  "too-low listing should be excluded");
  });

  test("returns empty array for unknown listingId", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getSimilar("nonexistent-id");
    assert.deepEqual(recs, []);
  });
});

describe("MarketplaceRecommendationService — seller reputation boost", () => {
  test("high-reputation seller scores higher than zero-rep seller", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    repo.addListing(makeListing("l1", "pets", "rare", 1000, "high-rep-seller"));
    repo.addListing(makeListing("l2", "pets", "rare", 1000, "no-rep-seller"));
    repo.setSellerScore("high-rep-seller", 100);
    repo.setSellerScore("no-rep-seller",     0);

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getRecommendations("user-1");

    const highRepRec = recs.find(r => r.listingId === "l1")!;
    const noRepRec   = recs.find(r => r.listingId === "l2")!;

    assert.ok(highRepRec.score > noRepRec.score, "high-rep seller should score higher");
  });

  test("partial reputation score applies proportional boost", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    repo.addListing(makeListing("l1", "pets", "rare", 1000, "seller-50"));
    repo.setSellerScore("seller-50", 50);

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getRecommendations("user-1");

    const rec = recs.find(r => r.listingId === "l1")!;
    // Base score 0 + reputation 50% of 10 = 5 (+ any trending weight)
    assert.ok(rec.score >= 5, "should have partial rep boost");
    assert.ok(rec.score < 10, "should not exceed max rep boost without other signals");
  });
});

describe("MarketplaceRecommendationService — empty history fallback", () => {
  test("returns results even when user has no purchase/watchlist history", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    repo.addListing(makeListing("l1", "pets",    "rare", 1000));
    repo.addListing(makeListing("l2", "tickets", "epic", 2000));

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getRecommendations("brand-new-user");

    assert.ok(recs.length >= 2, "should still return candidates for new user");
  });
});

describe("MarketplaceRecommendationService — deduplication", () => {
  test("each listingId appears at most once", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    // Add the same listing ID twice with different data (should dedupe)
    const listing = makeListing("dup-1", "pets", "rare", 1000);
    repo.addListing(listing);
    repo.addListing({ ...listing }); // duplicate

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getRecommendations("user-1");

    const ids   = recs.map(r => r.listingId);
    const uniq  = new Set(ids);
    assert.equal(ids.length, uniq.size, "no duplicate listingIds in result");
  });
});

describe("MarketplaceRecommendationService — pagination", () => {
  test("limit controls number of returned items", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    for (let i = 0; i < 15; i++) {
      repo.addListing(makeListing(`l${i}`, "pets", "rare", 1000 + i));
    }

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getRecommendations("user-1", { limit: 5 });

    assert.equal(recs.length, 5, "should return exactly limit items");
  });

  test("offset skips leading items", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    for (let i = 0; i < 10; i++) {
      repo.addListing(makeListing(`l${i}`, "pets", "rare", 1000 + i));
    }

    const svc   = new MarketplaceRecommendationService(repo);
    const page1 = await svc.getRecommendations("user-1", { limit: 5, offset: 0 });
    const page2 = await svc.getRecommendations("user-1", { limit: 5, offset: 5 });

    const ids1 = new Set(page1.map(r => r.listingId));
    const ids2 = new Set(page2.map(r => r.listingId));
    const overlap = [...ids1].filter(id => ids2.has(id));

    assert.equal(overlap.length, 0, "pages should not overlap");
  });
});

describe("MarketplaceRecommendationService — score sorting", () => {
  test("results are sorted by score descending", async () => {
    const repo = new MockMarketplaceRecommendationRepository();
    // High-rep seller → higher score
    repo.addListing(makeListing("l-high", "pets", "legendary", 1000, "s-high"));
    repo.addListing(makeListing("l-low",  "pets", "legendary", 1000, "s-low"));
    repo.setSellerScore("s-high", 100);
    repo.setSellerScore("s-low",    0);

    const svc  = new MarketplaceRecommendationService(repo);
    const recs = await svc.getRecommendations("user-1");

    for (let i = 0; i < recs.length - 1; i++) {
      assert.ok(
        recs[i]!.score >= recs[i + 1]!.score,
        `recs[${i}] score ${recs[i]!.score} should be >= recs[${i + 1}] score ${recs[i + 1]!.score}`,
      );
    }
  });
});
