// ─────────────────────────────────────────────────────────────────────────────
// SupabaseAppRegistryRepository — HUB-2
//
// Backs IAppRegistryRepository against the `ecosystem_apps` Supabase table.
// Falls back gracefully if the table doesn't exist yet.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase.js";
import type { IAppRegistryRepository } from "../appRegistryRepository.js";
import type { EcosystemApp, AppCategory } from "../../models/ecosystemApp.js";

const TABLE = "ecosystem_apps";

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  base_url: string;
  category: string;
  status: string;
  version: string;
  created_at: string | null;
  updated_at: string | null;
};

function rowToApp(r: Row): EcosystemApp {
  return {
    id:          r.id,
    slug:        r.slug,
    name:        r.name,
    description: r.description ?? undefined,
    iconUrl:     r.icon_url ?? undefined,
    baseUrl:     r.base_url,
    category:    r.category as AppCategory,
    status:      r.status as EcosystemApp["status"],
    version:     r.version,
    createdAt:   r.created_at ?? new Date().toISOString(),
    updatedAt:   r.updated_at ?? new Date().toISOString(),
  };
}

export class SupabaseAppRegistryRepository implements IAppRegistryRepository {
  private get db() { return getSupabaseClient(); }

  async create(app: EcosystemApp): Promise<EcosystemApp> {
    const { data, error } = await this.db.from(TABLE).insert({
      id:          app.id,
      slug:        app.slug,
      name:        app.name,
      description: app.description ?? null,
      icon_url:    app.iconUrl ?? null,
      base_url:    app.baseUrl,
      category:    app.category,
      status:      app.status,
      version:     app.version,
    }).select().single();

    if (error) throw new Error(`SupabaseAppRegistry.create: ${error.message}`);
    return rowToApp(data as Row);
  }

  async update(app: EcosystemApp): Promise<EcosystemApp | null> {
    const { data, error } = await this.db.from(TABLE).update({
      slug:        app.slug,
      name:        app.name,
      description: app.description ?? null,
      icon_url:    app.iconUrl ?? null,
      base_url:    app.baseUrl,
      category:    app.category,
      status:      app.status,
      version:     app.version,
      updated_at:  new Date().toISOString(),
    }).eq("id", app.id).select().single();

    if (error) return null;
    return rowToApp(data as Row);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.db.from(TABLE).delete().eq("id", id);
    return !error;
  }

  async findById(id: string): Promise<EcosystemApp | null> {
    const { data, error } = await this.db.from(TABLE).select("*").eq("id", id).single();
    if (error || !data) return null;
    return rowToApp(data as Row);
  }

  async findBySlug(slug: string): Promise<EcosystemApp | null> {
    const { data, error } = await this.db.from(TABLE).select("*").eq("slug", slug).single();
    if (error || !data) return null;
    return rowToApp(data as Row);
  }

  async findAll(): Promise<EcosystemApp[]> {
    const { data, error } = await this.db.from(TABLE).select("*").order("created_at", { ascending: true });
    if (error || !data) return [];
    return (data as Row[]).map(rowToApp);
  }

  async findByCategory(category: AppCategory): Promise<EcosystemApp[]> {
    const { data, error } = await this.db.from(TABLE).select("*").eq("category", category);
    if (error || !data) return [];
    return (data as Row[]).map(rowToApp);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const { count, error } = await this.db.from(TABLE).select("*", { count: "exact", head: true }).eq("slug", slug);
    if (error) return false;
    return (count ?? 0) > 0;
  }

  async count(): Promise<number> {
    const { count, error } = await this.db.from(TABLE).select("*", { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  }
}
