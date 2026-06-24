// ─────────────────────────────────────────────────────────────────────────────
// User Repository
//
// Responsibility: user records only. Avatar lives in AvatarRepository.
//
// HUB-5: MockUserRepository and user-001 seed data have been removed.
// User identity is now sourced from the real Universe Account API via
// accountBridgeService, not from a local mock store.
//
// InMemoryUserRepository is kept as an empty transient store for services
// that depend on IUserRepository (e.g. ProfileService). A PostgreSQL
// implementation can be swapped in at container.ts without touching anything else.
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

// ─── In-memory implementation (no seed data) ─────────────────────────────────

export class InMemoryUserRepository implements IUserRepository {
  private store = new Map<string, User>();

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

// ─── Singleton (swap here for Drizzle / Supabase) ─────────────────────────────
export const userRepository: IUserRepository = new InMemoryUserRepository();
