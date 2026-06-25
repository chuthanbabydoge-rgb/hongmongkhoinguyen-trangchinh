import { eq } from "drizzle-orm";
import { db, reputationsTable } from "@workspace/db";
import type { IReputationRepository } from "../reputationRepository";
import type { Reputation, ReputationHistoryEntry } from "../../models/reputation";

function calcTier(score: number): Reputation["tier"] {
  if (score >= 500) return "diamond";
  if (score >= 200) return "platinum";
  if (score >= 100) return "gold";
  if (score >= 50)  return "silver";
  return "bronze";
}

function rowToReputation(row: typeof reputationsTable.$inferSelect): Reputation {
  return {
    userId:    row.userId,
    score:     row.score,
    tier:      row.tier as Reputation["tier"],
    upvotes:   row.upvotes,
    downvotes: row.downvotes,
    badges:    (row.badges as string[]) ?? [],
    history:   (row.history as ReputationHistoryEntry[]) ?? [],
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt).toISOString(),
  };
}

export class DrizzleReputationRepository implements IReputationRepository {
  async getByUserId(userId: string): Promise<Reputation | null> {
    const rows = await db.select().from(reputationsTable).where(eq(reputationsTable.userId, userId)).limit(1);
    return rows[0] ? rowToReputation(rows[0]) : null;
  }

  async create(reputation: Reputation): Promise<Reputation> {
    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(reputationsTable)
      .values({
        userId:    reputation.userId,
        score:     reputation.score,
        tier:      calcTier(reputation.score),
        upvotes:   reputation.upvotes,
        downvotes: reputation.downvotes,
        badges:    reputation.badges,
        history:   reputation.history,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: reputationsTable.userId,
        set: {
          score:     reputation.score,
          tier:      calcTier(reputation.score),
          upvotes:   reputation.upvotes,
          downvotes: reputation.downvotes,
          badges:    reputation.badges,
          history:   reputation.history,
          updatedAt: now,
        },
      })
      .returning();
    return rowToReputation(inserted!);
  }

  async update(reputation: Reputation): Promise<Reputation | null> {
    const [updated] = await db
      .update(reputationsTable)
      .set({
        score:     reputation.score,
        tier:      calcTier(reputation.score),
        upvotes:   reputation.upvotes,
        downvotes: reputation.downvotes,
        badges:    reputation.badges,
        history:   reputation.history,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reputationsTable.userId, reputation.userId))
      .returning();
    return updated ? rowToReputation(updated) : null;
  }

  async applyScoreDelta(userId: string, delta: number, reason: string): Promise<Reputation | null> {
    const existing = await this.getByUserId(userId);
    if (!existing) return null;
    const newScore = existing.score + delta;
    const entry: ReputationHistoryEntry = {
      date:   new Date().toISOString().slice(0, 10),
      delta,
      reason,
    };
    const updated: Reputation = {
      ...existing,
      score:     newScore,
      tier:      calcTier(newScore),
      upvotes:   delta > 0 ? existing.upvotes + 1   : existing.upvotes,
      downvotes: delta < 0 ? existing.downvotes + 1 : existing.downvotes,
      history:   [entry, ...existing.history],
      updatedAt: new Date().toISOString(),
    };
    return this.update(updated);
  }

  async addBadge(userId: string, badgeId: string): Promise<Reputation | null> {
    const existing = await this.getByUserId(userId);
    if (!existing) return null;
    if (existing.badges.includes(badgeId)) return existing;
    return this.update({ ...existing, badges: [...existing.badges, badgeId] });
  }

  async removeBadge(userId: string, badgeId: string): Promise<Reputation | null> {
    const existing = await this.getByUserId(userId);
    if (!existing) return null;
    return this.update({ ...existing, badges: existing.badges.filter(b => b !== badgeId) });
  }

  async getHistory(userId: string, limit = 20): Promise<ReputationHistoryEntry[]> {
    const rep = await this.getByUserId(userId);
    return (rep?.history ?? []).slice(0, limit);
  }
}
