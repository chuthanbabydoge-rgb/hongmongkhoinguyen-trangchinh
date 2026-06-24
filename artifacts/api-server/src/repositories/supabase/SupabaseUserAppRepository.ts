// ─────────────────────────────────────────────────────────────────────────────
// SupabaseUserAppRepository — HUB-5
//
// Backs IUserAppRepository against the `user_apps` Supabase table.
// Falls back gracefully if the table doesn't exist yet.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase.js";
import type { IUserAppRepository } from "../applicationRegistryRepository.js";
import type { UserApplication } from "../../models/application.js";

const TABLE = "user_apps";

type Row = {
  id:             string;
  user_id:        string;
  application_id: string;
  installed_at:   string | null;
  last_opened_at: string | null;
};

function rowToUserApp(r: Row): UserApplication {
  return {
    id:            r.id,
    userId:        r.user_id,
    applicationId: r.application_id,
    installedAt:   r.installed_at ?? new Date().toISOString(),
    lastOpenedAt:  r.last_opened_at ?? undefined,
  };
}

export class SupabaseUserAppRepository implements IUserAppRepository {
  private get db() { return getSupabaseClient(); }

  async install(userApp: UserApplication): Promise<UserApplication> {
    const { data, error } = await this.db.from(TABLE).insert({
      id:             userApp.id,
      user_id:        userApp.userId,
      application_id: userApp.applicationId,
      installed_at:   userApp.installedAt,
      last_opened_at: userApp.lastOpenedAt ?? null,
    }).select().single();
    if (error) throw new Error(`SupabaseUserApp.install: ${error.message}`);
    return rowToUserApp(data as Row);
  }

  async uninstall(userId: string, applicationId: string): Promise<boolean> {
    const { error } = await this.db
      .from(TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("application_id", applicationId);
    return !error;
  }

  async findByUserId(userId: string): Promise<UserApplication[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("installed_at", { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map(rowToUserApp);
  }

  async findOne(userId: string, applicationId: string): Promise<UserApplication | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("application_id", applicationId)
      .single();
    if (error || !data) return null;
    return rowToUserApp(data as Row);
  }

  async updateLastOpened(userId: string, applicationId: string, at: string): Promise<UserApplication | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .update({ last_opened_at: at })
      .eq("user_id", userId)
      .eq("application_id", applicationId)
      .select()
      .single();
    if (error || !data) return null;
    return rowToUserApp(data as Row);
  }

  async isInstalled(userId: string, applicationId: string): Promise<boolean> {
    const { count, error } = await this.db
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("application_id", applicationId);
    if (error) return false;
    return (count ?? 0) > 0;
  }

  async countByApplicationId(applicationId: string): Promise<number> {
    const { count, error } = await this.db
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("application_id", applicationId);
    if (error) return 0;
    return count ?? 0;
  }
}
