// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceTreasuryService
//
// Aggregates treasury wallet balances and marketplace fee/volume statistics
// into a single dashboard response for GET /api/marketplace/treasury.
// ─────────────────────────────────────────────────────────────────────────────

import type { ITreasuryRepository } from "../repositories/marketplaceTreasuryRepository";

// ─── Response shape ───────────────────────────────────────────────────────────

export interface TreasuryDashboard {
  treasury: {
    credits: number;
    coins:   number;
    tokens:  number;
  };
  stats: {
    totalTransactions:  number;
    totalFeesCredits:   number;
    totalFeesCoins:     number;
    totalFeesTokens:    number;
    totalVolumeCredits: number;
    totalVolumeCoins:   number;
    totalVolumeTokens:  number;
  };
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IMarketplaceTreasuryService {
  getDashboard(): Promise<TreasuryDashboard>;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketplaceTreasuryService implements IMarketplaceTreasuryService {
  constructor(private readonly treasury: ITreasuryRepository) {}

  async getDashboard(): Promise<TreasuryDashboard> {
    const [wallet, stats] = await Promise.all([
      this.treasury.getTreasuryWallet(),
      this.treasury.getTreasuryStats(),
    ]);

    return {
      treasury: {
        credits: wallet.credits,
        coins:   wallet.coins,
        tokens:  wallet.tokens,
      },
      stats: {
        totalTransactions:  stats.totalTransactions,
        totalFeesCredits:   stats.totalFeesCredits,
        totalFeesCoins:     stats.totalFeesCoins,
        totalFeesTokens:    stats.totalFeesTokens,
        totalVolumeCredits: stats.totalVolumeCredits,
        totalVolumeCoins:   stats.totalVolumeCoins,
        totalVolumeTokens:  stats.totalVolumeTokens,
      },
    };
  }
}
