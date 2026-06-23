// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceReputationService — V2.4
//
// Manages seller reputation: auto-creation on first sale, score recalculation
// after every rating, and top-seller ranking.
// ─────────────────────────────────────────────────────────────────────────────

import {
  computeScore,
  computeLevel,
  type IReputationRepository,
  type SellerReputation,
  type RateInput,
} from "../repositories/marketplaceReputationRepository";

// Optional transaction lookup — injected to validate transactionId + sellerId.
export interface ITransactionLookup {
  getById(id: string): Promise<{ sellerId: string; buyerId: string } | null>;
}

function defaultRep(userId: string): SellerReputation {
  const now = new Date().toISOString();
  return {
    userId,
    score:           0,
    level:           "Bronze",
    totalSales:      0,
    totalVolume:     0,
    positiveRatings: 0,
    negativeRatings: 0,
    createdAt:       now,
    updatedAt:       now,
  };
}

export class MarketplaceReputationService {
  constructor(
    private readonly repo:   IReputationRepository,
    private readonly txLookup?: ITransactionLookup,
  ) {}

  // ─── Called by MarketplaceService after every completed sale / auction ──────

  async recordSale(sellerId: string, volume: number): Promise<SellerReputation> {
    const existing = await this.repo.getByUserId(sellerId) ?? defaultRep(sellerId);
    const next = {
      ...existing,
      totalSales:  existing.totalSales + 1,
      totalVolume: existing.totalVolume + volume,
    };
    next.score = computeScore(next);
    next.level = computeLevel(next.score);
    return this.repo.upsert(next);
  }

  // ─── Buyer submits a rating for a seller after a transaction ────────────────

  async submitRating(input: RateInput): Promise<SellerReputation> {
    const { buyerId, sellerId, transactionId, rating } = input;

    if (rating !== 1 && rating !== -1) {
      throw new Error("Xếp hạng không hợp lệ: phải là +1 hoặc -1.");
    }

    // Validate transactionId (if lookup is available)
    if (this.txLookup) {
      const tx = await this.txLookup.getById(transactionId);
      if (!tx) {
        throw new Error(`Giao dịch ${transactionId} không tìm thấy.`);
      }
      if (tx.sellerId !== sellerId) {
        throw new Error(`Người bán không khớp với giao dịch ${transactionId}.`);
      }
    }

    // Prevent duplicate ratings for the same transaction
    const alreadyRated = await this.repo.hasRating(buyerId, transactionId);
    if (alreadyRated) {
      throw new Error(`Người mua đã xếp hạng giao dịch ${transactionId} rồi.`);
    }

    await this.repo.addRating(input);

    const existing = await this.repo.getByUserId(sellerId) ?? defaultRep(sellerId);
    const next = {
      ...existing,
      positiveRatings: existing.positiveRatings + (rating ===  1 ? 1 : 0),
      negativeRatings: existing.negativeRatings + (rating === -1 ? 1 : 0),
    };
    next.score = computeScore(next);
    next.level = computeLevel(next.score);
    return this.repo.upsert(next);
  }

  // ─── Queries ────────────────────────────────────────────────────────────────

  async getReputation(userId: string): Promise<SellerReputation | null> {
    return this.repo.getByUserId(userId);
  }

  async getTopSellers(limit = 20): Promise<SellerReputation[]> {
    return this.repo.getTopSellers(limit);
  }
}
