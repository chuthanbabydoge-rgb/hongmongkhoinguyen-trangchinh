// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: Marketplace V1.8 — Search, Filter, Sort, Pagination
//
// Tests in-memory filter repos that mirror the Supabase query layer logic.
// No Supabase connection required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert              from "node:assert/strict";

import type {
  IListingsRepository,
  IAuctionsRepository,
  Listing,
  Auction,
  ListingQueryParams,
  AuctionQueryParams,
  ListingSortField,
  AuctionSortField,
  SortOrder,
  ItemCategory,
  ItemRarity,
  MarketplaceCurrency,
  ListingStatus,
  AuctionStatus,
  CreateListingInput,
  CreateAuctionInput,
} from "../../repositories/marketplaceRepository.js";

// ─── In-memory filtering repos ───────────────────────────────────────────────

const LISTING_SORT_KEY: Record<ListingSortField, keyof Listing> = {
  price: "price", createdAt: "createdAt", updatedAt: "updatedAt", rarity: "rarity", itemName: "itemName",
};
const AUCTION_SORT_KEY: Record<AuctionSortField, keyof Auction> = {
  price: "startingPrice", currentPrice: "currentPrice", createdAt: "createdAt",
  rarity: "rarity", itemName: "itemName", bidCount: "bidCount", endsAt: "endsAt",
};

class MockFilteringListingsRepo implements IListingsRepository {
  constructor(private data: Listing[]) {}

  async getAll(params: ListingQueryParams = {}): Promise<Listing[]> {
    const { q, category, rarity, currency, sellerId, minPrice, maxPrice, status,
            sort = "createdAt", order = "desc", limit = 50, offset = 0 } = params;

    let results = [...this.data];

    if (q)              results = results.filter(l => l.itemName.toLowerCase().includes(q.toLowerCase()));
    if (category)       results = results.filter(l => l.category === category);
    if (rarity)         results = results.filter(l => l.rarity === rarity);
    if (currency)       results = results.filter(l => l.currency === currency);
    if (sellerId)       results = results.filter(l => l.sellerId === sellerId);
    if (status)         results = results.filter(l => l.status === status);
    if (minPrice != null) results = results.filter(l => l.price >= minPrice);
    if (maxPrice != null) results = results.filter(l => l.price <= maxPrice);

    const key = LISTING_SORT_KEY[sort] ?? "createdAt";
    results.sort((a, b) => {
      const av = a[key] as number | string;
      const bv = b[key] as number | string;
      if (av < bv) return order === "asc" ? -1 : 1;
      if (av > bv) return order === "asc" ?  1 : -1;
      return 0;
    });

    return results.slice(offset, offset + limit);
  }

  async getById(id: string)                                  { return this.data.find(l => l.id === id) ?? null; }
  async create(_: CreateListingInput): Promise<Listing>      { throw new Error("not needed"); }
  async updateStatus(id: string, status: ListingStatus)      { return this.data.find(l => l.id === id) ?? null; }
  async delete(_: string)                                    { return false; }
}

class MockFilteringAuctionsRepo implements IAuctionsRepository {
  constructor(private data: Auction[]) {}

  async getAll(params: AuctionQueryParams = {}): Promise<Auction[]> {
    const { q, category, rarity, currency, sellerId, minPrice, maxPrice, status,
            sort = "endsAt", order = "asc", limit = 50, offset = 0 } = params;

    let results = [...this.data];

    if (q)              results = results.filter(a => a.itemName.toLowerCase().includes(q.toLowerCase()));
    if (category)       results = results.filter(a => a.category === category);
    if (rarity)         results = results.filter(a => a.rarity === rarity);
    if (currency)       results = results.filter(a => a.currency === currency);
    if (sellerId)       results = results.filter(a => a.sellerId === sellerId);
    if (status)         results = results.filter(a => a.status === status);
    if (minPrice != null) results = results.filter(a => a.currentPrice >= minPrice);
    if (maxPrice != null) results = results.filter(a => a.currentPrice <= maxPrice);

    const key = AUCTION_SORT_KEY[sort] ?? "endsAt";
    results.sort((a, b) => {
      const av = a[key] as number | string;
      const bv = b[key] as number | string;
      if (av < bv) return order === "asc" ? -1 : 1;
      if (av > bv) return order === "asc" ?  1 : -1;
      return 0;
    });

    return results.slice(offset, offset + limit);
  }

  async getAll2(_?: AuctionQueryParams)          { return []; }
  async getExpired()                             { return []; }
  async getById(id: string)                      { return this.data.find(a => a.id === id) ?? null; }
  async create(_: CreateAuctionInput)            { throw new Error("not needed"); }
  async updateBid(_: string, __: number, ___: number) { return null; }
  async updateStatus(id: string, status: AuctionStatus) { return this.data.find(a => a.id === id) ?? null; }
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const now = new Date();

function makeListing(overrides: Partial<Listing> & { id: string }): Listing {
  return {
    sellerId:  "seller-001",
    itemId:    `item-${overrides.id}`,
    itemName:  "Default Item",
    category:  "items" as ItemCategory,
    rarity:    "common" as ItemRarity,
    price:     100,
    currency:  "credits" as MarketplaceCurrency,
    status:    "active" as ListingStatus,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: null,
    ...overrides,
  };
}

function makeAuction(overrides: Partial<Auction> & { id: string }): Auction {
  return {
    sellerId:      "seller-001",
    itemId:        `item-${overrides.id}`,
    itemName:      "Default Auction Item",
    category:      "items" as ItemCategory,
    rarity:        "common" as ItemRarity,
    startingPrice: 100,
    currentPrice:  100,
    currency:      "credits" as MarketplaceCurrency,
    status:        "live" as AuctionStatus,
    bidCount:      0,
    startsAt:      now.toISOString(),
    endsAt:        new Date(now.getTime() + 86_400_000).toISOString(),
    createdAt:     now.toISOString(),
    ...overrides,
  };
}

const LISTINGS: Listing[] = [
  makeListing({ id: "l1", itemName: "Rùa Thần Kim",       category: "pets",    rarity: "legendary", price: 5000, currency: "credits", sellerId: "seller-001" }),
  makeListing({ id: "l2", itemName: "Rùa Băng Cổ Đại",    category: "pets",    rarity: "epic",      price: 2000, currency: "credits", sellerId: "seller-002" }),
  makeListing({ id: "l3", itemName: "Phượng Hoàng Lửa",   category: "items",   rarity: "rare",      price: 3000, currency: "stars",   sellerId: "seller-001" }),
  makeListing({ id: "l4", itemName: "Long Tinh",           category: "tickets", rarity: "common",    price:  500, currency: "credits", sellerId: "seller-003" }),
  makeListing({ id: "l5", itemName: "Giáp Plasma Mk.III",  category: "items",   rarity: "epic",      price: 4800, currency: "eth",     sellerId: "seller-002", status: "sold" as ListingStatus }),
];

const AUCTIONS: Auction[] = [
  makeAuction({ id: "a1", itemName: "Rồng Vũ Trụ",      category: "pets",  rarity: "mythic",   startingPrice: 10000, currentPrice: 12000, currency: "credits", bidCount: 5,  sellerId: "seller-001" }),
  makeAuction({ id: "a2", itemName: "Long Tinh Cổ",      category: "items", rarity: "legendary",startingPrice: 5000,  currentPrice:  5000, currency: "stars",   bidCount: 0,  sellerId: "seller-002" }),
  makeAuction({ id: "a3", itemName: "Rồng Băng",         category: "pets",  rarity: "epic",     startingPrice: 2000,  currentPrice:  3000, currency: "credits", bidCount: 3,  sellerId: "seller-001", status: "ended" as AuctionStatus }),
  makeAuction({ id: "a4", itemName: "Chiến Giáp Plasma", category: "items", rarity: "rare",     startingPrice: 1000,  currentPrice:  1500, currency: "eth",     bidCount: 2,  sellerId: "seller-003" }),
];

// ─── Listings tests ───────────────────────────────────────────────────────────

describe("Marketplace V1.8 — Listings Search/Filter/Sort", () => {

  test("✔ Tìm kiếm theo tên mặt hàng (exact)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ q: "Rùa Thần Kim" });
    assert.equal(results.length, 1);
    assert.equal(results[0]!.id, "l1");
  });

  test("✔ Tìm kiếm văn bản một phần (partial, case-insensitive)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ q: "rùa" });
    assert.equal(results.length, 2);
    const names = results.map(l => l.itemName);
    assert.ok(names.includes("Rùa Thần Kim"));
    assert.ok(names.includes("Rùa Băng Cổ Đại"));
  });

  test("✔ Lọc theo danh mục (category)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ category: "pets" });
    assert.equal(results.length, 2);
    results.forEach(l => assert.equal(l.category, "pets"));
  });

  test("✔ Lọc theo độ hiếm (rarity)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ rarity: "epic" });
    assert.equal(results.length, 2);
    results.forEach(l => assert.equal(l.rarity, "epic"));
  });

  test("✔ Lọc theo loại tiền tệ (currency)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ currency: "stars" });
    assert.equal(results.length, 1);
    assert.equal(results[0]!.itemName, "Phượng Hoàng Lửa");
  });

  test("✔ Lọc theo người bán (sellerId)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ sellerId: "seller-001" });
    assert.equal(results.length, 2);
    results.forEach(l => assert.equal(l.sellerId, "seller-001"));
  });

  test("✔ Giá tối thiểu (minPrice)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ minPrice: 3000, status: undefined });
    assert.ok(results.length >= 1);
    results.forEach(l => assert.ok(l.price >= 3000));
  });

  test("✔ Giá tối đa (maxPrice)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ maxPrice: 2000 });
    assert.ok(results.length >= 1);
    results.forEach(l => assert.ok(l.price <= 2000));
  });

  test("✔ Kết hợp các bộ lọc (combined filters)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ category: "pets", rarity: "epic" });
    assert.equal(results.length, 1);
    assert.equal(results[0]!.itemName, "Rùa Băng Cổ Đại");
  });

  test("✔ Sắp xếp tăng dần (sort price asc)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ sort: "price", order: "asc" });
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i]!.price >= results[i - 1]!.price);
    }
  });

  test("✔ Sắp xếp giảm dần (sort price desc)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ sort: "price", order: "desc" });
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i]!.price <= results[i - 1]!.price);
    }
  });

  test("✔ Phân trang (pagination limit + offset)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const page1 = await repo.getAll({ sort: "price", order: "asc", limit: 2, offset: 0 });
    const page2 = await repo.getAll({ sort: "price", order: "asc", limit: 2, offset: 2 });
    assert.equal(page1.length, 2);
    assert.equal(page2.length, 2);
    // No overlap between pages
    const ids1 = new Set(page1.map(l => l.id));
    assert.ok(!page2.some(l => ids1.has(l.id)));
    // Page1 prices <= page2 prices
    assert.ok(Math.max(...page1.map(l => l.price)) <= Math.min(...page2.map(l => l.price)));
  });

  test("✔ Kết quả trống (empty results)", async () => {
    const repo = new MockFilteringListingsRepo(LISTINGS);
    const results = await repo.getAll({ q: "Không Tồn Tại Xyz" });
    assert.equal(results.length, 0);
  });

});

// ─── Auctions tests ───────────────────────────────────────────────────────────

describe("Marketplace V1.8 — Auctions Search/Filter", () => {

  test("✔ Tìm kiếm đấu giá (search auctions by name)", async () => {
    const repo = new MockFilteringAuctionsRepo(AUCTIONS);
    const results = await repo.getAll({ q: "rồng" });
    assert.equal(results.length, 2);
    results.forEach(a => assert.ok(a.itemName.toLowerCase().includes("rồng")));
  });

  test("✔ Lọc đấu giá — category + status + sort bidCount desc", async () => {
    const repo = new MockFilteringAuctionsRepo(AUCTIONS);
    const results = await repo.getAll({
      category: "pets",
      status:   "live",
      sort:     "bidCount",
      order:    "desc",
    });
    assert.equal(results.length, 1);
    assert.equal(results[0]!.id, "a1"); // bidCount: 5
  });

});
