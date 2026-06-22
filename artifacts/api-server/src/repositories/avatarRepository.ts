// ─────────────────────────────────────────────────────────────────────────────
// Avatar Repository
//
// Stores per-user avatar configuration independently of the User record so
// avatar data can be fetched for comment threads, leaderboards, etc. without
// loading the full user row.
//
// PostgreSQL migration path:
//   One row per user in `avatars` (FK → users.id).
//   Implement DrizzleAvatarRepository and swap the singleton.
// ─────────────────────────────────────────────────────────────────────────────

import type { Avatar } from "../models/user";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAvatarRepository {
  getByUserId(userId: string): Promise<Avatar | null>;
  create(avatar: Avatar): Promise<Avatar>;
  update(avatar: Avatar): Promise<Avatar | null>;
  delete(userId: string): Promise<boolean>;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_AVATARS: Avatar[] = [
  {
    userId: "user-001",
    initials: "CZ",
    imageUrl: null,
    frameColor: "#7c3aed",
    badgeIcon: "early-adopter",
    updatedAt: "2024-12-01T10:00:00Z",
  },
];

// ─── Mock implementation ──────────────────────────────────────────────────────

export class MockAvatarRepository implements IAvatarRepository {
  private store = new Map<string, Avatar>(
    SEED_AVATARS.map((a) => [a.userId, { ...a }]),
  );

  async getByUserId(userId: string): Promise<Avatar | null> {
    return this.store.get(userId) ?? null;
  }

  async create(avatar: Avatar): Promise<Avatar> {
    const record: Avatar = { ...avatar, updatedAt: new Date().toISOString() };
    this.store.set(record.userId, record);
    return record;
  }

  async update(avatar: Avatar): Promise<Avatar | null> {
    if (!this.store.has(avatar.userId)) return null;
    const updated: Avatar = { ...avatar, updatedAt: new Date().toISOString() };
    this.store.set(avatar.userId, updated);
    return updated;
  }

  async delete(userId: string): Promise<boolean> {
    return this.store.delete(userId);
  }
}

// ─── Singleton (swap here for Drizzle) ───────────────────────────────────────
export const avatarRepository: IAvatarRepository = new MockAvatarRepository();
