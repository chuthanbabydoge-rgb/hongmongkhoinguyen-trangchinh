// ─────────────────────────────────────────────────────────────────────────────
// Account Service
//
// Orchestrates user account data across the four repositories.
// Controllers call this service; the service calls repositories.
//
// Architecture:
//   Controller → accountService → [userRepository, reputationRepository,
//                                   walletReferenceRepository,
//                                   inventoryReferenceRepository]
//
// PostgreSQL migration path:
//   Only the repository singletons need to change.  This service and its
//   callers remain unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { userRepository } from "../repositories/userRepository";
import { reputationRepository } from "../repositories/reputationRepository";
import { walletReferenceRepository } from "../repositories/walletReferenceRepository";
import { inventoryReferenceRepository } from "../repositories/inventoryReferenceRepository";

import type { User, Avatar } from "../models/user";
import type { Reputation } from "../models/reputation";
import type { WalletReference } from "../models/walletReference";
import type { InventoryReference } from "../models/inventoryReference";

// ─── Aggregate view ───────────────────────────────────────────────────────────
// A single object that combines all account-related data.
// Used by endpoints that need the full picture in one call.

export interface AccountSnapshot {
  user: User;
  avatar: Avatar;
  reputation: Reputation;
  walletRef: WalletReference | null;
  inventoryRef: InventoryReference | null;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Fetch the full account snapshot for a user in a single call.
 * All repository reads are parallelised.
 */
export async function getAccountSnapshot(
  userId: string,
): Promise<AccountSnapshot | null> {
  const [user, avatar, reputation, walletRef, inventoryRef] = await Promise.all(
    [
      userRepository.findById(userId),
      userRepository.findAvatarByUserId(userId),
      reputationRepository.findByUserId(userId),
      walletReferenceRepository.findByUserId(userId),
      inventoryReferenceRepository.findByUserId(userId),
    ],
  );

  if (!user) return null;

  const resolvedAvatar: Avatar = avatar ?? {
    userId,
    initials: user.username.slice(0, 2).toUpperCase(),
    imageUrl: null,
    frameColor: "#7c3aed",
    badgeIcon: null,
    updatedAt: user.updatedAt,
  };

  const resolvedReputation: Reputation = reputation ?? {
    userId,
    score: 0,
    tier: "bronze",
    upvotes: 0,
    downvotes: 0,
    badges: [],
    history: [],
    updatedAt: user.updatedAt,
  };

  return {
    user,
    avatar: resolvedAvatar,
    reputation: resolvedReputation,
    walletRef,
    inventoryRef,
  };
}

/**
 * Fetch only the user record + avatar.
 */
export async function getUser(
  userId: string,
): Promise<{ user: User; avatar: Avatar } | null> {
  const [user, avatar] = await Promise.all([
    userRepository.findById(userId),
    userRepository.findAvatarByUserId(userId),
  ]);

  if (!user) return null;

  return {
    user,
    avatar: avatar ?? {
      userId,
      initials: user.username.slice(0, 2).toUpperCase(),
      imageUrl: null,
      frameColor: "#7c3aed",
      badgeIcon: null,
      updatedAt: user.updatedAt,
    },
  };
}

/**
 * Fetch reputation details for a user.
 */
export async function getReputation(
  userId: string,
): Promise<Reputation | null> {
  return reputationRepository.findByUserId(userId);
}

/**
 * Fetch wallet reference (balance snapshot) for a user.
 */
export async function getWalletReference(
  userId: string,
): Promise<WalletReference | null> {
  return walletReferenceRepository.findByUserId(userId);
}

/**
 * Fetch inventory reference (item count snapshot) for a user.
 */
export async function getInventoryReference(
  userId: string,
): Promise<InventoryReference | null> {
  return inventoryReferenceRepository.findByUserId(userId);
}

/**
 * Apply a reputation score change for a user.
 */
export async function applyReputationDelta(
  userId: string,
  delta: number,
  reason: string,
): Promise<Reputation | null> {
  return reputationRepository.updateScore(userId, delta, reason);
}

/**
 * Grant a badge to a user.
 */
export async function grantBadge(
  userId: string,
  badgeId: string,
): Promise<Reputation | null> {
  return reputationRepository.addBadge(userId, badgeId);
}
