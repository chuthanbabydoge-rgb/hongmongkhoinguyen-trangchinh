// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: NotificationSyncService (HUB-4)
//
// All tests use fully in-memory repositories and mock account clients.
// No Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { InMemoryNotificationSyncRepository } from "../../repositories/notificationSyncRepository.js";
import {
  NotificationSyncService,
  NotificationSyncValidationError,
} from "../notificationSyncService.js";
import { AccountServiceUnavailableError } from "../accountClient.js";
import type { IAccountClient }   from "../accountClient.js";
import type { NotificationDTO, ActivityDTO } from "../../models/accountBridge.js";

// ─── Mock Account Client ──────────────────────────────────────────────────────

class MockAccountClient implements IAccountClient {
  notifications: NotificationDTO[] = [];
  activities:    ActivityDTO[]     = [];
  markedReadIds: string[]          = [];
  markedAllReadCount               = 0;
  shouldFail                       = false;
  failOnMark                       = false;

  async getNotifications(): Promise<NotificationDTO[]> {
    if (this.shouldFail) throw new AccountServiceUnavailableError("mock failure");
    return [...this.notifications];
  }
  async getActivities(): Promise<ActivityDTO[]> {
    if (this.shouldFail) throw new AccountServiceUnavailableError("mock failure");
    return [...this.activities];
  }
  async getUnreadNotificationCount(): Promise<number> {
    return this.notifications.filter(n => !n.isRead).length;
  }
  async markNotificationRead(id: string): Promise<void> {
    if (this.failOnMark) throw new AccountServiceUnavailableError("mark failed");
    this.markedReadIds.push(id);
    const n = this.notifications.find(x => x.id === id);
    if (n) n.isRead = true;
  }
  async markAllNotificationsRead(): Promise<number> {
    if (this.failOnMark) throw new AccountServiceUnavailableError("mark-all failed");
    const count = this.notifications.filter(n => !n.isRead).length;
    this.notifications.forEach(n => { n.isRead = true; });
    this.markedAllReadCount = count;
    return count;
  }
  async getIdentity()        { throw new Error("not implemented"); }
  async getProfile()         { throw new Error("not implemented"); }
  async getAvatar()          { throw new Error("not implemented"); }
  async getAchievements()    { return []; }
  async getAchievementCount(){ return 0; }
  async getReputation()      { throw new Error("not implemented"); }
  async getSettings()        { throw new Error("not implemented"); }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNotif(id: string, opts: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id,
    type:      opts.type      ?? "general",
    message:   opts.message   ?? `Notification ${id}`,
    isRead:    opts.isRead    ?? false,
    createdAt: opts.createdAt ?? new Date().toISOString(),
  };
}

function makeActivity(id: string): ActivityDTO {
  return { id, type: "ACTION", description: `Activity ${id}`, createdAt: new Date().toISOString() };
}

function makeSvc(notifs: NotificationDTO[] = [], activities: ActivityDTO[] = []) {
  const client = new MockAccountClient();
  client.notifications = notifs;
  client.activities    = activities;
  const repo = new InMemoryNotificationSyncRepository();
  const svc  = new NotificationSyncService(repo, client);
  return { svc, client, repo };
}

// ─── 1. syncNotifications — success ──────────────────────────────────────────

describe("NotificationSyncService — sync success", () => {
  test("synced count matches total notifications", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2"), makeNotif("n3")]);
    const result  = await svc.syncNotifications("user-1");
    assert.equal(result.synced, 3);
  });

  test("unread count is correct", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2", { isRead: true }), makeNotif("n3")]);
    const result  = await svc.syncNotifications("user-1");
    assert.equal(result.unread, 2);
  });

  test("lastSyncAt is a recent ISO string", async () => {
    const { svc } = makeSvc();
    const before  = Date.now();
    const result  = await svc.syncNotifications("user-1");
    assert.ok(new Date(result.lastSyncAt).getTime() >= before);
  });

  test("creates sync state on first sync", async () => {
    const { svc, repo } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    const state = await repo.findByUserId("user-1");
    assert.ok(state !== null);
  });

  test("sync state has correct userId", async () => {
    const { svc, repo } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    const state = await repo.findByUserId("user-1");
    assert.equal(state!.userId, "user-1");
  });

  test("sync state unreadCount matches result", async () => {
    const { svc, repo } = makeSvc([makeNotif("n1"), makeNotif("n2", { isRead: true })]);
    const result = await svc.syncNotifications("user-1");
    const state  = await repo.findByUserId("user-1");
    assert.equal(state!.unreadCount, result.unread);
  });

  test("updates sync state on second sync", async () => {
    const { svc, repo, client } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    client.notifications = [makeNotif("n1"), makeNotif("n2")];
    const result2 = await svc.syncNotifications("user-1");
    const state   = await repo.findByUserId("user-1");
    assert.equal(result2.synced, 2);
    assert.ok(state!.lastSyncAt !== null);
  });

  test("synced 0 for empty notifications", async () => {
    const { svc } = makeSvc([]);
    const result  = await svc.syncNotifications("user-1");
    assert.equal(result.synced, 0);
    assert.equal(result.unread, 0);
  });

  test("all-read notifications gives unread 0", async () => {
    const { svc } = makeSvc([
      makeNotif("n1", { isRead: true }),
      makeNotif("n2", { isRead: true }),
    ]);
    const result = await svc.syncNotifications("user-1");
    assert.equal(result.unread, 0);
  });

  test("all-unread notifications gives correct unread", async () => {
    const notifs = Array.from({ length: 5 }, (_, i) => makeNotif(`n${i}`));
    const { svc } = makeSvc(notifs);
    const result  = await svc.syncNotifications("user-1");
    assert.equal(result.unread, 5);
  });
});

// ─── 2. Large notifications ───────────────────────────────────────────────────

describe("NotificationSyncService — large notifications", () => {
  test("handles 100 notifications", async () => {
    const notifs = Array.from({ length: 100 }, (_, i) => makeNotif(`n${i}`));
    const { svc } = makeSvc(notifs);
    const result  = await svc.syncNotifications("user-1");
    assert.equal(result.synced, 100);
  });

  test("handles 500 notifications", async () => {
    const notifs = Array.from({ length: 500 }, (_, i) => makeNotif(`n${i}`));
    const { svc } = makeSvc(notifs);
    const result  = await svc.syncNotifications("user-1");
    assert.equal(result.synced, 500);
  });

  test("large all-unread gives correct count", async () => {
    const notifs = Array.from({ length: 200 }, (_, i) => makeNotif(`n${i}`, { isRead: false }));
    const { svc } = makeSvc(notifs);
    const result  = await svc.syncNotifications("user-1");
    assert.equal(result.unread, 200);
  });

  test("large all-read gives 0 unread", async () => {
    const notifs = Array.from({ length: 200 }, (_, i) => makeNotif(`n${i}`, { isRead: true }));
    const { svc } = makeSvc(notifs);
    const result  = await svc.syncNotifications("user-1");
    assert.equal(result.unread, 0);
  });

  test("large mixed priorities are all stored in cache", async () => {
    const notifs = [
      ...Array.from({ length: 50 }, (_, i) => makeNotif(`n${i}`,       { type: "urgent_alert" })),
      ...Array.from({ length: 50 }, (_, i) => makeNotif(`h${i}`,       { type: "high_priority" })),
      ...Array.from({ length: 100 }, (_, i) => makeNotif(`g${i}`,      { type: "general" })),
    ];
    const { svc } = makeSvc(notifs);
    await svc.syncNotifications("user-1");
    const feed = await svc.getNotifications("user-1", 1000);
    assert.equal(feed.total, 200);
  });
});

// ─── 3. Priority counting ─────────────────────────────────────────────────────

describe("NotificationSyncService — priority counts", () => {
  test("URGENT derived from 'urgent' in type", async () => {
    const { svc } = makeSvc([makeNotif("n1", { type: "urgent_message" })]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.urgentCount, 1);
  });

  test("URGENT derived from 'critical' in type", async () => {
    const { svc } = makeSvc([makeNotif("n1", { type: "critical_failure" })]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.urgentCount, 1);
  });

  test("HIGH derived from 'high' in type", async () => {
    const { svc } = makeSvc([makeNotif("n1", { type: "high_importance" })]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.highPriorityCount, 1);
  });

  test("HIGH derived from 'payment' in type", async () => {
    const { svc } = makeSvc([makeNotif("n1", { type: "payment_failed" })]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.highPriorityCount, 1);
  });

  test("NORMAL for unrecognised type", async () => {
    const { svc } = makeSvc([makeNotif("n1", { type: "general_update" })]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.urgentCount, 0);
    assert.equal(dash.highPriorityCount, 0);
  });

  test("mixed priorities counted independently", async () => {
    const { svc } = makeSvc([
      makeNotif("n1", { type: "urgent_alert" }),
      makeNotif("n2", { type: "high_priority" }),
      makeNotif("n3", { type: "general" }),
      makeNotif("n4", { type: "critical_error" }),
    ]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.urgentCount, 2);
    assert.equal(dash.highPriorityCount, 1);
  });

  test("all urgent gives 0 high", async () => {
    const { svc } = makeSvc([
      makeNotif("n1", { type: "urgent" }),
      makeNotif("n2", { type: "alert" }),
    ]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.urgentCount, 2);
    assert.equal(dash.highPriorityCount, 0);
  });

  test("empty list gives all zeros", async () => {
    const { svc } = makeSvc([]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.urgentCount, 0);
    assert.equal(dash.highPriorityCount, 0);
    assert.equal(dash.unreadCount, 0);
  });
});

// ─── 4. getNotificationCenter ─────────────────────────────────────────────────

describe("NotificationSyncService — getNotificationCenter", () => {
  test("returns all required fields", async () => {
    const { svc } = makeSvc([makeNotif("n1")], [makeActivity("a1")]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.ok("unreadCount"         in dash);
    assert.ok("highPriorityCount"   in dash);
    assert.ok("urgentCount"         in dash);
    assert.ok("latestNotifications" in dash);
    assert.ok("latestActivities"    in dash);
  });

  test("latestNotifications capped at 10", async () => {
    const notifs = Array.from({ length: 20 }, (_, i) => makeNotif(`n${i}`));
    const { svc } = makeSvc(notifs);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.ok(dash.latestNotifications.length <= 10);
  });

  test("latestActivities capped at 5", async () => {
    const acts = Array.from({ length: 10 }, (_, i) => makeActivity(`a${i}`));
    const { svc } = makeSvc([], acts);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.ok(dash.latestActivities.length <= 5);
  });

  test("empty state returns zeros before sync", async () => {
    const { svc } = makeSvc([makeNotif("n1")]);
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.unreadCount, 0);
    assert.deepEqual(dash.latestNotifications, []);
  });

  test("after sync, center reflects synced data", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.unreadCount, 2);
    assert.equal(dash.latestNotifications.length, 2);
  });

  test("unreadCount matches number of unread notifications", async () => {
    const { svc } = makeSvc([
      makeNotif("n1", { isRead: false }),
      makeNotif("n2", { isRead: true }),
      makeNotif("n3", { isRead: false }),
    ]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.unreadCount, 2);
  });

  test("throws for empty userId", async () => {
    const { svc } = makeSvc();
    await assert.rejects(
      () => svc.getNotificationCenter(""),
      NotificationSyncValidationError,
    );
  });

  test("dashboard is isolated by user", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-A");
    const dashA = await svc.getNotificationCenter("user-A");
    const dashB = await svc.getNotificationCenter("user-B");
    assert.equal(dashA.unreadCount, 2);
    assert.equal(dashB.unreadCount, 0);
  });

  test("activities fallback to empty on account error", async () => {
    const { svc, client } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    client.shouldFail = true;
    const dash = await svc.getNotificationCenter("user-1");
    assert.deepEqual(dash.latestActivities, []);
  });

  test("latestNotifications has HubNotification shape", async () => {
    const { svc } = makeSvc([makeNotif("n1", { type: "urgent_alert" })]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    const n = dash.latestNotifications[0]!;
    assert.ok("priority" in n);
    assert.ok("source"   in n);
    assert.equal(n.priority, "URGENT");
  });
});

// ─── 5. markRead ──────────────────────────────────────────────────────────────

describe("NotificationSyncService — markRead", () => {
  test("delegates to account client", async () => {
    const { svc, client } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    await svc.markRead("user-1", "n1");
    assert.ok(client.markedReadIds.includes("n1"));
  });

  test("updates notification in cache to isRead: true", async () => {
    const { svc } = makeSvc([makeNotif("n1", { isRead: false })]);
    await svc.syncNotifications("user-1");
    await svc.markRead("user-1", "n1");
    const feed = await svc.getNotifications("user-1");
    assert.equal(feed.notifications.find(n => n.id === "n1")?.isRead, true);
  });

  test("decrements unreadCount in sync state", async () => {
    const { svc, repo } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-1");
    await svc.markRead("user-1", "n1");
    const state = await repo.findByUserId("user-1");
    assert.equal(state!.unreadCount, 1);
  });

  test("only marks specified notification", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-1");
    await svc.markRead("user-1", "n1");
    const feed = await svc.getNotifications("user-1");
    assert.equal(feed.notifications.find(n => n.id === "n2")?.isRead, false);
  });

  test("marking already-read does not go below 0 unread", async () => {
    const { svc, repo } = makeSvc([makeNotif("n1", { isRead: true })]);
    await svc.syncNotifications("user-1");
    await svc.markRead("user-1", "n1");
    const state = await repo.findByUserId("user-1");
    assert.ok(state!.unreadCount >= 0);
  });

  test("throws for empty userId", async () => {
    const { svc } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    await assert.rejects(
      () => svc.markRead("", "n1"),
      NotificationSyncValidationError,
    );
  });

  test("throws for empty notificationId", async () => {
    const { svc } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    await assert.rejects(
      () => svc.markRead("user-1", ""),
      NotificationSyncValidationError,
    );
  });

  test("propagates account client error", async () => {
    const { svc, client } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    client.failOnMark = true;
    await assert.rejects(
      () => svc.markRead("user-1", "n1"),
      AccountServiceUnavailableError,
    );
  });
});

// ─── 6. markAllRead ───────────────────────────────────────────────────────────

describe("NotificationSyncService — markAllRead", () => {
  test("delegates to account client", async () => {
    const { svc, client } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-1");
    await svc.markAllRead("user-1");
    assert.equal(client.markedAllReadCount, 2);
  });

  test("sets all notifications in cache to isRead: true", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2"), makeNotif("n3")]);
    await svc.syncNotifications("user-1");
    await svc.markAllRead("user-1");
    const feed = await svc.getNotifications("user-1");
    assert.ok(feed.notifications.every(n => n.isRead === true));
  });

  test("sync state unreadCount becomes 0", async () => {
    const { svc, repo } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-1");
    await svc.markAllRead("user-1");
    const state = await repo.findByUserId("user-1");
    assert.equal(state!.unreadCount, 0);
  });

  test("returns count of previously unread notifications", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2", { isRead: true }), makeNotif("n3")]);
    await svc.syncNotifications("user-1");
    const count = await svc.markAllRead("user-1");
    assert.equal(count, 2);
  });

  test("returns 0 when all already read", async () => {
    const { svc } = makeSvc([makeNotif("n1", { isRead: true }), makeNotif("n2", { isRead: true })]);
    await svc.syncNotifications("user-1");
    const count = await svc.markAllRead("user-1");
    assert.equal(count, 0);
  });

  test("dashboard unreadCount is 0 after markAllRead", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-1");
    await svc.markAllRead("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.unreadCount, 0);
  });

  test("throws for empty userId", async () => {
    const { svc } = makeSvc();
    await assert.rejects(
      () => svc.markAllRead(""),
      NotificationSyncValidationError,
    );
  });

  test("propagates account client error", async () => {
    const { svc, client } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    client.failOnMark = true;
    await assert.rejects(
      () => svc.markAllRead("user-1"),
      AccountServiceUnavailableError,
    );
  });
});

// ─── 7. getSyncState ──────────────────────────────────────────────────────────

describe("NotificationSyncService — getSyncState", () => {
  test("returns null before first sync", async () => {
    const { svc } = makeSvc();
    const state   = await svc.getSyncState("user-1");
    assert.equal(state, null);
  });

  test("returns state after sync", async () => {
    const { svc } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    const state = await svc.getSyncState("user-1");
    assert.ok(state !== null);
  });

  test("lastSyncAt is populated", async () => {
    const { svc } = makeSvc();
    await svc.syncNotifications("user-1");
    const state = await svc.getSyncState("user-1");
    assert.ok(state!.lastSyncAt !== null);
  });

  test("unreadCount in state matches sync result", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2", { isRead: true })]);
    const result  = await svc.syncNotifications("user-1");
    const state   = await svc.getSyncState("user-1");
    assert.equal(state!.unreadCount, result.unread);
  });

  test("state is isolated by userId", async () => {
    const { svc } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-A");
    const stateA = await svc.getSyncState("user-A");
    const stateB = await svc.getSyncState("user-B");
    assert.ok(stateA !== null);
    assert.equal(stateB, null);
  });

  test("throws for empty userId", async () => {
    const { svc } = makeSvc();
    await assert.rejects(
      () => svc.getSyncState(""),
      NotificationSyncValidationError,
    );
  });
});

// ─── 8. Activity integration ──────────────────────────────────────────────────

describe("NotificationSyncService — activity integration", () => {
  test("emits an activity on sync", async () => {
    const { svc } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    const acts = svc.getActivities("user-1");
    assert.equal(acts.length, 1);
  });

  test("activity type is SYSTEM", async () => {
    const { svc } = makeSvc();
    await svc.syncNotifications("user-1");
    assert.equal(svc.getActivities("user-1")[0]!.type, "SYSTEM");
  });

  test("activity title is 'Notifications Synced'", async () => {
    const { svc } = makeSvc();
    await svc.syncNotifications("user-1");
    assert.equal(svc.getActivities("user-1")[0]!.title, "Notifications Synced");
  });

  test("activity visibility is PRIVATE", async () => {
    const { svc } = makeSvc();
    await svc.syncNotifications("user-1");
    assert.equal(svc.getActivities("user-1")[0]!.visibility, "PRIVATE");
  });

  test("activity sourceApp is universe-hub", async () => {
    const { svc } = makeSvc();
    await svc.syncNotifications("user-1");
    assert.equal(svc.getActivities("user-1")[0]!.sourceApp, "universe-hub");
  });

  test("multiple syncs emit multiple activities", async () => {
    const { svc } = makeSvc();
    await svc.syncNotifications("user-1");
    await svc.syncNotifications("user-1");
    await svc.syncNotifications("user-1");
    assert.equal(svc.getActivities("user-1").length, 3);
  });

  test("activity description mentions notification count", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-1");
    const desc = svc.getActivities("user-1")[0]!.description;
    assert.ok(desc.includes("2"));
  });

  test("activities are isolated by userId", async () => {
    const { svc } = makeSvc();
    await svc.syncNotifications("user-A");
    await svc.syncNotifications("user-B");
    assert.equal(svc.getActivities("user-A").length, 1);
    assert.equal(svc.getActivities("user-B").length, 1);
  });
});

// ─── 9. Account client integration ───────────────────────────────────────────

describe("NotificationSyncService — account client integration", () => {
  test("sync calls getNotifications on client", async () => {
    const client = new MockAccountClient();
    client.notifications = [makeNotif("n1")];
    const repo = new InMemoryNotificationSyncRepository();
    const svc  = new NotificationSyncService(repo, client);
    await svc.syncNotifications("user-1");
    const feed = await svc.getNotifications("user-1");
    assert.equal(feed.total, 1);
  });

  test("getNotificationCenter calls getActivities on client", async () => {
    const { svc, client } = makeSvc([], [makeActivity("a1"), makeActivity("a2")]);
    await svc.syncNotifications("user-1");
    const dash = await svc.getNotificationCenter("user-1");
    assert.equal(dash.latestActivities.length, 2);
  });

  test("markRead delegates id to client", async () => {
    const { svc, client } = makeSvc([makeNotif("target-id")]);
    await svc.syncNotifications("user-1");
    await svc.markRead("user-1", "target-id");
    assert.ok(client.markedReadIds.includes("target-id"));
  });

  test("markAllRead delegates to client", async () => {
    const { svc, client } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-1");
    await svc.markAllRead("user-1");
    assert.equal(client.markedAllReadCount, 2);
  });

  test("sync propagates AccountServiceUnavailableError", async () => {
    const { svc, client } = makeSvc();
    client.shouldFail = true;
    await assert.rejects(
      () => svc.syncNotifications("user-1"),
      AccountServiceUnavailableError,
    );
  });
});

// ─── 10. User isolation ───────────────────────────────────────────────────────

describe("NotificationSyncService — user isolation", () => {
  test("sync for user-A does not affect user-B cache", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-A");
    const feedB = await svc.getNotifications("user-B");
    assert.equal(feedB.total, 0);
  });

  test("markRead for user-A does not affect user-B", async () => {
    const { svc } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-A");
    await svc.syncNotifications("user-B");
    await svc.markRead("user-A", "n1");
    const feedB = await svc.getNotifications("user-B");
    assert.equal(feedB.notifications.find(n => n.id === "n1")?.isRead, false);
  });

  test("markAllRead for user-A does not set user-B to read", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-A");
    await svc.syncNotifications("user-B");
    await svc.markAllRead("user-A");
    const feedB = await svc.getNotifications("user-B");
    assert.ok(feedB.notifications.some(n => !n.isRead));
  });

  test("getSyncState returns independent state per user", async () => {
    const { svc } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-A");
    await svc.syncNotifications("user-B");
    const stateA = await svc.getSyncState("user-A");
    const stateB = await svc.getSyncState("user-B");
    assert.equal(stateA!.userId, "user-A");
    assert.equal(stateB!.userId, "user-B");
  });
});

// ─── 11. Multi-user scenario ──────────────────────────────────────────────────

describe("NotificationSyncService — multi-user", () => {
  test("10 users syncing independently all get their states saved", async () => {
    const { svc, repo } = makeSvc([makeNotif("n1")]);
    for (let i = 0; i < 10; i++) {
      await svc.syncNotifications(`user-${i}`);
    }
    for (let i = 0; i < 10; i++) {
      const state = await repo.findByUserId(`user-${i}`);
      assert.ok(state !== null);
    }
  });

  test("activities isolated across 5 users", async () => {
    const { svc } = makeSvc();
    for (let i = 0; i < 5; i++) {
      await svc.syncNotifications(`user-${i}`);
      await svc.syncNotifications(`user-${i}`);
    }
    for (let i = 0; i < 5; i++) {
      assert.equal(svc.getActivities(`user-${i}`).length, 2);
    }
  });

  test("markAllRead for one user leaves others unaffected", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    await svc.syncNotifications("user-0");
    await svc.syncNotifications("user-1");
    await svc.markAllRead("user-0");
    const feed1 = await svc.getNotifications("user-1");
    assert.ok(feed1.notifications.some(n => !n.isRead));
  });
});

// ─── 12. Pagination and ordering ─────────────────────────────────────────────

describe("NotificationSyncService — pagination", () => {
  test("limit is respected in getNotifications", async () => {
    const notifs = Array.from({ length: 10 }, (_, i) => makeNotif(`n${i}`));
    const { svc } = makeSvc(notifs);
    await svc.syncNotifications("user-1");
    const feed = await svc.getNotifications("user-1", 3);
    assert.equal(feed.notifications.length, 3);
  });

  test("offset skips the first N notifications", async () => {
    const notifs = Array.from({ length: 10 }, (_, i) =>
      makeNotif(`n${i}`, { createdAt: new Date(Date.now() - i * 1000).toISOString() }),
    );
    const { svc } = makeSvc(notifs);
    await svc.syncNotifications("user-1");
    const firstPage  = await svc.getNotifications("user-1", 5, 0);
    const secondPage = await svc.getNotifications("user-1", 5, 5);
    const firstIds   = firstPage.notifications.map(n => n.id);
    const secondIds  = secondPage.notifications.map(n => n.id);
    assert.ok(!firstIds.some(id => secondIds.includes(id)));
  });

  test("total reflects full count regardless of limit", async () => {
    const notifs = Array.from({ length: 20 }, (_, i) => makeNotif(`n${i}`));
    const { svc } = makeSvc(notifs);
    await svc.syncNotifications("user-1");
    const feed = await svc.getNotifications("user-1", 5);
    assert.equal(feed.total, 20);
  });

  test("large offset returns empty notifications array", async () => {
    const notifs = Array.from({ length: 5 }, (_, i) => makeNotif(`n${i}`));
    const { svc } = makeSvc(notifs);
    await svc.syncNotifications("user-1");
    const feed = await svc.getNotifications("user-1", 10, 100);
    assert.equal(feed.notifications.length, 0);
  });

  test("notifications sorted most recent first after sync", async () => {
    const notifs = [
      makeNotif("old", { createdAt: new Date(Date.now() - 10000).toISOString() }),
      makeNotif("new", { createdAt: new Date().toISOString() }),
      makeNotif("mid", { createdAt: new Date(Date.now() - 5000).toISOString() }),
    ];
    const { svc } = makeSvc(notifs);
    await svc.syncNotifications("user-1");
    const feed = await svc.getNotifications("user-1");
    assert.equal(feed.notifications[0]!.id, "new");
    assert.equal(feed.notifications[2]!.id, "old");
  });
});

// ─── 13. Error handling ───────────────────────────────────────────────────────

describe("NotificationSyncService — error handling", () => {
  test("sync throws AccountServiceUnavailableError when client fails", async () => {
    const { svc, client } = makeSvc();
    client.shouldFail = true;
    await assert.rejects(
      () => svc.syncNotifications("user-1"),
      AccountServiceUnavailableError,
    );
  });

  test("cache not corrupted after failed sync", async () => {
    const { svc, client } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    client.shouldFail = true;
    try { await svc.syncNotifications("user-1"); } catch { /* expected */ }
    const feed = await svc.getNotifications("user-1");
    assert.equal(feed.total, 1);
  });

  test("second sync succeeds after first failure", async () => {
    const { svc, client } = makeSvc([makeNotif("n1"), makeNotif("n2")]);
    client.shouldFail = true;
    try { await svc.syncNotifications("user-1"); } catch { /* expected */ }
    client.shouldFail = false;
    const result = await svc.syncNotifications("user-1");
    assert.equal(result.synced, 2);
  });

  test("markRead error does not remove notification from cache", async () => {
    const { svc, client } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    client.failOnMark = true;
    try { await svc.markRead("user-1", "n1"); } catch { /* expected */ }
    const feed = await svc.getNotifications("user-1");
    assert.equal(feed.total, 1);
  });

  test("sync validation: empty userId throws immediately", async () => {
    const { svc } = makeSvc();
    await assert.rejects(
      () => svc.syncNotifications(""),
      NotificationSyncValidationError,
    );
  });

  test("sync validation: whitespace userId throws immediately", async () => {
    const { svc } = makeSvc();
    await assert.rejects(
      () => svc.syncNotifications("   "),
      NotificationSyncValidationError,
    );
  });
});

// ─── 14. InMemoryNotificationSyncRepository ───────────────────────────────────

describe("InMemoryNotificationSyncRepository", () => {
  function makeState(userId: string): import("../../models/notificationSync.js").NotificationSyncState {
    const now = new Date().toISOString();
    return { id: crypto.randomUUID(), userId, lastSyncAt: now, lastNotificationId: null, unreadCount: 0, createdAt: now, updatedAt: now };
  }

  test("findByUserId returns null initially", async () => {
    const repo = new InMemoryNotificationSyncRepository();
    assert.equal(await repo.findByUserId("u1"), null);
  });

  test("save then findByUserId returns the state", async () => {
    const repo  = new InMemoryNotificationSyncRepository();
    const state = makeState("u1");
    await repo.save(state);
    const found = await repo.findByUserId("u1");
    assert.equal(found!.userId, "u1");
  });

  test("update modifies the record", async () => {
    const repo  = new InMemoryNotificationSyncRepository();
    const state = makeState("u1");
    await repo.save(state);
    await repo.update({ ...state, unreadCount: 5 });
    const found = await repo.findByUserId("u1");
    assert.equal(found!.unreadCount, 5);
  });

  test("update non-existent returns null", async () => {
    const repo   = new InMemoryNotificationSyncRepository();
    const state  = makeState("u1");
    const result = await repo.update(state);
    assert.equal(result, null);
  });

  test("delete removes the record", async () => {
    const repo  = new InMemoryNotificationSyncRepository();
    await repo.save(makeState("u1"));
    await repo.delete("u1");
    assert.equal(await repo.findByUserId("u1"), null);
  });

  test("delete returns false for non-existent", async () => {
    const repo   = new InMemoryNotificationSyncRepository();
    const result = await repo.delete("u-missing");
    assert.equal(result, false);
  });

  test("multiple users isolated", async () => {
    const repo = new InMemoryNotificationSyncRepository();
    await repo.save(makeState("u1"));
    await repo.save(makeState("u2"));
    const found1 = await repo.findByUserId("u1");
    const found2 = await repo.findByUserId("u2");
    assert.equal(found1!.userId, "u1");
    assert.equal(found2!.userId, "u2");
  });

  test("save overwrites previous record for same userId", async () => {
    const repo  = new InMemoryNotificationSyncRepository();
    const s1    = makeState("u1");
    await repo.save({ ...s1, unreadCount: 3 });
    await repo.save({ ...s1, unreadCount: 7 });
    const found = await repo.findByUserId("u1");
    assert.equal(found!.unreadCount, 7);
  });
});

// ─── 15. Edge cases ───────────────────────────────────────────────────────────

describe("NotificationSyncService — edge cases", () => {
  test("getNotifications returns empty for unseen user", async () => {
    const { svc } = makeSvc();
    const feed    = await svc.getNotifications("unknown-user");
    assert.deepEqual(feed.notifications, []);
    assert.equal(feed.total, 0);
  });

  test("notification with very long message is handled", async () => {
    const msg = "x".repeat(10_000);
    const { svc } = makeSvc([makeNotif("n1", { message: msg })]);
    await svc.syncNotifications("user-1");
    const feed = await svc.getNotifications("user-1");
    assert.equal(feed.notifications[0]!.message, msg);
  });

  test("notification source is 'universe-account'", async () => {
    const { svc } = makeSvc([makeNotif("n1")]);
    await svc.syncNotifications("user-1");
    const feed = await svc.getNotifications("user-1");
    assert.equal(feed.notifications[0]!.source, "universe-account");
  });

  test("getNotifications throws for empty userId", async () => {
    const { svc } = makeSvc();
    await assert.rejects(
      () => svc.getNotifications(""),
      NotificationSyncValidationError,
    );
  });

  test("single notification synced and retrievable", async () => {
    const { svc } = makeSvc([makeNotif("only-one")]);
    await svc.syncNotifications("user-1");
    const feed = await svc.getNotifications("user-1");
    assert.equal(feed.total, 1);
    assert.equal(feed.notifications[0]!.id, "only-one");
  });

  test("unreadCount in feed reflects correct count after markRead", async () => {
    const { svc } = makeSvc([makeNotif("n1"), makeNotif("n2"), makeNotif("n3")]);
    await svc.syncNotifications("user-1");
    await svc.markRead("user-1", "n1");
    const feed = await svc.getNotifications("user-1");
    assert.equal(feed.unreadCount, 2);
  });
});
