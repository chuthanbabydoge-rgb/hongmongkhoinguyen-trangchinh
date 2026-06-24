// ─────────────────────────────────────────────────────────────────────────────
// AppRegistryService — HUB-2
//
// Manages the Universe ecosystem app registry.
// On initialization it seeds 5 canonical apps idempotently.
// Emits an in-memory activity event whenever a new app registers.
//
// Architecture:
//   Controller → AppRegistryService → IAppRegistryRepository
// ─────────────────────────────────────────────────────────────────────────────

import type { IAppRegistryRepository } from "../repositories/appRegistryRepository.js";
import {
  APP_CATEGORIES,
  APP_STATUSES,
} from "../models/ecosystemApp.js";
import type {
  EcosystemApp,
  AppCategory,
  AppRegistryActivity,
  AppRegistryStats,
  RegisterAppRequest,
  UpdateAppRequest,
} from "../models/ecosystemApp.js";

// ─── Errors ───────────────────────────────────────────────────────────────────

export class AppRegistryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppRegistryValidationError";
  }
}

export class AppNotFoundError extends Error {
  constructor(id: string) {
    super(`App not found: ${id}`);
    this.name = "AppNotFoundError";
  }
}

export class SlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Slug already registered: ${slug}`);
    this.name = "SlugAlreadyExistsError";
  }
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9-]+$/;

function isValidUrl(value: string): boolean {
  try { new URL(value); return true; } catch { return false; }
}

function validateRegisterRequest(input: RegisterAppRequest): void {
  if (!input.slug || input.slug.length === 0) {
    throw new AppRegistryValidationError("Slug không được rỗng");
  }
  if (input.slug.length > 100) {
    throw new AppRegistryValidationError("Slug tối đa 100 ký tự");
  }
  if (!SLUG_RE.test(input.slug)) {
    throw new AppRegistryValidationError("Slug chỉ được chứa chữ thường, số, dấu gạch ngang");
  }
  if (!input.name || input.name.length === 0) {
    throw new AppRegistryValidationError("name không được rỗng");
  }
  if (input.name.length > 100) {
    throw new AppRegistryValidationError("name tối đa 100 ký tự");
  }
  if (input.description !== undefined && input.description.length > 1000) {
    throw new AppRegistryValidationError("description tối đa 1000 ký tự");
  }
  if (!input.baseUrl || input.baseUrl.length === 0) {
    throw new AppRegistryValidationError("baseUrl không được rỗng");
  }
  if (!isValidUrl(input.baseUrl)) {
    throw new AppRegistryValidationError("baseUrl phải là URL hợp lệ");
  }
  if (!(APP_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new AppRegistryValidationError(`category không hợp lệ: ${input.category}`);
  }
  if (input.status !== undefined && !(APP_STATUSES as readonly string[]).includes(input.status)) {
    throw new AppRegistryValidationError(`status không hợp lệ: ${input.status}`);
  }
  if (!input.version || input.version.length === 0) {
    throw new AppRegistryValidationError("version không được rỗng");
  }
  if (input.iconUrl !== undefined && !isValidUrl(input.iconUrl)) {
    throw new AppRegistryValidationError("iconUrl phải là URL hợp lệ");
  }
}

function validateUpdateRequest(input: UpdateAppRequest): void {
  if (input.name !== undefined) {
    if (input.name.length === 0) throw new AppRegistryValidationError("name không được rỗng");
    if (input.name.length > 100) throw new AppRegistryValidationError("name tối đa 100 ký tự");
  }
  if (input.description !== undefined && input.description.length > 1000) {
    throw new AppRegistryValidationError("description tối đa 1000 ký tự");
  }
  if (input.baseUrl !== undefined) {
    if (!isValidUrl(input.baseUrl)) throw new AppRegistryValidationError("baseUrl phải là URL hợp lệ");
  }
  if (input.category !== undefined && !(APP_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new AppRegistryValidationError(`category không hợp lệ: ${input.category}`);
  }
  if (input.status !== undefined && !(APP_STATUSES as readonly string[]).includes(input.status)) {
    throw new AppRegistryValidationError(`status không hợp lệ: ${input.status}`);
  }
  if (input.iconUrl !== undefined && !isValidUrl(input.iconUrl)) {
    throw new AppRegistryValidationError("iconUrl phải là URL hợp lệ");
  }
  if (input.version !== undefined && input.version.length === 0) {
    throw new AppRegistryValidationError("version không được rỗng");
  }
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_APPS: Omit<EcosystemApp, "id" | "createdAt" | "updatedAt">[] = [
  {
    slug:        "football-universe",
    name:        "Football Universe",
    description: "Virtual football player trading, teams and tournaments",
    iconUrl:     "https://cdn.universe.io/icons/football-universe.png",
    baseUrl:     "https://football.universe.io",
    category:    "SPORT",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "animal-evolution",
    name:        "Animal Evolution",
    description: "Collect, breed and evolve digital pets",
    iconUrl:     "https://cdn.universe.io/icons/animal-evolution.png",
    baseUrl:     "https://animals.universe.io",
    category:    "ANIMAL",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "world-creator",
    name:        "World Creator",
    description: "Build and trade virtual world assets",
    iconUrl:     "https://cdn.universe.io/icons/world-creator.png",
    baseUrl:     "https://worlds.universe.io",
    category:    "WORLD",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "safepass",
    name:        "SafePass",
    description: "Secure identity and access management for the Universe ecosystem",
    iconUrl:     "https://cdn.universe.io/icons/safepass.png",
    baseUrl:     "https://safepass.universe.io",
    category:    "SECURITY",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "exchange-hub",
    name:        "Exchange Hub",
    description: "Cross-app asset exchange and currency conversion",
    iconUrl:     "https://cdn.universe.io/icons/exchange-hub.png",
    baseUrl:     "https://exchange.universe.io",
    category:    "FINANCE",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
];

// ─── Service ──────────────────────────────────────────────────────────────────

export class AppRegistryService {
  private readonly activities: AppRegistryActivity[] = [];

  constructor(private readonly repo: IAppRegistryRepository) {}

  // ── Initialization / Seed ───────────────────────────────────────────────────

  async initialize(): Promise<void> {
    const now = new Date().toISOString();
    for (const seed of SEED_APPS) {
      const exists = await this.repo.existsBySlug(seed.slug);
      if (!exists) {
        await this.repo.create({
          ...seed,
          id:        crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  // ── Register ─────────────────────────────────────────────────────────────────

  async registerApp(input: RegisterAppRequest): Promise<EcosystemApp> {
    validateRegisterRequest(input);

    const exists = await this.repo.existsBySlug(input.slug);
    if (exists) throw new SlugAlreadyExistsError(input.slug);

    const now = new Date().toISOString();
    const app = await this.repo.create({
      ...input,
      status:    input.status ?? "ACTIVE",
      id:        crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });

    this.emitActivity(app);
    return app;
  }

  // ── Update ───────────────────────────────────────────────────────────────────

  async updateApp(id: string, input: UpdateAppRequest): Promise<EcosystemApp> {
    validateUpdateRequest(input);

    const existing = await this.repo.findById(id);
    if (!existing) throw new AppNotFoundError(id);

    const updated = await this.repo.update({ ...existing, ...input });
    if (!updated) throw new AppNotFoundError(id);
    return updated;
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  async deleteApp(id: string): Promise<boolean> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppNotFoundError(id);
    return this.repo.delete(id);
  }

  // ── Read ─────────────────────────────────────────────────────────────────────

  async getApp(id: string): Promise<EcosystemApp> {
    const app = await this.repo.findById(id);
    if (!app) throw new AppNotFoundError(id);
    return app;
  }

  async getBySlug(slug: string): Promise<EcosystemApp> {
    const app = await this.repo.findBySlug(slug);
    if (!app) throw new AppNotFoundError(slug);
    return app;
  }

  async getAllApps(): Promise<EcosystemApp[]> {
    return this.repo.findAll();
  }

  async getAppsByCategory(category: AppCategory): Promise<EcosystemApp[]> {
    return this.repo.findByCategory(category);
  }

  async countApps(): Promise<number> {
    return this.repo.count();
  }

  // ── Search ───────────────────────────────────────────────────────────────────

  async searchApps(q: string): Promise<EcosystemApp[]> {
    if (!q.trim()) return this.repo.findAll();
    const lower = q.toLowerCase();
    const all   = await this.repo.findAll();
    return all.filter(a =>
      a.name.toLowerCase().includes(lower) ||
      a.slug.toLowerCase().includes(lower) ||
      (a.description?.toLowerCase().includes(lower) ?? false),
    );
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  async getStats(): Promise<AppRegistryStats> {
    const all = await this.repo.findAll();

    const categories: Record<string, number> = {};
    for (const cat of APP_CATEGORIES) {
      const n = all.filter(a => a.category === cat).length;
      if (n > 0) categories[cat] = n;
    }

    return {
      totalApps:       all.length,
      activeApps:      all.filter(a => a.status === "ACTIVE").length,
      maintenanceApps: all.filter(a => a.status === "MAINTENANCE").length,
      inactiveApps:    all.filter(a => a.status === "INACTIVE").length,
      categories,
    };
  }

  // ── Activity feed ─────────────────────────────────────────────────────────────

  private emitActivity(app: EcosystemApp): void {
    this.activities.push({
      id:          crypto.randomUUID(),
      type:        "SYSTEM",
      title:       "New Ecosystem App",
      description: `${app.name} joined the Universe ecosystem`,
      visibility:  "PUBLIC",
      sourceApp:   "universe-hub",
      createdAt:   new Date().toISOString(),
    });
  }

  getActivities(): AppRegistryActivity[] {
    return [...this.activities];
  }
}
