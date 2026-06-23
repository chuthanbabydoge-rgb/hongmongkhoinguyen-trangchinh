// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MockMarketplacePaymentRepository
//
// Verifies that findAll / findById / findByUser work correctly across all
// supported filters and pagination options.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { MockMarketplacePaymentRepository } from "../../repositories/marketplacePaymentRepository.js";
import type { MarketplaceWalletTransaction } from "../../repositories/marketplacePaymentRepository.js";

// ─── Seed helpers ─────────────────────────────────────────────────────────────

function makeTx(overrides: Partial<MarketplaceWalletTransaction> & { id: string }): MarketplaceWalletTransaction {
  return {
    id:          overrides.id,
    buyerId:     overrides.buyerId    ?? "buyer-001",
    sellerId:    overrides.sellerId   ?? "seller-001",
    totalAmount: overrides.totalAmount ?? 1_000,
    feeAmount:   overrides.feeAmount  ?? 50,
    netAmount:   overrides.netAmount  ?? 950,
    currency:    overrides.currency   ?? "credits",
    sourceType:  overrides.sourceType ?? "listing",
    sourceId:    overrides.sourceId   ?? `src-${overrides.id}`,
    createdAt:   overrides.createdAt  ?? new Date().toISOString(),
  };
}

// ─── Shared fixture (seeded in beforeEach) ────────────────────────────────────

//  tx-1: buyer-001 / seller-001 / credits / listing
//  tx-2: buyer-002 / seller-001 / stars   / auction
//  tx-3: buyer-001 / seller-003 / credits / listing
//  tx-4: buyer-004 / seller-005 / eth     / auction
//  tx-5: buyer-006 / seller-007 / credits / listing

const SEED: MarketplaceWalletTransaction[] = [
  makeTx({ id: "tx-1", buyerId: "buyer-001", sellerId: "seller-001", currency: "credits", sourceType: "listing"  }),
  makeTx({ id: "tx-2", buyerId: "buyer-002", sellerId: "seller-001", currency: "stars",   sourceType: "auction"  }),
  makeTx({ id: "tx-3", buyerId: "buyer-001", sellerId: "seller-003", currency: "credits", sourceType: "listing"  }),
  makeTx({ id: "tx-4", buyerId: "buyer-004", sellerId: "seller-005", currency: "eth",     sourceType: "auction"  }),
  makeTx({ id: "tx-5", buyerId: "buyer-006", sellerId: "seller-007", currency: "credits", sourceType: "listing"  }),
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MockMarketplacePaymentRepository", () => {
  let repo: MockMarketplacePaymentRepository;

  beforeEach(async () => {
    repo = new MockMarketplacePaymentRepository();
    for (const tx of SEED) await repo.create(tx);
  });

  // ── 1. Liệt kê tất cả các khoản thanh toán ─────────────────────────────

  describe("liệt kê tất cả các khoản thanh toán", () => {
    test("findAll() trả về tất cả bản ghi với total đúng", async () => {
      const { data, total } = await repo.findAll();
      assert.equal(total, SEED.length);
      assert.equal(data.length, SEED.length);
    });

    test("kết quả sắp xếp theo thứ tự mới nhất (reverse insert)", async () => {
      const { data } = await repo.findAll();
      // The last seeded record (tx-5) should come first
      assert.equal(data[0]!.id, "tx-5");
      assert.equal(data[data.length - 1]!.id, "tx-1");
    });
  });

  // ── 2. Lọc theo người mua ──────────────────────────────────────────────

  describe("lọc theo người mua", () => {
    test("findAll({ userId: 'buyer-001' }) chỉ trả về bản ghi có buyer-001 là người mua", async () => {
      const { data, total } = await repo.findAll({ userId: "buyer-001" });
      assert.equal(total, 2);   // tx-1, tx-3
      assert.ok(data.every(t => t.buyerId === "buyer-001" || t.sellerId === "buyer-001"));
    });
  });

  // ── 3. Lọc theo người bán ──────────────────────────────────────────────

  describe("lọc theo người bán", () => {
    test("findAll({ userId: 'seller-001' }) trả về cả giao dịch có seller-001 là người bán", async () => {
      const { data, total } = await repo.findAll({ userId: "seller-001" });
      assert.equal(total, 2);   // tx-1 (seller-001), tx-2 (seller-001)
      assert.ok(data.every(t => t.buyerId === "seller-001" || t.sellerId === "seller-001"));
    });

    test("findByUser() trả về kết quả tương đương findAll với userId", async () => {
      const byUser = await repo.findByUser("seller-001");
      const byAll  = await repo.findAll({ userId: "seller-001" });
      assert.deepEqual(byUser, byAll);
    });
  });

  // ── 4. Lọc theo loại tiền tệ ───────────────────────────────────────────

  describe("lọc theo loại tiền tệ", () => {
    test("findAll({ currency: 'credits' }) chỉ trả về giao dịch credits", async () => {
      const { data, total } = await repo.findAll({ currency: "credits" });
      assert.equal(total, 3);   // tx-1, tx-3, tx-5
      assert.ok(data.every(t => t.currency === "credits"));
    });

    test("findAll({ currency: 'eth' }) chỉ trả về giao dịch eth", async () => {
      const { data, total } = await repo.findAll({ currency: "eth" });
      assert.equal(total, 1);   // tx-4
      assert.equal(data[0]!.id, "tx-4");
    });
  });

  // ── 5. Lọc theo loại nguồn ─────────────────────────────────────────────

  describe("lọc theo loại nguồn", () => {
    test("findAll({ sourceType: 'listing' }) chỉ trả về giao dịch mua niêm yết", async () => {
      const { data, total } = await repo.findAll({ sourceType: "listing" });
      assert.equal(total, 3);   // tx-1, tx-3, tx-5
      assert.ok(data.every(t => t.sourceType === "listing"));
    });

    test("findAll({ sourceType: 'auction' }) chỉ trả về giao dịch đấu giá", async () => {
      const { data, total } = await repo.findAll({ sourceType: "auction" });
      assert.equal(total, 2);   // tx-2, tx-4
      assert.ok(data.every(t => t.sourceType === "auction"));
    });
  });

  // ── 6. Lấy một khoản thanh toán duy nhất ──────────────────────────────

  describe("lấy một khoản thanh toán duy nhất", () => {
    test("findById() trả về đúng bản ghi khi ID tồn tại", async () => {
      const tx = await repo.findById("tx-3");
      assert.ok(tx, "phải tìm thấy tx-3");
      assert.equal(tx!.id,       "tx-3");
      assert.equal(tx!.buyerId,  "buyer-001");
      assert.equal(tx!.sellerId, "seller-003");
    });

    test("findById() trả về null khi ID không tồn tại", async () => {
      const tx = await repo.findById("tx-nonexistent");
      assert.equal(tx, null);
    });
  });

  // ── 7. Phân trang ──────────────────────────────────────────────────────

  describe("phân trang", () => {
    test("limit=2 chỉ trả về 2 bản ghi nhưng total phản ánh tổng số", async () => {
      const { data, total } = await repo.findAll({ limit: 2 });
      assert.equal(total, 5);
      assert.equal(data.length, 2);
    });

    test("offset+limit phân trang chính xác qua toàn bộ tập hợp", async () => {
      const page1 = await repo.findAll({ limit: 2, offset: 0 });
      const page2 = await repo.findAll({ limit: 2, offset: 2 });
      const page3 = await repo.findAll({ limit: 2, offset: 4 });

      assert.equal(page1.data.length, 2);
      assert.equal(page2.data.length, 2);
      assert.equal(page3.data.length, 1);   // only 1 record left

      // No duplicates across pages
      const ids = [
        ...page1.data.map(t => t.id),
        ...page2.data.map(t => t.id),
        ...page3.data.map(t => t.id),
      ];
      assert.equal(new Set(ids).size, 5, "không có bản ghi trùng lặp giữa các trang");
    });
  });

  // ── 8. Không tìm thấy thanh toán ──────────────────────────────────────

  describe("không tìm thấy thanh toán", () => {
    test("findById() với ID không hợp lệ trả về null", async () => {
      const result = await repo.findById("does-not-exist");
      assert.equal(result, null);
    });

    test("findAll({ userId: 'unknown' }) trả về danh sách trống", async () => {
      const { data, total } = await repo.findAll({ userId: "no-such-user" });
      assert.equal(total, 0);
      assert.equal(data.length, 0);
    });
  });
});
