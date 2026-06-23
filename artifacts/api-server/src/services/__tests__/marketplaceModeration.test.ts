// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplaceModerationService (V2.5)
//
// Covers all admin moderation scenarios — no Supabase or network required.
// Uses fully in-memory stubs.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { MarketplaceModerationService }           from "../marketplaceModerationService.js";
import { MockModerationRepository }               from "../../repositories/marketplaceModerationRepository.js";
import type { IModerationNotifier }               from "../marketplaceModerationService.js";
import type {
  IListingsRepository,
  IAuctionsRepository,
  Listing,
  Auction,
} from "../../repositories/marketplaceRepository.js";

// ─── Stubs ────────────────────────────────────────────────────────────────────

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id:        crypto.randomUUID(),
    sellerId:  "seller-001",
    itemId:    "item-001",
    itemName:  "Test Item",
    category:  "pets",
    rarity:    "common",
    price:     1000,
    currency:  "credits",
    status:    "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: null,
    ...overrides,
  } as Listing;
}

function makeAuction(overrides: Partial<Auction> = {}): Auction {
  return {
    id:            crypto.randomUUID(),
    sellerId:      "seller-001",
    itemId:        "item-002",
    itemName:      "Auction Item",
    category:      "weapons",
    rarity:        "rare",
    startingPrice: 500,
    currentPrice:  500,
    currency:      "credits",
    status:        "live",
    bidCount:      0,
    createdAt:     new Date().toISOString(),
    updatedAt:     new Date().toISOString(),
    endsAt:        new Date(Date.now() + 86400_000).toISOString(),
    ...overrides,
  } as Auction;
}

function makeListingsRepo(listings: Listing[]): IListingsRepository {
  const store = new Map(listings.map(l => [l.id, { ...l }]));
  return {
    async getAll(params) {
      return [...store.values()].filter(l => !params?.status || l.status === params.status);
    },
    async getById(id)              { return store.get(id) ?? null; },
    async updateStatus(id, status) {
      const l = store.get(id);
      if (!l) return null;
      l.status = status as Listing["status"];
      store.set(id, l);
      return l;
    },
    async create()  { return {} as Listing; },
    async delete()  { return false; },
  };
}

function makeAuctionsRepo(auctions: Auction[]): IAuctionsRepository {
  const store = new Map(auctions.map(a => [a.id, { ...a }]));
  return {
    async getAll(params) {
      return [...store.values()].filter(a => !params?.status || a.status === params.status);
    },
    async getById(id)              { return store.get(id) ?? null; },
    async updateStatus(id, status) {
      const a = store.get(id);
      if (!a) return null;
      a.status = status as Auction["status"];
      store.set(id, a);
      return a;
    },
    async create()    { return {} as Auction; },
    async updateBid() { return null; },
    async getExpired() { return []; },
  };
}

// Simple notifier that records calls
function makeNotifier() {
  const calls: string[] = [];
  const notif: IModerationNotifier = {
    async onListingRemoved(sid, lid) { calls.push(`listing-removed:${lid}:${sid}`); },
    async onAuctionRemoved(sid, aid) { calls.push(`auction-removed:${aid}:${sid}`); },
    async onSellerSuspended(sid)     { calls.push(`seller-suspended:${sid}`); },
    async onSellerBanned(sid)        { calls.push(`seller-banned:${sid}`); },
  };
  return { notif, calls };
}

// ─── Shared setup ─────────────────────────────────────────────────────────────

let repo:     MockModerationRepository;
let listing1: Listing;
let auction1: Auction;

beforeEach(() => {
  repo     = new MockModerationRepository();
  listing1 = makeListing({ id: "listing-001" });
  auction1 = makeAuction({ id: "auction-001" });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplaceModerationService", () => {

  test("✔ Xóa danh sách", async () => {
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([listing1]),
      makeAuctionsRepo([]),
    );
    const action = await svc.removeListing("admin-1", "listing-001", "Spam");
    assert.equal(action.action,   "REMOVE_LISTING");
    assert.equal(action.targetId, "listing-001");
    assert.equal(action.adminId,  "admin-1");
  });

  test("✔ Xóa đấu giá", async () => {
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([]),
      makeAuctionsRepo([auction1]),
    );
    const action = await svc.removeAuction("admin-1", "auction-001", "Fraud");
    assert.equal(action.action,   "REMOVE_AUCTION");
    assert.equal(action.targetId, "auction-001");
  });

  test("✔ Tạm ngừng hoạt động người bán", async () => {
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([]),
      makeAuctionsRepo([]),
    );
    const action = await svc.suspendSeller("admin-1", "seller-abc", "Policy violation");
    assert.equal(action.action,   "SUSPEND_SELLER");
    assert.equal(action.targetId, "seller-abc");

    const status = await repo.getSellerStatus("seller-abc");
    assert.equal(status?.status, "suspended");
  });

  test("✔ Cấm người bán", async () => {
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([]),
      makeAuctionsRepo([]),
    );
    const action = await svc.banSeller("admin-1", "seller-xyz", "Repeated violations");
    assert.equal(action.action,   "BAN_SELLER");
    assert.equal(action.targetId, "seller-xyz");

    const status = await repo.getSellerStatus("seller-xyz");
    assert.equal(status?.status, "banned");
  });

  test("✔ Nhật ký kiểm toán đã được tạo", async () => {
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([listing1]),
      makeAuctionsRepo([auction1]),
    );
    await svc.removeListing("admin-1", "listing-001", "Spam");
    await svc.removeAuction("admin-1", "auction-001", "Fraud");
    await svc.suspendSeller("admin-1", "seller-x", "Policy");

    const actions = await svc.getActions();
    assert.equal(actions.length, 3);
  });

  test("✔ Bộ đếm trên bảng điều khiển", async () => {
    const l2 = makeListing({ id: "l-2" });
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([listing1, l2]),
      makeAuctionsRepo([auction1]),
    );
    await svc.suspendSeller("admin-1", "seller-s1", "Reason");
    await svc.banSeller("admin-1",     "seller-b1", "Reason");

    const dash = await svc.getDashboard();
    assert.equal(dash.activeListings,   2);
    assert.equal(dash.activeAuctions,   1);
    assert.equal(dash.suspendedSellers, 1);
    assert.equal(dash.bannedSellers,    1);
    assert.equal(dash.reportedItems,    0);
  });

  test("✔ Chặn tạm ngừng hoạt động trùng lặp", async () => {
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([]),
      makeAuctionsRepo([]),
    );
    await svc.suspendSeller("admin-1", "seller-dup", "First");
    await assert.rejects(
      () => svc.suspendSeller("admin-1", "seller-dup", "Second"),
      /đã bị tạm ngừng/,
    );
  });

  test("✔ Chặn cấm trùng lặp", async () => {
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([]),
      makeAuctionsRepo([]),
    );
    await svc.banSeller("admin-1", "seller-dup", "First");
    await assert.rejects(
      () => svc.banSeller("admin-1", "seller-dup", "Second"),
      /đã bị cấm/,
    );
  });

  test("✔ Thông báo đã được gửi", async () => {
    const { notif, calls } = makeNotifier();
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([listing1]),
      makeAuctionsRepo([auction1]),
      notif,
    );

    await svc.removeListing("admin-1", "listing-001", "Spam");
    await svc.removeAuction("admin-1", "auction-001", "Fraud");
    await svc.suspendSeller("admin-1", "seller-s",    "Policy");
    await svc.banSeller(    "admin-1", "seller-b",    "Violation");

    // Wait a tick for fire-and-forget
    await new Promise(r => setTimeout(r, 10));

    assert.ok(calls.some(c => c.startsWith("listing-removed:")),  "listing-removed notification sent");
    assert.ok(calls.some(c => c.startsWith("auction-removed:")),  "auction-removed notification sent");
    assert.ok(calls.some(c => c.startsWith("seller-suspended:")), "seller-suspended notification sent");
    assert.ok(calls.some(c => c.startsWith("seller-banned:")),    "seller-banned notification sent");
  });

  test("✔ Chặn mục tiêu không hợp lệ", async () => {
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([]),
      makeAuctionsRepo([]),
    );
    await assert.rejects(
      () => svc.removeListing("admin-1", "non-existent-listing", "Spam"),
      /không tìm thấy/,
    );
    await assert.rejects(
      () => svc.removeAuction("admin-1", "non-existent-auction", "Fraud"),
      /không tìm thấy/,
    );
  });

  test("✔ Cơ sở dữ liệu trống", async () => {
    const svc = new MarketplaceModerationService(
      repo,
      makeListingsRepo([]),
      makeAuctionsRepo([]),
    );
    const dash    = await svc.getDashboard();
    const actions = await svc.getActions();
    const reports = await svc.getReported();

    assert.equal(dash.activeListings,   0);
    assert.equal(dash.activeAuctions,   0);
    assert.equal(dash.suspendedSellers, 0);
    assert.equal(dash.bannedSellers,    0);
    assert.deepEqual(actions, []);
    assert.deepEqual(reports, []);
  });
});
