import { logger } from "./lib/logger";
import { isSupabaseConfigured } from "./database/supabase";

import type { IUserRepository }               from "./repositories/userRepository";
import type { IAvatarRepository }             from "./repositories/avatarRepository";
import type { IReputationRepository }         from "./repositories/reputationRepository";
import type { IWalletRepository }             from "./repositories/walletRepository";
import type { IWalletTransactionRepository }  from "./repositories/walletTransactionRepository";
import type { IInventoryRepository }          from "./repositories/inventoryRepository";
import type { IInventoryItemsRepository }     from "./repositories/inventoryItemsRepository";

import { MockUserRepository }               from "./repositories/userRepository";
import { MockAvatarRepository }             from "./repositories/avatarRepository";
import { MockReputationRepository }         from "./repositories/reputationRepository";
import { MockWalletRepository }             from "./repositories/walletRepository";
import { MockWalletTransactionRepository }  from "./repositories/walletTransactionRepository";
import { MockInventoryRepository }          from "./repositories/inventoryRepository";
import { MockInventoryItemsRepository }     from "./repositories/inventoryItemsRepository";
import { SupabaseInventoryItemsRepository } from "./repositories/supabase/SupabaseInventoryItemsRepository";

import {
  SupabaseUserRepository,
  SupabaseAvatarRepository,
  SupabaseReputationRepository,
  SupabaseWalletRepository,
  SupabaseWalletTransactionRepository,
  SupabaseInventoryRepository,
} from "./repositories/supabase";

import type { User } from "./models/user";
import type { Avatar } from "./models/user";
import type { Reputation, ReputationHistoryEntry } from "./models/reputation";
import type { WalletReference, WalletCurrency } from "./models/walletReference";
import { AccountService }   from "./services/accountService";
import { ProfileService }   from "./services/profileService";
import { WalletService }    from "./services/walletService";
import { InventoryService } from "./services/inventoryService";

// ─── Fallback repositories ────────────────────────────────────────────────────

class FallbackUserRepository implements IUserRepository {
  constructor(
    private readonly primary: IUserRepository,
    private readonly fallback: IUserRepository,
  ) {}
  async getById(id: string): Promise<User | null> {
    const result = await this.primary.getById(id);
    if (result) return result;
    logger.warn({ userId: id }, "Supabase: user not found — falling back to mock");
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

class FallbackWalletRepository implements IWalletRepository {
  constructor(
    private readonly primary: IWalletRepository,
    private readonly fallback: IWalletRepository,
  ) {}
  async getByUserId(userId: string): Promise<WalletReference | null> {
    const result = await this.primary.getByUserId(userId);
    if (result) return result;
    logger.warn({ userId }, "Supabase: wallet not found — falling back to mock");
    return this.fallback.getByUserId(userId);
  }
  async create(ref: WalletReference): Promise<WalletReference>        { return this.primary.create(ref); }
  async update(ref: WalletReference): Promise<WalletReference | null> { return this.primary.update(ref); }
  async syncBalance(userId: string, currency: WalletCurrency): Promise<WalletReference | null> {
    return this.primary.syncBalance(userId, currency);
  }
  async delete(userId: string): Promise<boolean> { return this.primary.delete(userId); }
}

class FallbackWalletTransactionRepository implements IWalletTransactionRepository {
  constructor(
    private readonly primary: IWalletTransactionRepository,
    private readonly fallback: IWalletTransactionRepository,
  ) {}
  async getByUserId(userId: string, limit?: number) {
    try {
      const rows = await this.primary.getByUserId(userId, limit);
      if (rows.length) return rows;
      logger.warn({ userId }, "Supabase: no wallet_transactions rows — falling back to mock");
      return this.fallback.getByUserId(userId, limit);
    } catch (err) {
      logger.warn({ err, userId }, "Supabase: wallet_transactions query failed — falling back to mock (table may not exist yet)");
      return this.fallback.getByUserId(userId, limit);
    }
  }
  async create(tx: Parameters<IWalletTransactionRepository["create"]>[0]) {
    return this.primary.create(tx);
  }
}

// ─── Repository selection ─────────────────────────────────────────────────────

const useSupabase = isSupabaseConfigured();

let userRepo:               IUserRepository;
let avatarRepo:             IAvatarRepository;
let reputationRepo:         IReputationRepository;
let walletRepo:             IWalletRepository;
let walletTransactionRepo:  IWalletTransactionRepository;
let inventoryRepo:          IInventoryRepository;
let inventoryItemsRepo:     IInventoryItemsRepository;

// inventory_items live in Supabase — always use SupabaseInventoryItemsRepository
inventoryItemsRepo = new SupabaseInventoryItemsRepository();
logger.info("Container: inventory items → Supabase (SupabaseInventoryItemsRepository)");

if (useSupabase) {
  logger.info("Container: using Supabase repositories (mock fallback active for missing rows)");
  userRepo              = new FallbackUserRepository(new SupabaseUserRepository(), new MockUserRepository());
  avatarRepo            = new FallbackAvatarRepository(new SupabaseAvatarRepository(), new MockAvatarRepository());
  reputationRepo        = new FallbackReputationRepository(new SupabaseReputationRepository(), new MockReputationRepository());
  walletRepo            = new FallbackWalletRepository(new SupabaseWalletRepository(), new MockWalletRepository());
  walletTransactionRepo = new FallbackWalletTransactionRepository(new SupabaseWalletTransactionRepository(), new MockWalletTransactionRepository());
  inventoryRepo         = new SupabaseInventoryRepository();
} else {
  logger.info("Container: using Mock repositories (SUPABASE_URL / SUPABASE_ANON_KEY not set)");
  userRepo              = new MockUserRepository();
  avatarRepo            = new MockAvatarRepository();
  reputationRepo        = new MockReputationRepository();
  walletRepo            = new MockWalletRepository();
  walletTransactionRepo = new MockWalletTransactionRepository();
  inventoryRepo         = new MockInventoryRepository();
}

// ─── Wired service instances ──────────────────────────────────────────────────

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

export const walletService = new WalletService(
  walletRepo,
  walletTransactionRepo,
);

export const inventoryService = new InventoryService(inventoryItemsRepo);
