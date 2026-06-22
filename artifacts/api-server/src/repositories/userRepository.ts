// ─────────────────────────────────────────────────────────────────────────────
// User Repository
//
// Responsibility: user records only. Avatar lives in AvatarRepository.
//
// PostgreSQL migration path:
//   Implement DrizzleUserRepository using db.query.users / db.insert(users).
//   Swap the singleton at the bottom — nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────

import type { User } from "../models/user";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  getAll(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

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

// ─── Mock implementation ──────────────────────────────────────────────────────

export class MockUserRepository implements IUserRepository {
  private store = new Map<string, User>(
    SEED_USERS.map((u) => [u.id, { ...u }]),
  );

  async getById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async getAll(): Promise<User[]> {
    return Array.from(this.store.values());
  }

  async create(user: User): Promise<User> {
    const now = new Date().toISOString();
    const record: User = { ...user, createdAt: now, updatedAt: now };
    this.store.set(record.id, record);
    return record;
  }

  async update(user: User): Promise<User | null> {
    if (!this.store.has(user.id)) return null;
    const updated: User = { ...user, updatedAt: new Date().toISOString() };
    this.store.set(user.id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

// ─── Singleton (swap here for Drizzle) ───────────────────────────────────────
export const userRepository: IUserRepository = new MockUserRepository();
