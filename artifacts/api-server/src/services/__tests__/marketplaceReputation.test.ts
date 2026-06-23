// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplaceReputationService (V2.4)
//
// Covers all reputation scenarios — no Supabase or network required.
// Uses fully in-memory stubs.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { MarketplaceReputationService }                      from "../marketplaceReputationService.js";
import { MockReputationRepository, computeScore, computeLevel } from "../../repositories/marketplaceReputationRepository.js";
import type { ITransactionLookup }                           from "../marketplaceReputationService.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTxLookup(
  records: Record<string, { sellerId: string; buyerId: string }>,
): ITransactionLookup {
  return {
    async getById(id) {
      return records[id] ?? null;
    },
  };
}

// ─── Shared setup ─────────────────────────────────────────────────────────────

let repo:    MockReputationRepository;
let service: MarketplaceReputationService;

beforeEach(() => {
  repo    = new MockReputationRepository();
  service = new MarketplaceReputationService(repo);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplaceReputationService", () => {

  test("✔ tạo uy tín", async () => {
    const rep = await service.recordSale("seller-1", 5000);
    assert.equal(rep.userId,     "seller-1");
    assert.equal(rep.totalSales,  1);
    assert.equal(rep.totalVolume, 5000);
  });

  test("✔ tự động tạo khi bán hàng lần đầu", async () => {
    const existing = await repo.getByUserId("seller-new");
    assert.equal(existing, null);

    const rep = await service.recordSale("seller-new", 1000);
    assert.equal(rep.userId, "seller-new");
    assert.equal(rep.totalSales, 1);
  });

  test("✔ đánh giá tích cực", async () => {
    await service.recordSale("seller-2", 1000);
    const rep = await service.submitRating({
      buyerId:       "buyer-1",
      sellerId:      "seller-2",
      transactionId: "tx-1",
      rating:         1,
    });
    assert.equal(rep.positiveRatings, 1);
    assert.equal(rep.negativeRatings, 0);
  });

  test("✔ đánh giá tiêu cực", async () => {
    await service.recordSale("seller-3", 1000);
    const rep = await service.submitRating({
      buyerId:       "buyer-1",
      sellerId:      "seller-3",
      transactionId: "tx-2",
      rating:        -1,
    });
    assert.equal(rep.positiveRatings, 0);
    assert.equal(rep.negativeRatings, 1);
  });

  test("✔ tính toán điểm số", async () => {
    // totalSales=5, positive=4, negative=1
    // score = 5*2 + 4*5 - 1*10 = 10 + 20 - 10 = 20
    for (let i = 0; i < 5; i++) {
      await service.recordSale("seller-4", 1000);
    }
    for (let i = 0; i < 4; i++) {
      await service.submitRating({ buyerId: `b${i}`, sellerId: "seller-4", transactionId: `tx-pos-${i}`, rating: 1 });
    }
    await service.submitRating({ buyerId: "b-neg", sellerId: "seller-4", transactionId: "tx-neg-1", rating: -1 });

    const rep = await service.getReputation("seller-4");
    assert.ok(rep);
    assert.equal(rep.score, 20);
  });

  test("✔ Cấp độ Đồng", () => {
    assert.equal(computeLevel(0),  "Bronze");
    assert.equal(computeLevel(19), "Bronze");
    assert.equal(computeLevel(-5), "Bronze");
  });

  test("✔ Cấp độ Bạc", () => {
    assert.equal(computeLevel(20), "Silver");
    assert.equal(computeLevel(49), "Silver");
  });

  test("✔ Cấp độ Vàng", () => {
    assert.equal(computeLevel(50), "Gold");
    assert.equal(computeLevel(99), "Gold");
  });

  test("✔ Cấp độ Bạch kim", () => {
    assert.equal(computeLevel(100), "Platinum");
    assert.equal(computeLevel(199), "Platinum");
  });

  test("✔ Cấp độ Kim cương", () => {
    assert.equal(computeLevel(200), "Diamond");
    assert.equal(computeLevel(999), "Diamond");
  });

  test("✔ xếp hạng người bán hàng đầu", async () => {
    await service.recordSale("seller-a", 100_000);
    await service.recordSale("seller-a", 100_000);
    await service.recordSale("seller-b", 1_000);

    const top = await service.getTopSellers(2);
    assert.equal(top.length, 2);
    assert.equal(top[0]!.userId, "seller-a");
    assert.equal(top[1]!.userId, "seller-b");
  });

  test("✔ chặn đánh giá trùng lặp", async () => {
    await service.recordSale("seller-5", 1000);
    await service.submitRating({ buyerId: "buyer-dup", sellerId: "seller-5", transactionId: "tx-dup", rating: 1 });
    await assert.rejects(
      () => service.submitRating({ buyerId: "buyer-dup", sellerId: "seller-5", transactionId: "tx-dup", rating: -1 }),
      /đã xếp hạng/,
    );
  });

  test("✔ chặn giao dịch không hợp lệ", async () => {
    const svcWithLookup = new MarketplaceReputationService(
      repo,
      makeTxLookup({ "tx-valid": { sellerId: "seller-6", buyerId: "buyer-x" } }),
    );
    await assert.rejects(
      () => svcWithLookup.submitRating({
        buyerId:       "buyer-x",
        sellerId:      "seller-6",
        transactionId: "tx-does-not-exist",
        rating:         1,
      }),
      /không tìm thấy/,
    );
  });

  test("✔ cơ sở dữ liệu trống", async () => {
    const top = await service.getTopSellers();
    assert.deepEqual(top, []);

    const rep = await service.getReputation("nobody");
    assert.equal(rep, null);
  });
});
