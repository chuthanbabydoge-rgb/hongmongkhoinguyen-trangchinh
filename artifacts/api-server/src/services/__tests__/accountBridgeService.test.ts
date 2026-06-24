// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: AccountBridgeService (HUB-1)
//
// Covers: identity, profile, avatar, reputation, settings, dashboard
//         aggregation, notification count, activity fetch, caching,
//         timeout, service unavailable, multi-user isolation,
//         token forwarding, error handling, health check.
//
// Uses fully in-memory stubs — no network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert              from "node:assert/strict";

import { AccountBridgeService }            from "../accountBridgeService.js";
import { AccountServiceUnavailableError }  from "../accountClient.js";
import type { IAccountClient }             from "../accountClient.js";
import type {
  IdentityDTO,
  ProfileDTO,
  AvatarDTO,
  AchievementDTO,
  ReputationDTO,
  ActivityDTO,
  NotificationDTO,
  SettingsDTO,
} from "../../models/accountBridge.js";

// ─── Mock Client ──────────────────────────────────────────────────────────────

const IDENTITY: IdentityDTO  = { id: "u-001", username: "commander_zara", email: "zara@universe.io", createdAt: "2024-01-01T00:00:00Z" };
const PROFILE:  ProfileDTO   = { userId: "u-001", displayName: "Commander Zara", bio: "Galactic Architect", level: 47, xp: 84320 };
const AVATAR:   AvatarDTO    = { userId: "u-001", imageUrl: "https://cdn.universe.io/avatars/u-001.png", frameId: "frame-gold", badgeId: "badge-elite" };
const REPUTATION: ReputationDTO = { userId: "u-001", score: 142, badges: ["ưu tú", "pioneer"], tier: "elite" };
const SETTINGS: SettingsDTO  = { userId: "u-001", language: "vi", theme: "dark", notifications: true };
const ACTIVITIES: ActivityDTO[] = [
  { id: "act-1", type: "TRADE", description: "Bán Rồng Huyền Thoại", createdAt: "2024-06-01T10:00:00Z" },
  { id: "act-2", type: "BID",   description: "Đặt giá cho Phượng Hoàng", createdAt: "2024-06-01T11:00:00Z" },
];
const ACHIEVEMENTS: AchievementDTO[] = [
  { id: "ach-1", name: "First Trade", description: "Hoàn thành giao dịch đầu tiên", earnedAt: "2024-01-15T00:00:00Z" },
];
const NOTIFICATIONS: NotificationDTO[] = [
  { id: "notif-1", type: "BID_RECEIVED", message: "Ai đó đã đặt giá", isRead: false, createdAt: "2024-06-01T12:00:00Z" },
  { id: "notif-2", type: "SALE",          message: "Bán thành công",   isRead: true,  createdAt: "2024-06-01T11:00:00Z" },
];

type TokenRecord = Record<string, string | undefined>;

class MockAccountClient implements IAccountClient {
  calls: { method: string; token: string | undefined }[] = [];
  private shouldFail = false;
  private tokenData: TokenRecord = {};

  setFail(value: boolean): void { this.shouldFail = value; }
  setTokenData(token: string, data: Partial<typeof PROFILE>): void {
    this.tokenData[token] = JSON.stringify(data);
  }

  private record(method: string, token?: string): void {
    this.calls.push({ method, token });
    if (this.shouldFail) throw new AccountServiceUnavailableError("mock failure");
  }

  async getIdentity(token?: string): Promise<IdentityDTO>      { this.record("getIdentity", token);      return { ...IDENTITY }; }
  async getProfile(token?: string): Promise<ProfileDTO>         { this.record("getProfile", token);       return { ...PROFILE }; }
  async getAvatar(token?: string): Promise<AvatarDTO>           { this.record("getAvatar", token);        return { ...AVATAR }; }
  async getAchievements(token?: string): Promise<AchievementDTO[]> { this.record("getAchievements", token); return [...ACHIEVEMENTS]; }
  async getAchievementCount(token?: string): Promise<number>    { this.record("getAchievementCount", token); return ACHIEVEMENTS.length; }
  async getReputation(token?: string): Promise<ReputationDTO>   { this.record("getReputation", token);    return { ...REPUTATION }; }
  async getActivities(token?: string): Promise<ActivityDTO[]>   { this.record("getActivities", token);    return [...ACTIVITIES]; }
  async getNotifications(token?: string): Promise<NotificationDTO[]> { this.record("getNotifications", token); return [...NOTIFICATIONS]; }
  async getUnreadNotificationCount(token?: string): Promise<number> { this.record("getUnreadNotificationCount", token); return NOTIFICATIONS.filter(n => !n.isRead).length; }
  async getSettings(token?: string): Promise<SettingsDTO>       { this.record("getSettings", token);      return { ...SETTINGS }; }
}

function makeService() {
  const client  = new MockAccountClient();
  const service = new AccountBridgeService(client);
  return { client, service };
}

// ─── Identity ────────────────────────────────────────────────────────────────

describe("AccountBridgeService — identity", () => {

  test("✔ Lấy identity thành công", async () => {
    const { service } = makeService();
    const identity = await service.getIdentityCached("Bearer token-001");
    assert.equal(identity.id,       "u-001");
    assert.equal(identity.username, "commander_zara");
    assert.equal(identity.email,    "zara@universe.io");
  });

  test("✔ Identity không có token trả về dữ liệu", async () => {
    const { service } = makeService();
    const identity = await service.getIdentityCached(undefined);
    assert.ok(identity.id);
  });

});

// ─── Profile ─────────────────────────────────────────────────────────────────

describe("AccountBridgeService — profile", () => {

  test("✔ Lấy profile thành công", async () => {
    const { service } = makeService();
    const profile = await service.getProfileCached("Bearer token-001");
    assert.equal(profile.userId,      "u-001");
    assert.equal(profile.displayName, "Commander Zara");
    assert.equal(profile.level,       47);
  });

  test("✔ Profile có đủ fields bắt buộc", async () => {
    const { service } = makeService();
    const profile = await service.getProfileCached("Bearer token-001");
    assert.ok("userId"      in profile);
    assert.ok("displayName" in profile);
  });

});

// ─── Avatar ──────────────────────────────────────────────────────────────────

describe("AccountBridgeService — avatar", () => {

  test("✔ Lấy avatar thành công", async () => {
    const { service } = makeService();
    const avatar = await service.getAvatarCached("Bearer token-001");
    assert.equal(avatar.userId,   "u-001");
    assert.ok(avatar.imageUrl.startsWith("https://"));
  });

  test("✔ Avatar có frameId và badgeId", async () => {
    const { service } = makeService();
    const avatar = await service.getAvatarCached("Bearer token-001");
    assert.equal(avatar.frameId, "frame-gold");
    assert.equal(avatar.badgeId, "badge-elite");
  });

});

// ─── Reputation ──────────────────────────────────────────────────────────────

describe("AccountBridgeService — reputation", () => {

  test("✔ Lấy reputation thành công", async () => {
    const { client, service } = makeService();
    const rep = await service.getHubMe("Bearer token-001").then(d => d.reputation);
    assert.equal(rep.score, 142);
    assert.equal(rep.tier,  "elite");
  });

  test("✔ Reputation có badges", async () => {
    const { service } = makeService();
    const overview = await service.getHubUserOverview("Bearer token-001");
    assert.ok(Array.isArray(overview.reputation.badges));
    assert.ok(overview.reputation.badges.length > 0);
  });

});

// ─── Settings ────────────────────────────────────────────────────────────────

describe("AccountBridgeService — settings", () => {

  test("✔ Lấy settings thành công", async () => {
    const { service } = makeService();
    const settings = await service.getSettingsCached("Bearer token-001");
    assert.equal(settings.language, "vi");
    assert.equal(settings.theme,    "dark");
    assert.equal(settings.notifications, true);
  });

  test("✔ Settings có userId", async () => {
    const { service } = makeService();
    const settings = await service.getSettingsCached("Bearer token-001");
    assert.equal(settings.userId, "u-001");
  });

});

// ─── Dashboard aggregation ───────────────────────────────────────────────────

describe("AccountBridgeService — dashboard", () => {

  test("✔ Dashboard trả đủ 6 fields", async () => {
    const { service } = makeService();
    const dash = await service.getHubDashboard("Bearer token-001");
    assert.ok("profile"              in dash);
    assert.ok("avatar"               in dash);
    assert.ok("reputation"           in dash);
    assert.ok("achievementCount"     in dash);
    assert.ok("unreadNotifications"  in dash);
    assert.ok("latestActivities"     in dash);
  });

  test("✔ Dashboard achievementCount đúng", async () => {
    const { service } = makeService();
    const dash = await service.getHubDashboard("Bearer token-001");
    assert.equal(dash.achievementCount, 1);
  });

  test("✔ Dashboard unreadNotifications đúng", async () => {
    const { service } = makeService();
    const dash = await service.getHubDashboard("Bearer token-001");
    assert.equal(dash.unreadNotifications, 1);
  });

  test("✔ Dashboard latestActivities là array", async () => {
    const { service } = makeService();
    const dash = await service.getHubDashboard("Bearer token-001");
    assert.ok(Array.isArray(dash.latestActivities));
    assert.equal(dash.latestActivities.length, 2);
  });

  test("✔ Dashboard gọi đúng 6 methods song song", async () => {
    const { client, service } = makeService();
    await service.getHubDashboard("Bearer token-001");
    const methods = client.calls.map(c => c.method);
    assert.ok(methods.includes("getProfile"));
    assert.ok(methods.includes("getAvatar"));
    assert.ok(methods.includes("getReputation"));
    assert.ok(methods.includes("getAchievementCount"));
    assert.ok(methods.includes("getUnreadNotificationCount"));
    assert.ok(methods.includes("getActivities"));
  });

});

// ─── Hub Me ──────────────────────────────────────────────────────────────────

describe("AccountBridgeService — getHubMe", () => {

  test("✔ getHubMe trả profile, avatar, reputation, settings", async () => {
    const { service } = makeService();
    const me = await service.getHubMe("Bearer token-001");
    assert.ok("profile"    in me);
    assert.ok("avatar"     in me);
    assert.ok("reputation" in me);
    assert.ok("settings"   in me);
  });

  test("✔ getHubMe không trả identity hay activities", async () => {
    const { service } = makeService();
    const me = await service.getHubMe("Bearer token-001") as unknown as Record<string, unknown>;
    assert.ok(!("identity"   in me));
    assert.ok(!("activities" in me));
  });

});

// ─── Notification count ──────────────────────────────────────────────────────

describe("AccountBridgeService — notification count", () => {

  test("✔ Unread notification count đúng", async () => {
    const { service } = makeService();
    const overview = await service.getHubUserOverview("Bearer token-001");
    assert.equal(overview.unreadNotifications, 1);
  });

  test("✔ Notification count xuất hiện trong overview", async () => {
    const { service } = makeService();
    const overview = await service.getHubUserOverview("Bearer token-001");
    assert.ok(typeof overview.unreadNotifications === "number");
  });

});

// ─── Activity fetch ──────────────────────────────────────────────────────────

describe("AccountBridgeService — activity fetch", () => {

  test("✔ Activities trả array không rỗng", async () => {
    const { service } = makeService();
    const dash = await service.getHubDashboard("Bearer token-001");
    assert.ok(dash.latestActivities.length > 0);
  });

  test("✔ Activity có đủ fields bắt buộc", async () => {
    const { service } = makeService();
    const dash = await service.getHubDashboard("Bearer token-001");
    const act  = dash.latestActivities[0]!;
    assert.ok("id"          in act);
    assert.ok("type"        in act);
    assert.ok("description" in act);
    assert.ok("createdAt"   in act);
  });

});

// ─── Caching ─────────────────────────────────────────────────────────────────

describe("AccountBridgeService — caching", () => {

  test("✔ Identity được cache sau lần gọi đầu", async () => {
    const { client, service } = makeService();
    await service.getIdentityCached("Bearer cache-token");
    await service.getIdentityCached("Bearer cache-token");
    const identityCalls = client.calls.filter(c => c.method === "getIdentity");
    assert.equal(identityCalls.length, 1);
  });

  test("✔ Profile được cache sau lần gọi đầu", async () => {
    const { client, service } = makeService();
    await service.getProfileCached("Bearer cache-token");
    await service.getProfileCached("Bearer cache-token");
    const profileCalls = client.calls.filter(c => c.method === "getProfile");
    assert.equal(profileCalls.length, 1);
  });

  test("✔ Avatar được cache sau lần gọi đầu", async () => {
    const { client, service } = makeService();
    await service.getAvatarCached("Bearer cache-token");
    await service.getAvatarCached("Bearer cache-token");
    const avatarCalls = client.calls.filter(c => c.method === "getAvatar");
    assert.equal(avatarCalls.length, 1);
  });

  test("✔ Settings được cache sau lần gọi đầu", async () => {
    const { client, service } = makeService();
    await service.getSettingsCached("Bearer cache-token");
    await service.getSettingsCached("Bearer cache-token");
    const settingsCalls = client.calls.filter(c => c.method === "getSettings");
    assert.equal(settingsCalls.length, 1);
  });

  test("✔ clearCache xóa toàn bộ cache", async () => {
    const { client, service } = makeService();
    await service.getIdentityCached("Bearer cache-token");
    service.clearCache();
    await service.getIdentityCached("Bearer cache-token");
    const identityCalls = client.calls.filter(c => c.method === "getIdentity");
    assert.equal(identityCalls.length, 2);
  });

});

// ─── Timeout / Service unavailable ───────────────────────────────────────────

describe("AccountBridgeService — service unavailable", () => {

  test("✔ getHubMe throw AccountServiceUnavailableError khi Account down", async () => {
    const { client, service } = makeService();
    client.setFail(true);
    await assert.rejects(
      () => service.getHubMe("Bearer token-001"),
      AccountServiceUnavailableError,
    );
  });

  test("✔ getHubDashboard throw AccountServiceUnavailableError khi Account down", async () => {
    const { client, service } = makeService();
    client.setFail(true);
    await assert.rejects(
      () => service.getHubDashboard("Bearer token-001"),
      AccountServiceUnavailableError,
    );
  });

  test("✔ getHubUserOverview throw AccountServiceUnavailableError khi Account down", async () => {
    const { client, service } = makeService();
    client.setFail(true);
    await assert.rejects(
      () => service.getHubUserOverview("Bearer token-001"),
      AccountServiceUnavailableError,
    );
  });

  test("✔ checkAccountHealth trả connected:false khi Account down", async () => {
    const { client, service } = makeService();
    client.setFail(true);
    const health = await service.checkAccountHealth("Bearer token-001");
    assert.equal(health.connected, false);
    assert.ok(typeof health.error === "string");
  });

  test("✔ checkAccountHealth không throw — Hub không crash", async () => {
    const { client, service } = makeService();
    client.setFail(true);
    let threw = false;
    try {
      await service.checkAccountHealth("Bearer token-001");
    } catch {
      threw = true;
    }
    assert.equal(threw, false);
  });

});

// ─── Multi-user isolation ─────────────────────────────────────────────────────

describe("AccountBridgeService — multi-user isolation", () => {

  test("✔ Cache token-A không bị cache chéo với token-B (identity)", async () => {
    const { client, service } = makeService();
    await service.getIdentityCached("Bearer token-A");
    await service.getIdentityCached("Bearer token-B");
    const calls = client.calls.filter(c => c.method === "getIdentity");
    assert.equal(calls.length, 2);
  });

  test("✔ Cache token-A không bị cache chéo với token-B (profile)", async () => {
    const { client, service } = makeService();
    await service.getProfileCached("Bearer token-A");
    await service.getProfileCached("Bearer token-B");
    const calls = client.calls.filter(c => c.method === "getProfile");
    assert.equal(calls.length, 2);
  });

  test("✔ Token-A request lần 2 vẫn dùng cache, token-B gọi riêng", async () => {
    const { client, service } = makeService();
    await service.getAvatarCached("Bearer token-A");
    await service.getAvatarCached("Bearer token-A");
    await service.getAvatarCached("Bearer token-B");
    const calls = client.calls.filter(c => c.method === "getAvatar");
    assert.equal(calls.length, 2);
  });

  test("✔ anonymous token có cache riêng biệt với Bearer token", async () => {
    const { client, service } = makeService();
    await service.getIdentityCached(undefined);
    await service.getIdentityCached("Bearer token-001");
    const calls = client.calls.filter(c => c.method === "getIdentity");
    assert.equal(calls.length, 2);
  });

});

// ─── Token forwarding ────────────────────────────────────────────────────────

describe("AccountBridgeService — token forwarding", () => {

  test("✔ Token được forward khi gọi getIdentityCached", async () => {
    const { client, service } = makeService();
    const token = "Bearer forward-test-token";
    await service.getIdentityCached(token);
    const call = client.calls.find(c => c.method === "getIdentity");
    assert.equal(call?.token, token);
  });

  test("✔ Token được forward khi gọi getHubDashboard", async () => {
    const { client, service } = makeService();
    const token = "Bearer dash-token";
    await service.getHubDashboard(token);
    const repCall = client.calls.find(c => c.method === "getReputation");
    assert.equal(repCall?.token, token);
  });

  test("✔ Token undefined được forward khi không có Authorization", async () => {
    const { client, service } = makeService();
    await service.getProfileCached(undefined);
    const call = client.calls.find(c => c.method === "getProfile");
    assert.equal(call?.token, undefined);
  });

});

// ─── Error handling ──────────────────────────────────────────────────────────

describe("AccountBridgeService — error handling", () => {

  test("✔ AccountServiceUnavailableError có name đúng", () => {
    const err = new AccountServiceUnavailableError("test reason");
    assert.equal(err.name, "AccountServiceUnavailableError");
    assert.ok(err.message.includes("test reason"));
  });

  test("✔ AccountServiceUnavailableError với Error cause", () => {
    const cause = new Error("network timeout");
    const err   = new AccountServiceUnavailableError(cause);
    assert.ok(err.message.includes("network timeout"));
  });

  test("✔ AccountServiceUnavailableError instanceof Error", () => {
    const err = new AccountServiceUnavailableError("down");
    assert.ok(err instanceof Error);
  });

  test("✔ Cache không lưu nếu request thất bại", async () => {
    const { client, service } = makeService();
    client.setFail(true);
    try { await service.getIdentityCached("Bearer fail-token"); } catch { /* expected */ }
    client.setFail(false);
    await service.getIdentityCached("Bearer fail-token");
    const calls = client.calls.filter(c => c.method === "getIdentity");
    assert.equal(calls.length, 2);
  });

});

// ─── Health check ────────────────────────────────────────────────────────────

describe("AccountBridgeService — health check", () => {

  test("✔ Health check connected:true khi Account online", async () => {
    const { service } = makeService();
    const health = await service.checkAccountHealth("Bearer token-001");
    assert.equal(health.connected, true);
    assert.ok(!("error" in health) || health.error === undefined);
  });

  test("✔ Health check connected:false khi Account offline", async () => {
    const { client, service } = makeService();
    client.setFail(true);
    const health = await service.checkAccountHealth("Bearer token-001");
    assert.equal(health.connected, false);
    assert.ok(typeof health.error === "string");
    assert.ok(health.error!.length > 0);
  });

  test("✔ Health check gọi getIdentity để kiểm tra kết nối", async () => {
    const { client, service } = makeService();
    await service.checkAccountHealth("Bearer token-001");
    const calls = client.calls.filter(c => c.method === "getIdentity");
    assert.equal(calls.length, 1);
  });

});

// ─── Hub User Overview ───────────────────────────────────────────────────────

describe("AccountBridgeService — getHubUserOverview", () => {

  test("✔ Overview trả đủ 6 fields", async () => {
    const { service } = makeService();
    const overview = await service.getHubUserOverview("Bearer token-001");
    assert.ok("identity"             in overview);
    assert.ok("profile"              in overview);
    assert.ok("avatar"               in overview);
    assert.ok("reputation"           in overview);
    assert.ok("achievementCount"     in overview);
    assert.ok("unreadNotifications"  in overview);
  });

  test("✔ Overview identity.id đúng", async () => {
    const { service } = makeService();
    const overview = await service.getHubUserOverview("Bearer token-001");
    assert.equal(overview.identity.id, "u-001");
  });

  test("✔ Overview achievementCount là số", async () => {
    const { service } = makeService();
    const overview = await service.getHubUserOverview("Bearer token-001");
    assert.ok(typeof overview.achievementCount === "number");
  });

});
