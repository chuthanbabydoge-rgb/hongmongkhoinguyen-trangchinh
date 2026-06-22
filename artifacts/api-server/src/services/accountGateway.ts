// ─────────────────────────────────────────────────────────────────────────────
// Account Gateway
//
// Sits between Universe Hub API and the external Universe Account Service.
//
// Architecture:
//   Universe Hub  →  API Server  →  accountGateway  →  Account Service
//
// Current behaviour:
//   - If ACCOUNT_SERVICE_URL is set, the gateway attempts real HTTP calls.
//   - On network error or missing env var, it falls back to mock data so the
//     rest of the system keeps running without a live account service.
//
// To enable the real service:
//   Set ACCOUNT_SERVICE_URL=http://localhost:5001  (or wherever it runs)
//
// To add new endpoints later:
//   1. Add an interface below.
//   2. Add a MOCK_* constant.
//   3. Add a function following the same pattern.
// ─────────────────────────────────────────────────────────────────────────────

import { logger } from "../lib/logger";

// ─── Configuration ────────────────────────────────────────────────────────────

const ACCOUNT_SERVICE_URL = process.env["ACCOUNT_SERVICE_URL"]?.replace(
  /\/$/,
  "",
);

const REQUEST_TIMEOUT_MS = 5_000;

// ─── Interface contracts ──────────────────────────────────────────────────────
// These types form the agreed shape between Universe Hub and the Account
// Service.  Keep in sync with the Account Service's own OpenAPI / schema.

export interface AccountUserProfile {
  id: string;
  username: string;
  title: string;
  status: "online" | "away" | "offline";
  level: number;
  xp: number;
  maxXp: number;
  progressPercent: number;
  reputation: number;
  reputationTier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  badges: string[];
  joinedAt: string;
}

export interface AccountUserAvatar {
  userId: string;
  initials: string;
  imageUrl: string | null;
  frameColor: string;
  badgeIcon: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  isUnlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface AccountUserAchievements {
  userId: string;
  total: number;
  unlocked: number;
  achievements: Achievement[];
}

export interface AccountUserReputation {
  userId: string;
  score: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  upvotes: number;
  downvotes: number;
  badges: string[];
  history: Array<{
    date: string;
    delta: number;
    reason: string;
  }>;
}

// ─── Mock fallback data ───────────────────────────────────────────────────────
// Used when ACCOUNT_SERVICE_URL is not configured or the service is
// unreachable.  Mirrors the data visible in the UI.

const MOCK_USER_ID = "user-001";

const MOCK_PROFILE: AccountUserProfile = {
  id: MOCK_USER_ID,
  username: "Commander Zara",
  title: "Galactic Architect",
  status: "online",
  level: 47,
  xp: 84320,
  maxXp: 100000,
  progressPercent: 84,
  reputation: 142,
  reputationTier: "gold",
  badges: ["early-adopter", "trader", "explorer"],
  joinedAt: "2022-03-15T08:00:00Z",
};

const MOCK_AVATAR: AccountUserAvatar = {
  userId: MOCK_USER_ID,
  initials: "CZ",
  imageUrl: null,
  frameColor: "#7c3aed",
  badgeIcon: "early-adopter",
};

const MOCK_ACHIEVEMENTS: AccountUserAchievements = {
  userId: MOCK_USER_ID,
  total: 48,
  unlocked: 31,
  achievements: [
    {
      id: "early-adopter",
      title: "Người tiên phong",
      description: "Tham gia Universe trong 30 ngày đầu ra mắt.",
      icon: "🚀",
      unlockedAt: "2022-03-20T10:00:00Z",
      isUnlocked: true,
      rarity: "legendary",
    },
    {
      id: "trader",
      title: "Nhà giao dịch",
      description: "Hoàn thành 10 giao dịch trên sàn giao dịch.",
      icon: "💱",
      unlockedAt: "2022-06-01T14:30:00Z",
      isUnlocked: true,
      rarity: "rare",
    },
    {
      id: "explorer",
      title: "Nhà thám hiểm",
      description: "Ghé thăm 5 vũ trụ khác nhau.",
      icon: "🗺️",
      unlockedAt: "2022-09-15T09:00:00Z",
      isUnlocked: true,
      rarity: "common",
    },
    {
      id: "galaxy-builder",
      title: "Kiến trúc sư thiên hà",
      description: "Xây dựng 3 thế giới đạt cấp độ 10 trở lên.",
      icon: "🌌",
      unlockedAt: null,
      isUnlocked: false,
      rarity: "epic",
    },
  ],
};

const MOCK_REPUTATION: AccountUserReputation = {
  userId: MOCK_USER_ID,
  score: 142,
  tier: "gold",
  upvotes: 187,
  downvotes: 12,
  badges: ["early-adopter", "trader", "explorer"],
  history: [
    { date: "2024-12-01", delta: +5, reason: "Được đánh giá tích cực" },
    { date: "2024-11-15", delta: +10, reason: "Hoàn thành nhiệm vụ tuần" },
    { date: "2024-10-30", delta: -2, reason: "Báo cáo hợp lệ được ghi nhận" },
  ],
};

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function fetchFromAccountService<T>(path: string): Promise<T> {
  if (!ACCOUNT_SERVICE_URL) {
    throw new Error("ACCOUNT_SERVICE_URL is not configured");
  }

  const url = `${ACCOUNT_SERVICE_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Account service responded with HTTP ${response.status} for ${path}`,
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Gateway functions ────────────────────────────────────────────────────────
// Each function tries the live service first.  On any failure it logs a
// warning and returns mock data so callers are never left empty-handed.

/**
 * Fetch the full user profile from the Account Service.
 */
export async function getUserProfile(
  userId: string = MOCK_USER_ID,
): Promise<AccountUserProfile> {
  if (ACCOUNT_SERVICE_URL) {
    try {
      return await fetchFromAccountService<AccountUserProfile>(
        `/users/${userId}/profile`,
      );
    } catch (err) {
      logger.warn(
        { err, userId },
        "accountGateway.getUserProfile: falling back to mock data",
      );
    }
  }

  return { ...MOCK_PROFILE, id: userId };
}

/**
 * Fetch the user's avatar data from the Account Service.
 */
export async function getUserAvatar(
  userId: string = MOCK_USER_ID,
): Promise<AccountUserAvatar> {
  if (ACCOUNT_SERVICE_URL) {
    try {
      return await fetchFromAccountService<AccountUserAvatar>(
        `/users/${userId}/avatar`,
      );
    } catch (err) {
      logger.warn(
        { err, userId },
        "accountGateway.getUserAvatar: falling back to mock data",
      );
    }
  }

  return { ...MOCK_AVATAR, userId };
}

/**
 * Fetch the user's achievement list from the Account Service.
 */
export async function getUserAchievements(
  userId: string = MOCK_USER_ID,
): Promise<AccountUserAchievements> {
  if (ACCOUNT_SERVICE_URL) {
    try {
      return await fetchFromAccountService<AccountUserAchievements>(
        `/users/${userId}/achievements`,
      );
    } catch (err) {
      logger.warn(
        { err, userId },
        "accountGateway.getUserAchievements: falling back to mock data",
      );
    }
  }

  return { ...MOCK_ACHIEVEMENTS, userId };
}

/**
 * Fetch the user's reputation details from the Account Service.
 */
export async function getUserReputation(
  userId: string = MOCK_USER_ID,
): Promise<AccountUserReputation> {
  if (ACCOUNT_SERVICE_URL) {
    try {
      return await fetchFromAccountService<AccountUserReputation>(
        `/users/${userId}/reputation`,
      );
    } catch (err) {
      logger.warn(
        { err, userId },
        "accountGateway.getUserReputation: falling back to mock data",
      );
    }
  }

  return { ...MOCK_REPUTATION, userId };
}
