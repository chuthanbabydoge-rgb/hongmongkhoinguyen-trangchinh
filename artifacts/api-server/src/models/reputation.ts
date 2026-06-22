// ─────────────────────────────────────────────────────────────────────────────
// Reputation model
//
// Tracks a user's standing within the Universe ecosystem.
// Badges are stored as string IDs resolved to display data by the client.
//
// PostgreSQL migration path:
//   `reputations` table: one row per user.
//   `reputation_history` table: one row per event, FK → reputations.userId.
//   `badges` stored as a text[] column or a junction table `user_badges`.
// ─────────────────────────────────────────────────────────────────────────────

export type ReputationTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";

export interface ReputationHistoryEntry {
  date: string;
  delta: number;
  reason: string;
}

export interface Reputation {
  userId: string;
  score: number;
  tier: ReputationTier;
  upvotes: number;
  downvotes: number;
  badges: string[];
  history: ReputationHistoryEntry[];
  updatedAt: string;
}
