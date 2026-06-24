// ─────────────────────────────────────────────────────────────────────────────
// SupabaseNotificationSyncRepository — HUB-4
//
// Backs INotificationSyncRepository against `notification_sync_state` table.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase.js";
import type { INotificationSyncRepository } from "../notificationSyncRepository.js";
import type { NotificationSyncState } from "../../models/notificationSync.js";

const TABLE = "notification_sync_state";

type Row = {
  id:                   string;
  user_id:              string;
  last_sync_at:         string | null;
  last_notification_id: string | null;
  unread_count:         number;
  created_at:           string | null;
  updated_at:           string | null;
};

function rowToState(r: Row): NotificationSyncState {
  return {
    id:                 r.id,
    userId:             r.user_id,
    lastSyncAt:         r.last_sync_at,
    lastNotificationId: r.last_notification_id,
    unreadCount:        r.unread_count,
    createdAt:          r.created_at ?? new Date().toISOString(),
    updatedAt:          r.updated_at ?? new Date().toISOString(),
  };
}

export class SupabaseNotificationSyncRepository implements INotificationSyncRepository {
  private get db() { return getSupabaseClient(); }

  async findByUserId(userId: string): Promise<NotificationSyncState | null> {
    const { data, error } = await this.db
      .from(TABLE).select("*").eq("user_id", userId).single();
    if (error || !data) return null;
    return rowToState(data as Row);
  }

  async save(state: NotificationSyncState): Promise<NotificationSyncState> {
    const { data, error } = await this.db.from(TABLE).insert({
      id:                   state.id,
      user_id:              state.userId,
      last_sync_at:         state.lastSyncAt,
      last_notification_id: state.lastNotificationId,
      unread_count:         state.unreadCount,
    }).select().single();
    if (error) throw new Error(`SupabaseNotificationSync.save: ${error.message}`);
    return rowToState(data as Row);
  }

  async update(state: NotificationSyncState): Promise<NotificationSyncState | null> {
    const { data, error } = await this.db.from(TABLE).update({
      last_sync_at:         state.lastSyncAt,
      last_notification_id: state.lastNotificationId,
      unread_count:         state.unreadCount,
      updated_at:           new Date().toISOString(),
    }).eq("user_id", state.userId).select().single();
    if (error || !data) return null;
    return rowToState(data as Row);
  }

  async delete(userId: string): Promise<boolean> {
    const { error } = await this.db.from(TABLE).delete().eq("user_id", userId);
    return !error;
  }
}
