// ─────────────────────────────────────────────────────────────────────────────
// MarketplacePaymentService
//
// Handles wallet transfers for marketplace purchases and auction settlements.
//
// Atomicity model (compensating transactions):
//   Because we use the Supabase REST API (not a raw PG connection), true
//   DB-level transactions are not available here.  Instead each step is
//   paired with a compensating action so that any failure leaves balances
//   consistent:
//
//     Phase 1  — validate (read-only, no side-effects)
//     Phase 2  — debit buyer
//     Phase 3  — credit seller     (rolls back phase 2 on error)
//     Phase 4  — create record     (rolls back phases 2+3 on error)
//
// Currency mapping (MarketplaceCurrency → WalletCurrency key):
//   "credits" → credits
//   "stars"   → coins
//   "eth"     → tokens
// ─────────────────────────────────────────────────────────────────────────────

import type { IWalletRepository }             from "../repositories/walletRepository";
import type { WalletCurrency, WalletReference } from "../models/walletReference";
import type { MarketplaceCurrency }           from "../repositories/marketplaceRepository";
import type {
  IMarketplacePaymentRepository,
  MarketplaceWalletTransaction,
  PaymentSourceType,
} from "../repositories/marketplacePaymentRepository";

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
}

// ─── Currency mapping ─────────────────────────────────────────────────────────

function currencyKey(currency: MarketplaceCurrency): keyof WalletCurrency {
  switch (currency) {
    case "credits": return "credits";
    case "stars":   return "coins";
    case "eth":     return "tokens";
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketplacePaymentService implements IMarketplacePaymentService {
  constructor(
    private readonly wallets:  IWalletRepository,
    private readonly payments: IMarketplacePaymentRepository,
  ) {}

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

    const key           = currencyKey(currency);
    const buyerBalance  = buyerWallet.currency[key];
    const sellerBalance = sellerWallet.currency[key];

    if (buyerBalance < amount) {
      throw new Error(
        `Số dư không đủ: người mua có ${buyerBalance} ${currency}, cần ${amount} ${currency}.`,
      );
    }

    // ── Phase 2: debit buyer ─────────────────────────────────────────────────

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

    // ── Phase 3: credit seller (compensates phase 2 on failure) ─────────────

    let updatedSeller: WalletReference | null = null;
    try {
      const newSellerCurrency: WalletCurrency = {
        ...sellerWallet.currency,
        [key]: sellerBalance + amount,
      };
      updatedSeller = await this.wallets.update({
        ...sellerWallet,
        currency: newSellerCurrency,
      });
      if (!updatedSeller) throw new Error(`Không thể cập nhật ví người bán (${sellerId}).`);
    } catch (err) {
      // Compensate: restore buyer wallet
      await this.wallets.update(buyerWallet).catch(() => {});
      throw err;
    }

    // ── Phase 4: create transaction record (compensates phases 2+3 on failure)

    try {
      const tx: MarketplaceWalletTransaction = {
        id:         crypto.randomUUID(),
        buyerId,
        sellerId,
        amount,
        currency,
        sourceType,
        sourceId,
        createdAt:  new Date().toISOString(),
      };
      return await this.payments.create(tx);
    } catch (err) {
      // Compensate: restore both wallets
      await Promise.allSettled([
        this.wallets.update(buyerWallet),
        this.wallets.update(sellerWallet),
      ]);
      throw err;
    }
  }
}
