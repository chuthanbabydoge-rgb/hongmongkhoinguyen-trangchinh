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

// ─── Query options ────────────────────────────────────────────────────────────

export interface FindPaymentsOptions {
  userId?:     string;              // buyer OR seller
  currency?:   MarketplaceCurrency;
  sourceType?: PaymentSourceType;
  limit?:      number;              // default 50
  offset?:     number;              // default 0
}

// ─── Repository interface ─────────────────────────────────────────────────────

export interface IMarketplacePaymentRepository {
  /** Write a new payment record. */
  create(tx: MarketplaceWalletTransaction): Promise<MarketplaceWalletTransaction>;

  /**
   * Return all records matching the optional filters, newest first.
   * Always returns { data, total } where total is pre-pagination count.
   */
  findAll(opts?: FindPaymentsOptions): Promise<{ data: MarketplaceWalletTransaction[]; total: number }>;

  /** Return a single record by ID, or null if not found. */
  findById(id: string): Promise<MarketplaceWalletTransaction | null>;

  /**
   * Return all records where the given userId is the buyer or seller.
   * Supports the same optional filters and pagination as findAll.
   */
  findByUser(userId: string, opts?: Omit<FindPaymentsOptions, "userId">): Promise<{ data: MarketplaceWalletTransaction[]; total: number }>;

  /** @deprecated  Use findAll({ userId }) instead. */
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

  async findAll(opts: FindPaymentsOptions = {}): Promise<{ data: MarketplaceWalletTransaction[]; total: number }> {
    let results = [...this.store].reverse(); // newest first

    if (opts.userId) {
      const uid = opts.userId;
      results = results.filter(t => t.buyerId === uid || t.sellerId === uid);
    }
    if (opts.currency)   results = results.filter(t => t.currency   === opts.currency);
    if (opts.sourceType) results = results.filter(t => t.sourceType === opts.sourceType);

    const total  = results.length;
    const offset = opts.offset ?? 0;
    const limit  = opts.limit  ?? 50;
    return { data: results.slice(offset, offset + limit), total };
  }

  async findById(id: string): Promise<MarketplaceWalletTransaction | null> {
    return this.store.find(t => t.id === id) ?? null;
  }

  async findByUser(
    userId: string,
    opts: Omit<FindPaymentsOptions, "userId"> = {},
  ): Promise<{ data: MarketplaceWalletTransaction[]; total: number }> {
    return this.findAll({ ...opts, userId });
  }

  async getByUserId(userId: string, limit = 50): Promise<MarketplaceWalletTransaction[]> {
    const { data } = await this.findByUser(userId, { limit });
    return data;
  }
}
