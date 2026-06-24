// ─────────────────────────────────────────────────────────────────────────────
// ApplicationRegistryService — HUB-5
//
// Manages the Universe App Registry: register, enable/disable, install, open.
// Includes user-level install/open tracking and Activity Feed integration.
//
// Architecture:
//   Controller → ApplicationRegistryService
//                  → IApplicationRegistryRepository
//                  → IUserAppRepository
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IApplicationRegistryRepository,
  IUserAppRepository,
} from "../repositories/applicationRegistryRepository.js";
import {
  APP_HUB5_CATEGORIES,
  APP_HUB5_STATUSES,
} from "../models/application.js";
import type {
  Application,
  UserApplication,
  AppHUB5Category,
  CreateApplicationRequest,
  InstallApplicationRequest,
  AppHUB5Activity,
  PaginationOptions,
  PaginatedResult,
} from "../models/application.js";

// ─── Errors ───────────────────────────────────────────────────────────────────

export class AppAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`App đã tồn tại với slug: ${slug}`);
    this.name = "AppAlreadyExistsError";
  }
}

export class AppHUB5NotFoundError extends Error {
  constructor(identifier: string) {
    super(`App không tồn tại: ${identifier}`);
    this.name = "AppHUB5NotFoundError";
  }
}

export class AppDisabledError extends Error {
  constructor(slug: string) {
    super(`App "${slug}" đã bị vô hiệu hóa và không thể mở`);
    this.name = "AppDisabledError";
  }
}

export class AppValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppValidationError";
  }
}

export class AppNotInstalledError extends Error {
  constructor(slug: string) {
    super(`App "${slug}" chưa được cài đặt`);
    this.name = "AppNotInstalledError";
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9-]+$/;

function isValidUrl(value: string): boolean {
  try { new URL(value); return true; } catch { return false; }
}

function validateCreateRequest(input: CreateApplicationRequest): void {
  if (!input.slug || input.slug.trim().length === 0) {
    throw new AppValidationError("slug không được rỗng");
  }
  if (input.slug.length > 100) {
    throw new AppValidationError("slug tối đa 100 ký tự");
  }
  if (!SLUG_RE.test(input.slug)) {
    throw new AppValidationError("slug chỉ được chứa chữ thường, số, dấu gạch ngang");
  }
  if (!input.name || input.name.trim().length === 0) {
    throw new AppValidationError("name không được rỗng");
  }
  if (input.name.length > 100) {
    throw new AppValidationError("name tối đa 100 ký tự");
  }
  if (input.description !== undefined && input.description.length > 1000) {
    throw new AppValidationError("description tối đa 1000 ký tự");
  }
  if (!input.launchUrl || input.launchUrl.trim().length === 0) {
    throw new AppValidationError("launchUrl không được rỗng");
  }
  if (!isValidUrl(input.launchUrl)) {
    throw new AppValidationError("launchUrl phải là URL hợp lệ");
  }
  if (!(APP_HUB5_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new AppValidationError(`category không hợp lệ: ${input.category}`);
  }
  if (input.status !== undefined && !(APP_HUB5_STATUSES as readonly string[]).includes(input.status)) {
    throw new AppValidationError(`status không hợp lệ: ${input.status}`);
  }
  if (input.iconUrl !== undefined && !isValidUrl(input.iconUrl)) {
    throw new AppValidationError("iconUrl phải là URL hợp lệ");
  }
  if (input.bannerUrl !== undefined && !isValidUrl(input.bannerUrl)) {
    throw new AppValidationError("bannerUrl phải là URL hợp lệ");
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class ApplicationRegistryService {
  private readonly activities: AppHUB5Activity[] = [];

  constructor(
    private readonly appRepo:     IApplicationRegistryRepository,
    private readonly userAppRepo: IUserAppRepository,
  ) {}

  // ── Register ─────────────────────────────────────────────────────────────────

  async registerApp(input: CreateApplicationRequest): Promise<Application> {
    validateCreateRequest(input);

    const exists = await this.appRepo.existsBySlug(input.slug);
    if (exists) throw new AppAlreadyExistsError(input.slug);

    const now = new Date().toISOString();
    const app = await this.appRepo.create({
      id:          crypto.randomUUID(),
      slug:        input.slug,
      name:        input.name,
      description: input.description,
      iconUrl:     input.iconUrl,
      bannerUrl:   input.bannerUrl,
      category:    input.category,
      launchUrl:   input.launchUrl,
      ownerApp:    input.ownerApp,
      status:      input.status ?? "ACTIVE",
      featured:    input.featured ?? false,
      createdAt:   now,
      updatedAt:   now,
    });

    return app;
  }

  // ── Enable / Disable ─────────────────────────────────────────────────────────

  async disableApp(slug: string): Promise<Application> {
    const app = await this.appRepo.findBySlug(slug);
    if (!app) throw new AppHUB5NotFoundError(slug);
    const updated = await this.appRepo.updateStatus(app.id, "DISABLED");
    if (!updated) throw new AppHUB5NotFoundError(slug);
    return updated;
  }

  async enableApp(slug: string): Promise<Application> {
    const app = await this.appRepo.findBySlug(slug);
    if (!app) throw new AppHUB5NotFoundError(slug);
    const updated = await this.appRepo.updateStatus(app.id, "ACTIVE");
    if (!updated) throw new AppHUB5NotFoundError(slug);
    return updated;
  }

  // ── Read ─────────────────────────────────────────────────────────────────────

  async getApp(slug: string): Promise<Application> {
    const app = await this.appRepo.findBySlug(slug);
    if (!app) throw new AppHUB5NotFoundError(slug);
    return app;
  }

  async getApps(opts?: PaginationOptions): Promise<PaginatedResult<Application>> {
    const page  = Math.max(1, opts?.page  ?? 1);
    const limit = Math.max(1, opts?.limit ?? 20);
    const all   = await this.appRepo.findAll({ ...opts, page: 1, limit: 100_000 });
    const data  = await this.appRepo.findAll(opts);
    return {
      data,
      total:      all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit),
    };
  }

  async getFeaturedApps(opts?: PaginationOptions): Promise<PaginatedResult<Application>> {
    const page  = Math.max(1, opts?.page  ?? 1);
    const limit = Math.max(1, opts?.limit ?? 20);
    const allFeatured = await this.appRepo.findFeatured({ page: 1, limit: 100_000 });
    const data        = await this.appRepo.findFeatured(opts);
    return {
      data,
      total:      allFeatured.length,
      page,
      limit,
      totalPages: Math.ceil(allFeatured.length / limit),
    };
  }

  async getRecentlyAdded(limit = 10): Promise<Application[]> {
    return this.appRepo.findRecentlyAdded(limit);
  }

  async getAppsByCategory(category: AppHUB5Category, opts?: PaginationOptions): Promise<Application[]> {
    return this.appRepo.findByCategory(category, opts);
  }

  // ── Install / Uninstall ───────────────────────────────────────────────────────

  async installApp(userId: string, input: InstallApplicationRequest): Promise<UserApplication> {
    if (!userId || userId.trim().length === 0) {
      throw new AppValidationError("userId không được rỗng");
    }

    const app = await this.appRepo.findBySlug(input.slug);
    if (!app) throw new AppHUB5NotFoundError(input.slug);

    const already = await this.userAppRepo.isInstalled(userId, app.id);
    if (already) {
      const existing = await this.userAppRepo.findOne(userId, app.id);
      return existing!;
    }

    const now     = new Date().toISOString();
    const userApp = await this.userAppRepo.install({
      id:            crypto.randomUUID(),
      userId,
      applicationId: app.id,
      installedAt:   now,
    });

    this.emitActivity(userId, "Installed App", `Đã cài đặt ${app.name}`, "PUBLIC");
    return userApp;
  }

  async uninstallApp(userId: string, slug: string): Promise<void> {
    if (!userId || userId.trim().length === 0) {
      throw new AppValidationError("userId không được rỗng");
    }

    const app = await this.appRepo.findBySlug(slug);
    if (!app) throw new AppHUB5NotFoundError(slug);

    const installed = await this.userAppRepo.isInstalled(userId, app.id);
    if (!installed) throw new AppNotInstalledError(slug);

    await this.userAppRepo.uninstall(userId, app.id);
  }

  async getMyApps(userId: string): Promise<Array<{ app: Application; userApp: UserApplication }>> {
    if (!userId || userId.trim().length === 0) {
      throw new AppValidationError("userId không được rỗng");
    }

    const userApps = await this.userAppRepo.findByUserId(userId);
    const results: Array<{ app: Application; userApp: UserApplication }> = [];

    for (const ua of userApps) {
      const app = await this.appRepo.findById(ua.applicationId);
      if (app) results.push({ app, userApp: ua });
    }

    return results;
  }

  // ── Open ─────────────────────────────────────────────────────────────────────

  async openApp(userId: string, slug: string): Promise<{ app: Application; launchUrl: string; lastOpenedAt: string }> {
    if (!userId || userId.trim().length === 0) {
      throw new AppValidationError("userId không được rỗng");
    }

    const app = await this.appRepo.findBySlug(slug);
    if (!app) throw new AppHUB5NotFoundError(slug);

    if (app.status === "DISABLED") throw new AppDisabledError(slug);

    const now = new Date().toISOString();
    await this.userAppRepo.updateLastOpened(userId, app.id, now);

    this.emitActivity(userId, "Opened App", `Đã mở ${app.name}`, "PRIVATE");

    return {
      app,
      launchUrl:    app.launchUrl,
      lastOpenedAt: now,
    };
  }

  // ── Activity Feed ─────────────────────────────────────────────────────────────

  private emitActivity(
    userId:      string,
    title:       string,
    description: string,
    visibility:  "PUBLIC" | "PRIVATE",
  ): void {
    this.activities.push({
      id:          crypto.randomUUID(),
      userId,
      type:        "SYSTEM",
      title,
      description,
      visibility,
      sourceApp:   "universe-hub",
      createdAt:   new Date().toISOString(),
    });
  }

  getActivities(userId?: string): AppHUB5Activity[] {
    if (userId) return this.activities.filter(a => a.userId === userId);
    return [...this.activities];
  }
}
