// ─────────────────────────────────────────────────────────────────────────────
// Notification Sync models — HUB-4
//
// Hub is a sync/cache layer — notification source-of-truth is Universe Account.
// ─────────────────────────────────────────────────────────────────────────────

import type { ActivityDTO } from "./accountBridge.js";

export type NotificationPriority = "NORMAL" | "HIGH" | "URGENT";

// ─── Sync State ───────────────────────────────────────────────────────────────

export interface NotificationSyncState {
  id:                 string;
  userId:             string;
  lastSyncAt:         string | null;
  lastNotificationId: string | null;
  unreadCount:        number;
  createdAt:          string;
  updatedAt:          string;
}

// ─── Hub Notification ─────────────────────────────────────────────────────────

export interface HubNotification {
  id:        string;
  type:      string;
  message:   string;
  isRead:    boolean;
  priority:  NotificationPriority;
  source:    string;
  createdAt: string;
}

// ─── Aggregated types ─────────────────────────────────────────────────────────

export interface NotificationFeed {
  notifications: HubNotification[];
  total:         number;
  unreadCount:   number;
}

export interface NotificationSummary {
  unreadCount:       number;
  highPriorityCount: number;
  urgentCount:       number;
  totalCount:        number;
}

export interface NotificationSyncResult {
  synced:     number;
  unread:     number;
  lastSyncAt: string;
}

export interface NotificationCenterDashboard {
  unreadCount:         number;
  highPriorityCount:   number;
  urgentCount:         number;
  latestNotifications: HubNotification[];
  latestActivities:    ActivityDTO[];
}

// ─── Internal activity ────────────────────────────────────────────────────────

export interface SyncActivity {
  id:          string;
  type:        "SYSTEM";
  title:       string;
  description: string;
  visibility:  "PRIVATE";
  sourceApp:   "universe-hub";
  userId:      string;
  createdAt:   string;
}
