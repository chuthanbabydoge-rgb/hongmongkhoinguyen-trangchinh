// ─────────────────────────────────────────────────────────────────────────────
// MarketplacePaymentRepository
//
// Stores per-trade wallet transfer records.  Each successful purchase or
// auction settlement writes one row here, giving a full audit trail of
// who paid whom, how much, in which currency, and from which source.
//
// Fee breakdown per record:
//   totalAmount — what the buyer paid (full listing/bid price)
//   feeAmount   — the marketplace fee deducted from the seller payout
//   netAmount   — what the seller actually received (totalAmount - feeAmount)
//
// Table (future DB migration): marketplace_wallet_transactions
//   id (uuid pk), buyer_id, seller_id,
//   total_amount, fee_amount, net_amount,
//   currency, source_type ("listing"|"auction"), source_id, created_at
// ─────────────────────────────────────────────────────────────────────────────

import type { MarketplaceCurrency } from "./marketplaceRepository";

// ─── Domain model ─────────────────────────────────────────────────────────────

export type PaymentSourceType = "listing" | "auction";

export interface MarketplaceWalletTransaction {
  id:          string;
  buyerId:     string;
  sellerId:    string;
  totalAmount: number;   // buyer pays this (full price)
  feeAmount:   number;   // treasury receives this
  netAmount:   number;   // seller receives this (totalAmount - feeAmount)
  currency:    MarketplaceCurrency;
  sourceType:  PaymentSourceType;
  sourceId:    string;
  createdAt:   string;
}

// ─── Repository interface ─────────────────────────────────────────────────────

export interface IMarketplacePaymentRepository {
  create(tx: MarketplaceWalletTransaction): Promise<MarketplaceWalletTransaction>;
  getByUserId(userId: string, limit?: number): Promise<MarketplaceWalletTransaction[]>;
}

// ─── Mock implementation (in-memory) ─────────────────────────────────────────

export class MockMarketplacePaymentRepository implements IMarketplacePaymentRepository {
  private store: MarketplaceWalletTransaction[] = [];

  async create(tx: MarketplaceWalletTransaction): Promise<MarketplaceWalletTransaction> {
    const record = { ...tx };
    this.store.push(record);
    return record;
  }

  async getByUserId(userId: string, limit = 50): Promise<MarketplaceWalletTransaction[]> {
    return this.store
      .filter(tx => tx.buyerId === userId || tx.sellerId === userId)
      .slice(-limit)
      .reverse();
  }
}
