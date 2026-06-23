// ─────────────────────────────────────────────────────────────────────────────
// MarketplacePaymentService
//
// Handles wallet transfers (including fee deduction) for marketplace purchases
// and auction settlements.
//
// Fee policy:
//   MARKETPLACE_FEE_PERCENT = 5  (5 % of the sale price)
//   • Buyer  pays:    totalAmount   (full listing/bid price)
//   • Seller receives: netAmount   (totalAmount – feeAmount)
//   • Treasury receives: feeAmount (Math.floor of 5 %)
//   • If feeAmount rounds to 0 the treasury credit step is skipped.
//
// Atomicity model (compensating transactions):
//   Because we use the Supabase REST API (not a raw PG connection), true
//   DB-level transactions are not available.  Each write phase is paired with
//   a compensating action that restores the pre-transaction state on failure:
//
//     Phase 1  — validate          (read-only, no side-effects)
//     Phase 2  — debit buyer       (totalAmount)
//     Phase 3  — credit seller     (netAmount)   → rolls back phase 2 on error
//     Phase 3b — credit treasury   (feeAmount)   → rolls back phases 2+3 on error
//     Phase 4  — create record                   → rolls back all on error
//
// Currency mapping (MarketplaceCurrency → WalletCurrency key):
//   "credits" → credits
//   "stars"   → coins
//   "eth"     → tokens
// ─────────────────────────────────────────────────────────────────────────────

import type { IWalletRepository }              from "../repositories/walletRepository";
import type { WalletCurrency, WalletReference } from "../models/walletReference";
import type { MarketplaceCurrency }            from "../repositories/marketplaceRepository";
import type {
  IMarketplacePaymentRepository,
  MarketplaceWalletTransaction,
  PaymentSourceType,
  FindPaymentsOptions,
} from "../repositories/marketplacePaymentRepository";

// ─── Fee configuration ────────────────────────────────────────────────────────

export const MARKETPLACE_FEE_PERCENT = 5;

// ─── Treasury identity ────────────────────────────────────────────────────────

export const TREASURY_USER_ID   = "treasury";
export const TREASURY_WALLET_ID = "treasury-wallet-001";

// ─── Input / output types ─────────────────────────────────────────────────────

export interface ProcessPaymentInput {
  buyerId:    string;
  sellerId:   string;
  amount:     number;
  currency:   MarketplaceCurrency;
  sourceType: PaymentSourceType;
  sourceId:   string;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IMarketplacePaymentService {
  processPayment(input: ProcessPaymentInput): Promise<MarketplaceWalletTransaction>;
  getPayments(opts?: FindPaymentsOptions): Promise<{ data: MarketplaceWalletTransaction[]; total: number }>;
  getPaymentById(id: string): Promise<MarketplaceWalletTransaction | null>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currencyKey(currency: MarketplaceCurrency): keyof WalletCurrency {
  switch (currency) {
    case "credits": return "credits";
    case "stars":   return "coins";
    case "eth":     return "tokens";
  }
}

function computeFee(amount: number): { feeAmount: number; netAmount: number } {
  const feeAmount = Math.floor(amount * MARKETPLACE_FEE_PERCENT / 100);
  return { feeAmount, netAmount: amount - feeAmount };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketplacePaymentService implements IMarketplacePaymentService {
  constructor(
    private readonly wallets:  IWalletRepository,
    private readonly payments: IMarketplacePaymentRepository,
  ) {}

  // ── Query methods ─────────────────────────────────────────────────────────

  async getPayments(
    opts?: FindPaymentsOptions,
  ): Promise<{ data: MarketplaceWalletTransaction[]; total: number }> {
    return this.payments.findAll(opts);
  }

  async getPaymentById(id: string): Promise<MarketplaceWalletTransaction | null> {
    return this.payments.findById(id);
  }

  // ── Treasury wallet — auto-created on first use ───────────────────────────

  private async getOrCreateTreasuryWallet(): Promise<WalletReference> {
    const existing = await this.wallets.getByUserId(TREASURY_USER_ID);
    if (existing) return existing;
    return this.wallets.create({
      userId:       TREASURY_USER_ID,
      walletId:     TREASURY_WALLET_ID,
      currency:     { credits: 0, coins: 0, tokens: 0 },
      lastSyncedAt: new Date().toISOString(),
    });
  }

  // ── Core payment flow ─────────────────────────────────────────────────────

  async processPayment(input: ProcessPaymentInput): Promise<MarketplaceWalletTransaction> {
    const { buyerId, sellerId, amount, currency, sourceType, sourceId } = input;

    // ── Phase 1: validate ────────────────────────────────────────────────────

    if (amount <= 0) {
      throw new Error(`amount phải lớn hơn 0, nhận được: ${amount}.`);
    }
    if (buyerId === sellerId) {
      throw new Error("Người mua và người bán không thể là cùng một người.");
    }

    const [buyerWallet, sellerWallet] = await Promise.all([
      this.wallets.getByUserId(buyerId),
      this.wallets.getByUserId(sellerId),
    ]);

    if (!buyerWallet) {
      throw new Error(`Không tìm thấy ví của người mua (${buyerId}).`);
    }
    if (!sellerWallet) {
      throw new Error(`Không tìm thấy ví của người bán (${sellerId}).`);
    }

    const key          = currencyKey(currency);
    const buyerBalance = buyerWallet.currency[key];

    if (buyerBalance < amount) {
      throw new Error(
        `Số dư không đủ: người mua có ${buyerBalance} ${currency}, cần ${amount} ${currency}.`,
      );
    }

    const { feeAmount, netAmount } = computeFee(amount);

    // ── Phase 2: debit buyer (full amount) ───────────────────────────────────

    const newBuyerCurrency: WalletCurrency = {
      ...buyerWallet.currency,
      [key]: buyerBalance - amount,
    };
    const updatedBuyer = await this.wallets.update({
      ...buyerWallet,
      currency: newBuyerCurrency,
    });
    if (!updatedBuyer) {
      throw new Error(`Không thể cập nhật ví người mua (${buyerId}).`);
    }

    // ── Phase 3: credit seller (net amount) — rolls back phase 2 on error ───

    try {
      const sellerBalance    = sellerWallet.currency[key];
      const newSellerCurrency: WalletCurrency = {
        ...sellerWallet.currency,
        [key]: sellerBalance + netAmount,
      };
      const updatedSeller = await this.wallets.update({
        ...sellerWallet,
        currency: newSellerCurrency,
      });
      if (!updatedSeller) throw new Error(`Không thể cập nhật ví người bán (${sellerId}).`);
    } catch (err) {
      await this.wallets.update(buyerWallet).catch(() => {});
      throw err;
    }

    // ── Phase 3b: credit treasury (fee) — rolls back phases 2+3 on error ────

    let treasurySnapshot: WalletReference | null = null;

    if (feeAmount > 0) {
      try {
        const treasuryWallet    = await this.getOrCreateTreasuryWallet();
        treasurySnapshot        = treasuryWallet;
        const treasuryBalance   = treasuryWallet.currency[key];
        const newTreasuryCurrency: WalletCurrency = {
          ...treasuryWallet.currency,
          [key]: treasuryBalance + feeAmount,
        };
        const updatedTreasury = await this.wallets.update({
          ...treasuryWallet,
          currency: newTreasuryCurrency,
        });
        if (!updatedTreasury) throw new Error("Không thể cập nhật ví kho bạc.");
      } catch (err) {
        await Promise.allSettled([
          this.wallets.update(buyerWallet),
          this.wallets.update(sellerWallet),
        ]);
        throw err;
      }
    }

    // ── Phase 4: create record — rolls back all on error ─────────────────────

    try {
      const tx: MarketplaceWalletTransaction = {
        id:          crypto.randomUUID(),
        buyerId,
        sellerId,
        totalAmount: amount,
        feeAmount,
        netAmount,
        currency,
        sourceType,
        sourceId,
        createdAt:   new Date().toISOString(),
      };
      return await this.payments.create(tx);
    } catch (err) {
      const rollbacks: Promise<unknown>[] = [
        this.wallets.update(buyerWallet),
        this.wallets.update(sellerWallet),
      ];
      if (treasurySnapshot) {
        rollbacks.push(this.wallets.update(treasurySnapshot));
      }
      await Promise.allSettled(rollbacks);
      throw err;
    }
  }
}
