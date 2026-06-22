// ─────────────────────────────────────────────────────────────────────────────
// User Repository
//
// IUserRepository — the contract every implementation must satisfy.
// MockUserRepository — in-memory implementation for development.
//
// PostgreSQL migration path:
//   Create `DrizzleUserRepository implements IUserRepository` that swaps
//   the Map store for `db.query.users` / `db.insert(users)` etc.
//   No service or controller code needs to change — just swap the instance
//   exported at the bottom of this file.
// ─────────────────────────────────────────────────────────────────────────────

import type { User, Avatar } from "../models/user";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  update(id: string, partial: Partial<Omit<User, "id">>): Promise<User | null>;
  delete(id: string): Promise<boolean>;

  findAvatarByUserId(userId: string): Promise<Avatar | null>;
  saveAvatar(avatar: Avatar): Promise<Avatar>;
  updateAvatar(
    userId: string,
    partial: Partial<Omit<Avatar, "userId">>,
  ): Promise<Avatar | null>;
}

// ─── Mock seed data ───────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  {
    id: "user-001",
    username: "Commander Zara",
    title: "Galactic Architect",
    status: "online",
    level: 47,
    xp: 84320,
    maxXp: 100000,
    progressPercent: 84,
    joinedAt: "2022-03-15T08:00:00Z",
    createdAt: "2022-03-15T08:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
  },
];

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

export class MockUserRepository implements IUserRepository {
  private users = new Map<string, User>(
    SEED_USERS.map((u) => [u.id, { ...u }]),
  );
  private avatars = new Map<string, Avatar>(
    SEED_AVATARS.map((a) => [a.userId, { ...a }]),
  );

  // ── User CRUD ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<User> {
    const now = new Date().toISOString();
    const record: User = { ...user, createdAt: now, updatedAt: now };
    this.users.set(record.id, record);
    return record;
  }

  async update(
    id: string,
    partial: Partial<Omit<User, "id">>,
  ): Promise<User | null> {
    const existing = this.users.get(id);
    if (!existing) return null;
    const updated: User = {
      ...existing,
      ...partial,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // ── Avatar CRUD ────────────────────────────────────────────────────────────

  async findAvatarByUserId(userId: string): Promise<Avatar | null> {
    return this.avatars.get(userId) ?? null;
  }

  async saveAvatar(avatar: Avatar): Promise<Avatar> {
    const record: Avatar = {
      ...avatar,
      updatedAt: new Date().toISOString(),
    };
    this.avatars.set(record.userId, record);
    return record;
  }

  async updateAvatar(
    userId: string,
    partial: Partial<Omit<Avatar, "userId">>,
  ): Promise<Avatar | null> {
    const existing = this.avatars.get(userId);
    if (!existing) return null;
    const updated: Avatar = {
      ...existing,
      ...partial,
      userId,
      updatedAt: new Date().toISOString(),
    };
    this.avatars.set(userId, updated);
    return updated;
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
// Swap MockUserRepository for DrizzleUserRepository here when ready.

export const userRepository: IUserRepository = new MockUserRepository();
