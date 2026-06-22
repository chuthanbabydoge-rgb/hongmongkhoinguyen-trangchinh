// ─────────────────────────────────────────────────────────────────────────────
// Profile Service
//
// Composes User + Avatar + Reputation into the ProfileData shape expected
// by the profile API routes.  Receives all three repository interfaces via
// constructor injection — no concrete implementation is imported here.
//
// Architecture:
//   ProfileController → ProfileService → [IUserRepository, IAvatarRepository,
//                                          IReputationRepository]
//
// Usage:
//   Instantiate via container.ts — do not `new ProfileService(...)` elsewhere.
// ─────────────────────────────────────────────────────────────────────────────

import type { IUserRepository }       from "../repositories/userRepository";
import type { IAvatarRepository }     from "../repositories/avatarRepository";
import type { IReputationRepository } from "../repositories/reputationRepository";

import type { Avatar }                from "../models/user";
import type { Reputation }            from "../models/reputation";

// ─── Output contract (what the API returns) ───────────────────────────────────

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

// ─── Service class ────────────────────────────────────────────────────────────

export class ProfileService {
  constructor(
    private readonly users: IUserRepository,
    private readonly avatars: IAvatarRepository,
    private readonly reputations: IReputationRepository,
  ) {}

  async getProfile(userId: string): Promise<ProfileData> {
    const [user, avatar, rep] = await Promise.all([
      this.users.getById(userId),
      this.avatars.getByUserId(userId),
      this.reputations.getByUserId(userId),
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

    return {
      id:              user.id,
      username:        user.username,
      title:           user.title,
      status:          user.status,
      level:           user.level,
      xp:              user.xp,
      maxXp:           user.maxXp,
      progressPercent: user.progressPercent,
      reputation:      resolvedRep.score,
      reputationTier:  resolvedRep.tier,
      badges:          resolvedRep.badges,
      avatar:          resolvedAvatar,
      joinedAt:        user.joinedAt,
    };
  }
}
