// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplaceWatchlistService (V1.9)
//
// Covers all watchlist CRUD operations and validation rules.
// Uses fully in-memory stubs — no Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert              from "node:assert/strict";

import { MarketplaceWatchlistService } from "../marketplaceWatchlistService.js";
import { MockMarketplaceWatchlistRepository } from "../../repositories/marketplaceWatchlistRepository.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeService() {
  const repo    = new MockMarketplaceWatchlistRepository();
  const service = new MarketplaceWatchlistService(repo);
  return { repo, service };
}

const LISTING_WATCH = {
  userId:     "user-001",
  targetType: "listing",
  targetId:   "lst-001",
  itemName:   "Rồng Lửa",
  price:      50000,
  rarity:     "legendary",
  status:     "active",
};

const AUCTION_WATCH = {
  userId:     "user-001",
  targetType: "auction",
  targetId:   "auc-001",
  itemName:   "Sói Băng",
  price:      20000,
  rarity:     "epic",
  status:     "live",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplaceWatchlistService", () => {

  test("✔ Thêm theo dõi danh sách (add listing watch)", async () => {
    const { service } = makeService();
    const { entry, created } = await service.add(LISTING_WATCH);

    assert.equal(created, true);
    assert.ok(entry.id);
    assert.equal(entry.userId,     "user-001");
    assert.equal(entry.targetType, "listing");
    assert.equal(entry.targetId,   "lst-001");
    assert.equal(entry.itemName,   "Rồng Lửa");
    assert.equal(entry.price,      50000);
    assert.equal(entry.rarity,     "legendary");
    assert.equal(entry.status,     "active");
    assert.ok(entry.createdAt);
  });

  test("✔ Thêm theo dõi đấu giá (add auction watch)", async () => {
    const { service } = makeService();
    const { entry, created } = await service.add(AUCTION_WATCH);

    assert.equal(created, true);
    assert.equal(entry.targetType, "auction");
    assert.equal(entry.targetId,   "auc-001");
    assert.equal(entry.price,      20000);
    assert.equal(entry.status,     "live");
  });

  test("✔ Chặn theo dõi trùng lặp (block duplicate watch)", async () => {
    const { service } = makeService();

    const first  = await service.add(LISTING_WATCH);
    const second = await service.add(LISTING_WATCH);

    assert.equal(first.created,  true);
    assert.equal(second.created, false);
    assert.equal(first.entry.id, second.entry.id);

    const list = await service.list("user-001");
    assert.equal(list.length, 1);
  });

  test("✔ Xóa theo dõi (remove watch)", async () => {
    const { service } = makeService();

    const { entry } = await service.add(LISTING_WATCH);
    const deleted   = await service.remove(entry.id);
    assert.equal(deleted, true);

    const list = await service.list("user-001");
    assert.equal(list.length, 0);
  });

  test("✔ Xóa theo dõi không tồn tại (remove nonexistent)", async () => {
    const { service } = makeService();
    const deleted = await service.remove("nonexistent-id");
    assert.equal(deleted, false);
  });

  test("✔ Liệt kê danh sách theo dõi (list watchlist)", async () => {
    const { service } = makeService();

    await service.add(LISTING_WATCH);
    await service.add(AUCTION_WATCH);

    const list = await service.list("user-001");
    assert.equal(list.length, 2);
  });

  test("✔ Đếm danh sách theo dõi (count watchlist)", async () => {
    const { service } = makeService();

    await service.add(LISTING_WATCH);
    await service.add(AUCTION_WATCH);
    await service.add({ ...LISTING_WATCH, userId: "user-002", targetId: "lst-002" });

    assert.equal(await service.count("user-001"), 2);
    assert.equal(await service.count("user-002"), 1);
  });

  test("✔ Loại mục tiêu không hợp lệ (invalid target type)", async () => {
    const { service } = makeService();

    await assert.rejects(
      () => service.add({ ...LISTING_WATCH, targetType: "invalid" }),
      /không hợp lệ/u,
    );
  });

  test("✔ Thiếu người dùng (missing userId)", async () => {
    const { service } = makeService();

    await assert.rejects(
      () => service.add({ ...LISTING_WATCH, userId: "" }),
      /bắt buộc/u,
    );
  });

  test("✔ Trạng thái trống (empty state)", async () => {
    const { service } = makeService();

    const list = await service.list("unknown-user");
    assert.equal(list.length, 0);
    assert.equal(await service.count("unknown-user"), 0);
  });

  test("✔ Phản hồi theo dõi được bổ sung (enriched watch response)", async () => {
    const { service } = makeService();

    const { entry } = await service.add({
      userId:     "user-001",
      targetType: "listing",
      targetId:   "lst-002",
      itemName:   "Striker Alpha",
      price:      35000,
      rarity:     "epic",
      status:     "active",
    });

    assert.equal(entry.itemName, "Striker Alpha");
    assert.equal(entry.price,    35000);
    assert.equal(entry.rarity,   "epic");
    assert.equal(entry.status,   "active");
  });

});
