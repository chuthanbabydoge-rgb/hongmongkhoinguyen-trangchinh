// ─────────────────────────────────────────────────────────────────────────────
// Supabase Reputation Repository
//
// Table: reputations
// Columns:
//   user_id, score, tier, upvotes, downvotes, badges (text[]), history (jsonb),
//   updated_at
//
// Note: `applyScoreDelta` updates score + appends a history entry atomically
// via a single UPDATE that reads and writes history as a JSONB column.
// For high-write scenarios, extract history into its own table and use a
// Supabase Edge Function or Postgres trigger for atomic increments.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type { IReputationRepository } from "../reputationRepository";
import type { Reputation, ReputationHistoryEntry } from "../../models/reputation";

// ─── Tier helper ──────────────────────────────────────────────────────────────

function calcTier(score: number): Reputation["tier"] {
  if (score >= 500) return "diamond";
  if (score >= 200) return "platinum";
  if (score >= 100) return "gold";
  if (score >= 50)  return "silver";
  return "bronze";
}

// ─── Row → Domain mapping ─────────────────────────────────────────────────────

function toReputation(row: Record<string, unknown>): Reputation {
  return {
    userId:    row["user_id"] as string,
    score:     row["score"] as number,
    tier:      row["tier"] as Reputation["tier"],
    upvotes:   row["upvotes"] as number,
    downvotes: row["downvotes"] as number,
    badges:    (row["badges"] as string[]) ?? [],
    history:   (row["history"] as ReputationHistoryEntry[]) ?? [],
    updatedAt: row["updated_at"] as string,
  };
}

function toRow(rep: Reputation): Record<string, unknown> {
  return {
    user_id:    rep.userId,
    score:      rep.score,
    tier:       rep.tier,
    upvotes:    rep.upvotes,
    downvotes:  rep.downvotes,
    badges:     rep.badges,
    history:    rep.history,
    updated_at: new Date().toISOString(),
  };
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class SupabaseReputationRepository implements IReputationRepository {
  private get db() { return getSupabaseClient(); }

  async getByUserId(userId: string): Promise<Reputation | null> {
    if (!isValidUuid(userId)) return null;
    const { data, error } = await this.db
      .from("reputations")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`SupabaseReputationRepository.getByUserId: ${error.message}`);
    return data ? toReputation(data) : null;
  }

  async create(reputation: Reputation): Promise<Reputation> {
    const { data, error } = await this.db
      .from("reputations")
      .insert({ ...toRow(reputation), tier: calcTier(reputation.score) })
      .select()
      .single();
    if (error) throw new Error(`SupabaseReputationRepository.create: ${error.message}`);
    return toReputation(data);
  }

  async update(reputation: Reputation): Promise<Reputation | null> {
    const { data, error } = await this.db
      .from("reputations")
      .update({ ...toRow(reputation), tier: calcTier(reputation.score) })
      .eq("user_id", reputation.userId)
      .select()
      .maybeSingle();
    if (error) throw new Error(`SupabaseReputationRepository.update: ${error.message}`);
    return data ? toReputation(data) : null;
  }

  async applyScoreDelta(userId: string, delta: number, reason: string): Promise<Reputation | null> {
    // Fetch current state, mutate in-process, write back atomically.
    const existing = await this.getByUserId(userId);
    if (!existing) return null;

    const newScore = existing.score + delta;
    const entry: ReputationHistoryEntry = {
      date: new Date().toISOString().slice(0, 10),
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
    return this.update({
      ...existing,
      badges: existing.badges.filter((b) => b !== badgeId),
    });
  }

  async getHistory(userId: string, limit = 20): Promise<ReputationHistoryEntry[]> {
    const rep = await this.getByUserId(userId);
    return (rep?.history ?? []).slice(0, limit);
  }
}
