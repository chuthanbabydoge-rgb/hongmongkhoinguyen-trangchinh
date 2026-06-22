// ─────────────────────────────────────────────────────────────────────────────
// Universe Account Service
//
// Façade consumed by useAccount().
// Delegates to profileService and notificationService which call the real API.
//
// To swap endpoints: update the underlying services only — this file and
// useAccount.ts do not need to change.
// ─────────────────────────────────────────────────────────────────────────────

import { fetchProfile } from "./profileService";
import { fetchNotifications } from "./notificationService";

// ─── Frontend types (contract with useAccount / components) ───────────────────

export interface UserProfile {
  id: string;
  username: string;
  title: string;
  status: "online" | "away" | "offline";
  level: number;
  xp: number;
  maxXp: number;
  reputation: number;
  joinedAt: string;
}

export interface UserAvatar {
  userId: string;
  initials: string;
  imageUrl: string | null;
  frameColor: string;
  badgeIcon: string | null;
}

export interface UserLevel {
  current: number;
  xp: number;
  maxXp: number;
  progressPercent: number;
  rank: string;
}

export interface UserXP {
  total: number;
  thisWeek: number;
  thisMonth: number;
  lastActivity: string;
}

export interface UserReputation {
  score: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  upvotes: number;
  downvotes: number;
  badges: string[];
}

export type NotificationType =
  | "reward"
  | "transaction"
  | "system"
  | "social"
  | "marketplace";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Rank label map ───────────────────────────────────────────────────────────

const REPUTATION_TIER_RANK: Record<UserReputation["tier"], string> = {
  bronze:   "Đồng",
  silver:   "Bạc",
  gold:     "Ưu tú",
  platinum: "Bạch kim",
  diamond:  "Kim cương",
};

// ─── Service class ────────────────────────────────────────────────────────────

class UniverseAccountService {
  /**
   * Full user profile — calls GET /api/profile.
   */
  async getUserProfile(): Promise<UserProfile> {
    const data = await fetchProfile();
    return {
      id: data.id,
      username: data.username,
      title: data.title,
      status: data.status,
      level: data.level,
      xp: data.xp,
      maxXp: data.maxXp,
      reputation: data.reputation,
      joinedAt: data.joinedAt,
    };
  }

  /**
   * Avatar data — derived from GET /api/profile.
   */
  async getUserAvatar(): Promise<UserAvatar> {
    const data = await fetchProfile();
    return {
      userId: data.id,
      initials: data.avatar.initials,
      imageUrl: data.avatar.imageUrl,
      frameColor: data.avatar.frameColor,
      badgeIcon: data.badges[0] ?? null,
    };
  }

  /**
   * Level + XP progress — derived from GET /api/profile.
   */
  async getUserLevel(): Promise<UserLevel> {
    const data = await fetchProfile();
    return {
      current: data.level,
      xp: data.xp,
      maxXp: data.maxXp,
      progressPercent: data.progressPercent,
      rank: REPUTATION_TIER_RANK[data.reputationTier] ?? data.reputationTier,
    };
  }

  /**
   * XP statistics — derived from GET /api/profile.
   * (thisWeek / thisMonth will be wired to a dedicated endpoint later.)
   */
  async getUserXP(): Promise<UserXP> {
    const data = await fetchProfile();
    return {
      total: data.xp,
      thisWeek: 0,
      thisMonth: 0,
      lastActivity: new Date().toISOString(),
    };
  }

  /**
   * Reputation details — derived from GET /api/profile.
   */
  async getUserReputation(): Promise<UserReputation> {
    const data = await fetchProfile();
    return {
      score: data.reputation,
      tier: data.reputationTier,
      upvotes: 0,
      downvotes: 0,
      badges: data.badges,
    };
  }

  /**
   * Notifications list — calls GET /api/notifications.
   * Sorted: unread first.
   */
  async getNotifications(): Promise<Notification[]> {
    const { notifications } = await fetchNotifications();
    return notifications
      .map((n) => ({
        id: n.id,
        type: n.type as NotificationType,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }))
      .sort((a, b) => Number(a.isRead) - Number(b.isRead));
  }

  /**
   * Count of unread notifications — derived from GET /api/notifications.
   */
  async getUnreadNotificationCount(): Promise<number> {
    const { unreadCount } = await fetchNotifications();
    return unreadCount;
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const accountService = new UniverseAccountService();
