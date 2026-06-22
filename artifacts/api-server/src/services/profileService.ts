// ─────────────────────────────────────────────────────────────────────────────
// Profile service
//
// Data path: Controller → profileService → repositories → mock data
//
// When ACCOUNT_SERVICE_URL is set, the accountGateway is tried first and
// the result is returned directly (live microservice path).
// Otherwise, the local repositories supply the data (dev / offline path).
//
// PostgreSQL migration path:
//   Swap MockUserRepository / MockReputationRepository for their Drizzle
//   counterparts in src/repositories/*.  No changes needed here.
// ─────────────────────────────────────────────────────────────────────────────

import { userRepository } from "../repositories/userRepository";
import { reputationRepository } from "../repositories/reputationRepository";
import { getUserProfile, getUserAvatar } from "./accountGateway";
import type { User, Avatar } from "../models/user";
import type { Reputation } from "../models/reputation";

const ACCOUNT_SERVICE_URL = process.env["ACCOUNT_SERVICE_URL"];

// ─── Composite profile shape (what the API returns) ───────────────────────────

export interface ProfileData {
  id: string;
  username: string;
  title: string;
  status: "online" | "away" | "offline";
  level: number;
  xp: number;
  maxXp: number;
  progressPercent: number;
  reputation: number;
  reputationTier: Reputation["tier"];
  badges: string[];
  avatar: Avatar;
  joinedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assembleProfile(user: User, avatar: Avatar, rep: Reputation): ProfileData {
  return {
    id: user.id,
    username: user.username,
    title: user.title,
    status: user.status,
    level: user.level,
    xp: user.xp,
    maxXp: user.maxXp,
    progressPercent: user.progressPercent,
    reputation: rep.score,
    reputationTier: rep.tier,
    badges: rep.badges,
    avatar,
    joinedAt: user.joinedAt,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<ProfileData> {
  // Live microservice path — gateway handles its own fallback internally.
  if (ACCOUNT_SERVICE_URL) {
    const [gatewayProfile, gatewayAvatar] = await Promise.all([
      getUserProfile(userId),
      getUserAvatar(userId),
    ]);

    const rep = await reputationRepository.findByUserId(userId);

    return {
      id: gatewayProfile.id,
      username: gatewayProfile.username,
      title: gatewayProfile.title,
      status: gatewayProfile.status,
      level: gatewayProfile.level,
      xp: gatewayProfile.xp,
      maxXp: gatewayProfile.maxXp,
      progressPercent: gatewayProfile.progressPercent,
      reputation: rep?.score ?? gatewayProfile.reputation,
      reputationTier: rep?.tier ?? gatewayProfile.reputationTier,
      badges: rep?.badges ?? gatewayProfile.badges,
      avatar: {
        ...gatewayAvatar,
        updatedAt: new Date().toISOString(),
      },
      joinedAt: gatewayProfile.joinedAt,
    };
  }

  // Local repository path (dev / offline).
  const [user, avatar, rep] = await Promise.all([
    userRepository.findById(userId),
    userRepository.findAvatarByUserId(userId),
    reputationRepository.findByUserId(userId),
  ]);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const resolvedAvatar: Avatar = avatar ?? {
    userId,
    initials: user.username.slice(0, 2).toUpperCase(),
    imageUrl: null,
    frameColor: "#7c3aed",
    badgeIcon: null,
    updatedAt: user.updatedAt,
  };

  const resolvedRep: Reputation = rep ?? {
    userId,
    score: 0,
    tier: "bronze",
    upvotes: 0,
    downvotes: 0,
    badges: [],
    history: [],
    updatedAt: user.updatedAt,
  };

  return assembleProfile(user, resolvedAvatar, resolvedRep);
}
