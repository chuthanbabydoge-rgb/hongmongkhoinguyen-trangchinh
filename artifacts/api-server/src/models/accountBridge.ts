// ─────────────────────────────────────────────────────────────────────────────
// DTOs: Universe Account → Hub bridge
//
// These types represent data shapes returned by the Universe Account API.
// Hub never stores this data — it proxies and aggregates on-the-fly.
// ─────────────────────────────────────────────────────────────────────────────

export interface IdentityDTO {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface ProfileDTO {
  userId: string;
  displayName: string;
  bio?: string;
  level?: number;
  xp?: number;
}

export interface AvatarDTO {
  userId: string;
  imageUrl: string;
  frameId?: string;
  badgeId?: string;
}

export interface AchievementDTO {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

export interface ReputationDTO {
  userId: string;
  score: number;
  badges: string[];
  tier?: string;
}

export interface ActivityDTO {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface NotificationDTO {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SettingsDTO {
  userId: string;
  language: string;
  theme: string;
  notifications: boolean;
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

export interface HubDashboardResponse {
  profile: ProfileDTO;
  avatar: AvatarDTO;
  reputation: ReputationDTO;
  achievementCount: number;
  unreadNotifications: number;
  latestActivities: ActivityDTO[];
}
