// ─────────────────────────────────────────────────────────────────────────────
// SupabaseApplicationRegistryRepository — HUB-5
//
// Backs IApplicationRegistryRepository against `applications_registry` table.
// Falls back gracefully if the table doesn't exist yet.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase.js";
import type { IApplicationRegistryRepository } from "../applicationRegistryRepository.js";
import type {
  Application,
  AppHUB5Category,
  AppHUB5Status,
  PaginationOptions,
} from "../../models/application.js";

const TABLE = "applications_registry";

type Row = {
  id:           string;
  slug:         string;
  name:         string;
  description:  string | null;
  icon_url:     string | null;
  banner_url:   string | null;
  category:     string;
  launch_url:   string;
  owner_app:    string | null;
  status:       string;
  featured:     boolean;
  created_at:   string | null;
  updated_at:   string | null;
};

function rowToApp(r: Row): Application {
  return {
    id:          r.id,
    slug:        r.slug,
    name:        r.name,
    description: r.description ?? undefined,
    iconUrl:     r.icon_url ?? undefined,
    bannerUrl:   r.banner_url ?? undefined,
    category:    r.category as AppHUB5Category,
    launchUrl:   r.launch_url,
    ownerApp:    r.owner_app ?? undefined,
    status:      r.status as AppHUB5Status,
    featured:    r.featured,
    createdAt:   r.created_at ?? new Date().toISOString(),
    updatedAt:   r.updated_at ?? new Date().toISOString(),
  };
}

export class SupabaseApplicationRegistryRepository implements IApplicationRegistryRepository {
  private get db() { return getSupabaseClient(); }

  async create(app: Application): Promise<Application> {
    const { data, error } = await this.db.from(TABLE).insert({
      id:          app.id,
      slug:        app.slug,
      name:        app.name,
      description: app.description ?? null,
      icon_url:    app.iconUrl ?? null,
      banner_url:  app.bannerUrl ?? null,
      category:    app.category,
      launch_url:  app.launchUrl,
      owner_app:   app.ownerApp ?? null,
      status:      app.status,
      featured:    app.featured,
    }).select().single();
    if (error) throw new Error(`SupabaseApplicationRegistry.create: ${error.message}`);
    return rowToApp(data as Row);
  }

  async update(app: Application): Promise<Application | null> {
    const { data, error } = await this.db.from(TABLE).update({
      slug:        app.slug,
      name:        app.name,
      description: app.description ?? null,
      icon_url:    app.iconUrl ?? null,
      banner_url:  app.bannerUrl ?? null,
      category:    app.category,
      launch_url:  app.launchUrl,
      owner_app:   app.ownerApp ?? null,
      status:      app.status,
      featured:    app.featured,
      updated_at:  new Date().toISOString(),
    }).eq("id", app.id).select().single();
    if (error) return null;
    return rowToApp(data as Row);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.db.from(TABLE).delete().eq("id", id);
    return !error;
  }

  async findById(id: string): Promise<Application | null> {
    const { data, error } = await this.db.from(TABLE).select("*").eq("id", id).single();
    if (error || !data) return null;
    return rowToApp(data as Row);
  }

  async findBySlug(slug: string): Promise<Application | null> {
    const { data, error } = await this.db.from(TABLE).select("*").eq("slug", slug).single();
    if (error || !data) return null;
    return rowToApp(data as Row);
  }

  async findAll(opts?: PaginationOptions): Promise<Application[]> {
    const page  = Math.max(1, opts?.page  ?? 1);
    const limit = Math.max(1, opts?.limit ?? 20);
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: (opts?.order ?? "desc") === "asc" })
      .range((page - 1) * limit, page * limit - 1);
    if (error || !data) return [];
    return (data as Row[]).map(rowToApp);
  }

  async findByCategory(category: AppHUB5Category, opts?: PaginationOptions): Promise<Application[]> {
    const page  = Math.max(1, opts?.page  ?? 1);
    const limit = Math.max(1, opts?.limit ?? 20);
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error || !data) return [];
    return (data as Row[]).map(rowToApp);
  }

  async findFeatured(opts?: PaginationOptions): Promise<Application[]> {
    const page  = Math.max(1, opts?.page  ?? 1);
    const limit = Math.max(1, opts?.limit ?? 20);
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error || !data) return [];
    return (data as Row[]).map(rowToApp);
  }

  async findRecentlyAdded(limit: number): Promise<Application[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as Row[]).map(rowToApp);
  }

  async updateStatus(id: string, status: AppHUB5Status): Promise<Application | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error || !data) return null;
    return rowToApp(data as Row);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const { count, error } = await this.db
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("slug", slug);
    if (error) return false;
    return (count ?? 0) > 0;
  }

  async count(): Promise<number> {
    const { count, error } = await this.db
      .from(TABLE)
      .select("*", { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  }
}
