// ─────────────────────────────────────────────────────────────────────────────
// Application Registry Repository — HUB-5
//
// IApplicationRegistryRepository: interface for Application data.
// IUserAppRepository:              interface for UserApplication data.
// InMemory implementations:        default and test implementations.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Application,
  UserApplication,
  AppHUB5Category,
  AppHUB5Status,
  PaginationOptions,
} from "../models/application.js";

// ─── Application Repository Interface ─────────────────────────────────────────

export interface IApplicationRegistryRepository {
  create(app: Application): Promise<Application>;
  update(app: Application): Promise<Application | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<Application | null>;
  findBySlug(slug: string): Promise<Application | null>;
  findAll(opts?: PaginationOptions): Promise<Application[]>;
  findByCategory(category: AppHUB5Category, opts?: PaginationOptions): Promise<Application[]>;
  findFeatured(opts?: PaginationOptions): Promise<Application[]>;
  findRecentlyAdded(limit: number): Promise<Application[]>;
  updateStatus(id: string, status: AppHUB5Status): Promise<Application | null>;
  existsBySlug(slug: string): Promise<boolean>;
  count(): Promise<number>;
}

// ─── UserApp Repository Interface ─────────────────────────────────────────────

export interface IUserAppRepository {
  install(userApp: UserApplication): Promise<UserApplication>;
  uninstall(userId: string, applicationId: string): Promise<boolean>;
  findByUserId(userId: string): Promise<UserApplication[]>;
  findOne(userId: string, applicationId: string): Promise<UserApplication | null>;
  updateLastOpened(userId: string, applicationId: string, at: string): Promise<UserApplication | null>;
  isInstalled(userId: string, applicationId: string): Promise<boolean>;
  countByApplicationId(applicationId: string): Promise<number>;
}

// ─── Sorting helpers ──────────────────────────────────────────────────────────

function applySort(apps: Application[], opts?: PaginationOptions): Application[] {
  const sort  = opts?.sort ?? "createdAt";
  const order = opts?.order ?? "desc";
  const sorted = [...apps].sort((a, b) => {
    if (sort === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sort === "featured") {
      return Number(b.featured) - Number(a.featured);
    }
    return a.createdAt.localeCompare(b.createdAt);
  });
  if (order === "desc" && sort !== "featured") sorted.reverse();
  return sorted;
}

function applyPagination(apps: Application[], opts?: PaginationOptions): Application[] {
  const page  = Math.max(1, opts?.page  ?? 1);
  const limit = Math.max(1, opts?.limit ?? 20);
  const start = (page - 1) * limit;
  return apps.slice(start, start + limit);
}

// ─── InMemory Application Repository ─────────────────────────────────────────

export class InMemoryApplicationRegistryRepository implements IApplicationRegistryRepository {
  private readonly store     = new Map<string, Application>();
  private readonly slugIndex = new Map<string, string>();

  async create(app: Application): Promise<Application> {
    const now    = new Date().toISOString();
    const record = { ...app, createdAt: app.createdAt ?? now, updatedAt: now };
    this.store.set(record.id, record);
    this.slugIndex.set(record.slug, record.id);
    return { ...record };
  }

  async update(app: Application): Promise<Application | null> {
    const existing = this.store.get(app.id);
    if (!existing) return null;
    if (app.slug !== existing.slug) {
      this.slugIndex.delete(existing.slug);
      this.slugIndex.set(app.slug, app.id);
    }
    const updated = { ...app, updatedAt: new Date().toISOString() };
    this.store.set(app.id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    const existing = this.store.get(id);
    if (!existing) return false;
    this.slugIndex.delete(existing.slug);
    return this.store.delete(id);
  }

  async findById(id: string): Promise<Application | null> {
    const app = this.store.get(id);
    return app ? { ...app } : null;
  }

  async findBySlug(slug: string): Promise<Application | null> {
    const id = this.slugIndex.get(slug);
    if (!id) return null;
    const app = this.store.get(id);
    return app ? { ...app } : null;
  }

  async findAll(opts?: PaginationOptions): Promise<Application[]> {
    const all = Array.from(this.store.values());
    return applyPagination(applySort(all, opts), opts);
  }

  async findByCategory(category: AppHUB5Category, opts?: PaginationOptions): Promise<Application[]> {
    const filtered = Array.from(this.store.values()).filter(a => a.category === category);
    return applyPagination(applySort(filtered, opts), opts);
  }

  async findFeatured(opts?: PaginationOptions): Promise<Application[]> {
    const featured = Array.from(this.store.values()).filter(a => a.featured);
    return applyPagination(applySort(featured, opts), opts);
  }

  async findRecentlyAdded(limit: number): Promise<Application[]> {
    const all = Array.from(this.store.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return all.slice(0, limit).map(a => ({ ...a }));
  }

  async updateStatus(id: string, status: AppHUB5Status): Promise<Application | null> {
    const app = this.store.get(id);
    if (!app) return null;
    const updated = { ...app, status, updatedAt: new Date().toISOString() };
    this.store.set(id, updated);
    return { ...updated };
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.slugIndex.has(slug);
  }

  async count(): Promise<number> {
    return this.store.size;
  }
}

// ─── InMemory UserApp Repository ─────────────────────────────────────────────

export class InMemoryUserAppRepository implements IUserAppRepository {
  private readonly store = new Map<string, UserApplication>();

  private key(userId: string, applicationId: string): string {
    return `${userId}::${applicationId}`;
  }

  async install(userApp: UserApplication): Promise<UserApplication> {
    const record = { ...userApp };
    this.store.set(record.id, record);
    return { ...record };
  }

  async uninstall(userId: string, applicationId: string): Promise<boolean> {
    for (const [id, ua] of this.store.entries()) {
      if (ua.userId === userId && ua.applicationId === applicationId) {
        this.store.delete(id);
        return true;
      }
    }
    return false;
  }

  async findByUserId(userId: string): Promise<UserApplication[]> {
    return Array.from(this.store.values())
      .filter(ua => ua.userId === userId)
      .map(ua => ({ ...ua }));
  }

  async findOne(userId: string, applicationId: string): Promise<UserApplication | null> {
    for (const ua of this.store.values()) {
      if (ua.userId === userId && ua.applicationId === applicationId) {
        return { ...ua };
      }
    }
    return null;
  }

  async updateLastOpened(userId: string, applicationId: string, at: string): Promise<UserApplication | null> {
    for (const [id, ua] of this.store.entries()) {
      if (ua.userId === userId && ua.applicationId === applicationId) {
        const updated = { ...ua, lastOpenedAt: at };
        this.store.set(id, updated);
        return { ...updated };
      }
    }
    return null;
  }

  async isInstalled(userId: string, applicationId: string): Promise<boolean> {
    void this.key(userId, applicationId);
    for (const ua of this.store.values()) {
      if (ua.userId === userId && ua.applicationId === applicationId) return true;
    }
    return false;
  }

  async countByApplicationId(applicationId: string): Promise<number> {
    let count = 0;
    for (const ua of this.store.values()) {
      if (ua.applicationId === applicationId) count++;
    }
    return count;
  }
}
