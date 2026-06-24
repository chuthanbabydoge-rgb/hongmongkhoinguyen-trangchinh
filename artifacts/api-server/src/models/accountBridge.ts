// ─────────────────────────────────────────────────────────────────────────────
// DTOs: Universe Account → Hub bridge
//
// Field names match the ACTUAL Account API response shapes (verified live).
// Hub never stores this data — it proxies and aggregates on-the-fly.
// ─────────────────────────────────────────────────────────────────────────────

// Returned by GET /api/identity/me  (not currently used in hub/me or hub/dashboard)
export interface IdentityDTO {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

// Returned by GET /api/profile/me  → envelope: { profile: ProfileDTO }
export interface ProfileDTO {
  id: string;
  userId: string;
  universeId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

// Returned by GET /api/avatar/me  → envelope: { avatar: AvatarDTO }
export interface AvatarDTO {
  id: string;
  userId: string;
  avatarName: string;
  avatarUrl: string | null;
  frame: string;
  title: string;
  background: string;
  accessories: string[];
  createdAt: string;
  updatedAt: string;
}

// Returned by GET /api/achievements/me  → flat array
export interface AchievementDTO {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

// Returned by GET /api/reputation/me  → envelope: { reputation: ReputationDTO }
export interface ReputationDTO {
  score: number;
  level: string;
  badge: string;
  positiveEvents: number;
  negativeEvents: number;
  lastActivityAt: string | null;
}

// Returned by GET /api/activity/me  → envelope: { activities: ActivityDTO[] }
export interface ActivityDTO {
  id: string;
  userId: string;
  type: string;
  sourceApp: string;
  title: string;
  description: string;
  metadata: unknown | null;
  visibility: string;
  createdAt: string;
}

// Returned by GET /api/notifications  → flat array
export interface NotificationDTO {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Returned by GET /api/settings/me  → envelope: { settings: SettingsDTO }
export interface SettingsDTO {
  id: string;
  userId: string;
  theme: string;
  language: string;
  timezone: string;
  privacyProfile: string;
  privacyActivity: string;
  privacyReputation: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketplaceNotifications: boolean;
  achievementNotifications: boolean;
  reputationNotifications: boolean;
  securityNotifications: boolean;
  allowFriendRequests: boolean;
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HubUserOverview {
  identity: IdentityDTO;
  profile: ProfileDTO;
  avatar: AvatarDTO;
  reputation: ReputationDTO;
  achievementCount: number;
  unreadNotifications: number;
}

export interface HubMeResponse {
  profile: ProfileDTO;
  avatar: AvatarDTO;
  reputation: ReputationDTO;
  settings: SettingsDTO;
}

export interface WalletSnapshot {
  credits: number;
  coins: number;
  tokens: number;
  rewardPoints: number;
  weeklyChangePercent: number;
}

export interface InventorySnapshot {
  pets: number;
  footballPlayers: number;
  tickets: number;
  worldAssets: number;
  items: number;
  total: number;
}

export interface HubDashboardResponse {
  profile: ProfileDTO;
  avatar: AvatarDTO;
  reputation: ReputationDTO;
  achievementCount: number;
  unreadNotifications: number;
  latestActivities: ActivityDTO[];
  wallet: WalletSnapshot;
  inventory: InventorySnapshot;
}
