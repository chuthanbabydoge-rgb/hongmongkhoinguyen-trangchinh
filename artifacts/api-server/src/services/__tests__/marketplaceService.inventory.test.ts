// ─────────────────────────────────────────────────────────────────────────────
// Integration tests: MarketplaceService — inventory sync
//
// Uses in-memory stub repositories so no Supabase connection is required.
// Run with: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { MarketplaceService } from "../marketplaceService.js";
import type { IInventoryItemsMutationRepository, InventoryItemRecord } from "../../repositories/inventoryItemsMutationRepository.js";
import type {
  IListingsRepository,
  ITransactionsRepository,
  IAuctionsRepository,
  IBidsRepository,
  IMarketplaceStatsRepository,
  Listing,
  CreateListingInput,
  MarketplaceStats,
} from "../../repositories/marketplaceRepository.js";

// ─── Stub types ───────────────────────────────────────────────────────────────

const BASE_INPUT: CreateListingInput = {
  sellerId: "seller-uuid-0001-0001-000000000001",
  itemId:   "item-uuid-0000-0001-000000000001",
  itemName: "Test Item",
  category: "items",
  rarity:   "common",
  price:    100,
  currency: "credits",
};

const BASE_LISTING: Listing = {
  id:        "listing-uuid-001",
  sellerId:  BASE_INPUT.sellerId,
  itemId:    BASE_INPUT.itemId,
  itemName:  BASE_INPUT.itemName,
  category:  BASE_INPUT.category,
  rarity:    BASE_INPUT.rarity,
  price:     BASE_INPUT.price,
  currency:  BASE_INPUT.currency,
  status:    "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  expiresAt: null,
};

// ─── In-memory stubs ──────────────────────────────────────────────────────────

function makeInventoryStub(record: InventoryItemRecord): IInventoryItemsMutationRepository & { record: InventoryItemRecord } {
  return {
    record,
    async getById(id) { return record.id === id ? record : null; },
    async setStatus(id, status) {
      if (record.id === id) record.status = status;
    },
    async transferOwnership(id, newUserId) {
      if (record.id === id) { record.userId = newUserId; record.status = "đang hoạt động"; }
    },
  };
}

function makeListingsStub(): IListingsRepository & { created: CreateListingInput[]; deleted: string[]; statuses: Map<string, string> } {
  const created: CreateListingInput[] = [];
  const deleted: string[] = [];
  const statuses = new Map<string, string>([["listing-uuid-001", "active"]]);

  return {
    created, deleted, statuses,
    async getAll()       { return []; },
    async getById(id)    { return id === BASE_LISTING.id ? { ...BASE_LISTING, status: statuses.get(id) as "active" | "sold" | "cancelled" | "expired" ?? "active" } : null; },
    async create(input)  { created.push(input); return { ...BASE_LISTING }; },
    async updateStatus(id, status) { statuses.set(id, status); return { ...BASE_LISTING, status }; },
    async delete(id)     { deleted.push(id); return true; },
  };
}

const noopTransactions: ITransactionsRepository = {
  async getAll()              { return []; },
  async getByUserId()         { return []; },
  async create(tx)            { return { ...tx, id: "tx-001", createdAt: new Date().toISOString() }; },
};

const noopAuctions: IAuctionsRepository = {
  async getAll()          { return []; },
  async getById()         { return null; },
  async create(i)         { return null as never; },
  async updateBid()       { return null; },
  async updateStatus()    { return null; },
  async getExpired()      { return []; },
};

const noopBids: IBidsRepository = {
  async getByAuctionId()  { return []; },
  async getHighestBid()   { return null; },
  async create()          { return null as never; },
};

const noopStats: IMarketplaceStatsRepository = {
  async getStats(): Promise<MarketplaceStats> {
    return { totalListings: 0, activeListings: 0, soldListings: 0, totalAuctions: 0, liveAuctions: 0, totalTransactions: 0, marketVolume: 0 };
  },
};

function makeService(inventoryRecord: InventoryItemRecord) {
  const inventoryStub = makeInventoryStub(inventoryRecord);
  const listingsStub  = makeListingsStub();
  const svc = new MarketplaceService(
    listingsStub,
    noopTransactions,
    noopAuctions,
    noopBids,
    noopStats,
    inventoryStub,
  );
  return { svc, inventoryStub, listingsStub };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplaceService — inventory sync", () => {

  // ── createListing ───────────────────────────────────────────────────────────

  describe("createListing", () => {

    test("thành công: trạng thái → 'đang giao dịch' khi tạo mặt hàng (status = 'đang hoạt động')", async () => {
      const { svc, inventoryStub } = makeService({
        id: BASE_INPUT.itemId, userId: BASE_INPUT.sellerId,
        status: "đang hoạt động", name: "Test Item",
      });

      await svc.createListing(BASE_INPUT);

      assert.equal(inventoryStub.record.status, "đang giao dịch",
        "Trạng thái phải là 'đang giao dịch' sau khi niêm yết");
    });

    test("thành công: tạo mặt hàng với status 'active' (legacy English)", async () => {
      const { svc, inventoryStub } = makeService({
        id: BASE_INPUT.itemId, userId: BASE_INPUT.sellerId,
        status: "active", name: "Test Item",
      });

      await svc.createListing(BASE_INPUT);

      assert.equal(inventoryStub.record.status, "đang giao dịch",
        "Phải chấp nhận 'active' (tiếng Anh cũ) và đặt trạng thái 'đang giao dịch'");
    });

    test("từ chối: vật phẩm không tồn tại", async () => {
      const { svc } = makeService({
        id: "other-item", userId: BASE_INPUT.sellerId,
        status: "đang hoạt động", name: "Other",
      });

      await assert.rejects(
        () => svc.createListing(BASE_INPUT),
        /không tồn tại/,
        "Phải từ chối nếu vật phẩm không tồn tại",
      );
    });

    test("từ chối: người bán không sở hữu vật phẩm", async () => {
      const { svc } = makeService({
        id: BASE_INPUT.itemId, userId: "other-user",
        status: "đang hoạt động", name: "Test Item",
      });

      await assert.rejects(
        () => svc.createListing(BASE_INPUT),
        /không sở hữu/,
        "Phải từ chối nếu user_id không khớp với sellerId",
      );
    });

    test("từ chối: trạng thái 'đang giao dịch'", async () => {
      const { svc } = makeService({
        id: BASE_INPUT.itemId, userId: BASE_INPUT.sellerId,
        status: "đang giao dịch", name: "Test Item",
      });

      await assert.rejects(
        () => svc.createListing(BASE_INPUT),
        /đang được niêm yết/,
      );
    });

    test("từ chối: trạng thái 'đã trang bị'", async () => {
      const { svc } = makeService({
        id: BASE_INPUT.itemId, userId: BASE_INPUT.sellerId,
        status: "đã trang bị", name: "Test Item",
      });

      await assert.rejects(
        () => svc.createListing(BASE_INPUT),
        /đang được trang bị/,
      );
    });

    test("từ chối: trạng thái 'bị khóa'", async () => {
      const { svc } = makeService({
        id: BASE_INPUT.itemId, userId: BASE_INPUT.sellerId,
        status: "bị khóa", name: "Test Item",
      });

      await assert.rejects(
        () => svc.createListing(BASE_INPUT),
        /bị khóa/,
      );
    });

    test("từ chối: trạng thái 'đã hết hạn'", async () => {
      const { svc } = makeService({
        id: BASE_INPUT.itemId, userId: BASE_INPUT.sellerId,
        status: "đã hết hạn", name: "Test Item",
      });

      await assert.rejects(
        () => svc.createListing(BASE_INPUT),
        /hết hạn/,
      );
    });

    test("từ chối: trạng thái 'đã sử dụng'", async () => {
      const { svc } = makeService({
        id: BASE_INPUT.itemId, userId: BASE_INPUT.sellerId,
        status: "đã sử dụng", name: "Test Item",
      });

      await assert.rejects(
        () => svc.createListing(BASE_INPUT),
        /đã được sử dụng/,
      );
    });

    test("từ chối: trạng thái không xác định (không phải 'đang hoạt động')", async () => {
      const { svc } = makeService({
        id: BASE_INPUT.itemId, userId: BASE_INPUT.sellerId,
        status: "unknown-status", name: "Test Item",
      });

      await assert.rejects(
        () => svc.createListing(BASE_INPUT),
        /không thể niêm yết/,
      );
    });

  });

  // ── deleteListing ───────────────────────────────────────────────────────────

  describe("deleteListing", () => {

    test("thành công: trạng thái → 'đang hoạt động' khi xóa mặt hàng", async () => {
      const { svc, inventoryStub } = makeService({
        id: BASE_LISTING.itemId, userId: BASE_LISTING.sellerId,
        status: "đang giao dịch", name: "Test Item",
      });

      await svc.deleteListing(BASE_LISTING.id);

      assert.equal(inventoryStub.record.status, "đang hoạt động",
        "Trạng thái phải là 'đang hoạt động' sau khi xóa niêm yết");
    });

    test("từ chối: niêm yết không tồn tại", async () => {
      const { svc } = makeService({
        id: BASE_LISTING.itemId, userId: BASE_LISTING.sellerId,
        status: "đang giao dịch", name: "Test Item",
      });

      await assert.rejects(
        () => svc.deleteListing("non-existent-id"),
        /không tìm thấy/,
      );
    });

  });

  // ── purchaseListing ─────────────────────────────────────────────────────────

  describe("purchaseListing", () => {

    test("thành công: chuyển quyền sở hữu và đặt trạng thái 'đang hoạt động'", async () => {
      const BUYER_ID = "buyer-uuid-0001-0001-000000000099";
      const { svc, inventoryStub } = makeService({
        id: BASE_LISTING.itemId, userId: BASE_LISTING.sellerId,
        status: "đang giao dịch", name: "Test Item",
      });

      await svc.purchaseListing(BASE_LISTING.id, { buyerId: BUYER_ID });

      assert.equal(inventoryStub.record.userId, BUYER_ID,
        "Quyền sở hữu phải được chuyển sang người mua");
      assert.equal(inventoryStub.record.status, "đang hoạt động",
        "Trạng thái phải là 'đang hoạt động' sau khi mua");
    });

    test("từ chối: người bán mua chính mặt hàng của mình", async () => {
      const { svc } = makeService({
        id: BASE_LISTING.itemId, userId: BASE_LISTING.sellerId,
        status: "đang giao dịch", name: "Test Item",
      });

      await assert.rejects(
        () => svc.purchaseListing(BASE_LISTING.id, { buyerId: BASE_LISTING.sellerId }),
        /không thể mua/,
      );
    });

    test("từ chối: niêm yết không tìm thấy", async () => {
      const { svc } = makeService({
        id: BASE_LISTING.itemId, userId: BASE_LISTING.sellerId,
        status: "đang giao dịch", name: "Test Item",
      });

      await assert.rejects(
        () => svc.purchaseListing("non-existent-id", { buyerId: "buyer-999" }),
        /không tìm thấy/,
      );
    });

  });

});
