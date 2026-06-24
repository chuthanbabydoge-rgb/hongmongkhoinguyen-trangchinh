// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: ApplicationRegistryService (HUB-5)
//
// Covers: register, duplicate slug, enable/disable, featured, recently added,
//         install, reinstall, uninstall, my apps, open app, lastOpenedAt,
//         activity integration, pagination, sorting, multi-user isolation,
//         business rule enforcement, edge cases.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert             from "node:assert/strict";

import {
  ApplicationRegistryService,
  AppAlreadyExistsError,
  AppHUB5NotFoundError,
  AppDisabledError,
  AppValidationError,
  AppNotInstalledError,
} from "../applicationRegistryService.js";
import {
  InMemoryApplicationRegistryRepository,
  InMemoryUserAppRepository,
} from "../../repositories/applicationRegistryRepository.js";
import type { CreateApplicationRequest } from "../../models/application.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeService() {
  const appRepo     = new InMemoryApplicationRegistryRepository();
  const userAppRepo = new InMemoryUserAppRepository();
  const service     = new ApplicationRegistryService(appRepo, userAppRepo);
  return { appRepo, userAppRepo, service };
}

const VALID_APP: CreateApplicationRequest = {
  slug:        "test-app",
  name:        "Test App",
  description: "Ứng dụng kiểm thử",
  iconUrl:     "https://cdn.universe.io/icons/test.png",
  bannerUrl:   "https://cdn.universe.io/banners/test.png",
  category:    "UTILITY",
  launchUrl:   "https://test.universe.io/launch",
  ownerApp:    "universe-hub",
  status:      "ACTIVE",
  featured:    false,
};

const USER_A = "user-aaa";
const USER_B = "user-bbb";

// ─── Register App ─────────────────────────────────────────────────────────────

describe("HUB-5 — registerApp()", () => {

  test("✔ Đăng ký app thành công", async () => {
    const { service } = makeService();
    const app = await service.registerApp(VALID_APP);
    assert.equal(app.slug,   "test-app");
    assert.equal(app.name,   "Test App");
    assert.equal(app.status, "ACTIVE");
    assert.equal(app.featured, false);
    assert.ok(app.id);
    assert.ok(app.createdAt);
    assert.ok(app.updatedAt);
  });

  test("✔ Status mặc định là ACTIVE khi không truyền", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, slug: "app-no-status", status: undefined });
    assert.equal(app.status, "ACTIVE");
  });

  test("✔ featured mặc định false khi không truyền", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, slug: "app-no-featured", featured: undefined });
    assert.equal(app.featured, false);
  });

  test("✔ Đăng ký nhiều app khác slug", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "app-x" });
    await service.registerApp({ ...VALID_APP, slug: "app-y" });
    const result = await service.getApps();
    assert.equal(result.total, 2);
  });

  test("✔ Đăng ký app với category SPORT", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, slug: "sport-app", category: "SPORT" });
    assert.equal(app.category, "SPORT");
  });

  test("✔ Đăng ký app với category AI", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, slug: "ai-app", category: "AI" });
    assert.equal(app.category, "AI");
  });

  test("✔ Đăng ký app featured=true", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, slug: "featured-app", featured: true });
    assert.equal(app.featured, true);
  });

  test("✔ App có launchUrl đúng", async () => {
    const { service } = makeService();
    const app = await service.registerApp(VALID_APP);
    assert.equal(app.launchUrl, "https://test.universe.io/launch");
  });

  test("✔ App có ownerApp đúng", async () => {
    const { service } = makeService();
    const app = await service.registerApp(VALID_APP);
    assert.equal(app.ownerApp, "universe-hub");
  });

});

// ─── Duplicate Slug ───────────────────────────────────────────────────────────

describe("HUB-5 — registerApp() duplicate slug", () => {

  test("✖ Duplicate slug → AppAlreadyExistsError", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await assert.rejects(
      () => service.registerApp(VALID_APP),
      (err: unknown) => err instanceof AppAlreadyExistsError,
    );
  });

  test("✖ Duplicate slug — message chứa slug", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    try {
      await service.registerApp(VALID_APP);
      assert.fail("Expected AppAlreadyExistsError");
    } catch (err) {
      assert.ok(err instanceof AppAlreadyExistsError);
      assert.ok(err.message.includes("test-app"));
    }
  });

  test("✖ Slug khác không gây lỗi duplicate", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const app2 = await service.registerApp({ ...VALID_APP, slug: "other-app" });
    assert.equal(app2.slug, "other-app");
  });

});

// ─── Validation ───────────────────────────────────────────────────────────────

describe("HUB-5 — registerApp() validation", () => {

  test("✖ Slug rỗng → AppValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "" }),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

  test("✖ Slug có ký tự hoa → AppValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "MyApp" }),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

  test("✖ Slug có ký tự đặc biệt → AppValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "my_app!" }),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

  test("✖ Slug quá dài → AppValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "a".repeat(101) }),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

  test("✖ Name rỗng → AppValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "empty-name", name: "" }),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

  test("✖ launchUrl không hợp lệ → AppValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "bad-url", launchUrl: "not-a-url" }),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

  test("✖ category không hợp lệ → AppValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "bad-cat", category: "INVALID" as never }),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

  test("✖ iconUrl không hợp lệ → AppValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "bad-icon", iconUrl: "not-a-url" }),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

});

// ─── Get App ─────────────────────────────────────────────────────────────────

describe("HUB-5 — getApp()", () => {

  test("✔ Lấy app theo slug thành công", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const app = await service.getApp("test-app");
    assert.equal(app.slug, "test-app");
  });

  test("✖ Slug không tồn tại → AppHUB5NotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.getApp("non-existent"),
      (err: unknown) => err instanceof AppHUB5NotFoundError,
    );
  });

});

// ─── Get Apps (Pagination) ────────────────────────────────────────────────────

describe("HUB-5 — getApps() pagination", () => {

  async function seedApps(service: ApplicationRegistryService, count: number) {
    for (let i = 0; i < count; i++) {
      await service.registerApp({
        ...VALID_APP,
        slug: `app-${i.toString().padStart(3, "0")}`,
        name: `App ${i}`,
      });
    }
  }

  test("✔ Trả về tổng số app", async () => {
    const { service } = makeService();
    await seedApps(service, 5);
    const result = await service.getApps();
    assert.equal(result.total, 5);
  });

  test("✔ Phân trang page=1 limit=3", async () => {
    const { service } = makeService();
    await seedApps(service, 5);
    const result = await service.getApps({ page: 1, limit: 3 });
    assert.equal(result.data.length, 3);
    assert.equal(result.totalPages, 2);
  });

  test("✔ Phân trang page=2 limit=3", async () => {
    const { service } = makeService();
    await seedApps(service, 5);
    const result = await service.getApps({ page: 2, limit: 3 });
    assert.equal(result.data.length, 2);
  });

  test("✔ totalPages tính đúng", async () => {
    const { service } = makeService();
    await seedApps(service, 10);
    const result = await service.getApps({ page: 1, limit: 4 });
    assert.equal(result.totalPages, 3);
  });

  test("✔ Danh sách rỗng khi không có app", async () => {
    const { service } = makeService();
    const result = await service.getApps();
    assert.equal(result.total, 0);
    assert.equal(result.data.length, 0);
  });

});

// ─── Featured Apps ────────────────────────────────────────────────────────────

describe("HUB-5 — getFeaturedApps()", () => {

  test("✔ Chỉ trả về app có featured=true", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "normal", featured: false });
    await service.registerApp({ ...VALID_APP, slug: "feat-1", featured: true });
    await service.registerApp({ ...VALID_APP, slug: "feat-2", featured: true });

    const result = await service.getFeaturedApps();
    assert.equal(result.total, 2);
    assert.ok(result.data.every(a => a.featured));
  });

  test("✔ Không có featured app → trả về rỗng", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "no-feat", featured: false });
    const result = await service.getFeaturedApps();
    assert.equal(result.total, 0);
  });

  test("✔ Featured app phân trang đúng", async () => {
    const { service } = makeService();
    for (let i = 0; i < 5; i++) {
      await service.registerApp({ ...VALID_APP, slug: `feat-${i}`, featured: true });
    }
    const result = await service.getFeaturedApps({ page: 1, limit: 3 });
    assert.equal(result.data.length, 3);
    assert.equal(result.total, 5);
  });

  test("✔ App disabled nhưng featured=true vẫn xuất hiện trong featured", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "dis-feat", featured: true, status: "DISABLED" });
    const result = await service.getFeaturedApps();
    assert.equal(result.total, 1);
  });

});

// ─── Recently Added ───────────────────────────────────────────────────────────

describe("HUB-5 — getRecentlyAdded()", () => {

  test("✔ Trả về đúng số lượng limit", async () => {
    const { service } = makeService();
    for (let i = 0; i < 5; i++) {
      await service.registerApp({ ...VALID_APP, slug: `r-app-${i}` });
    }
    const apps = await service.getRecentlyAdded(3);
    assert.equal(apps.length, 3);
  });

  test("✔ Trả về ít hơn limit nếu không đủ app", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const apps = await service.getRecentlyAdded(10);
    assert.equal(apps.length, 1);
  });

  test("✔ Trả về rỗng nếu không có app", async () => {
    const { service } = makeService();
    const apps = await service.getRecentlyAdded(5);
    assert.equal(apps.length, 0);
  });

});

// ─── Enable / Disable ─────────────────────────────────────────────────────────

describe("HUB-5 — disableApp() / enableApp()", () => {

  test("✔ disableApp() thay đổi status → DISABLED", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const updated = await service.disableApp("test-app");
    assert.equal(updated.status, "DISABLED");
  });

  test("✔ enableApp() thay đổi status → ACTIVE", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, status: "DISABLED" });
    const updated = await service.enableApp("test-app");
    assert.equal(updated.status, "ACTIVE");
  });

  test("✖ disableApp() slug không tồn tại → AppHUB5NotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.disableApp("ghost"),
      (err: unknown) => err instanceof AppHUB5NotFoundError,
    );
  });

  test("✖ enableApp() slug không tồn tại → AppHUB5NotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.enableApp("ghost"),
      (err: unknown) => err instanceof AppHUB5NotFoundError,
    );
  });

  test("✔ disable → enable → disable lại hoạt động đúng", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.disableApp("test-app");
    await service.enableApp("test-app");
    const disabled = await service.disableApp("test-app");
    assert.equal(disabled.status, "DISABLED");
  });

});

// ─── Install App ─────────────────────────────────────────────────────────────

describe("HUB-5 — installApp()", () => {

  test("✔ Cài đặt app thành công", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const userApp = await service.installApp(USER_A, { slug: "test-app" });
    assert.equal(userApp.userId, USER_A);
    assert.ok(userApp.installedAt);
    assert.ok(userApp.applicationId);
  });

  test("✔ Cài đặt app 2 lần không tạo bản ghi mới (idempotent)", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const first  = await service.installApp(USER_A, { slug: "test-app" });
    const second = await service.installApp(USER_A, { slug: "test-app" });
    assert.equal(first.id, second.id);
  });

  test("✔ 2 user khác nhau cài cùng app → 2 bản ghi riêng biệt", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const ua1 = await service.installApp(USER_A, { slug: "test-app" });
    const ua2 = await service.installApp(USER_B, { slug: "test-app" });
    assert.notEqual(ua1.id, ua2.id);
    assert.equal(ua1.userId, USER_A);
    assert.equal(ua2.userId, USER_B);
  });

  test("✖ Install app không tồn tại → AppHUB5NotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.installApp(USER_A, { slug: "ghost" }),
      (err: unknown) => err instanceof AppHUB5NotFoundError,
    );
  });

  test("✖ userId rỗng → AppValidationError", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await assert.rejects(
      () => service.installApp("", { slug: "test-app" }),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

  test("✔ App disabled vẫn có thể install (không bị chặn khi install)", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, status: "DISABLED" });
    const userApp = await service.installApp(USER_A, { slug: "test-app" });
    assert.ok(userApp.applicationId);
  });

});

// ─── Uninstall App ────────────────────────────────────────────────────────────

describe("HUB-5 — uninstallApp()", () => {

  test("✔ Gỡ cài đặt thành công", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    await service.uninstallApp(USER_A, "test-app");
    const myApps = await service.getMyApps(USER_A);
    assert.equal(myApps.length, 0);
  });

  test("✖ Gỡ app chưa install → AppNotInstalledError", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await assert.rejects(
      () => service.uninstallApp(USER_A, "test-app"),
      (err: unknown) => err instanceof AppNotInstalledError,
    );
  });

  test("✖ Gỡ app không tồn tại → AppHUB5NotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.uninstallApp(USER_A, "ghost"),
      (err: unknown) => err instanceof AppHUB5NotFoundError,
    );
  });

  test("✔ User A gỡ không ảnh hưởng User B", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    await service.installApp(USER_B, { slug: "test-app" });
    await service.uninstallApp(USER_A, "test-app");

    const myAppsA = await service.getMyApps(USER_A);
    const myAppsB = await service.getMyApps(USER_B);
    assert.equal(myAppsA.length, 0);
    assert.equal(myAppsB.length, 1);
  });

  test("✔ Install sau khi uninstall hoạt động bình thường", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    await service.uninstallApp(USER_A, "test-app");
    const reinstalled = await service.installApp(USER_A, { slug: "test-app" });
    assert.ok(reinstalled.id);
  });

});

// ─── My Apps ─────────────────────────────────────────────────────────────────

describe("HUB-5 — getMyApps()", () => {

  test("✔ Trả về danh sách app đã cài", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "app-1" });
    await service.registerApp({ ...VALID_APP, slug: "app-2" });
    await service.installApp(USER_A, { slug: "app-1" });
    await service.installApp(USER_A, { slug: "app-2" });
    const myApps = await service.getMyApps(USER_A);
    assert.equal(myApps.length, 2);
  });

  test("✔ Trả về rỗng nếu chưa cài app nào", async () => {
    const { service } = makeService();
    const myApps = await service.getMyApps(USER_A);
    assert.equal(myApps.length, 0);
  });

  test("✔ Mỗi item chứa cả app và userApp", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    const myApps = await service.getMyApps(USER_A);
    assert.ok(myApps[0]?.app);
    assert.ok(myApps[0]?.userApp);
    assert.equal(myApps[0]?.app.slug, "test-app");
    assert.equal(myApps[0]?.userApp.userId, USER_A);
  });

  test("✔ Cô lập giữa 2 user — User A chỉ thấy app của mình", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "app-a" });
    await service.registerApp({ ...VALID_APP, slug: "app-b" });
    await service.installApp(USER_A, { slug: "app-a" });
    await service.installApp(USER_B, { slug: "app-b" });

    const myAppsA = await service.getMyApps(USER_A);
    const myAppsB = await service.getMyApps(USER_B);
    assert.equal(myAppsA.length, 1);
    assert.equal(myAppsB.length, 1);
    assert.equal(myAppsA[0]?.app.slug, "app-a");
    assert.equal(myAppsB[0]?.app.slug, "app-b");
  });

  test("✖ userId rỗng → AppValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.getMyApps(""),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

});

// ─── Open App ─────────────────────────────────────────────────────────────────

describe("HUB-5 — openApp()", () => {

  test("✔ Mở app thành công → trả về launchUrl", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    const result = await service.openApp(USER_A, "test-app");
    assert.equal(result.launchUrl, "https://test.universe.io/launch");
    assert.ok(result.lastOpenedAt);
  });

  test("✔ openApp() cập nhật lastOpenedAt", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    const result = await service.openApp(USER_A, "test-app");
    assert.ok(result.lastOpenedAt);
    const d = new Date(result.lastOpenedAt);
    assert.ok(!isNaN(d.getTime()));
  });

  test("✔ openApp() lần 2 cập nhật lastOpenedAt mới hơn", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    const first = await service.openApp(USER_A, "test-app");
    await new Promise(r => setTimeout(r, 5));
    const second = await service.openApp(USER_A, "test-app");
    assert.ok(second.lastOpenedAt >= first.lastOpenedAt);
  });

  test("✖ Mở app DISABLED → AppDisabledError", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.disableApp("test-app");
    await assert.rejects(
      () => service.openApp(USER_A, "test-app"),
      (err: unknown) => err instanceof AppDisabledError,
    );
  });

  test("✖ Mở app không tồn tại → AppHUB5NotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.openApp(USER_A, "ghost"),
      (err: unknown) => err instanceof AppHUB5NotFoundError,
    );
  });

  test("✖ userId rỗng → AppValidationError", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await assert.rejects(
      () => service.openApp("", "test-app"),
      (err: unknown) => err instanceof AppValidationError,
    );
  });

  test("✔ App không cần install trước khi mở", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const result = await service.openApp(USER_A, "test-app");
    assert.ok(result.app.slug);
  });

  test("✔ openApp() trả về đúng app object", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const result = await service.openApp(USER_A, "test-app");
    assert.equal(result.app.name, "Test App");
    assert.equal(result.app.category, "UTILITY");
  });

});

// ─── Activity Feed Integration ────────────────────────────────────────────────

describe("HUB-5 — Activity Feed Integration", () => {

  test("✔ installApp() tạo activity type=SYSTEM title=Installed App", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    const activities = service.getActivities(USER_A);
    const installActivity = activities.find(a => a.title === "Installed App");
    assert.ok(installActivity);
    assert.equal(installActivity.type, "SYSTEM");
  });

  test("✔ openApp() tạo activity type=SYSTEM title=Opened App", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.openApp(USER_A, "test-app");
    const activities = service.getActivities(USER_A);
    const openActivity = activities.find(a => a.title === "Opened App");
    assert.ok(openActivity);
    assert.equal(openActivity.type, "SYSTEM");
  });

  test("✔ Activity chứa userId đúng", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    const activities = service.getActivities(USER_A);
    assert.ok(activities.every(a => a.userId === USER_A));
  });

  test("✔ Activity sourceApp = universe-hub", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    const activities = service.getActivities(USER_A);
    assert.ok(activities.every(a => a.sourceApp === "universe-hub"));
  });

  test("✔ Activities của 2 user cô lập", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    await service.installApp(USER_B, { slug: "test-app" });

    const activitiesA = service.getActivities(USER_A);
    const activitiesB = service.getActivities(USER_B);
    assert.ok(activitiesA.every(a => a.userId === USER_A));
    assert.ok(activitiesB.every(a => a.userId === USER_B));
  });

  test("✔ Cài đặt 2 lần (idempotent) chỉ tạo 1 activity", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    await service.installApp(USER_A, { slug: "test-app" });
    const activities = service.getActivities(USER_A).filter(a => a.title === "Installed App");
    assert.equal(activities.length, 1);
  });

  test("✔ Mở app nhiều lần tạo nhiều activity", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.openApp(USER_A, "test-app");
    await service.openApp(USER_A, "test-app");
    await service.openApp(USER_A, "test-app");
    const activities = service.getActivities(USER_A).filter(a => a.title === "Opened App");
    assert.equal(activities.length, 3);
  });

  test("✔ Activity có createdAt hợp lệ", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    const activities = service.getActivities(USER_A);
    assert.ok(activities.length > 0);
    const d = new Date(activities[0]!.createdAt);
    assert.ok(!isNaN(d.getTime()));
  });

  test("✔ getActivities() không truyền userId → trả về tất cả", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    await service.installApp(USER_B, { slug: "test-app" });
    const all = service.getActivities();
    assert.equal(all.length, 2);
  });

});

// ─── Multi-User Isolation ─────────────────────────────────────────────────────

describe("HUB-5 — Multi-User Isolation", () => {

  test("✔ 3 user cài 3 app khác nhau — không xen kẽ", async () => {
    const { service } = makeService();
    const USER_C = "user-ccc";
    await service.registerApp({ ...VALID_APP, slug: "app-for-a" });
    await service.registerApp({ ...VALID_APP, slug: "app-for-b" });
    await service.registerApp({ ...VALID_APP, slug: "app-for-c" });

    await service.installApp(USER_A, { slug: "app-for-a" });
    await service.installApp(USER_B, { slug: "app-for-b" });
    await service.installApp(USER_C, { slug: "app-for-c" });

    const a = await service.getMyApps(USER_A);
    const b = await service.getMyApps(USER_B);
    const c = await service.getMyApps(USER_C);

    assert.equal(a.length, 1);
    assert.equal(b.length, 1);
    assert.equal(c.length, 1);
    assert.equal(a[0]?.app.slug, "app-for-a");
    assert.equal(b[0]?.app.slug, "app-for-b");
    assert.equal(c[0]?.app.slug, "app-for-c");
  });

  test("✔ Mở app không làm thay đổi lastOpenedAt của user khác", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    await service.installApp(USER_B, { slug: "test-app" });

    await service.openApp(USER_A, "test-app");
    const myAppsB = await service.getMyApps(USER_B);
    assert.equal(myAppsB[0]?.userApp.lastOpenedAt, undefined);
  });

  test("✔ Uninstall của User A không xóa record của User B", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    await service.installApp(USER_B, { slug: "test-app" });
    await service.uninstallApp(USER_A, "test-app");

    const myAppsB = await service.getMyApps(USER_B);
    assert.equal(myAppsB.length, 1);
  });

});

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe("HUB-5 — Edge Cases", () => {

  test("✔ Slug hợp lệ với dấu gạch ngang", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, slug: "my-cool-app-123" });
    assert.equal(app.slug, "my-cool-app-123");
  });

  test("✔ App không có description (optional)", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, slug: "no-desc", description: undefined });
    assert.equal(app.description, undefined);
  });

  test("✔ App không có iconUrl (optional)", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, slug: "no-icon", iconUrl: undefined });
    assert.equal(app.iconUrl, undefined);
  });

  test("✔ App không có bannerUrl (optional)", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, slug: "no-banner", bannerUrl: undefined });
    assert.equal(app.bannerUrl, undefined);
  });

  test("✔ Kích hoạt app đã ACTIVE không gây lỗi", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const app = await service.enableApp("test-app");
    assert.equal(app.status, "ACTIVE");
  });

  test("✔ Vô hiệu hóa app đã DISABLED không gây lỗi", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, status: "DISABLED" });
    const app = await service.disableApp("test-app");
    assert.equal(app.status, "DISABLED");
  });

  test("✔ Tất cả categories hợp lệ đều được chấp nhận", async () => {
    const { service } = makeService();
    const categories = ["SYSTEM", "SPORT", "WORLD", "ANIMAL", "ECONOMY", "UTILITY", "EDUCATION", "AI"] as const;
    for (const cat of categories) {
      const app = await service.registerApp({ ...VALID_APP, slug: `cat-${cat.toLowerCase()}`, category: cat });
      assert.equal(app.category, cat);
    }
  });

  test("✔ getApps() page=1 với 0 app trả về tổng 0", async () => {
    const { service } = makeService();
    const result = await service.getApps({ page: 1, limit: 10 });
    assert.equal(result.total, 0);
    assert.equal(result.totalPages, 0);
  });

  test("✔ Sorting theo name ASC", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "b-app", name: "B App" });
    await service.registerApp({ ...VALID_APP, slug: "a-app", name: "A App" });
    const result = await service.getApps({ sort: "name", order: "asc" });
    assert.equal(result.data[0]?.name, "A App");
    assert.equal(result.data[1]?.name, "B App");
  });

  test("✔ App registered có id dạng UUID", async () => {
    const { service } = makeService();
    const app = await service.registerApp(VALID_APP);
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    assert.match(app.id, uuidRe);
  });

  test("✔ UserApplication id dạng UUID", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const ua = await service.installApp(USER_A, { slug: "test-app" });
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    assert.match(ua.id, uuidRe);
  });

  test("✔ openApp() không yêu cầu đã install", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await assert.doesNotReject(() => service.openApp(USER_A, "test-app"));
  });

  test("✔ Sau khi disable, re-enable thì openApp() thành công", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.disableApp("test-app");
    await service.enableApp("test-app");
    const result = await service.openApp(USER_A, "test-app");
    assert.ok(result.launchUrl);
  });

  test("✔ Đăng ký 100 app với slug khác nhau không gây lỗi", async () => {
    const { service } = makeService();
    const promises = Array.from({ length: 100 }, (_, i) =>
      service.registerApp({ ...VALID_APP, slug: `bulk-${i}`, name: `Bulk ${i}` }),
    );
    const apps = await Promise.all(promises);
    assert.equal(apps.length, 100);
    const result = await service.getApps({ page: 1, limit: 50 });
    assert.equal(result.total, 100);
  });

  test("✔ Cài đặt nhiều app cho 1 user", async () => {
    const { service } = makeService();
    const N = 5;
    for (let i = 0; i < N; i++) {
      await service.registerApp({ ...VALID_APP, slug: `multi-${i}` });
      await service.installApp(USER_A, { slug: `multi-${i}` });
    }
    const myApps = await service.getMyApps(USER_A);
    assert.equal(myApps.length, N);
  });

});

// ─── Additional Business Rule Tests ───────────────────────────────────────────

describe("HUB-5 — Business Rules", () => {

  test("✔ Business Rule 1: slug unique — đăng ký 2 app cùng slug → lỗi", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP }),
      (err: unknown) => err instanceof AppAlreadyExistsError,
    );
  });

  test("✔ Business Rule 2: install idempotent — không tạo duplicate", async () => {
    const { service, userAppRepo } = makeService();
    await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    await service.installApp(USER_A, { slug: "test-app" });
    await service.installApp(USER_A, { slug: "test-app" });
    const allUserApps = await userAppRepo.findByUserId(USER_A);
    assert.equal(allUserApps.length, 1);
  });

  test("✔ Business Rule 3: openApp() app DISABLED → AppDisabledError", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await service.disableApp("test-app");
    await assert.rejects(
      () => service.openApp(USER_A, "test-app"),
      (err: unknown) => err instanceof AppDisabledError,
    );
  });

  test("✔ Business Rule 4: getFeaturedApps() chỉ trả về featured=true", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "f1", featured: true });
    await service.registerApp({ ...VALID_APP, slug: "f2", featured: true });
    await service.registerApp({ ...VALID_APP, slug: "nf", featured: false });
    const result = await service.getFeaturedApps();
    assert.ok(result.data.every(a => a.featured === true));
    assert.equal(result.total, 2);
  });

  test("✔ Business Rule 5: openApp() cập nhật lastOpenedAt", async () => {
    const { service, userAppRepo } = makeService();
    const created = await service.registerApp(VALID_APP);
    await service.installApp(USER_A, { slug: "test-app" });
    const before = await userAppRepo.findOne(USER_A, created.id);
    assert.equal(before?.lastOpenedAt, undefined);
    await service.openApp(USER_A, "test-app");
    const after = await userAppRepo.findOne(USER_A, created.id);
    assert.ok(after?.lastOpenedAt);
  });

  test("✔ Uninstall rồi install lại → installedAt mới", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const first = await service.installApp(USER_A, { slug: "test-app" });
    await service.uninstallApp(USER_A, "test-app");
    await new Promise(r => setTimeout(r, 5));
    const second = await service.installApp(USER_A, { slug: "test-app" });
    assert.notEqual(first.id, second.id);
  });

  test("✔ getApps() trả về đúng page và limit", async () => {
    const { service } = makeService();
    for (let i = 0; i < 15; i++) {
      await service.registerApp({ ...VALID_APP, slug: `page-${i}` });
    }
    const page1 = await service.getApps({ page: 1, limit: 5 });
    const page2 = await service.getApps({ page: 2, limit: 5 });
    const page3 = await service.getApps({ page: 3, limit: 5 });
    assert.equal(page1.data.length, 5);
    assert.equal(page2.data.length, 5);
    assert.equal(page3.data.length, 5);
    assert.equal(page1.total, 15);
    const slugsPage1 = page1.data.map(a => a.slug);
    const slugsPage2 = page2.data.map(a => a.slug);
    const overlap = slugsPage1.filter(s => slugsPage2.includes(s));
    assert.equal(overlap.length, 0);
  });

  test("✔ registerApp với DISABLED status hoạt động đúng", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, status: "DISABLED" });
    assert.equal(app.status, "DISABLED");
  });

  test("✔ getAppsByCategory trả về đúng category", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "edu-1", category: "EDUCATION" });
    await service.registerApp({ ...VALID_APP, slug: "edu-2", category: "EDUCATION" });
    await service.registerApp({ ...VALID_APP, slug: "ai-1",  category: "AI" });
    const edApps = await service.getAppsByCategory("EDUCATION");
    const aiApps = await service.getAppsByCategory("AI");
    assert.equal(edApps.length, 2);
    assert.equal(aiApps.length, 1);
    assert.ok(edApps.every(a => a.category === "EDUCATION"));
  });

  test("✔ openApp() trên app ACTIVE sau enable hoạt động", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, status: "DISABLED" });
    await service.enableApp("test-app");
    const result = await service.openApp(USER_A, "test-app");
    assert.equal(result.app.status, "ACTIVE");
    assert.ok(result.launchUrl);
  });

  test("✔ Mỗi UserApplication có installedAt hợp lệ", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const ua = await service.installApp(USER_A, { slug: "test-app" });
    const d = new Date(ua.installedAt);
    assert.ok(!isNaN(d.getTime()));
  });

});
