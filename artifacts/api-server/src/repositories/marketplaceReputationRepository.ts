// ─────────────────────────────────────────────────────────────────────────────
// Marketplace Reputation Repository — V2.4
//
// Tracks seller reputation: score, level, sales stats, and per-transaction
// buyer ratings (positive +1 / negative -1).
// ─────────────────────────────────────────────────────────────────────────────

// ─── Domain models ────────────────────────────────────────────────────────────

export interface SellerReputation {
  userId:          string;
  score:           number;
  level:           string;
  totalSales:      number;
  totalVolume:     number;
  positiveRatings: number;
  negativeRatings: number;
  createdAt:       string;
  updatedAt:       string;
}

export interface ReputationRating {
  id:            string;
  buyerId:       string;
  sellerId:      string;
  transactionId: string;
  rating:        1 | -1;
  createdAt:     string;
}

export interface RateInput {
  buyerId:       string;
  sellerId:      string;
  transactionId: string;
  rating:        1 | -1;
}

// ─── Score / level helpers (shared by service and mock) ───────────────────────

export function computeScore(rep: Pick<SellerReputation, "totalSales" | "positiveRatings" | "negativeRatings">): number {
  return (rep.totalSales * 2) + (rep.positiveRatings * 5) - (rep.negativeRatings * 10);
}

export function computeLevel(score: number): string {
  if (score >= 200) return "Diamond";
  if (score >= 100) return "Platinum";
  if (score >= 50)  return "Gold";
  if (score >= 20)  return "Silver";
  return "Bronze";
}

// ─── Repository interface ──────────────────────────────────────────────────────

export interface IReputationRepository {
  getByUserId(userId: string): Promise<SellerReputation | null>;
  upsert(rep: SellerReputation): Promise<SellerReputation>;
  getTopSellers(limit?: number): Promise<SellerReputation[]>;
  addRating(input: RateInput): Promise<ReputationRating>;
  hasRating(buyerId: string, transactionId: string): Promise<boolean>;
}

// ─── Mock (in-memory) ─────────────────────────────────────────────────────────

export class MockReputationRepository implements IReputationRepository {
  private reputations = new Map<string, SellerReputation>();
  private ratings     = new Map<string, ReputationRating>();

  async getByUserId(userId: string): Promise<SellerReputation | null> {
    return this.reputations.get(userId) ?? null;
  }

  async upsert(rep: SellerReputation): Promise<SellerReputation> {
    const existing = this.reputations.get(rep.userId);
    const now      = new Date().toISOString();
    const updated: SellerReputation = {
      ...rep,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.reputations.set(rep.userId, updated);
    return updated;
  }

  async getTopSellers(limit = 20): Promise<SellerReputation[]> {
    return [...this.reputations.values()]
      .sort((a, b) => b.score - a.score || b.totalVolume - a.totalVolume)
      .slice(0, limit);
  }

  async addRating(input: RateInput): Promise<ReputationRating> {
    const id = crypto.randomUUID();
    const r: ReputationRating = { ...input, id, createdAt: new Date().toISOString() };
    this.ratings.set(id, r);
    return r;
  }

  async hasRating(buyerId: string, transactionId: string): Promise<boolean> {
    for (const r of this.ratings.values()) {
      if (r.buyerId === buyerId && r.transactionId === transactionId) return true;
    }
    return false;
  }
}
