// ─────────────────────────────────────────────────────────────────────────────
// Composition Root (Dependency Injection Container)
//
// The ONLY place where concrete repository classes are instantiated.
// Controllers import pre-wired service instances from here — no repository
// implementation is imported anywhere else in the application.
//
// Environment strategy:
//   development (default) → Mock repositories (in-memory, no external deps)
//   production            → Supabase repositories (requires SUPABASE_URL +
//                           SUPABASE_ANON_KEY secrets to be set)
//
// To add a new environment (e.g. staging with a test DB):
//   1. Implement the Supabase* classes (already done).
//   2. Add a branch below that selects them.
//   3. No service or controller code needs to change.
// ─────────────────────────────────────────────────────────────────────────────

import { logger } from "./lib/logger";
import { isSupabaseConfigured } from "./database/supabase";

import type { IUserRepository }       from "./repositories/userRepository";
import type { IAvatarRepository }     from "./repositories/avatarRepository";
import type { IReputationRepository } from "./repositories/reputationRepository";
import type { IWalletRepository }     from "./repositories/walletRepository";
import type { IInventoryRepository }  from "./repositories/inventoryRepository";

import { MockUserRepository }        from "./repositories/userRepository";
import { MockAvatarRepository }      from "./repositories/avatarRepository";
import { MockReputationRepository }  from "./repositories/reputationRepository";
import { MockWalletRepository }      from "./repositories/walletRepository";
import { MockInventoryRepository }   from "./repositories/inventoryRepository";

import {
  SupabaseUserRepository,
  SupabaseAvatarRepository,
  SupabaseReputationRepository,
  SupabaseWalletRepository,
  SupabaseInventoryRepository,
} from "./repositories/supabase";

import type { User } from "./models/user";
import type { Avatar } from "./models/user";
import type { Reputation, ReputationHistoryEntry } from "./models/reputation";
import { AccountService } from "./services/accountService";
import { ProfileService } from "./services/profileService";

// ─── Fallback repository helpers ──────────────────────────────────────────────
// When Supabase is configured but rows don't exist yet (tables empty before
// seeding), read methods fall through to the in-memory Mock so the app remains
// functional. Writes always target Supabase.
// Run scripts/seed-supabase.sql in your Supabase SQL editor to add real data.

class FallbackUserRepository implements IUserRepository {
  constructor(
    private readonly primary: IUserRepository,
    private readonly fallback: IUserRepository,
  ) {}

  async getById(id: string): Promise<User | null> {
    const result = await this.primary.getById(id);
    if (result) return result;
    logger.warn({ userId: id }, "Supabase: user not found — falling back to mock data");
    return this.fallback.getById(id);
  }

  async getAll(): Promise<User[]> {
    const rows = await this.primary.getAll();
    return rows.length ? rows : this.fallback.getAll();
  }

  async create(user: User): Promise<User>        { return this.primary.create(user); }
  async update(user: User): Promise<User | null> { return this.primary.update(user); }
  async delete(id: string): Promise<boolean>     { return this.primary.delete(id); }
}

class FallbackAvatarRepository implements IAvatarRepository {
  constructor(
    private readonly primary: IAvatarRepository,
    private readonly fallback: IAvatarRepository,
  ) {}

  async getByUserId(userId: string): Promise<Avatar | null> {
    return await this.primary.getByUserId(userId) ?? this.fallback.getByUserId(userId);
  }

  async create(a: Avatar): Promise<Avatar>        { return this.primary.create(a); }
  async update(a: Avatar): Promise<Avatar | null> { return this.primary.update(a); }
  async delete(userId: string): Promise<boolean>  { return this.primary.delete(userId); }
}

class FallbackReputationRepository implements IReputationRepository {
  constructor(
    private readonly primary: IReputationRepository,
    private readonly fallback: IReputationRepository,
  ) {}

  async getByUserId(userId: string): Promise<Reputation | null> {
    return await this.primary.getByUserId(userId) ?? this.fallback.getByUserId(userId);
  }

  async create(r: Reputation): Promise<Reputation>        { return this.primary.create(r); }
  async update(r: Reputation): Promise<Reputation | null> { return this.primary.update(r); }

  async applyScoreDelta(userId: string, delta: number, reason: string): Promise<Reputation | null> {
    return this.primary.applyScoreDelta(userId, delta, reason);
  }
  async addBadge(userId: string, badgeId: string): Promise<Reputation | null> {
    return this.primary.addBadge(userId, badgeId);
  }
  async removeBadge(userId: string, badgeId: string): Promise<Reputation | null> {
    return this.primary.removeBadge(userId, badgeId);
  }
  async getHistory(userId: string, limit?: number): Promise<ReputationHistoryEntry[]> {
    return this.primary.getHistory(userId, limit);
  }
}

// ─── Repository selection ─────────────────────────────────────────────────────

const useSupabase = isSupabaseConfigured();

let userRepo: IUserRepository;
let avatarRepo: IAvatarRepository;
let reputationRepo: IReputationRepository;
let walletRepo: IWalletRepository;
let inventoryRepo: IInventoryRepository;

if (useSupabase) {
  logger.info("Container: using Supabase repositories (mock fallback active for missing rows)");
  userRepo       = new FallbackUserRepository(new SupabaseUserRepository(), new MockUserRepository());
  avatarRepo     = new FallbackAvatarRepository(new SupabaseAvatarRepository(), new MockAvatarRepository());
  reputationRepo = new FallbackReputationRepository(new SupabaseReputationRepository(), new MockReputationRepository());
  walletRepo     = new SupabaseWalletRepository();
  inventoryRepo  = new SupabaseInventoryRepository();
} else {
  logger.info("Container: using Mock repositories (SUPABASE_URL / SUPABASE_ANON_KEY not set)");
  userRepo       = new MockUserRepository();
  avatarRepo     = new MockAvatarRepository();
  reputationRepo = new MockReputationRepository();
  walletRepo     = new MockWalletRepository();
  inventoryRepo  = new MockInventoryRepository();
}

// ─── Wired service instances ──────────────────────────────────────────────────
// Repository instances are shared so in-memory mock state stays consistent.

export const accountService = new AccountService(
  userRepo,
  avatarRepo,
  reputationRepo,
  walletRepo,
  inventoryRepo,
);

export const profileService = new ProfileService(
  userRepo,
  avatarRepo,
  reputationRepo,
);
