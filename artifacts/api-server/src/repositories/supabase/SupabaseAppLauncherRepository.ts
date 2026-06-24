// ─────────────────────────────────────────────────────────────────────────────
// SupabaseAppLauncherRepository — HUB-3
//
// Backs IAppLauncherRepository against the `app_launches` Supabase table.
// Falls back gracefully if the table doesn't exist yet.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase.js";
import type { IAppLauncherRepository } from "../appLauncherRepository.js";
import type { LaunchRecord } from "../../models/appLauncher.js";

const TABLE = "app_launches";

type Row = {
  id:            string;
  user_id:       string;
  app_slug:      string;
  launched_at:   string;
  launch_source: string;
  session_id:    string | null;
  metadata:      Record<string, unknown> | null;
  created_at:    string | null;
};

function rowToRecord(r: Row): LaunchRecord {
  return {
    id:           r.id,
    userId:       r.user_id,
    appSlug:      r.app_slug,
    launchedAt:   r.launched_at,
    launchSource: r.launch_source,
    sessionId:    r.session_id ?? undefined,
    metadata:     r.metadata ?? undefined,
  };
}

export class SupabaseAppLauncherRepository implements IAppLauncherRepository {
  private get db() { return getSupabaseClient(); }

  async recordLaunch(record: LaunchRecord): Promise<LaunchRecord> {
    const { data, error } = await this.db.from(TABLE).insert({
      id:            record.id,
      user_id:       record.userId,
      app_slug:      record.appSlug,
      launched_at:   record.launchedAt,
      launch_source: record.launchSource,
      session_id:    record.sessionId ?? null,
      metadata:      record.metadata ?? null,
    }).select().single();

    if (error) throw new Error(`SupabaseAppLauncher.recordLaunch: ${error.message}`);
    return rowToRecord(data as Row);
  }

  async getRecentLaunches(userId: string, limit = 10): Promise<LaunchRecord[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("launched_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return (data as Row[]).map(rowToRecord);
  }

  async countLaunches(userId: string): Promise<number> {
    const { count, error } = await this.db
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) return 0;
    return count ?? 0;
  }

  async getMostUsedApps(userId: string, limit = 5): Promise<{ appSlug: string; count: number }[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("app_slug")
      .eq("user_id", userId);

    if (error || !data) return [];

    const counts = new Map<string, number>();
    for (const row of data as { app_slug: string }[]) {
      counts.set(row.app_slug, (counts.get(row.app_slug) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([appSlug, count]) => ({ appSlug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async deleteLaunchHistory(userId: string): Promise<boolean> {
    const { error } = await this.db
      .from(TABLE)
      .delete()
      .eq("user_id", userId);

    return !error;
  }

  async hasLaunchedApp(userId: string, appSlug: string): Promise<boolean> {
    const { count, error } = await this.db
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("app_slug", appSlug);

    if (error) return false;
    return (count ?? 0) > 0;
  }
}
