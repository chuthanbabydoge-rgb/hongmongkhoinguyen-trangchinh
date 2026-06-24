// ─────────────────────────────────────────────────────────────────────────────
// App Registry Repository — HUB-2
//
// IAppRegistryRepository: interface for all implementations.
// InMemoryAppRegistryRepository: fully in-memory, used as default and in tests.
// ─────────────────────────────────────────────────────────────────────────────

import type { EcosystemApp, AppCategory } from "../models/ecosystemApp.js";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAppRegistryRepository {
  create(app: EcosystemApp): Promise<EcosystemApp>;
  update(app: EcosystemApp): Promise<EcosystemApp | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<EcosystemApp | null>;
  findBySlug(slug: string): Promise<EcosystemApp | null>;
  findAll(): Promise<EcosystemApp[]>;
  findByCategory(category: AppCategory): Promise<EcosystemApp[]>;
  existsBySlug(slug: string): Promise<boolean>;
  count(): Promise<number>;
}

// ─── In-Memory Implementation ─────────────────────────────────────────────────

export class InMemoryAppRegistryRepository implements IAppRegistryRepository {
  private readonly store = new Map<string, EcosystemApp>();
  private readonly slugIndex = new Map<string, string>();

  async create(app: EcosystemApp): Promise<EcosystemApp> {
    const now = new Date().toISOString();
    const record: EcosystemApp = { ...app, createdAt: app.createdAt ?? now, updatedAt: now };
    this.store.set(record.id, record);
    this.slugIndex.set(record.slug, record.id);
    return { ...record };
  }

  async update(app: EcosystemApp): Promise<EcosystemApp | null> {
    const existing = this.store.get(app.id);
    if (!existing) return null;
    if (app.slug !== existing.slug) {
      this.slugIndex.delete(existing.slug);
      this.slugIndex.set(app.slug, app.id);
    }
    const updated: EcosystemApp = { ...app, updatedAt: new Date().toISOString() };
    this.store.set(app.id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    const existing = this.store.get(id);
    if (!existing) return false;
    this.slugIndex.delete(existing.slug);
    return this.store.delete(id);
  }

  async findById(id: string): Promise<EcosystemApp | null> {
    const app = this.store.get(id);
    return app ? { ...app } : null;
  }

  async findBySlug(slug: string): Promise<EcosystemApp | null> {
    const id = this.slugIndex.get(slug);
    if (!id) return null;
    const app = this.store.get(id);
    return app ? { ...app } : null;
  }

  async findAll(): Promise<EcosystemApp[]> {
    return Array.from(this.store.values()).map(a => ({ ...a }));
  }

  async findByCategory(category: AppCategory): Promise<EcosystemApp[]> {
    return Array.from(this.store.values())
      .filter(a => a.category === category)
      .map(a => ({ ...a }));
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.slugIndex.has(slug);
  }

  async count(): Promise<number> {
    return this.store.size;
  }
}
