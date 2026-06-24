// ─────────────────────────────────────────────────────────────────────────────
// Notification Sync Repository — HUB-4
//
// INotificationSyncRepository: interface.
// InMemoryNotificationSyncRepository: in-memory implementation for dev/tests.
// ─────────────────────────────────────────────────────────────────────────────

import type { NotificationSyncState } from "../models/notificationSync.js";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface INotificationSyncRepository {
  findByUserId(userId: string): Promise<NotificationSyncState | null>;
  save(state: NotificationSyncState): Promise<NotificationSyncState>;
  update(state: NotificationSyncState): Promise<NotificationSyncState | null>;
  delete(userId: string): Promise<boolean>;
}

// ─── In-Memory Implementation ─────────────────────────────────────────────────

export class InMemoryNotificationSyncRepository implements INotificationSyncRepository {
  private readonly store = new Map<string, NotificationSyncState>();

  async findByUserId(userId: string): Promise<NotificationSyncState | null> {
    const s = this.store.get(userId);
    return s ? { ...s } : null;
  }

  async save(state: NotificationSyncState): Promise<NotificationSyncState> {
    const record: NotificationSyncState = { ...state };
    this.store.set(state.userId, record);
    return { ...record };
  }

  async update(state: NotificationSyncState): Promise<NotificationSyncState | null> {
    if (!this.store.has(state.userId)) return null;
    const updated: NotificationSyncState = { ...state, updatedAt: new Date().toISOString() };
    this.store.set(state.userId, updated);
    return { ...updated };
  }

  async delete(userId: string): Promise<boolean> {
    return this.store.delete(userId);
  }
}
