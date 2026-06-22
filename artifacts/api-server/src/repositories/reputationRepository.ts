// ─────────────────────────────────────────────────────────────────────────────
// Reputation Repository
//
// IReputationRepository — contract for all implementations.
// MockReputationRepository — in-memory implementation for development.
//
// PostgreSQL migration path:
//   Create `DrizzleReputationRepository` that queries the `reputations` and
//   `reputation_history` tables.  History inserts should use a DB transaction
//   so the score and row are written atomically.
// ─────────────────────────────────────────────────────────────────────────────

import type { Reputation, ReputationHistoryEntry } from "../models/reputation";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IReputationRepository {
  findByUserId(userId: string): Promise<Reputation | null>;
  save(reputation: Reputation): Promise<Reputation>;
  updateScore(
    userId: string,
    delta: number,
    reason: string,
  ): Promise<Reputation | null>;
  addBadge(userId: string, badgeId: string): Promise<Reputation | null>;
  removeBadge(userId: string, badgeId: string): Promise<Reputation | null>;
  getHistory(
    userId: string,
    limit?: number,
  ): Promise<ReputationHistoryEntry[]>;
}

// ─── Mock seed data ───────────────────────────────────────────────────────────

const SEED_REPUTATIONS: Reputation[] = [
  {
    userId: "user-001",
    score: 142,
    tier: "gold",
    upvotes: 187,
    downvotes: 12,
    badges: ["early-adopter", "trader", "explorer"],
    history: [
      { date: "2024-12-01", delta: +5, reason: "Được đánh giá tích cực" },
      { date: "2024-11-15", delta: +10, reason: "Hoàn thành nhiệm vụ tuần" },
      { date: "2024-10-30", delta: -2, reason: "Báo cáo hợp lệ được ghi nhận" },
      { date: "2024-09-20", delta: +8, reason: "Tham gia sự kiện cộng đồng" },
      { date: "2024-08-05", delta: +3, reason: "Được đánh giá tích cực" },
    ],
    updatedAt: "2024-12-01T10:00:00Z",
  },
];

// ─── Tier thresholds ──────────────────────────────────────────────────────────

function calcTier(score: number): Reputation["tier"] {
  if (score >= 500) return "diamond";
  if (score >= 200) return "platinum";
  if (score >= 100) return "gold";
  if (score >= 50) return "silver";
  return "bronze";
}

// ─── Mock implementation ──────────────────────────────────────────────────────

export class MockReputationRepository implements IReputationRepository {
  private store = new Map<string, Reputation>(
    SEED_REPUTATIONS.map((r) => [r.userId, { ...r, history: [...r.history] }]),
  );

  async findByUserId(userId: string): Promise<Reputation | null> {
    return this.store.get(userId) ?? null;
  }

  async save(reputation: Reputation): Promise<Reputation> {
    const record: Reputation = {
      ...reputation,
      tier: calcTier(reputation.score),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(record.userId, record);
    return record;
  }

  async updateScore(
    userId: string,
    delta: number,
    reason: string,
  ): Promise<Reputation | null> {
    const existing = this.store.get(userId);
    if (!existing) return null;

    const newScore = existing.score + delta;
    const entry: ReputationHistoryEntry = {
      date: new Date().toISOString().slice(0, 10),
      delta,
      reason,
    };

    const updated: Reputation = {
      ...existing,
      score: newScore,
      tier: calcTier(newScore),
      upvotes: delta > 0 ? existing.upvotes + 1 : existing.upvotes,
      downvotes: delta < 0 ? existing.downvotes + 1 : existing.downvotes,
      history: [entry, ...existing.history],
      updatedAt: new Date().toISOString(),
    };

    this.store.set(userId, updated);
    return updated;
  }

  async addBadge(userId: string, badgeId: string): Promise<Reputation | null> {
    const existing = this.store.get(userId);
    if (!existing) return null;
    if (existing.badges.includes(badgeId)) return existing;

    const updated: Reputation = {
      ...existing,
      badges: [...existing.badges, badgeId],
      updatedAt: new Date().toISOString(),
    };
    this.store.set(userId, updated);
    return updated;
  }

  async removeBadge(
    userId: string,
    badgeId: string,
  ): Promise<Reputation | null> {
    const existing = this.store.get(userId);
    if (!existing) return null;

    const updated: Reputation = {
      ...existing,
      badges: existing.badges.filter((b) => b !== badgeId),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(userId, updated);
    return updated;
  }

  async getHistory(
    userId: string,
    limit = 20,
  ): Promise<ReputationHistoryEntry[]> {
    return (this.store.get(userId)?.history ?? []).slice(0, limit);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
// Swap MockReputationRepository for DrizzleReputationRepository here when ready.

export const reputationRepository: IReputationRepository =
  new MockReputationRepository();
