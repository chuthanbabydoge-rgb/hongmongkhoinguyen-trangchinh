// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplacePaymentService
//
// Covers wallet payment settlement for marketplace purchases and auctions.
// Uses fully in-memory stubs — no Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { MarketplacePaymentService } from "../marketplacePaymentService.js";
import type { IWalletRepository }    from "../../repositories/walletRepository.js";
import type { WalletReference }      from "../../models/walletReference.js";
import type {
  IMarketplacePaymentRepository,
  MarketplaceWalletTransaction,
} from "../../repositories/marketplacePaymentRepository.js";

// ─── Stubs ────────────────────────────────────────────────────────────────────

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

  seed(ref: WalletReference) { this.store.set(ref.userId, { ...ref, currency: { ...ref.currency } }); }
  get(userId: string) { return this.store.get(userId); }

  async getByUserId(userId: string) { return this.store.get(userId) ?? null; }

  async create(ref: WalletReference) {
    this.store.set(ref.userId, { ...ref });
    return ref;
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

/** Optional stub that throws on create — simulates a DB write failure */
class FailingPaymentRepo implements IMarketplacePaymentRepository {
  async create(_tx: MarketplaceWalletTransaction): Promise<MarketplaceWalletTransaction> {
    throw new Error("DB_ERROR: marketplace_wallet_transactions unavailable");
  }
  async getByUserId() { return []; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeService(
  walletRepo: IWalletRepository,
  paymentRepo: IMarketplacePaymentRepository,
) {
  return new MarketplacePaymentService(walletRepo, paymentRepo);
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
    wallets.seed(makeWalletRef(BUYER,  10_000));   // 10 000 credits
    wallets.seed(makeWalletRef(SELLER,  2_000));   //  2 000 credits
  });

  // ── 1. Giao dịch mua thành công ──────────────────────────────────────────

  describe("giao dịch mua thành công", () => {
    test("trừ tiền người mua, cộng tiền người bán", async () => {
      const svc = makeService(wallets, payments);

      await svc.processPayment({
        buyerId:    BUYER,
        sellerId:   SELLER,
        amount:     3_000,
        currency:   "credits",
        sourceType: "listing",
        sourceId:   "listing-abc",
      });

      assert.equal(wallets.get(BUYER)!.currency.credits,  7_000); // 10000 - 3000
      assert.equal(wallets.get(SELLER)!.currency.credits, 5_000); //  2000 + 3000
    });

    test("ánh xạ tiền tệ đúng — stars → coins", async () => {
      wallets.seed(makeWalletRef(BUYER,  0, 8_000, 0));  // 8 000 coins
      wallets.seed(makeWalletRef(SELLER, 0, 1_000, 0));

      const svc = makeService(wallets, payments);

      await svc.processPayment({
        buyerId:    BUYER,
        sellerId:   SELLER,
        amount:     500,
        currency:   "stars",
        sourceType: "listing",
        sourceId:   "listing-stars",
      });

      assert.equal(wallets.get(BUYER)!.currency.coins,  7_500);
      assert.equal(wallets.get(SELLER)!.currency.coins, 1_500);
    });
  });

  // ── 2. Thiếu tiền ────────────────────────────────────────────────────────

  describe("thiếu tiền", () => {
    test("ném lỗi khi số dư người mua không đủ", async () => {
      const svc = makeService(wallets, payments);

      await assert.rejects(
        () => svc.processPayment({
          buyerId:    BUYER,
          sellerId:   SELLER,
          amount:     99_999,       // vượt quá số dư 10 000
          currency:   "credits",
          sourceType: "listing",
          sourceId:   "listing-xyz",
        }),
        /Số dư không đủ/,
      );
    });

    test("không thay đổi số dư nào khi xác thực thất bại", async () => {
      const svc = makeService(wallets, payments);
      const buyerBefore  = wallets.get(BUYER)!.currency.credits;
      const sellerBefore = wallets.get(SELLER)!.currency.credits;

      await assert.rejects(
        () => svc.processPayment({
          buyerId:    BUYER,
          sellerId:   SELLER,
          amount:     50_000,
          currency:   "credits",
          sourceType: "listing",
          sourceId:   "listing-z",
        }),
      );

      assert.equal(wallets.get(BUYER)!.currency.credits,  buyerBefore);
      assert.equal(wallets.get(SELLER)!.currency.credits, sellerBefore);
    });
  });

  // ── 3. Thanh toán đấu giá thành công ─────────────────────────────────────

  describe("thanh toán đấu giá thành công", () => {
    test("người thắng bị trừ tiền, người bán nhận tiền", async () => {
      wallets.seed(makeWalletRef("winner-001", 0, 0, 5_000)); // 5000 tokens
      wallets.seed(makeWalletRef("seller-002", 0, 0,   500));

      const svc = makeService(wallets, payments);

      await svc.processPayment({
        buyerId:    "winner-001",
        sellerId:   "seller-002",
        amount:     2_000,
        currency:   "eth",          // eth → tokens
        sourceType: "auction",
        sourceId:   "auction-99",
      });

      assert.equal(wallets.get("winner-001")!.currency.tokens, 3_000); // 5000 - 2000
      assert.equal(wallets.get("seller-002")!.currency.tokens, 2_500); //  500 + 2000
    });
  });

  // ── 4. Hoàn tác khi tạo bản ghi thất bại ─────────────────────────────────

  describe("hoàn tác khi ghi bản ghi thất bại", () => {
    test("phục hồi số dư cả hai bên nếu lưu giao dịch ví lỗi", async () => {
      const failRepo = new FailingPaymentRepo();
      const svc      = makeService(wallets, failRepo);

      const buyerBefore  = wallets.get(BUYER)!.currency.credits;
      const sellerBefore = wallets.get(SELLER)!.currency.credits;

      await assert.rejects(
        () => svc.processPayment({
          buyerId:    BUYER,
          sellerId:   SELLER,
          amount:     1_000,
          currency:   "credits",
          sourceType: "listing",
          sourceId:   "listing-fail",
        }),
        /DB_ERROR/,
      );

      // Cả hai ví phải được phục hồi về trạng thái ban đầu
      assert.equal(wallets.get(BUYER)!.currency.credits,  buyerBefore);
      assert.equal(wallets.get(SELLER)!.currency.credits, sellerBefore);
    });
  });

  // ── 5. Bản ghi giao dịch đã được tạo ─────────────────────────────────────

  describe("bản ghi giao dịch đã được tạo", () => {
    test("trả về bản ghi đầy đủ với tất cả các trường", async () => {
      const svc = makeService(wallets, payments);

      const tx = await svc.processPayment({
        buyerId:    BUYER,
        sellerId:   SELLER,
        amount:     500,
        currency:   "credits",
        sourceType: "listing",
        sourceId:   "listing-record",
      });

      assert.ok(tx.id,                      "phải có id");
      assert.equal(tx.buyerId,    BUYER);
      assert.equal(tx.sellerId,   SELLER);
      assert.equal(tx.amount,     500);
      assert.equal(tx.currency,   "credits");
      assert.equal(tx.sourceType, "listing");
      assert.equal(tx.sourceId,   "listing-record");
      assert.ok(tx.createdAt,               "phải có createdAt");
    });

    test("bản ghi được lưu vào kho dữ liệu giao dịch", async () => {
      const svc = makeService(wallets, payments);

      await svc.processPayment({
        buyerId:    BUYER,
        sellerId:   SELLER,
        amount:     1_200,
        currency:   "credits",
        sourceType: "auction",
        sourceId:   "auction-store",
      });

      assert.equal(payments.records.length, 1);
      assert.equal(payments.records[0]!.sourceId, "auction-store");
    });
  });
});
