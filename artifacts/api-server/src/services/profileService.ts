// ─────────────────────────────────────────────────────────────────────────────
// Profile service
//
// Delegates to accountGateway so that the data path is:
//   Route → Controller → profileService → accountGateway → Account Service
//
// The gateway handles fallback to mock data when ACCOUNT_SERVICE_URL is not
// configured, so this service never needs to import raw mock data directly.
// ─────────────────────────────────────────────────────────────────────────────

import {
  getUserProfile,
  getUserAvatar,
  type AccountUserProfile,
  type AccountUserAvatar,
} from "./accountGateway";

// Re-export ProfileData shape so existing controllers keep compiling unchanged.
export type ProfileData = AccountUserProfile & {
  avatar: AccountUserAvatar;
};

export async function getProfile(userId: string): Promise<ProfileData> {
  const [profile, avatar] = await Promise.all([
    getUserProfile(userId),
    getUserAvatar(userId),
  ]);

  return {
    ...profile,
    avatar,
  };
}
