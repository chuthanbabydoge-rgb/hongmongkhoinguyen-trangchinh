// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceTreasuryRepository
//
// Reads treasury wallet balances and aggregates fee / volume statistics from
// the marketplace payment history (marketplace_wallet_transactions table).
//
// Used by MarketplaceTreasuryService to power GET /api/marketplace/treasury.
// ─────────────────────────────────────────────────────────────────────────────

import type { MarketplaceWalletTransaction } from "./marketplacePaymentRepository";

// ─── Domain models ────────────────────────────────────────────────────────────

export interface TreasuryWallet {
  userId:  string;
  credits: number;
  coins:   number;
  tokens:  number;
}

export interface TreasuryStats {
  totalTransactions:  number;
  totalFeesCredits:   number;
  totalFeesCoins:     number;
  totalFeesTokens:    number;
  totalVolumeCredits: number;
  totalVolumeCoins:   number;
  totalVolumeTokens:  number;
}

// ─── Repository interface ─────────────────────────────────────────────────────

export interface ITreasuryRepository {
  /** Return current treasury wallet balances. */
  getTreasuryWallet(): Promise<TreasuryWallet>;

  /** Aggregate fee and volume statistics from all payment records. */
  getTreasuryStats(): Promise<TreasuryStats>;
}

// ─── Mock implementation (in-memory) ─────────────────────────────────────────

export class MockTreasuryRepository implements ITreasuryRepository {
  constructor(
    private readonly payments: MarketplaceWalletTransaction[] = [],
    private readonly walletBalance: { credits: number; coins: number; tokens: number } = {
      credits: 0,
      coins:   0,
      tokens:  0,
    },
  ) {}

  async getTreasuryWallet(): Promise<TreasuryWallet> {
    return {
      userId:  "treasury",
      credits: this.walletBalance.credits,
      coins:   this.walletBalance.coins,
      tokens:  this.walletBalance.tokens,
    };
  }

  async getTreasuryStats(): Promise<TreasuryStats> {
    let totalFeesCredits   = 0;
    let totalFeesCoins     = 0;
    let totalFeesTokens    = 0;
    let totalVolumeCredits = 0;
    let totalVolumeCoins   = 0;
    let totalVolumeTokens  = 0;

    for (const tx of this.payments) {
      switch (tx.currency) {
        case "credits":
          totalFeesCredits   += tx.feeAmount;
          totalVolumeCredits += tx.totalAmount;
          break;
        case "stars":
          totalFeesCoins   += tx.feeAmount;
          totalVolumeCoins += tx.totalAmount;
          break;
        case "eth":
          totalFeesTokens   += tx.feeAmount;
          totalVolumeTokens += tx.totalAmount;
          break;
      }
    }

    return {
      totalTransactions:  this.payments.length,
      totalFeesCredits,
      totalFeesCoins,
      totalFeesTokens,
      totalVolumeCredits,
      totalVolumeCoins,
      totalVolumeTokens,
    };
  }
}
