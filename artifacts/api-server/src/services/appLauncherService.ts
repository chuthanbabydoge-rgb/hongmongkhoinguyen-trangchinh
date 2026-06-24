// ─────────────────────────────────────────────────────────────────────────────
// AppLauncherService — HUB-3
//
// Manages app launching, launch history, and the launcher dashboard.
//
// Architecture:
//   Controller → AppLauncherService → IAppLauncherRepository
//                                   → AppRegistryService (HUB-2)
//
// SSO: generates a short-lived opaque token (UUID-based, 1-hour expiry).
//      In production this would delegate to Universe Account Sprint-8 SSO.
//
// Activity integration: emits PRIVATE SYSTEM activities per launch.
// Notification integration: sends a welcome notification on first launch.
// ─────────────────────────────────────────────────────────────────────────────

import type { IAppLauncherRepository } from "../repositories/appLauncherRepository.js";
import type { AppRegistryService }     from "./appRegistryService.js";
import type {
  LaunchRecord,
  AppLaunchResponse,
  RecentApp,
  LauncherDashboard,
  LauncherActivity,
  LauncherNotification,
} from "../models/appLauncher.js";
import type { EcosystemApp } from "../models/appRegistry.js";
import { AppNotFoundError }  from "./appRegistryService.js";

// ─── Errors ───────────────────────────────────────────────────────────────────

export class AppLauncherValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppLauncherValidationError";
  }
}

export class AppNotAvailableError extends Error {
  constructor(slug: string, status: string) {
    super(`App "${slug}" is not available (status: ${status})`);
    this.name = "AppNotAvailableError";
  }
}

// ─── Launch URL mapping ───────────────────────────────────────────────────────

const SLUG_TO_DOMAIN: Record<string, string> = {
  "football-universe": "https://football.universe",
  "world-creator":     "https://world.universe",
  "safepass":          "https://safepass.universe",
  "exchange-hub":      "https://exchange.universe",
};

function buildLaunchUrl(app: EcosystemApp, token: string): string {
  const base = SLUG_TO_DOMAIN[app.slug] ?? app.url;
  return `${base}/app?token=${token}`;
}

// ─── SSO token generation ─────────────────────────────────────────────────────

function generateSsoToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function tokenExpiresAt(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d.toISOString();
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AppLauncherService {
  private readonly activities:    LauncherActivity[]    = [];
  private readonly notifications: LauncherNotification[] = [];

  constructor(
    private readonly repo:    IAppLauncherRepository,
    private readonly registry: AppRegistryService,
  ) {}

  // ── Launch ───────────────────────────────────────────────────────────────────

  async launchApp(
    userId:        string,
    appSlug:       string,
    launchSource = "hub",
    sessionId?:    string,
  ): Promise<AppLaunchResponse> {
    if (!userId || userId.trim().length === 0) {
      throw new AppLauncherValidationError("userId is required");
    }
    if (!appSlug || appSlug.trim().length === 0) {
      throw new AppLauncherValidationError("appSlug is required");
    }

    let app: EcosystemApp;
    try {
      app = await this.registry.getBySlug(appSlug);
    } catch (err) {
      if (err instanceof AppNotFoundError) {
        throw new AppNotFoundError(appSlug);
      }
      throw err;
    }

    if (app.status !== "ACTIVE") {
      throw new AppNotAvailableError(appSlug, app.status);
    }

    const isFirstLaunch = !(await this.repo.hasLaunchedApp(userId, appSlug));

    const accessToken = generateSsoToken();
    const expiresAt   = tokenExpiresAt();
    const launchedAt  = new Date().toISOString();

    const record: LaunchRecord = {
      id:           crypto.randomUUID(),
      userId,
      appSlug,
      launchedAt,
      launchSource,
      sessionId,
      metadata:     { appName: app.name, appVersion: app.version },
    };

    await this.repo.recordLaunch(record);

    this.emitActivity(userId, app);

    if (isFirstLaunch) {
      this.emitFirstLaunchNotification(userId, app);
    }

    return {
      app: {
        slug:    app.slug,
        name:    app.name,
        iconUrl: app.icon,
      },
      launchUrl:   buildLaunchUrl(app, accessToken),
      accessToken,
      expiresAt,
    };
  }

  // ── Recent apps ──────────────────────────────────────────────────────────────

  async getMyRecentApps(userId: string, limit = 10): Promise<RecentApp[]> {
    if (!userId) throw new AppLauncherValidationError("userId is required");

    const records = await this.repo.getRecentLaunches(userId, limit * 3);
    const seen    = new Map<string, LaunchRecord>();

    for (const r of records) {
      if (!seen.has(r.appSlug)) seen.set(r.appSlug, r);
    }

    const mostUsed = await this.repo.getMostUsedApps(userId, limit * 3);
    const countMap = new Map(mostUsed.map(m => [m.appSlug, m.count]));

    const result: RecentApp[] = [];
    for (const [slug, record] of seen) {
      let appName = slug;
      try {
        const app = await this.registry.getBySlug(slug);
        appName   = app.name;
      } catch { /* app may have been removed */ }

      result.push({
        appSlug:     slug,
        appName,
        launchedAt:  record.launchedAt,
        launchCount: countMap.get(slug) ?? 1,
      });
    }

    return result.slice(0, limit);
  }

  // ── Most used apps ───────────────────────────────────────────────────────────

  async getMyMostUsedApps(userId: string, limit = 5): Promise<RecentApp[]> {
    if (!userId) throw new AppLauncherValidationError("userId is required");

    const mostUsed = await this.repo.getMostUsedApps(userId, limit);

    const result: RecentApp[] = [];
    for (const { appSlug, count } of mostUsed) {
      const recentLaunches = await this.repo.getRecentLaunches(userId, 100);
      const lastRecord     = recentLaunches.find(r => r.appSlug === appSlug);
      const launchedAt     = lastRecord?.launchedAt ?? new Date().toISOString();

      let appName = appSlug;
      try {
        const app = await this.registry.getBySlug(appSlug);
        appName   = app.name;
      } catch { /* app may have been removed */ }

      result.push({ appSlug, appName, launchedAt, launchCount: count });
    }

    return result;
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────

  async getLauncherDashboard(userId: string): Promise<LauncherDashboard> {
    if (!userId) throw new AppLauncherValidationError("userId is required");

    const [recentApps, favoriteApps, totalLaunches, allApps] = await Promise.all([
      this.getMyRecentApps(userId, 5),
      this.getMyMostUsedApps(userId, 5),
      this.repo.countLaunches(userId),
      this.registry.getAllApps(),
    ]);

    return {
      recentApps,
      favoriteApps,
      installedApps: allApps.filter(a => a.status === "ACTIVE").length,
      totalLaunches,
    };
  }

  // ── Clear history ─────────────────────────────────────────────────────────────

  async clearLaunchHistory(userId: string): Promise<void> {
    if (!userId) throw new AppLauncherValidationError("userId is required");
    await this.repo.deleteLaunchHistory(userId);
  }

  // ── Activity feed ─────────────────────────────────────────────────────────────

  private emitActivity(userId: string, app: EcosystemApp): void {
    this.activities.push({
      id:          crypto.randomUUID(),
      type:        "SYSTEM",
      title:       "App Launched",
      description: `Opened ${app.name}`,
      visibility:  "PRIVATE",
      sourceApp:   "universe-hub",
      createdAt:   new Date().toISOString(),
    });
  }

  getActivities(userId?: string): LauncherActivity[] {
    void userId;
    return [...this.activities];
  }

  // ── Notification feed ─────────────────────────────────────────────────────────

  private emitFirstLaunchNotification(userId: string, app: EcosystemApp): void {
    this.notifications.push({
      id:        crypto.randomUUID(),
      userId,
      title:     `Welcome to ${app.name}`,
      message:   `You've launched ${app.name} for the first time. Enjoy!`,
      priority:  "NORMAL",
      source:    "universe-hub",
      createdAt: new Date().toISOString(),
    });
  }

  getNotifications(userId: string): LauncherNotification[] {
    return this.notifications.filter(n => n.userId === userId);
  }
}
