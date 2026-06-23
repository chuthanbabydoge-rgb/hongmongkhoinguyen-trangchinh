// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceNotificationRepository
//
// Table: marketplace_notifications
//   id UUID PK, user_id UUID, type TEXT, title TEXT, message TEXT,
//   is_read BOOLEAN DEFAULT false, metadata JSONB, created_at TIMESTAMPTZ
//
// Gracefully returns empty results / zeros if the table doesn't exist yet.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type {
  IMarketplaceNotificationRepository,
  MarketplaceNotification,
  CreateNotificationInput,
  NotificationType,
} from "../marketplaceNotificationRepository";

type Row = Record<string, unknown>;

function toNotification(row: Row): MarketplaceNotification {
  return {
    id:        String(row["id"]         ?? ""),
    userId:    String(row["user_id"]    ?? ""),
    type:      String(row["type"]       ?? "") as NotificationType,
    title:     String(row["title"]      ?? ""),
    message:   String(row["message"]    ?? ""),
    isRead:    Boolean(row["is_read"]   ?? false),
    metadata:  row["metadata"] != null ? (row["metadata"] as Record<string, unknown>) : undefined,
    createdAt: String(row["created_at"] ?? ""),
  };
}

const TABLE = "marketplace_notifications";

export class SupabaseMarketplaceNotificationRepository implements IMarketplaceNotificationRepository {
  private get db() { return getSupabaseClient(); }

  async create(input: CreateNotificationInput): Promise<MarketplaceNotification> {
    const { data, error } = await this.db
      .from(TABLE)
      .insert({
        user_id:  input.userId,
        type:     input.type,
        title:    input.title,
        message:  input.message,
        metadata: input.metadata ?? null,
        is_read:  false,
      })
      .select()
      .single();

    if (error) throw new Error(`SupabaseNotificationRepo.create: ${error.message}`);
    return toNotification(data as Row);
  }

  async getByUserId(userId: string, limit = 50, offset = 0): Promise<{ data: MarketplaceNotification[]; total: number }> {
    const { data, error, count } = await this.db
      .from(TABLE)
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return { data: [], total: 0 };

    return {
      data:  (data ?? []).map(r => toNotification(r as Row)),
      total: count ?? 0,
    };
  }

  async getUnreadByUserId(userId: string): Promise<MarketplaceNotification[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []).map(r => toNotification(r as Row));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await this.db
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) return 0;
    return count ?? 0;
  }

  async markAsRead(id: string): Promise<MarketplaceNotification | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !data) return null;
    return toNotification(data as Row);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const { data, error } = await this.db
      .from(TABLE)
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .select("id");

    if (error) return 0;
    return (data ?? []).length;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.db.from(TABLE).delete().eq("id", id);
    return !error;
  }
}
