// ─────────────────────────────────────────────────────────────────────────────
// Reputation Repository
//
// PostgreSQL migration path:
//   `reputations` table (one row per user) + `reputation_history` table.
//   Score updates must be transactional (score + history row written together).
//   Implement DrizzleReputationRepository and swap the singleton.
// ─────────────────────────────────────────────────────────────────────────────

import type { Reputation, ReputationHistoryEntry } from "../models/reputation";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IReputationRepository {
  getByUserId(userId: string): Promise<Reputation | null>;
  create(reputation: Reputation): Promise<Reputation>;
  update(reputation: Reputation): Promise<Reputation | null>;
  applyScoreDelta(userId: string, delta: number, reason: string): Promise<Reputation | null>;
  addBadge(userId: string, badgeId: string): Promise<Reputation | null>;
  removeBadge(userId: string, badgeId: string): Promise<Reputation | null>;
  getHistory(userId: string, limit?: number): Promise<ReputationHistoryEntry[]>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcTier(score: number): Reputation["tier"] {
  if (score >= 500) return "diamond";
  if (score >= 200) return "platinum";
  if (score >= 100) return "gold";
  if (score >= 50)  return "silver";
  return "bronze";
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_REPUTATIONS: Reputation[] = [
  {
    userId: "user-001",
    score: 142,
    tier: "gold",
    upvotes: 187,
    downvotes: 12,
    badges: ["early-adopter", "trader", "explorer"],
    history: [
      { date: "2024-12-01", delta: +5,  reason: "Được đánh giá tích cực" },
      { date: "2024-11-15", delta: +10, reason: "Hoàn thành nhiệm vụ tuần" },
      { date: "2024-10-30", delta: -2,  reason: "Báo cáo hợp lệ được ghi nhận" },
      { date: "2024-09-20", delta: +8,  reason: "Tham gia sự kiện cộng đồng" },
      { date: "2024-08-05", delta: +3,  reason: "Được đánh giá tích cực" },
    ],
    updatedAt: "2024-12-01T10:00:00Z",
  },
];

// ─── Mock implementation ──────────────────────────────────────────────────────

export class MockReputationRepository implements IReputationRepository {
  private store = new Map<string, Reputation>(
    SEED_REPUTATIONS.map((r) => [r.userId, { ...r, history: [...r.history] }]),
  );

  async getByUserId(userId: string): Promise<Reputation | null> {
    return this.store.get(userId) ?? null;
  }

  async create(reputation: Reputation): Promise<Reputation> {
    const record: Reputation = {
      ...reputation,
      tier: calcTier(reputation.score),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(record.userId, record);
    return record;
  }

  async update(reputation: Reputation): Promise<Reputation | null> {
    if (!this.store.has(reputation.userId)) return null;
    const updated: Reputation = {
      ...reputation,
      tier: calcTier(reputation.score),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(reputation.userId, updated);
    return updated;
  }

  async applyScoreDelta(userId: string, delta: number, reason: string): Promise<Reputation | null> {
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
      upvotes:   delta > 0 ? existing.upvotes + 1   : existing.upvotes,
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

  async removeBadge(userId: string, badgeId: string): Promise<Reputation | null> {
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

  async getHistory(userId: string, limit = 20): Promise<ReputationHistoryEntry[]> {
    return (this.store.get(userId)?.history ?? []).slice(0, limit);
  }
}

// ─── Singleton (swap here for Drizzle) ───────────────────────────────────────
export const reputationRepository: IReputationRepository = new MockReputationRepository();
