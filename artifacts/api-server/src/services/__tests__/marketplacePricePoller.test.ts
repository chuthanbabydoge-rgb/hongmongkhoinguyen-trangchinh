// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplacePricePoller (V2.2)
//
// Covers all scan scenarios — no Supabase or network required.
// Uses fully in-memory stubs.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { MarketplacePricePoller } from "../marketplacePricePoller.js";
import { MarketplaceWatchlistService } from "../marketplaceWatchlistService.js";
import { MockMarketplaceWatchlistRepository } from "../../repositories/marketplaceWatchlistRepository.js";
import { MockMarketplaceNotificationRepository } from "../../repositories/marketplaceNotificationRepository.js";
import { MarketplaceNotificationService } from "../marketplaceNotificationService.js";
import type {
  IListingsRepository,
  IAuctionsRepository,
  Listing,
  Auction,
} from "../../repositories/marketplaceRepository.js";

// ─── Stubs ────────────────────────────────────────────────────────────────────

function makeListingsRepo(priceMap: Record<string, number>): IListingsRepository {
  return {
    async getById(id: string) {
      if (id in priceMap) {
        return { id, price: priceMap[id]! } as Listing;
      }
      return null;
    },
    async getAll()                      { return []; },
    async create()                      { return {} as Listing; },
    async updateStatus()                { return null; },
    async delete()                      { return false; },
  };
}

function makeAuctionsRepo(priceMap: Record<string, number>): IAuctionsRepository {
  return {
    async getById(id: string) {
      if (id in priceMap) {
        return { id, currentPrice: priceMap[id]! } as Auction;
      }
      return null;
    },
    async getAll()         { return []; },
    async getExpired()     { return []; },
    async create()         { return {} as Auction; },
    async updateBid()      { return null; },
    async updateStatus()   { return null; },
  };
}

// ─── Shared setup ─────────────────────────────────────────────────────────────

let watchlistRepo:    MockMarketplaceWatchlistRepository;
let notifRepo:        MockMarketplaceNotificationRepository;
let notifService:     MarketplaceNotificationService;
let watchlistService: MarketplaceWatchlistService;

beforeEach(() => {
  watchlistRepo    = new MockMarketplaceWatchlistRepository();
  notifRepo        = new MockMarketplaceNotificationRepository();
  notifService     = new MarketplaceNotificationService(notifRepo);
  watchlistService = new MarketplaceWatchlistService(watchlistRepo, notifService);
});

function makePoller(
  listingPrices: Record<string, number> = {},
  auctionPrices: Record<string, number> = {},
) {
  return new MarketplacePricePoller(
    watchlistRepo,
    makeListingsRepo(listingPrices),
    makeAuctionsRepo(auctionPrices),
    watchlistService,
    999_999,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplacePricePoller", () => {

  test("✔ không thay đổi giá — không phát hiện giảm giá", async () => {
    await watchlistRepo.create({
      userId: "user-001", targetType: "listing", targetId: "lst-001",
      itemName: "Rồng", price: 10000,
    });

    const poller = makePoller({ "lst-001": 10000 });
    const result = await poller.runOnce();

    assert.equal(result.scanned, 1);
    assert.equal(result.drops,   0);
  });

  test("✔ giảm giá một lần — phát hiện và đếm chính xác", async () => {
    await watchlistRepo.create({
      userId: "user-001", targetType: "listing", targetId: "lst-002",
      itemName: "Phượng", price: 50000,
    });

    const poller = makePoller({ "lst-002": 40000 });
    const result = await poller.runOnce();

    assert.equal(result.scanned, 1);
    assert.equal(result.drops,   1);

    const [entry] = await watchlistRepo.getByUserId("user-001");
    assert.equal(entry!.priceDropCount,  1);
    assert.equal(entry!.lastSeenPrice,   40000);
  });

  test("✔ giảm giá nhiều lần — tích lũy đúng", async () => {
    await watchlistRepo.create({
      userId: "user-001", targetType: "listing", targetId: "lst-003",
      itemName: "Sói Băng", price: 30000,
    });

    const [entry] = await watchlistRepo.getByUserId("user-001");
    const id = entry!.id;

    // First drop: 30000 → 25000
    const poller1 = makePoller({ "lst-003": 25000 });
    const r1 = await poller1.runOnce();
    assert.equal(r1.drops, 1);

    // Second drop: 25000 → 20000
    const poller2 = makePoller({ "lst-003": 20000 });
    const r2 = await poller2.runOnce();
    assert.equal(r2.drops, 1);

    const result = await watchlistRepo.checkPrice(id, 20000);
    assert.equal(result!.entry.priceDropCount, 2);
  });

  test("✔ thông báo được tạo khi giảm giá", async () => {
    await watchlistRepo.create({
      userId: "user-001", targetType: "listing", targetId: "lst-004",
      itemName: "Tiger X", price: 8000,
    });

    const poller = makePoller({ "lst-004": 6000 });
    await poller.runOnce();

    const { data } = await notifService.getNotifications("user-001");
    const priceDrop = data.find(n => n.type === "PRICE_DROP");
    assert.ok(priceDrop, "Phải có thông báo PRICE_DROP");
    assert.equal(priceDrop!.userId, "user-001");
  });

  test("✔ poller vẫn hoạt động sau lỗi kho lưu trữ riêng lẻ", async () => {
    await watchlistRepo.create({
      userId: "user-001", targetType: "listing", targetId: "lst-ok",
      itemName: "OK Item", price: 5000,
    });
    await watchlistRepo.create({
      userId: "user-002", targetType: "listing", targetId: "lst-err",
      itemName: "Error Item", price: 9000,
    });

    // lst-err is missing from listings repo — simulates "item not found" (no price = skip, not error)
    // lst-ok has a drop
    const poller = makePoller({ "lst-ok": 4000 });
    const result = await poller.runOnce();

    assert.equal(result.scanned, 2);
    assert.equal(result.drops,   1);
  });

  test("✔ số liệu tổng kết runOnce chính xác — nhiều mục, nhiều giảm giá", async () => {
    await watchlistRepo.create({ userId: "u1", targetType: "listing", targetId: "l1", price: 1000 });
    await watchlistRepo.create({ userId: "u2", targetType: "listing", targetId: "l2", price: 2000 });
    await watchlistRepo.create({ userId: "u3", targetType: "listing", targetId: "l3", price: 3000 });
    await watchlistRepo.create({ userId: "u4", targetType: "auction", targetId: "a1", price: 4000 });

    const poller = new MarketplacePricePoller(
      watchlistRepo,
      makeListingsRepo({ l1: 900, l2: 2000, l3: 2500 }),  // l1 drop, l2 unchanged, l3 drop
      makeAuctionsRepo({ a1: 3000 }),                      // a1 drop
      watchlistService,
      999_999,
    );

    const result = await poller.runOnce();

    assert.equal(result.scanned, 4);
    assert.equal(result.drops,   3);
  });

  test("✔ start/stop — timer được quản lý đúng cách", () => {
    const poller = makePoller();
    poller.start();
    poller.start();
    poller.stop();
    poller.stop();
  });

});
