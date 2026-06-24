// Mirror of api-server/src/models/accountBridge.ts — frontend copy
// (kept in sync manually; do not import from api-server directly)

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

export interface ReputationDTO {
  score: number;
  level: string;
  badge: string;
  positiveEvents: number;
  negativeEvents: number;
  lastActivityAt: string | null;
}

export interface SettingsDTO {
  id: string;
  userId: string;
  theme: string;
  language: string;
  timezone: string;
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
  wallet: WalletSnapshot;
  inventory: InventorySnapshot;
}
