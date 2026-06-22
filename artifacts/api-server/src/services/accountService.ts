// ─────────────────────────────────────────────────────────────────────────────
// Account Service
//
// Orchestrates all account-domain repositories via constructor injection.
// No repository is imported directly — all dependencies arrive through the
// constructor so the real implementations can be swapped without touching
// this file.
//
// Architecture:
//   Controller → AccountService → [IUserRepository, IAvatarRepository,
//                                   IReputationRepository, IWalletRepository,
//                                   IInventoryRepository]
//
// Usage:
//   Instantiate via container.ts — do not `new AccountService(...)` elsewhere.
// ─────────────────────────────────────────────────────────────────────────────

import type { IUserRepository }        from "../repositories/userRepository";
import type { IAvatarRepository }      from "../repositories/avatarRepository";
import type { IReputationRepository }  from "../repositories/reputationRepository";
import type { IWalletRepository }      from "../repositories/walletRepository";
import type { IInventoryRepository }   from "../repositories/inventoryRepository";

import type { User, Avatar }           from "../models/user";
import type { Reputation }             from "../models/reputation";
import type { WalletReference }        from "../models/walletReference";
import type { InventoryReference }     from "../models/inventoryReference";

// ─── Aggregate view ───────────────────────────────────────────────────────────

export interface AccountSnapshot {
  user: User;
  avatar: Avatar;
  reputation: Reputation;
  walletRef: WalletReference | null;
  inventoryRef: InventoryReference | null;
}

// ─── Default fallbacks ────────────────────────────────────────────────────────

function defaultAvatar(user: User): Avatar {
  return {
    userId: user.id,
    initials: user.username.slice(0, 2).toUpperCase(),
    imageUrl: null,
    frameColor: "#7c3aed",
    badgeIcon: null,
    updatedAt: user.updatedAt,
  };
}

function defaultReputation(userId: string, updatedAt: string): Reputation {
  return {
    userId,
    score: 0,
    tier: "bronze",
    upvotes: 0,
    downvotes: 0,
    badges: [],
    history: [],
    updatedAt,
  };
}

// ─── Service class ────────────────────────────────────────────────────────────

export class AccountService {
  constructor(
    private readonly users: IUserRepository,
    private readonly avatars: IAvatarRepository,
    private readonly reputations: IReputationRepository,
    private readonly wallets: IWalletRepository,
    private readonly inventories: IInventoryRepository,
  ) {}

  /**
   * Full account snapshot — all five repositories in a single parallel fetch.
   */
  async getAccountSnapshot(userId: string): Promise<AccountSnapshot | null> {
    const [user, avatar, reputation, walletRef, inventoryRef] =
      await Promise.all([
        this.users.getById(userId),
        this.avatars.getByUserId(userId),
        this.reputations.getByUserId(userId),
        this.wallets.getByUserId(userId),
        this.inventories.getByUserId(userId),
      ]);

    if (!user) return null;

    return {
      user,
      avatar:     avatar      ?? defaultAvatar(user),
      reputation: reputation  ?? defaultReputation(userId, user.updatedAt),
      walletRef,
      inventoryRef,
    };
  }

  /**
   * User record + avatar only (lightweight).
   */
  async getUser(userId: string): Promise<{ user: User; avatar: Avatar } | null> {
    const [user, avatar] = await Promise.all([
      this.users.getById(userId),
      this.avatars.getByUserId(userId),
    ]);
    if (!user) return null;
    return { user, avatar: avatar ?? defaultAvatar(user) };
  }

  /**
   * Reputation for a user.
   */
  async getReputation(userId: string): Promise<Reputation | null> {
    return this.reputations.getByUserId(userId);
  }

  /**
   * Wallet balance snapshot.
   */
  async getWalletReference(userId: string): Promise<WalletReference | null> {
    return this.wallets.getByUserId(userId);
  }

  /**
   * Inventory count snapshot.
   */
  async getInventoryReference(userId: string): Promise<InventoryReference | null> {
    return this.inventories.getByUserId(userId);
  }

  /**
   * Apply a reputation score delta (+/-) with an audit reason.
   */
  async applyReputationDelta(
    userId: string,
    delta: number,
    reason: string,
  ): Promise<Reputation | null> {
    return this.reputations.applyScoreDelta(userId, delta, reason);
  }

  /**
   * Grant a badge to a user.
   */
  async grantBadge(userId: string, badgeId: string): Promise<Reputation | null> {
    return this.reputations.addBadge(userId, badgeId);
  }

  /**
   * Revoke a badge from a user.
   */
  async revokeBadge(userId: string, badgeId: string): Promise<Reputation | null> {
    return this.reputations.removeBadge(userId, badgeId);
  }
}
