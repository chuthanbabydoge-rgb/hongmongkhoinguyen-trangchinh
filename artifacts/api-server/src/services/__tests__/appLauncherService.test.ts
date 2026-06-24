// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: AppLauncherService (HUB-3)
//
// All tests use fully in-memory repositories — no Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { InMemoryAppLauncherRepository } from "../../repositories/appLauncherRepository.js";
import { InMemoryAppRegistryRepository } from "../../repositories/appRegistryRepository.js";
import { AppRegistryService }            from "../appRegistryService.js";
import {
  AppLauncherService,
  AppLauncherValidationError,
  AppNotAvailableError,
} from "../appLauncherService.js";
import { AppNotFoundError } from "../appRegistryService.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRegistry(): AppRegistryService {
  const repo = new InMemoryAppRegistryRepository();
  return new AppRegistryService(repo);
}

async function seedRegistry(registry: AppRegistryService): Promise<void> {
  await registry.initialize();
}

function makeSvc(registry?: AppRegistryService): { svc: AppLauncherService; repo: InMemoryAppLauncherRepository; registry: AppRegistryService } {
  const reg  = registry ?? makeRegistry();
  const repo = new InMemoryAppLauncherRepository();
  const svc  = new AppLauncherService(repo, reg);
  return { svc, repo, registry: reg };
}

async function seededSvc(): Promise<{ svc: AppLauncherService; repo: InMemoryAppLauncherRepository; registry: AppRegistryService }> {
  const { svc, repo, registry } = makeSvc();
  await seedRegistry(registry);
  return { svc, repo, registry };
}

// ─── 1. Launch success ────────────────────────────────────────────────────────

describe("AppLauncherService — launch success", () => {
  test("returns app summary", async () => {
    const { svc } = await seededSvc();
    const result  = await svc.launchApp("user-1", "football-universe");
    assert.equal(result.app.slug, "football-universe");
    assert.equal(result.app.name, "Football Universe");
  });

  test("returns a non-empty accessToken", async () => {
    const { svc } = await seededSvc();
    const result  = await svc.launchApp("user-1", "football-universe");
    assert.ok(result.accessToken.length > 0);
  });

  test("returns a launchUrl containing the token", async () => {
    const { svc } = await seededSvc();
    const result  = await svc.launchApp("user-1", "football-universe");
    assert.ok(result.launchUrl.includes(result.accessToken));
  });

  test("football-universe gets football.universe domain", async () => {
    const { svc } = await seededSvc();
    const result  = await svc.launchApp("user-1", "football-universe");
    assert.ok(result.launchUrl.startsWith("https://football.universe/app?token="));
  });

  test("world-creator gets world.universe domain", async () => {
    const { svc } = await seededSvc();
    const result  = await svc.launchApp("user-1", "world-creator");
    assert.ok(result.launchUrl.startsWith("https://world.universe/app?token="));
  });

  test("safepass gets safepass.universe domain", async () => {
    const { svc } = await seededSvc();
    const result  = await svc.launchApp("user-1", "safepass");
    assert.ok(result.launchUrl.startsWith("https://safepass.universe/app?token="));
  });

  test("exchange-hub gets exchange.universe domain", async () => {
    const { svc } = await seededSvc();
    const result  = await svc.launchApp("user-1", "exchange-hub");
    assert.ok(result.launchUrl.startsWith("https://exchange.universe/app?token="));
  });

  test("expiresAt is in the future", async () => {
    const { svc } = await seededSvc();
    const result  = await svc.launchApp("user-1", "football-universe");
    assert.ok(new Date(result.expiresAt) > new Date());
  });

  test("expiresAt is approximately 1 hour away", async () => {
    const { svc }  = await seededSvc();
    const before   = Date.now();
    const result   = await svc.launchApp("user-1", "football-universe");
    const expiresMs = new Date(result.expiresAt).getTime();
    assert.ok(expiresMs - before >= 3_500_000 && expiresMs - before <= 3_700_000);
  });

  test("each launch generates a unique accessToken", async () => {
    const { svc } = await seededSvc();
    const r1 = await svc.launchApp("user-1", "football-universe");
    const r2 = await svc.launchApp("user-1", "football-universe");
    assert.notEqual(r1.accessToken, r2.accessToken);
  });
});

// ─── 2. Launch unknown app ────────────────────────────────────────────────────

describe("AppLauncherService — launch unknown app", () => {
  test("throws AppNotFoundError for unknown slug", async () => {
    const { svc } = await seededSvc();
    await assert.rejects(
      () => svc.launchApp("user-1", "does-not-exist"),
      AppNotFoundError,
    );
  });

  test("throws AppLauncherValidationError for empty slug", async () => {
    const { svc } = await seededSvc();
    await assert.rejects(
      () => svc.launchApp("user-1", ""),
      AppLauncherValidationError,
    );
  });

  test("throws AppLauncherValidationError for empty userId", async () => {
    const { svc } = await seededSvc();
    await assert.rejects(
      () => svc.launchApp("", "football-universe"),
      AppLauncherValidationError,
    );
  });
});

// ─── 3. Inactive / maintenance app ───────────────────────────────────────────

describe("AppLauncherService — unavailable app", () => {
  test("throws AppNotAvailableError for INACTIVE app", async () => {
    const { svc, registry } = await seededSvc();
    const app = await registry.getBySlug("football-universe");
    await registry.updateApp(app.id, { status: "INACTIVE" });
    await assert.rejects(
      () => svc.launchApp("user-1", "football-universe"),
      AppNotAvailableError,
    );
  });

  test("throws AppNotAvailableError for MAINTENANCE app", async () => {
    const { svc, registry } = await seededSvc();
    const app = await registry.getBySlug("football-universe");
    await registry.updateApp(app.id, { status: "MAINTENANCE" });
    await assert.rejects(
      () => svc.launchApp("user-1", "football-universe"),
      AppNotAvailableError,
    );
  });
});

// ─── 4. Launch records history ────────────────────────────────────────────────

describe("AppLauncherService — records history", () => {
  test("records a launch entry", async () => {
    const { svc, repo } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    const records = await repo.getRecentLaunches("user-1");
    assert.equal(records.length, 1);
    assert.equal(records[0]!.appSlug, "football-universe");
  });

  test("records userId correctly", async () => {
    const { svc, repo } = await seededSvc();
    await svc.launchApp("user-42", "world-creator");
    const records = await repo.getRecentLaunches("user-42");
    assert.equal(records[0]!.userId, "user-42");
  });

  test("records launchSource", async () => {
    const { svc, repo } = await seededSvc();
    await svc.launchApp("user-1", "football-universe", "sidebar");
    const records = await repo.getRecentLaunches("user-1");
    assert.equal(records[0]!.launchSource, "sidebar");
  });

  test("records default launchSource 'hub'", async () => {
    const { svc, repo } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    const records = await repo.getRecentLaunches("user-1");
    assert.equal(records[0]!.launchSource, "hub");
  });

  test("records sessionId when provided", async () => {
    const { svc, repo } = await seededSvc();
    await svc.launchApp("user-1", "football-universe", "hub", "session-abc");
    const records = await repo.getRecentLaunches("user-1");
    assert.equal(records[0]!.sessionId, "session-abc");
  });

  test("launchedAt is close to now", async () => {
    const { svc, repo } = await seededSvc();
    const before = Date.now();
    await svc.launchApp("user-1", "football-universe");
    const records = await repo.getRecentLaunches("user-1");
    const launchedMs = new Date(records[0]!.launchedAt).getTime();
    assert.ok(launchedMs >= before && launchedMs <= Date.now());
  });

  test("multiple launches are all recorded", async () => {
    const { svc, repo } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "world-creator");
    await svc.launchApp("user-1", "safepass");
    const records = await repo.getRecentLaunches("user-1", 10);
    assert.equal(records.length, 3);
  });
});

// ─── 5. First-time notification ───────────────────────────────────────────────

describe("AppLauncherService — first-time notification", () => {
  test("emits welcome notification on first launch", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    const notifs = svc.getNotifications("user-1");
    assert.equal(notifs.length, 1);
    assert.ok(notifs[0]!.title.includes("Football Universe"));
  });

  test("does NOT emit notification on second launch of same app", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");
    const notifs = svc.getNotifications("user-1");
    assert.equal(notifs.length, 1);
  });

  test("emits notification when launching a different new app", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "world-creator");
    const notifs = svc.getNotifications("user-1");
    assert.equal(notifs.length, 2);
  });

  test("notification priority is NORMAL", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    const notifs = svc.getNotifications("user-1");
    assert.equal(notifs[0]!.priority, "NORMAL");
  });

  test("notification source is universe-hub", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    const notifs = svc.getNotifications("user-1");
    assert.equal(notifs[0]!.source, "universe-hub");
  });
});

// ─── 6. Activity integration ──────────────────────────────────────────────────

describe("AppLauncherService — activity integration", () => {
  test("emits an activity per launch", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    const acts = svc.getActivities();
    assert.equal(acts.length, 1);
  });

  test("activity type is SYSTEM", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    assert.equal(svc.getActivities()[0]!.type, "SYSTEM");
  });

  test("activity title is 'App Launched'", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    assert.equal(svc.getActivities()[0]!.title, "App Launched");
  });

  test("activity description includes app name", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    assert.ok(svc.getActivities()[0]!.description.includes("Football Universe"));
  });

  test("activity visibility is PRIVATE", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    assert.equal(svc.getActivities()[0]!.visibility, "PRIVATE");
  });

  test("activity sourceApp is universe-hub", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    assert.equal(svc.getActivities()[0]!.sourceApp, "universe-hub");
  });

  test("emits an activity for every launch including repeats", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");
    assert.equal(svc.getActivities().length, 3);
  });
});

// ─── 7. Recent apps ───────────────────────────────────────────────────────────

describe("AppLauncherService — getMyRecentApps", () => {
  test("returns empty array for fresh user", async () => {
    const { svc } = await seededSvc();
    const result  = await svc.getMyRecentApps("user-new");
    assert.deepEqual(result, []);
  });

  test("returns launched apps", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    const result = await svc.getMyRecentApps("user-1");
    assert.equal(result.length, 1);
    assert.equal(result[0]!.appSlug, "football-universe");
  });

  test("de-duplicates multiple launches of same app", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");
    const result = await svc.getMyRecentApps("user-1");
    assert.equal(result.length, 1);
  });

  test("shows launchCount correctly", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");
    const result = await svc.getMyRecentApps("user-1");
    assert.equal(result[0]!.launchCount, 2);
  });

  test("isolates by userId", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-A", "football-universe");
    await svc.launchApp("user-B", "world-creator");
    const resultA = await svc.getMyRecentApps("user-A");
    const resultB = await svc.getMyRecentApps("user-B");
    assert.equal(resultA.length, 1);
    assert.equal(resultA[0]!.appSlug, "football-universe");
    assert.equal(resultB.length, 1);
    assert.equal(resultB[0]!.appSlug, "world-creator");
  });

  test("respects limit parameter", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "world-creator");
    await svc.launchApp("user-1", "safepass");
    const result = await svc.getMyRecentApps("user-1", 2);
    assert.equal(result.length, 2);
  });

  test("throws AppLauncherValidationError for empty userId", async () => {
    const { svc } = await seededSvc();
    await assert.rejects(
      () => svc.getMyRecentApps(""),
      AppLauncherValidationError,
    );
  });
});

// ─── 8. Most used (favorites) ─────────────────────────────────────────────────

describe("AppLauncherService — getMyMostUsedApps", () => {
  test("returns empty for fresh user", async () => {
    const { svc } = await seededSvc();
    const result  = await svc.getMyMostUsedApps("user-new");
    assert.deepEqual(result, []);
  });

  test("returns most used app first", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "world-creator");
    const result = await svc.getMyMostUsedApps("user-1");
    assert.equal(result[0]!.appSlug, "football-universe");
    assert.equal(result[0]!.launchCount, 2);
  });

  test("sorts by launch count descending", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "safepass");
    await svc.launchApp("user-1", "safepass");
    await svc.launchApp("user-1", "safepass");
    await svc.launchApp("user-1", "world-creator");
    await svc.launchApp("user-1", "world-creator");
    await svc.launchApp("user-1", "football-universe");
    const result = await svc.getMyMostUsedApps("user-1");
    assert.equal(result[0]!.appSlug, "safepass");
    assert.equal(result[1]!.appSlug, "world-creator");
  });

  test("respects limit", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "world-creator");
    await svc.launchApp("user-1", "safepass");
    const result = await svc.getMyMostUsedApps("user-1", 2);
    assert.equal(result.length, 2);
  });

  test("isolates by userId", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-A", "football-universe");
    await svc.launchApp("user-B", "safepass");
    const resultA = await svc.getMyMostUsedApps("user-A");
    assert.equal(resultA[0]!.appSlug, "football-universe");
    const resultB = await svc.getMyMostUsedApps("user-B");
    assert.equal(resultB[0]!.appSlug, "safepass");
  });
});

// ─── 9. Dashboard ─────────────────────────────────────────────────────────────

describe("AppLauncherService — getLauncherDashboard", () => {
  test("returns dashboard shape", async () => {
    const { svc } = await seededSvc();
    const dash    = await svc.getLauncherDashboard("user-1");
    assert.ok(Array.isArray(dash.recentApps));
    assert.ok(Array.isArray(dash.favoriteApps));
    assert.ok(typeof dash.installedApps === "number");
    assert.ok(typeof dash.totalLaunches === "number");
  });

  test("totalLaunches is 0 for fresh user", async () => {
    const { svc } = await seededSvc();
    const dash    = await svc.getLauncherDashboard("user-new");
    assert.equal(dash.totalLaunches, 0);
  });

  test("totalLaunches counts all launches including repeats", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "world-creator");
    const dash = await svc.getLauncherDashboard("user-1");
    assert.equal(dash.totalLaunches, 3);
  });

  test("installedApps reflects ACTIVE apps in registry", async () => {
    const { svc } = await seededSvc();
    const dash    = await svc.getLauncherDashboard("user-1");
    assert.ok(dash.installedApps >= 5);
  });

  test("recentApps shows launched apps", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    const dash = await svc.getLauncherDashboard("user-1");
    assert.equal(dash.recentApps.length, 1);
  });

  test("favoriteApps shows most used apps", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");
    const dash = await svc.getLauncherDashboard("user-1");
    assert.equal(dash.favoriteApps[0]!.appSlug, "football-universe");
  });

  test("dashboard isolates by userId", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-A", "football-universe");
    const dashA = await svc.getLauncherDashboard("user-A");
    const dashB = await svc.getLauncherDashboard("user-B");
    assert.equal(dashA.totalLaunches, 1);
    assert.equal(dashB.totalLaunches, 0);
  });

  test("throws AppLauncherValidationError for empty userId", async () => {
    const { svc } = await seededSvc();
    await assert.rejects(
      () => svc.getLauncherDashboard(""),
      AppLauncherValidationError,
    );
  });
});

// ─── 10. Clear history ────────────────────────────────────────────────────────

describe("AppLauncherService — clearLaunchHistory", () => {
  test("clears all history for user", async () => {
    const { svc, repo } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "world-creator");
    await svc.clearLaunchHistory("user-1");
    const records = await repo.getRecentLaunches("user-1");
    assert.equal(records.length, 0);
  });

  test("does not affect other users' history", async () => {
    const { svc, repo } = await seededSvc();
    await svc.launchApp("user-A", "football-universe");
    await svc.launchApp("user-B", "world-creator");
    await svc.clearLaunchHistory("user-A");
    const recordsB = await repo.getRecentLaunches("user-B");
    assert.equal(recordsB.length, 1);
  });

  test("totalLaunches is 0 after clear", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.clearLaunchHistory("user-1");
    const dash = await svc.getLauncherDashboard("user-1");
    assert.equal(dash.totalLaunches, 0);
  });

  test("throws AppLauncherValidationError for empty userId", async () => {
    const { svc } = await seededSvc();
    await assert.rejects(
      () => svc.clearLaunchHistory(""),
      AppLauncherValidationError,
    );
  });
});

// ─── 11. User isolation ───────────────────────────────────────────────────────

describe("AppLauncherService — user isolation", () => {
  test("launches for different users don't mix", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-2", "safepass");
    await svc.launchApp("user-3", "exchange-hub");

    const r1 = await svc.getMyRecentApps("user-1");
    const r2 = await svc.getMyRecentApps("user-2");
    const r3 = await svc.getMyRecentApps("user-3");

    assert.equal(r1.length, 1);
    assert.equal(r1[0]!.appSlug, "football-universe");
    assert.equal(r2[0]!.appSlug, "safepass");
    assert.equal(r3[0]!.appSlug, "exchange-hub");
  });

  test("notifications are isolated by user", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-A", "football-universe");
    await svc.launchApp("user-B", "world-creator");
    const notifsA = svc.getNotifications("user-A");
    const notifsB = svc.getNotifications("user-B");
    assert.equal(notifsA.length, 1);
    assert.equal(notifsB.length, 1);
    assert.ok(notifsA[0]!.title.includes("Football Universe"));
    assert.ok(notifsB[0]!.title.includes("World Creator"));
  });
});

// ─── 12. Repository persistence ───────────────────────────────────────────────

describe("InMemoryAppLauncherRepository — persistence", () => {
  test("persists records across calls", async () => {
    const repo = new InMemoryAppLauncherRepository();
    await repo.recordLaunch({ id: "1", userId: "u1", appSlug: "app1", launchedAt: new Date().toISOString(), launchSource: "hub" });
    await repo.recordLaunch({ id: "2", userId: "u1", appSlug: "app2", launchedAt: new Date().toISOString(), launchSource: "hub" });
    const records = await repo.getRecentLaunches("u1", 10);
    assert.equal(records.length, 2);
  });

  test("countLaunches returns correct count", async () => {
    const repo = new InMemoryAppLauncherRepository();
    await repo.recordLaunch({ id: "1", userId: "u1", appSlug: "app1", launchedAt: new Date().toISOString(), launchSource: "hub" });
    await repo.recordLaunch({ id: "2", userId: "u1", appSlug: "app1", launchedAt: new Date().toISOString(), launchSource: "hub" });
    assert.equal(await repo.countLaunches("u1"), 2);
  });

  test("hasLaunchedApp returns false before launch", async () => {
    const repo = new InMemoryAppLauncherRepository();
    assert.equal(await repo.hasLaunchedApp("u1", "app1"), false);
  });

  test("hasLaunchedApp returns true after launch", async () => {
    const repo = new InMemoryAppLauncherRepository();
    await repo.recordLaunch({ id: "1", userId: "u1", appSlug: "app1", launchedAt: new Date().toISOString(), launchSource: "hub" });
    assert.equal(await repo.hasLaunchedApp("u1", "app1"), true);
  });

  test("deleteLaunchHistory removes only that user", async () => {
    const repo = new InMemoryAppLauncherRepository();
    await repo.recordLaunch({ id: "1", userId: "u1", appSlug: "app1", launchedAt: new Date().toISOString(), launchSource: "hub" });
    await repo.recordLaunch({ id: "2", userId: "u2", appSlug: "app2", launchedAt: new Date().toISOString(), launchSource: "hub" });
    await repo.deleteLaunchHistory("u1");
    assert.equal(await repo.countLaunches("u1"), 0);
    assert.equal(await repo.countLaunches("u2"), 1);
  });
});

// ─── 13. Launch ordering ──────────────────────────────────────────────────────

describe("AppLauncherService — launch ordering", () => {
  test("recent apps are ordered most recent first", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await new Promise(r => setTimeout(r, 5));
    await svc.launchApp("user-1", "world-creator");
    await new Promise(r => setTimeout(r, 5));
    await svc.launchApp("user-1", "safepass");

    const records = await svc.getMyRecentApps("user-1");
    assert.equal(records[0]!.appSlug, "safepass");
  });

  test("getMostUsedApps returns highest count first", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "world-creator");
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");
    await svc.launchApp("user-1", "football-universe");

    const favs = await svc.getMyMostUsedApps("user-1");
    assert.equal(favs[0]!.appSlug, "football-universe");
    assert.equal(favs[0]!.launchCount, 3);
  });
});

// ─── 14. Duplicate launches ───────────────────────────────────────────────────

describe("AppLauncherService — duplicate launches", () => {
  test("can launch same app many times without error", async () => {
    const { svc } = await seededSvc();
    for (let i = 0; i < 10; i++) {
      const r = await svc.launchApp("user-1", "football-universe");
      assert.ok(r.accessToken.length > 0);
    }
  });

  test("each duplicate launch gets a fresh token", async () => {
    const { svc } = await seededSvc();
    const tokens = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const r = await svc.launchApp("user-1", "football-universe");
      tokens.add(r.accessToken);
    }
    assert.equal(tokens.size, 5);
  });
});

// ─── 15. Token forwarding in URL ─────────────────────────────────────────────

describe("AppLauncherService — token in URL", () => {
  test("accessToken appears exactly once in launchUrl", async () => {
    const { svc } = await seededSvc();
    const r       = await svc.launchApp("user-1", "football-universe");
    const count   = r.launchUrl.split(r.accessToken).length - 1;
    assert.equal(count, 1);
  });

  test("launchUrl contains 'token=' query param", async () => {
    const { svc } = await seededSvc();
    const r       = await svc.launchApp("user-1", "football-universe");
    assert.ok(r.launchUrl.includes("token="));
  });
});

// ─── 16. Registry integration ────────────────────────────────────────────────

describe("AppLauncherService — registry integration", () => {
  test("app name in response matches registry", async () => {
    const { svc, registry } = await seededSvc();
    const regApp = await registry.getBySlug("football-universe");
    const result = await svc.launchApp("user-1", "football-universe");
    assert.equal(result.app.name, regApp.name);
  });

  test("fallback to baseUrl when slug not in SLUG_TO_DOMAIN map", async () => {
    const { svc, registry } = await seededSvc();
    await registry.registerApp({
      slug:     "custom-app",
      name:     "Custom App",
      baseUrl:  "https://custom.example.com",
      category: "OTHER",
      version:  "1.0.0",
    });
    const r = await svc.launchApp("user-1", "custom-app");
    assert.ok(r.launchUrl.startsWith("https://custom.example.com/app?token="));
  });
});

// ─── 17. Multi-user scenario ──────────────────────────────────────────────────

describe("AppLauncherService — multi-user", () => {
  test("50 launches across 5 users all recorded correctly", async () => {
    const { svc, repo } = await seededSvc();
    const slugs = ["football-universe", "world-creator", "safepass", "exchange-hub", "animal-evolution"];
    for (let i = 0; i < 50; i++) {
      const userId = `user-${i % 5}`;
      const slug   = slugs[i % slugs.length]!;
      await svc.launchApp(userId, slug);
    }
    for (let i = 0; i < 5; i++) {
      const count = await repo.countLaunches(`user-${i}`);
      assert.equal(count, 10);
    }
  });
});

// ─── 18. Large launch history ─────────────────────────────────────────────────

describe("AppLauncherService — large launch history", () => {
  test("handles 100 launches without error", async () => {
    const { svc } = await seededSvc();
    for (let i = 0; i < 100; i++) {
      await svc.launchApp("user-1", "football-universe");
    }
    const dash = await svc.getLauncherDashboard("user-1");
    assert.equal(dash.totalLaunches, 100);
  });

  test("getMyRecentApps limit still applies with large history", async () => {
    const { svc } = await seededSvc();
    const slugs = ["football-universe", "world-creator", "safepass", "exchange-hub", "animal-evolution"];
    for (let i = 0; i < 50; i++) {
      await svc.launchApp("user-1", slugs[i % slugs.length]!);
    }
    const result = await svc.getMyRecentApps("user-1", 3);
    assert.ok(result.length <= 3);
  });
});

// ─── 19. SSO integration ──────────────────────────────────────────────────────

describe("AppLauncherService — SSO token generation", () => {
  test("accessToken is a non-empty string", async () => {
    const { svc } = await seededSvc();
    const r = await svc.launchApp("user-1", "football-universe");
    assert.ok(typeof r.accessToken === "string");
    assert.ok(r.accessToken.length > 0);
  });

  test("accessToken does not contain hyphens (UUID stripped)", async () => {
    const { svc } = await seededSvc();
    const r = await svc.launchApp("user-1", "football-universe");
    assert.ok(!r.accessToken.includes("-"));
  });

  test("expiresAt is a valid ISO date string", async () => {
    const { svc } = await seededSvc();
    const r  = await svc.launchApp("user-1", "football-universe");
    const dt = new Date(r.expiresAt);
    assert.ok(!Number.isNaN(dt.getTime()));
  });
});

// ─── 20. Edge cases ───────────────────────────────────────────────────────────

describe("AppLauncherService — edge cases", () => {
  test("whitespace-only userId is rejected", async () => {
    const { svc } = await seededSvc();
    await assert.rejects(
      () => svc.launchApp("   ", "football-universe"),
      AppLauncherValidationError,
    );
  });

  test("whitespace-only appSlug is rejected", async () => {
    const { svc } = await seededSvc();
    await assert.rejects(
      () => svc.launchApp("user-1", "   "),
      AppLauncherValidationError,
    );
  });

  test("getMyRecentApps returns empty after clearLaunchHistory", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.clearLaunchHistory("user-1");
    const result = await svc.getMyRecentApps("user-1");
    assert.deepEqual(result, []);
  });

  test("getMostUsedApps returns empty after clearLaunchHistory", async () => {
    const { svc } = await seededSvc();
    await svc.launchApp("user-1", "football-universe");
    await svc.clearLaunchHistory("user-1");
    const result = await svc.getMyMostUsedApps("user-1");
    assert.deepEqual(result, []);
  });

  test("launch returns iconUrl from registry", async () => {
    const { svc } = await seededSvc();
    const r       = await svc.launchApp("user-1", "football-universe");
    assert.ok(r.app.iconUrl !== undefined && r.app.iconUrl.length > 0);
  });

  test("clearing history for unknown user does not throw", async () => {
    const { svc } = await seededSvc();
    await assert.doesNotReject(() => svc.clearLaunchHistory("never-existed-user"));
  });
});
