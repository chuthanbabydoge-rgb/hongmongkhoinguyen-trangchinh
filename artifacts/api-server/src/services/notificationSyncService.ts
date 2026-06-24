// ─────────────────────────────────────────────────────────────────────────────
// NotificationSyncService — HUB-4
//
// Hub is a sync/cache layer — Universe Account is the source of truth.
// Notifications are fetched from Account, cached in-process, and the sync
// state is persisted in the repository.
//
// Architecture:
//   Controller → NotificationSyncService → INotificationSyncRepository
//                                        → IAccountClient (HUB-1 bridge)
// ─────────────────────────────────────────────────────────────────────────────

import type { INotificationSyncRepository } from "../repositories/notificationSyncRepository.js";
import type { IAccountClient }              from "./accountClient.js";
import type {
  HubNotification,
  NotificationSyncState,
  NotificationSyncResult,
  NotificationCenterDashboard,
  NotificationFeed,
  SyncActivity,
  NotificationPriority,
} from "../models/notificationSync.js";
import type { NotificationDTO, ActivityDTO } from "../models/accountBridge.js";

// ─── Priority derivation ──────────────────────────────────────────────────────

const URGENT_KEYWORDS = ["urgent", "critical", "alert", "emergency", "security"];
const HIGH_KEYWORDS   = ["high", "important", "warning", "action_required", "payment"];

function derivePriority(type: string): NotificationPriority {
  const lower = type.toLowerCase();
  if (URGENT_KEYWORDS.some(k => lower.includes(k))) return "URGENT";
  if (HIGH_KEYWORDS.some(k => lower.includes(k)))   return "HIGH";
  return "NORMAL";
}

function toHubNotification(dto: NotificationDTO): HubNotification {
  return {
    id:        dto.id,
    type:      dto.type,
    message:   dto.message,
    isRead:    dto.isRead,
    priority:  derivePriority(dto.type),
    source:    "universe-account",
    createdAt: dto.createdAt,
  };
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export class NotificationSyncValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationSyncValidationError";
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class NotificationSyncService {
  private readonly cache      = new Map<string, HubNotification[]>();
  private readonly activities: SyncActivity[] = [];

  constructor(
    private readonly repo:   INotificationSyncRepository,
    private readonly client: IAccountClient,
  ) {}

  // ── Sync ─────────────────────────────────────────────────────────────────────

  async syncNotifications(userId: string, token?: string): Promise<NotificationSyncResult> {
    if (!userId || userId.trim().length === 0) {
      throw new NotificationSyncValidationError("userId is required");
    }

    const dtos = await this.client.getNotifications(token);
    const hubNotifs = dtos
      .map(toHubNotification)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.cache.set(userId, hubNotifs);

    const unreadCount  = hubNotifs.filter(n => !n.isRead).length;
    const latestId     = hubNotifs[0]?.id ?? null;
    const now          = new Date().toISOString();

    const existing = await this.repo.findByUserId(userId);
    if (existing) {
      await this.repo.update({
        ...existing,
        lastSyncAt:         now,
        lastNotificationId: latestId,
        unreadCount,
        updatedAt:          now,
      });
    } else {
      await this.repo.save({
        id:                 crypto.randomUUID(),
        userId,
        lastSyncAt:         now,
        lastNotificationId: latestId,
        unreadCount,
        createdAt:          now,
        updatedAt:          now,
      });
    }

    this.emitSyncActivity(userId, dtos.length);

    return { synced: dtos.length, unread: unreadCount, lastSyncAt: now };
  }

  // ── Notification Center ───────────────────────────────────────────────────────

  async getNotificationCenter(userId: string, token?: string): Promise<NotificationCenterDashboard> {
    if (!userId || userId.trim().length === 0) {
      throw new NotificationSyncValidationError("userId is required");
    }

    const cached = this.cache.get(userId) ?? [];
    let activities: ActivityDTO[] = [];
    try {
      activities = await this.client.getActivities(token);
    } catch {
      activities = [];
    }

    const unreadCount       = cached.filter(n => !n.isRead).length;
    const highPriorityCount = cached.filter(n => n.priority === "HIGH").length;
    const urgentCount       = cached.filter(n => n.priority === "URGENT").length;

    return {
      unreadCount,
      highPriorityCount,
      urgentCount,
      latestNotifications: cached.slice(0, 10),
      latestActivities:    activities.slice(0, 5),
    };
  }

  // ── Get notifications ─────────────────────────────────────────────────────────

  async getNotifications(userId: string, limit = 20, offset = 0): Promise<NotificationFeed> {
    if (!userId || userId.trim().length === 0) {
      throw new NotificationSyncValidationError("userId is required");
    }

    const cached     = this.cache.get(userId) ?? [];
    const paginated  = cached.slice(offset, offset + limit);
    const unreadCount = cached.filter(n => !n.isRead).length;

    return { notifications: paginated, total: cached.length, unreadCount };
  }

  // ── Mark read ─────────────────────────────────────────────────────────────────

  async markRead(userId: string, notificationId: string, token?: string): Promise<void> {
    if (!userId || userId.trim().length === 0) {
      throw new NotificationSyncValidationError("userId is required");
    }
    if (!notificationId || notificationId.trim().length === 0) {
      throw new NotificationSyncValidationError("notificationId is required");
    }

    await this.client.markNotificationRead(notificationId, token);

    const cached  = this.cache.get(userId) ?? [];
    const updated = cached.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    this.cache.set(userId, updated);

    const state = await this.repo.findByUserId(userId);
    if (state) {
      const newCount = Math.max(0, state.unreadCount - (
        cached.find(n => n.id === notificationId && !n.isRead) ? 1 : 0
      ));
      await this.repo.update({ ...state, unreadCount: newCount, updatedAt: new Date().toISOString() });
    }
  }

  // ── Mark all read ─────────────────────────────────────────────────────────────

  async markAllRead(userId: string, token?: string): Promise<number> {
    if (!userId || userId.trim().length === 0) {
      throw new NotificationSyncValidationError("userId is required");
    }

    const count   = await this.client.markAllNotificationsRead(token);
    const cached  = this.cache.get(userId) ?? [];
    const updated = cached.map(n => ({ ...n, isRead: true }));
    this.cache.set(userId, updated);

    const state = await this.repo.findByUserId(userId);
    if (state) {
      await this.repo.update({ ...state, unreadCount: 0, updatedAt: new Date().toISOString() });
    }

    return count;
  }

  // ── Sync state ────────────────────────────────────────────────────────────────

  async getSyncState(userId: string): Promise<NotificationSyncState | null> {
    if (!userId || userId.trim().length === 0) {
      throw new NotificationSyncValidationError("userId is required");
    }
    return this.repo.findByUserId(userId);
  }

  // ── Activity feed ─────────────────────────────────────────────────────────────

  private emitSyncActivity(userId: string, count: number): void {
    this.activities.push({
      id:          crypto.randomUUID(),
      type:        "SYSTEM",
      title:       "Notifications Synced",
      description: `Synced ${count} notification${count === 1 ? "" : "s"} from Universe Account`,
      visibility:  "PRIVATE",
      sourceApp:   "universe-hub",
      userId,
      createdAt:   new Date().toISOString(),
    });
  }

  getActivities(userId?: string): SyncActivity[] {
    if (userId) return this.activities.filter(a => a.userId === userId);
    return [...this.activities];
  }
}
