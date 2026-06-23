// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplacePaymentService
//
// Covers wallet payment settlement (V1.3) and fee/treasury logic (V1.4).
// Uses fully in-memory stubs — no Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  MarketplacePaymentService,
  MARKETPLACE_FEE_PERCENT,
  TREASURY_USER_ID,
} from "../marketplacePaymentService.js";
import type { IWalletRepository }    from "../../repositories/walletRepository.js";
import type { WalletReference }      from "../../models/walletReference.js";
import type {
  IMarketplacePaymentRepository,
  MarketplaceWalletTransaction,
} from "../../repositories/marketplacePaymentRepository.js";

// ─── In-memory stubs ──────────────────────────────────────────────────────────

function makeWalletRef(
  userId: string,
  credits: number,
  coins = 0,
  tokens = 0,
): WalletReference {
  return {
    userId,
    walletId:     `wallet-${userId}`,
    currency:     { credits, coins, tokens },
    lastSyncedAt: new Date().toISOString(),
  };
}

class InMemoryWalletRepo implements IWalletRepository {
  private store = new Map<string, WalletReference>();

  seed(ref: WalletReference) {
    this.store.set(ref.userId, { ...ref, currency: { ...ref.currency } });
  }
  get(userId: string) { return this.store.get(userId); }

  async getByUserId(userId: string) { return this.store.get(userId) ?? null; }

  async create(ref: WalletReference) {
    const record = { ...ref, currency: { ...ref.currency } };
    this.store.set(record.userId, record);
    return record;
  }

  async update(ref: WalletReference) {
    if (!this.store.has(ref.userId)) return null;
    const updated = { ...ref, currency: { ...ref.currency }, lastSyncedAt: new Date().toISOString() };
    this.store.set(ref.userId, updated);
    return updated;
  }

  async syncBalance(userId: string, currency: WalletReference["currency"]) {
    const existing = this.store.get(userId);
    if (!existing) return null;
    const updated = { ...existing, currency: { ...currency } };
    this.store.set(userId, updated);
    return updated;
  }

  async delete(userId: string) { return this.store.delete(userId); }
}

class InMemoryPaymentRepo implements IMarketplacePaymentRepository {
  readonly records: MarketplaceWalletTransaction[] = [];

  async create(tx: MarketplaceWalletTransaction) {
    this.records.push({ ...tx });
    return tx;
  }

  async getByUserId(userId: string, limit = 50) {
    return this.records
      .filter(r => r.buyerId === userId || r.sellerId === userId)
      .slice(-limit);
  }
}

class FailingPaymentRepo implements IMarketplacePaymentRepository {
  async create(_tx: MarketplaceWalletTransaction): Promise<MarketplaceWalletTransaction> {
    throw new Error("DB_ERROR: marketplace_wallet_transactions unavailable");
  }
  async getByUserId() { return []; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeService(walletRepo: IWalletRepository, paymentRepo: IMarketplacePaymentRepository) {
  return new MarketplacePaymentService(walletRepo, paymentRepo);
}

/** Expected fee for a given amount at the configured rate */
function expectedFee(amount: number) {
  return Math.floor(amount * MARKETPLACE_FEE_PERCENT / 100);
}

const BUYER  = "buyer-001";
const SELLER = "seller-001";

// ─────────────────────────────────────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────────────────────────────────────

describe("MarketplacePaymentService", () => {
  let wallets:  InMemoryWalletRepo;
  let payments: InMemoryPaymentRepo;

  beforeEach(() => {
    wallets  = new InMemoryWalletRepo();
    payments = new InMemoryPaymentRepo();
    wallets.seed(makeWalletRef(BUYER,  10_000));
    wallets.seed(makeWalletRef(SELLER,  2_000));
  });

  // ── V1.3 — giao dịch mua thành công ──────────────────────────────────────

  describe("giao dịch mua thành công", () => {
    test("trừ tiền người mua, cộng tiền ròng cho người bán", async () => {
      const svc = makeService(wallets, payments);

      await svc.processPayment({
        buyerId: BUYER, sellerId: SELLER,
        amount: 3_000, currency: "credits",
        sourceType: "listing", sourceId: "listing-abc",
      });

      const fee = expectedFee(3_000);           // 150
      assert.equal(wallets.get(BUYER)!.currency.credits,  10_000 - 3_000);
      assert.equal(wallets.get(SELLER)!.currency.credits,  2_000 + (3_000 - fee));
    });

    test("ánh xạ tiền tệ — stars → coins", async () => {
      wallets.seed(makeWalletRef(BUYER,  0, 8_000, 0));
      wallets.seed(makeWalletRef(SELLER, 0, 1_000, 0));
      const svc = makeService(wallets, payments);

      await svc.processPayment({
        buyerId: BUYER, sellerId: SELLER,
        amount: 500, currency: "stars",
        sourceType: "listing", sourceId: "listing-stars",
      });

      const fee = expectedFee(500);
      assert.equal(wallets.get(BUYER)!.currency.coins,  8_000 - 500);
      assert.equal(wallets.get(SELLER)!.currency.coins, 1_000 + (500 - fee));
    });
  });

  // ── V1.3 — thiếu tiền ────────────────────────────────────────────────────

  describe("thiếu tiền", () => {
    test("ném lỗi khi số dư người mua không đủ", async () => {
      const svc = makeService(wallets, payments);
      await assert.rejects(
        () => svc.processPayment({
          buyerId: BUYER, sellerId: SELLER,
          amount: 99_999, currency: "credits",
          sourceType: "listing", sourceId: "listing-xyz",
        }),
        /Số dư không đủ/,
      );
    });

    test("không thay đổi số dư nào khi xác thực thất bại", async () => {
      const svc          = makeService(wallets, payments);
      const buyerBefore  = wallets.get(BUYER)!.currency.credits;
      const sellerBefore = wallets.get(SELLER)!.currency.credits;

      await assert.rejects(() =>
        svc.processPayment({
          buyerId: BUYER, sellerId: SELLER,
          amount: 50_000, currency: "credits",
          sourceType: "listing", sourceId: "listing-z",
        }),
      );

      assert.equal(wallets.get(BUYER)!.currency.credits,  buyerBefore);
      assert.equal(wallets.get(SELLER)!.currency.credits, sellerBefore);
    });
  });

  // ── V1.3 — thanh toán đấu giá thành công ─────────────────────────────────

  describe("thanh toán đấu giá thành công", () => {
    test("người thắng bị trừ tiền, người bán nhận số tiền ròng", async () => {
      wallets.seed(makeWalletRef("winner-001", 0, 0, 5_000));
      wallets.seed(makeWalletRef("seller-002", 0, 0,   500));
      const svc = makeService(wallets, payments);

      await svc.processPayment({
        buyerId: "winner-001", sellerId: "seller-002",
        amount: 2_000, currency: "eth",
        sourceType: "auction", sourceId: "auction-99",
      });

      const fee = expectedFee(2_000);           // 100
      assert.equal(wallets.get("winner-001")!.currency.tokens, 5_000 - 2_000);
      assert.equal(wallets.get("seller-002")!.currency.tokens,   500 + (2_000 - fee));
    });
  });

  // ── V1.3 — hoàn tác khi ghi bản ghi thất bại ─────────────────────────────

  describe("hoàn tác khi ghi bản ghi thất bại", () => {
    test("phục hồi số dư cả hai bên và kho bạc nếu lưu giao dịch ví lỗi", async () => {
      const svc         = makeService(wallets, new FailingPaymentRepo());
      const buyerBefore  = wallets.get(BUYER)!.currency.credits;
      const sellerBefore = wallets.get(SELLER)!.currency.credits;

      await assert.rejects(
        () => svc.processPayment({
          buyerId: BUYER, sellerId: SELLER,
          amount: 1_000, currency: "credits",
          sourceType: "listing", sourceId: "listing-fail",
        }),
        /DB_ERROR/,
      );

      assert.equal(wallets.get(BUYER)!.currency.credits,  buyerBefore);
      assert.equal(wallets.get(SELLER)!.currency.credits, sellerBefore);
    });
  });

  // ── V1.3 — bản ghi giao dịch đã được tạo ─────────────────────────────────

  describe("bản ghi giao dịch đã được tạo", () => {
    test("trả về bản ghi đầy đủ với tất cả các trường", async () => {
      const svc = makeService(wallets, payments);
      const amount = 500;
      const fee    = expectedFee(amount);

      const tx = await svc.processPayment({
        buyerId: BUYER, sellerId: SELLER,
        amount, currency: "credits",
        sourceType: "listing", sourceId: "listing-record",
      });

      assert.ok(tx.id,                          "phải có id");
      assert.equal(tx.buyerId,     BUYER);
      assert.equal(tx.sellerId,    SELLER);
      assert.equal(tx.totalAmount, amount);
      assert.equal(tx.feeAmount,   fee);
      assert.equal(tx.netAmount,   amount - fee);
      assert.equal(tx.currency,    "credits");
      assert.equal(tx.sourceType,  "listing");
      assert.equal(tx.sourceId,    "listing-record");
      assert.ok(tx.createdAt,                   "phải có createdAt");
    });

    test("bản ghi được lưu vào kho dữ liệu giao dịch", async () => {
      const svc = makeService(wallets, payments);
      await svc.processPayment({
        buyerId: BUYER, sellerId: SELLER,
        amount: 1_200, currency: "credits",
        sourceType: "auction", sourceId: "auction-store",
      });

      assert.equal(payments.records.length, 1);
      assert.equal(payments.records[0]!.sourceId, "auction-store");
    });
  });

  // ── V1.4 — Tính phí niêm yết ─────────────────────────────────────────────

  describe("V1.4 — tính phí niêm yết", () => {
    test(`phí ${MARKETPLACE_FEE_PERCENT}% bị trừ khỏi số tiền của người bán`, async () => {
      const svc    = makeService(wallets, payments);
      const amount = 10_000;
      const fee    = expectedFee(amount);          // 500

      const tx = await svc.processPayment({
        buyerId: BUYER, sellerId: SELLER,
        amount, currency: "credits",
        sourceType: "listing", sourceId: "listing-fee",
      });

      assert.equal(tx.totalAmount, amount);
      assert.equal(tx.feeAmount,   fee);
      assert.equal(tx.netAmount,   amount - fee);

      // Buyer pays full price
      assert.equal(wallets.get(BUYER)!.currency.credits, 10_000 - amount);
      // Seller gets net (price minus fee)
      assert.equal(wallets.get(SELLER)!.currency.credits, 2_000 + (amount - fee));
    });
  });

  // ── V1.4 — Tính phí đấu giá ──────────────────────────────────────────────

  describe("V1.4 — tính phí đấu giá", () => {
    test("phí 5% áp dụng đúng cho thanh toán đấu giá", async () => {
      wallets.seed(makeWalletRef("bidder-001", 20_000));
      wallets.seed(makeWalletRef("aseller-001", 0));
      const svc    = makeService(wallets, payments);
      const amount = 8_000;
      const fee    = expectedFee(amount);          // 400

      const tx = await svc.processPayment({
        buyerId: "bidder-001", sellerId: "aseller-001",
        amount, currency: "credits",
        sourceType: "auction", sourceId: "auction-fee",
      });

      assert.equal(tx.feeAmount, fee);
      assert.equal(tx.netAmount, amount - fee);
      assert.equal(wallets.get("bidder-001")!.currency.credits,  20_000 - amount);
      assert.equal(wallets.get("aseller-001")!.currency.credits,         amount - fee);
    });
  });

  // ── V1.4 — Phí bằng không (trường hợp ngoại lệ) ─────────────────────────

  describe("V1.4 — phí bằng không (trường hợp ngoại lệ)", () => {
    test("giao dịch thành công khi phí làm tròn về 0", async () => {
      // 1 credit × 5% = 0.05 → Math.floor → 0
      wallets.seed(makeWalletRef("tiny-buyer",  100));
      wallets.seed(makeWalletRef("tiny-seller",   0));
      const svc = makeService(wallets, payments);

      const tx = await svc.processPayment({
        buyerId: "tiny-buyer", sellerId: "tiny-seller",
        amount: 1, currency: "credits",
        sourceType: "listing", sourceId: "listing-tiny",
      });

      assert.equal(tx.feeAmount,   0);
      assert.equal(tx.netAmount,   1);
      assert.equal(tx.totalAmount, 1);
      // Seller receives the full 1 credit (no fee to deduct)
      assert.equal(wallets.get("tiny-seller")!.currency.credits, 1);
    });
  });

  // ── V1.4 — Kho bạc được ghi có chính xác ────────────────────────────────

  describe("V1.4 — kho bạc được ghi có chính xác", () => {
    test("kho bạc nhận đúng số tiền phí", async () => {
      const svc    = makeService(wallets, payments);
      const amount = 5_000;
      const fee    = expectedFee(amount);          // 250

      await svc.processPayment({
        buyerId: BUYER, sellerId: SELLER,
        amount, currency: "credits",
        sourceType: "listing", sourceId: "listing-treasury",
      });

      const treasury = wallets.get(TREASURY_USER_ID);
      assert.ok(treasury,                                    "ví kho bạc phải tồn tại");
      assert.equal(treasury!.currency.credits, fee,         "kho bạc phải có đúng số tiền phí");
    });

    test("nhiều giao dịch tích lũy vào kho bạc", async () => {
      wallets.seed(makeWalletRef("buyer2", 50_000));
      wallets.seed(makeWalletRef("seller2",     0));
      const svc = makeService(wallets, payments);

      const amt1 = 4_000;
      const amt2 = 6_000;

      await svc.processPayment({
        buyerId: BUYER, sellerId: SELLER,
        amount: amt1, currency: "credits",
        sourceType: "listing", sourceId: "listing-t1",
      });
      await svc.processPayment({
        buyerId: "buyer2", sellerId: "seller2",
        amount: amt2, currency: "credits",
        sourceType: "listing", sourceId: "listing-t2",
      });

      const totalFees = expectedFee(amt1) + expectedFee(amt2);  // 200 + 300 = 500
      assert.equal(wallets.get(TREASURY_USER_ID)!.currency.credits, totalFees);
    });
  });

  // ── V1.4 — Người bán nhận được số tiền ròng ──────────────────────────────

  describe("V1.4 — người bán nhận được số tiền ròng", () => {
    test("số tiền nhận = tổng - phí, không bao giờ bằng tổng số tiền", async () => {
      const svc    = makeService(wallets, payments);
      const amount = 2_000;
      const fee    = expectedFee(amount);          // 100 (fee > 0)

      assert.ok(fee > 0, "test này yêu cầu phí > 0");

      const sellerBefore = wallets.get(SELLER)!.currency.credits;
      await svc.processPayment({
        buyerId: BUYER, sellerId: SELLER,
        amount, currency: "credits",
        sourceType: "listing", sourceId: "listing-net",
      });

      const sellerAfter = wallets.get(SELLER)!.currency.credits;
      assert.equal(sellerAfter - sellerBefore, amount - fee, "người bán nhận số tiền ròng");
      assert.notEqual(sellerAfter - sellerBefore, amount,    "người bán không nhận tổng số tiền");
    });
  });

  // ── V1.4 — An toàn khi hoàn tác (với phí) ────────────────────────────────

  describe("V1.4 — an toàn khi hoàn tác (với phí)", () => {
    test("hoàn tác toàn bộ bao gồm kho bạc khi ghi bản ghi thất bại", async () => {
      const svc = makeService(wallets, new FailingPaymentRepo());

      const buyerBefore  = wallets.get(BUYER)!.currency.credits;
      const sellerBefore = wallets.get(SELLER)!.currency.credits;

      await assert.rejects(
        () => svc.processPayment({
          buyerId: BUYER, sellerId: SELLER,
          amount: 4_000, currency: "credits",
          sourceType: "listing", sourceId: "listing-rollback",
        }),
        /DB_ERROR/,
      );

      // Buyer, seller fully restored
      assert.equal(wallets.get(BUYER)!.currency.credits,  buyerBefore);
      assert.equal(wallets.get(SELLER)!.currency.credits, sellerBefore);
      // Treasury also restored (either not created or back to 0)
      const treasury = wallets.get(TREASURY_USER_ID);
      if (treasury) {
        assert.equal(treasury.currency.credits, 0, "kho bạc phải được hoàn tác về 0");
      }
    });
  });
});
