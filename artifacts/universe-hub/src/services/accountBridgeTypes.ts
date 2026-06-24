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
