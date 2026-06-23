// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceModerationRepository — V2.5
//
// Tables required:
//   marketplace_moderation_actions  (id PK, admin_id, action, target_type,
//                                    target_id, reason, created_at)
//   marketplace_seller_statuses     (user_id PK, status, updated_at)
//   marketplace_reported_items      (id PK, target_type, target_id, reason,
//                                    created_at)
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import type {
  IModerationRepository,
  ModerationAction,
  ModerationActionType,
  SellerModerationStatus,
  SellerStatusValue,
  ReportedItem,
} from "../marketplaceModerationRepository";

function getClient() {
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_ANON_KEY"]!);
}

function toAction(row: Record<string, unknown>): ModerationAction {
  return {
    id:         row["id"]          as string,
    adminId:    row["admin_id"]    as string,
    action:     row["action"]      as ModerationActionType,
    targetType: row["target_type"] as string,
    targetId:   row["target_id"]   as string,
    reason:     row["reason"]      as string,
    createdAt:  row["created_at"]  as string,
  };
}

function toStatus(row: Record<string, unknown>): SellerModerationStatus {
  return {
    userId:    row["user_id"]    as string,
    status:    row["status"]     as SellerStatusValue,
    updatedAt: row["updated_at"] as string,
  };
}

function toReported(row: Record<string, unknown>): ReportedItem {
  return {
    id:         row["id"]          as string,
    targetType: row["target_type"] as string,
    targetId:   row["target_id"]   as string,
    reason:     row["reason"]      as string,
    createdAt:  row["created_at"]  as string,
  };
}

export class SupabaseMarketplaceModerationRepository implements IModerationRepository {
  private get db() { return getClient(); }

  async addAction(input: Omit<ModerationAction, "id" | "createdAt">): Promise<ModerationAction> {
    const { data, error } = await this.db
      .from("marketplace_moderation_actions")
      .insert({
        admin_id:    input.adminId,
        action:      input.action,
        target_type: input.targetType,
        target_id:   input.targetId,
        reason:      input.reason,
      })
      .select()
      .single();
    if (error) throw error;
    return toAction(data as Record<string, unknown>);
  }

  async getActions(limit = 100): Promise<ModerationAction[]> {
    const { data, error } = await this.db
      .from("marketplace_moderation_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(r => toAction(r as Record<string, unknown>));
  }

  async getSellerStatus(userId: string): Promise<SellerModerationStatus | null> {
    const { data } = await this.db
      .from("marketplace_seller_statuses")
      .select("*")
      .eq("user_id", userId)
      .single();
    return data ? toStatus(data as Record<string, unknown>) : null;
  }

  async setSellerStatus(userId: string, status: SellerStatusValue): Promise<SellerModerationStatus> {
    const { data, error } = await this.db
      .from("marketplace_seller_statuses")
      .upsert({ user_id: userId, status, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
      .select()
      .single();
    if (error) throw error;
    return toStatus(data as Record<string, unknown>);
  }

  async countSellers(status: SellerStatusValue): Promise<number> {
    const { count } = await this.db
      .from("marketplace_seller_statuses")
      .select("user_id", { count: "exact", head: true })
      .eq("status", status);
    return count ?? 0;
  }

  async getReported(): Promise<ReportedItem[]> {
    const { data, error } = await this.db
      .from("marketplace_reported_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(r => toReported(r as Record<string, unknown>));
  }

  async countReported(): Promise<number> {
    const { count } = await this.db
      .from("marketplace_reported_items")
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  }
}
