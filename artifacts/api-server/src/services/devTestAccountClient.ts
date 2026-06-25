// ─────────────────────────────────────────────────────────────────────────────
// DevTestAccountClient — HUB-10 E2E Verification
//
// Wraps the real IAccountClient.  When a token matches the pattern
// "Bearer dev-test::<userId>", it returns a synthetic ProfileDTO without
// calling the external Universe Account service.
//
// ONLY active when NODE_ENV !== "production".
// All other tokens are forwarded to the real client unchanged.
//
// Test tokens:
//   Bearer dev-test::social-user-a   → userId = social-user-a
//   Bearer dev-test::social-user-b   → userId = social-user-b
// ─────────────────────────────────────────────────────────────────────────────

import type { IAccountClient } from "./accountClient.js";
import type {
  IdentityDTO, ProfileDTO, AvatarDTO, AchievementDTO,
  ReputationDTO, ActivityDTO, NotificationDTO, SettingsDTO,
} from "../models/accountBridge.js";

const DEV_TOKEN_PREFIX = "Bearer dev-test::";

function parseDevToken(token: string | undefined): string | null {
  if (!token?.startsWith(DEV_TOKEN_PREFIX)) return null;
  const userId = token.slice(DEV_TOKEN_PREFIX.length).trim();
  return userId || null;
}

function makeProfile(userId: string): ProfileDTO {
  const now = new Date().toISOString();
  return {
    id:          userId,
    userId:      userId,
    universeId:  userId,
    username:    userId,
    displayName: userId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    avatarUrl:   null,
    bio:         null,
    createdAt:   now,
    updatedAt:   now,
  };
}

function makeIdentity(userId: string): IdentityDTO {
  return {
    id:        userId,
    username:  userId,
    email:     `${userId}@dev-test.universe.io`,
    createdAt: new Date().toISOString(),
  };
}

function makeAvatar(userId: string): AvatarDTO {
  const now = new Date().toISOString();
  return {
    id:           userId + "-avatar",
    userId,
    avatarName:   userId,
    avatarUrl:    null,
    frame:        "default",
    title:        "Tester",
    background:   "#000",
    accessories:  [],
    createdAt:    now,
    updatedAt:    now,
  };
}

function makeReputation(): ReputationDTO {
  return {
    score:          0,
    level:          "Newcomer",
    badge:          "newcomer",
    positiveEvents: 0,
    negativeEvents: 0,
    lastActivityAt: null,
  };
}

function makeSettings(userId: string): SettingsDTO {
  const now = new Date().toISOString();
  return {
    id:                          userId + "-settings",
    userId,
    theme:                       "dark",
    language:                    "vi",
    timezone:                    "Asia/Ho_Chi_Minh",
    privacyProfile:              "public",
    privacyActivity:             "public",
    privacyReputation:           "public",
    emailNotifications:          true,
    pushNotifications:           true,
    marketplaceNotifications:    true,
    achievementNotifications:    true,
    reputationNotifications:     true,
    securityNotifications:       true,
    allowFriendRequests:         true,
    allowDirectMessages:         true,
    showOnlineStatus:            true,
    showLastSeen:                true,
    createdAt:                   now,
    updatedAt:                   now,
  };
}

export class DevTestAccountClient implements IAccountClient {
  constructor(private readonly real: IAccountClient) {}

  async getIdentity(token?: string): Promise<IdentityDTO> {
    const userId = parseDevToken(token);
    if (userId) return makeIdentity(userId);
    return this.real.getIdentity(token);
  }

  async getProfile(token?: string): Promise<ProfileDTO> {
    const userId = parseDevToken(token);
    if (userId) return makeProfile(userId);
    return this.real.getProfile(token);
  }

  async getAvatar(token?: string): Promise<AvatarDTO> {
    const userId = parseDevToken(token);
    if (userId) return makeAvatar(userId);
    return this.real.getAvatar(token);
  }

  async getAchievements(token?: string): Promise<AchievementDTO[]> {
    if (parseDevToken(token)) return [];
    return this.real.getAchievements(token);
  }

  async getAchievementCount(token?: string): Promise<number> {
    if (parseDevToken(token)) return 0;
    return this.real.getAchievementCount(token);
  }

  async getReputation(token?: string): Promise<ReputationDTO> {
    if (parseDevToken(token)) return makeReputation();
    return this.real.getReputation(token);
  }

  async getActivities(token?: string): Promise<ActivityDTO[]> {
    if (parseDevToken(token)) return [];
    return this.real.getActivities(token);
  }

  async getNotifications(token?: string): Promise<NotificationDTO[]> {
    if (parseDevToken(token)) return [];
    return this.real.getNotifications(token);
  }

  async getUnreadNotificationCount(token?: string): Promise<number> {
    if (parseDevToken(token)) return 0;
    return this.real.getUnreadNotificationCount(token);
  }

  async getSettings(token?: string): Promise<SettingsDTO> {
    const userId = parseDevToken(token);
    if (userId) return makeSettings(userId);
    return this.real.getSettings(token);
  }

  async markNotificationRead(id: string, token?: string): Promise<void> {
    if (parseDevToken(token)) return;
    return this.real.markNotificationRead(id, token);
  }

  async markAllNotificationsRead(token?: string): Promise<number> {
    if (parseDevToken(token)) return 0;
    return this.real.markAllNotificationsRead(token);
  }

  async ping(): Promise<{ connected: boolean; error?: string }> {
    return this.real.ping();
  }
}
