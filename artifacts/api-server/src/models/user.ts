// ─────────────────────────────────────────────────────────────────────────────
// User model
//
// Core domain entity for a Universe account holder.
// No business logic here — pure data shape.
//
// PostgreSQL migration path:
//   Map each field to a column in the `users` table via Drizzle ORM.
//   `status` → varchar enum, `level`/`xp` → integer, dates → timestamptz.
// ─────────────────────────────────────────────────────────────────────────────

export type UserStatus = "online" | "away" | "offline";

export interface User {
  id: string;
  username: string;
  title: string;
  status: UserStatus;
  level: number;
  xp: number;
  maxXp: number;
  progressPercent: number;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
// Stored separately so it can be fetched independently (e.g. for comment
// threads or leaderboards) without loading the full user record.

export interface Avatar {
  userId: string;
  initials: string;
  imageUrl: string | null;
  frameColor: string;
  badgeIcon: string | null;
  updatedAt: string;
}
