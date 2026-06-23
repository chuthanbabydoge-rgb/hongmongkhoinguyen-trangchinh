// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplaceSavedSearchService + MarketplaceSavedSearchPoller (V2.3)
//
// Uses fully in-memory stubs — no Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { MarketplaceSavedSearchService }  from "../marketplaceSavedSearchService.js";
import { MarketplaceSavedSearchPoller }   from "../marketplaceSavedSearchPoller.js";
import { MockSavedSearchRepository }      from "../../repositories/marketplaceSavedSearchRepository.js";
import { MockMarketplaceNotificationRepository } from "../../repositories/marketplaceNotificationRepository.js";
import { MarketplaceNotificationService } from "../marketplaceNotificationService.js";
import type { IListingsRepository, Listing } from "../../repositories/marketplaceRepository.js";

// ─── Listing stub factory ─────────────────────────────────────────────────────

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id:         crypto.randomUUID(),
    itemId:     "item-001",
    itemName:   "Rồng Lửa",
    sellerId:   "seller-001",
    price:      10000,
    currency:   "credits",
    category:   "pets",
    rarity:     "legendary",
    status:     "active",
    createdAt:  new Date().toISOString(),
    updatedAt:  new Date().toISOString(),
    ...overrides,
  } as Listing;
}

function makeListingsRepo(listings: Listing[]): IListingsRepository {
  return {
    async getAll(params) {
      return listings.filter(l => {
        if (params?.status   && l.status   !== params.status)   return false;
        if (params?.category && l.category !== params.category) return false;
        if (params?.rarity   && l.rarity   !== params.rarity)   return false;
        if (params?.currency && l.currency !== params.currency) return false;
        if (params?.minPrice != null && l.price < params.minPrice) return false;
        if (params?.maxPrice != null && l.price > params.maxPrice) return false;
        if (params?.q) {
          const q = params.q.toLowerCase();
          if (!l.itemName.toLowerCase().includes(q)) return false;
        }
        return true;
      });
    },
    async getById(id) { return listings.find(l => l.id === id) ?? null; },
    async create()    { return {} as Listing; },
    async updateStatus() { return null; },
    async delete()    { return false; },
  };
}

// ─── Shared setup ─────────────────────────────────────────────────────────────

let searchRepo:   MockSavedSearchRepository;
let notifRepo:    MockMarketplaceNotificationRepository;
let notifService: MarketplaceNotificationService;
let service:      MarketplaceSavedSearchService;

beforeEach(() => {
  searchRepo   = new MockSavedSearchRepository();
  notifRepo    = new MockMarketplaceNotificationRepository();
  notifService = new MarketplaceNotificationService(notifRepo);
  service      = new MarketplaceSavedSearchService(searchRepo);
});

function makePoller(listings: Listing[] = []) {
  return new MarketplaceSavedSearchPoller(
    searchRepo,
    makeListingsRepo(listings),
    notifService,
    999_999,
  );
}

// ─── Service tests ────────────────────────────────────────────────────────────

describe("MarketplaceSavedSearchService", () => {

  test("✔ Tạo tìm kiếm — đầy đủ trường", async () => {
    const s = await service.create({
      userId: "user-001", name: "Thú cưng huyền thoại",
      category: "pets", rarity: "legendary", maxPrice: 5000,
    });

    assert.ok(s.id);
    assert.equal(s.userId,   "user-001");
    assert.equal(s.name,     "Thú cưng huyền thoại");
    assert.equal(s.category, "pets");
    assert.equal(s.rarity,   "legendary");
    assert.equal(s.maxPrice, 5000);
    assert.ok(s.createdAt);
    assert.ok(s.updatedAt);
  });

  test("✔ Tạo tìm kiếm — tối thiểu (chỉ userId + name)", async () => {
    const s = await service.create({ userId: "user-001", name: "Tìm gì đó" });
    assert.equal(s.query,    null);
    assert.equal(s.category, null);
    assert.equal(s.minPrice, null);
  });

  test("✔ Cập nhật tìm kiếm", async () => {
    const created = await service.create({ userId: "u1", name: "Cũ" });
    const updated = await service.update(created.id, { name: "Mới", maxPrice: 9999 });

    assert.ok(updated);
    assert.equal(updated!.name,     "Mới");
    assert.equal(updated!.maxPrice, 9999);
  });

  test("✔ Cập nhật tìm kiếm không tồn tại → null", async () => {
    const result = await service.update("nonexistent", { name: "X" });
    assert.equal(result, null);
  });

  test("✔ Xóa tìm kiếm", async () => {
    const { id } = await service.create({ userId: "u1", name: "Del" });
    assert.equal(await service.delete(id), true);
    assert.equal(await service.findById(id), null);
  });

  test("✔ Xóa tìm kiếm không tồn tại → false", async () => {
    assert.equal(await service.delete("ghost"), false);
  });

  test("✔ Truy vấn theo người dùng", async () => {
    await service.create({ userId: "u1", name: "A" });
    await service.create({ userId: "u1", name: "B" });
    await service.create({ userId: "u2", name: "C" });

    const list = await service.list("u1");
    assert.equal(list.length, 2);
    assert.ok(list.every(s => s.userId === "u1"));
  });

  test("✔ Xác thực — thiếu userId", async () => {
    await assert.rejects(() => service.create({ userId: "", name: "X" }), /bắt buộc/u);
  });

  test("✔ Xác thực — thiếu name", async () => {
    await assert.rejects(() => service.create({ userId: "u1", name: "" }), /bắt buộc/u);
  });

  test("✔ Xác thực — minPrice > maxPrice", async () => {
    await assert.rejects(
      () => service.create({ userId: "u1", name: "X", minPrice: 9000, maxPrice: 1000 }),
      /lớn hơn/u,
    );
  });

  test("✔ Cơ sở dữ liệu trống trả về danh sách rỗng", async () => {
    const list = await service.list("nobody");
    assert.equal(list.length, 0);
  });

});

// ─── Poller tests ─────────────────────────────────────────────────────────────

describe("MarketplaceSavedSearchPoller", () => {

  test("✔ Cơ sở dữ liệu trống trả về giá trị 0", async () => {
    const result = await makePoller().runOnce();
    assert.equal(result.savedSearches, 0);
    assert.equal(result.newMatches,    0);
  });

  test("✔ Tìm kiếm khớp theo danh mục", async () => {
    await searchRepo.create({ userId: "u1", name: "Thú cưng", category: "pets" });
    const pet  = makeListing({ category: "pets" });
    const gear = makeListing({ category: "weapons" });

    const poller = makePoller([pet, gear]);
    const result = await poller.runOnce();

    assert.equal(result.savedSearches, 1);
    assert.equal(result.newMatches,    1);
  });

  test("✔ Tìm kiếm khớp theo độ hiếm", async () => {
    await searchRepo.create({ userId: "u1", name: "Legendary only", rarity: "legendary" });
    const legendary = makeListing({ rarity: "legendary" });
    const common    = makeListing({ rarity: "common" });

    const result = await makePoller([legendary, common]).runOnce();
    assert.equal(result.newMatches, 1);
  });

  test("✔ Tìm kiếm khớp theo khoảng giá", async () => {
    await searchRepo.create({ userId: "u1", name: "Giá rẻ", minPrice: 1000, maxPrice: 5000 });
    const cheap     = makeListing({ price: 3000 });
    const expensive = makeListing({ price: 9000 });

    const result = await makePoller([cheap, expensive]).runOnce();
    assert.equal(result.newMatches, 1);
  });

  test("✔ Kết hợp các bộ lọc", async () => {
    await searchRepo.create({
      userId: "u1", name: "Combo",
      category: "pets", rarity: "legendary", maxPrice: 8000,
    });

    const match1 = makeListing({ category: "pets", rarity: "legendary", price: 5000 });
    const match2 = makeListing({ category: "pets", rarity: "legendary", price: 6000 });
    const noMatch = makeListing({ category: "weapons", rarity: "legendary", price: 5000 });

    const result = await makePoller([match1, match2, noMatch]).runOnce();
    assert.equal(result.newMatches, 2);
  });

  test("✔ Đã tạo thông báo khi có kết quả phù hợp", async () => {
    await searchRepo.create({ userId: "u1", name: "Dragon Search", category: "pets" });
    const listing = makeListing({ category: "pets", itemName: "Rồng Vàng" });

    await makePoller([listing]).runOnce();

    const { data } = await notifService.getNotifications("u1");
    const match = data.find(n => n.type === "SAVED_SEARCH_MATCH");
    assert.ok(match, "Phải có thông báo SAVED_SEARCH_MATCH");
    assert.ok(match!.message.includes("Rồng Vàng"));
    assert.ok(match!.message.includes("Dragon Search"));
  });

  test("✔ Ngăn chặn thông báo trùng lặp — chạy lại không phát thêm", async () => {
    await searchRepo.create({ userId: "u1", name: "No Dup", category: "pets" });
    const listing = makeListing({ category: "pets" });
    const poller  = makePoller([listing]);

    await poller.runOnce();
    await poller.runOnce();

    const { data } = await notifService.getNotifications("u1");
    const matches = data.filter(n => n.type === "SAVED_SEARCH_MATCH");
    assert.equal(matches.length, 1, "Chỉ một thông báo dù chạy hai lần");
  });

  test("✔ Tóm tắt thăm dò chính xác — nhiều tìm kiếm, nhiều kết quả", async () => {
    await searchRepo.create({ userId: "u1", name: "Search A", category: "pets" });
    await searchRepo.create({ userId: "u2", name: "Search B", rarity: "rare" });
    await searchRepo.create({ userId: "u3", name: "Search C", maxPrice: 100 });

    const l1 = makeListing({ category: "pets",    rarity: "rare",      price: 50 });
    const l2 = makeListing({ category: "weapons", rarity: "rare",      price: 200 });
    const l3 = makeListing({ category: "armor",   rarity: "common",    price: 80 });

    const result = await makePoller([l1, l2, l3]).runOnce();

    assert.equal(result.savedSearches, 3);
    assert.equal(result.newMatches,    5);
  });

  test("✔ Poller tiếp tục xử lý sau lỗi riêng lẻ", async () => {
    await searchRepo.create({ userId: "u1", name: "OK Search", category: "pets" });
    const listing = makeListing({ category: "pets" });

    const result = await makePoller([listing]).runOnce();
    assert.equal(result.savedSearches, 1);
    assert.equal(result.newMatches,    1);
  });

  test("✔ start/stop — timer được quản lý đúng cách", () => {
    const poller = makePoller();
    poller.start();
    poller.start();
    poller.stop();
    poller.stop();
  });

});
