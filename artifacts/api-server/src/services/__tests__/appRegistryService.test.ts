// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: AppRegistryService (HUB-2)
//
// Covers: register, duplicate slug, update, delete, find by id/slug,
//         find all, search, category filter, stats, seed idempotent,
//         activity integration, validation errors.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert              from "node:assert/strict";

import {
  AppRegistryService,
  AppRegistryValidationError,
  AppNotFoundError,
  SlugAlreadyExistsError,
} from "../appRegistryService.js";
import { InMemoryAppRegistryRepository } from "../../repositories/appRegistryRepository.js";
import type { RegisterAppRequest } from "../../models/appRegistry.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeService() {
  const repo    = new InMemoryAppRegistryRepository();
  const service = new AppRegistryService(repo);
  return { repo, service };
}

async function makeSeededService() {
  const { repo, service } = makeService();
  await service.initialize();
  return { repo, service };
}

const VALID_APP: RegisterAppRequest = {
  slug:        "test-app",
  name:        "Test App",
  description: "A test application",
  url:         "https://test.universe.io",
  category:    "UTILITY",
  status:      "ACTIVE",
  version:     "1.0.0",
};

// ─── Register app ─────────────────────────────────────────────────────────────

describe("AppRegistryService — register app", () => {

  test("✔ Đăng ký app thành công", async () => {
    const { service } = makeService();
    const app = await service.registerApp(VALID_APP);
    assert.equal(app.slug,   "test-app");
    assert.equal(app.name,   "Test App");
    assert.equal(app.status, "ACTIVE");
    assert.ok(app.id);
    assert.ok(app.createdAt);
    assert.ok(app.updatedAt);
  });

  test("✔ App được lưu vào repository", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const found   = await service.getAppById(created.id);
    assert.equal(found.id, created.id);
  });

  test("✔ Đăng ký app với status mặc định ACTIVE", async () => {
    const { service } = makeService();
    const app = await service.registerApp({
      slug: "no-status-app", name: "No Status", url: "https://x.io",
      category: "OTHER", version: "1.0.0",
    });
    assert.equal(app.status, "ACTIVE");
  });

  test("✔ Đăng ký nhiều app khác nhau", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "app-a", name: "App A" });
    await service.registerApp({ ...VALID_APP, slug: "app-b", name: "App B" });
    const all = await service.getAllApps();
    assert.equal(all.length, 2);
  });

  test("✔ App có đủ fields sau khi đăng ký", async () => {
    const { service } = makeService();
    const app = await service.registerApp(VALID_APP);
    assert.ok("id"        in app);
    assert.ok("slug"      in app);
    assert.ok("name"      in app);
    assert.ok("url"       in app);
    assert.ok("category"  in app);
    assert.ok("status"    in app);
    assert.ok("version"   in app);
    assert.ok("createdAt" in app);
    assert.ok("updatedAt" in app);
  });

});

// ─── Duplicate slug ───────────────────────────────────────────────────────────

describe("AppRegistryService — duplicate slug", () => {

  test("✔ Đăng ký slug trùng throw SlugAlreadyExistsError", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP }),
      SlugAlreadyExistsError,
    );
  });

  test("✔ Slug trùng không tạo app mới", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    try { await service.registerApp(VALID_APP); } catch { /* expected */ }
    const all = await service.getAllApps();
    assert.equal(all.length, 1);
  });

  test("✔ Slug khác nhau không bị lỗi trùng", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "unique-a" });
    const app = await service.registerApp({ ...VALID_APP, slug: "unique-b" });
    assert.equal(app.slug, "unique-b");
  });

});

// ─── Update ───────────────────────────────────────────────────────────────────

describe("AppRegistryService — update", () => {

  test("✔ Cập nhật name thành công", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const updated = await service.updateApp(created.id, { name: "Updated Name" });
    assert.equal(updated.name, "Updated Name");
    assert.equal(updated.id,   created.id);
  });

  test("✔ Cập nhật status thành công", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const updated = await service.updateApp(created.id, { status: "MAINTENANCE" });
    assert.equal(updated.status, "MAINTENANCE");
  });

  test("✔ Cập nhật version thành công", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const updated = await service.updateApp(created.id, { version: "2.0.0" });
    assert.equal(updated.version, "2.0.0");
  });

  test("✔ Cập nhật app không tồn tại throw AppNotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.updateApp("nonexistent-id", { name: "X" }),
      AppNotFoundError,
    );
  });

  test("✔ updatedAt thay đổi sau khi update", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    await new Promise(r => setTimeout(r, 5));
    const updated = await service.updateApp(created.id, { name: "New Name" });
    assert.ok(updated.updatedAt >= created.updatedAt);
  });

  test("✔ Cập nhật url hợp lệ", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const updated = await service.updateApp(created.id, { url: "https://new.universe.io" });
    assert.equal(updated.url, "https://new.universe.io");
  });

});

// ─── Delete ───────────────────────────────────────────────────────────────────

describe("AppRegistryService — delete", () => {

  test("✔ Xóa app thành công", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const result  = await service.deleteApp(created.id);
    assert.equal(result, true);
  });

  test("✔ App bị xóa không còn trong danh sách", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    await service.deleteApp(created.id);
    const all = await service.getAllApps();
    assert.equal(all.length, 0);
  });

  test("✔ Xóa app không tồn tại throw AppNotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.deleteApp("nonexistent-id"),
      AppNotFoundError,
    );
  });

  test("✔ Sau khi xóa, slug được giải phóng để đăng ký lại", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    await service.deleteApp(created.id);
    const reReg = await service.registerApp(VALID_APP);
    assert.equal(reReg.slug, VALID_APP.slug);
  });

});

// ─── Find by id ───────────────────────────────────────────────────────────────

describe("AppRegistryService — find by id", () => {

  test("✔ Tìm app theo id thành công", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const found   = await service.getAppById(created.id);
    assert.equal(found.id, created.id);
  });

  test("✔ Tìm app không tồn tại throw AppNotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.getAppById("not-found"),
      AppNotFoundError,
    );
  });

});

// ─── Find by slug ─────────────────────────────────────────────────────────────

describe("AppRegistryService — find by slug", () => {

  test("✔ Tìm app theo slug thành công", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const found = await service.getBySlug("test-app");
    assert.equal(found.slug, "test-app");
  });

  test("✔ Tìm slug không tồn tại throw AppNotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.getBySlug("not-a-slug"),
      AppNotFoundError,
    );
  });

});

// ─── Find all ─────────────────────────────────────────────────────────────────

describe("AppRegistryService — find all", () => {

  test("✔ getAllApps trả danh sách rỗng khi không có app", async () => {
    const { service } = makeService();
    const all = await service.getAllApps();
    assert.equal(all.length, 0);
  });

  test("✔ getAllApps trả đúng số app đã đăng ký", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "a1" });
    await service.registerApp({ ...VALID_APP, slug: "a2" });
    await service.registerApp({ ...VALID_APP, slug: "a3" });
    const all = await service.getAllApps();
    assert.equal(all.length, 3);
  });

  test("✔ countApps đúng sau nhiều thao tác", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "c1" });
    await service.registerApp({ ...VALID_APP, slug: "c2" });
    const n = await service.countApps();
    assert.equal(n, 2);
  });

});

// ─── Search ───────────────────────────────────────────────────────────────────

describe("AppRegistryService — search", () => {

  test("✔ Tìm theo name không phân biệt hoa thường", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const results = await service.searchApps("TEST APP");
    assert.equal(results.length, 1);
  });

  test("✔ Tìm theo slug", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const results = await service.searchApps("test-app");
    assert.equal(results.length, 1);
  });

  test("✔ Tìm theo description", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const results = await service.searchApps("test application");
    assert.equal(results.length, 1);
  });

  test("✔ Từ khóa không khớp trả mảng rỗng", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const results = await service.searchApps("nonexistent-xyz");
    assert.equal(results.length, 0);
  });

  test("✔ Tìm kiếm rỗng trả tất cả", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "s1" });
    await service.registerApp({ ...VALID_APP, slug: "s2" });
    const results = await service.searchApps("");
    assert.equal(results.length, 2);
  });

  test("✔ Tìm kiếm trả nhiều kết quả", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "universe-a", name: "Universe App A" });
    await service.registerApp({ ...VALID_APP, slug: "universe-b", name: "Universe App B" });
    await service.registerApp({ ...VALID_APP, slug: "other-app",  name: "Other App" });
    const results = await service.searchApps("universe");
    assert.equal(results.length, 2);
  });

});

// ─── Category filter ──────────────────────────────────────────────────────────

describe("AppRegistryService — category filter", () => {

  test("✔ Lọc theo SPORT", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "sport-1",   category: "SPORT" });
    await service.registerApp({ ...VALID_APP, slug: "finance-1", category: "FINANCE" });
    const results = await service.getAppsByCategory("SPORT");
    assert.equal(results.length, 1);
    assert.equal(results[0]!.category, "SPORT");
  });

  test("✔ Lọc theo FINANCE", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "f1", category: "FINANCE" });
    await service.registerApp({ ...VALID_APP, slug: "f2", category: "FINANCE" });
    const results = await service.getAppsByCategory("FINANCE");
    assert.equal(results.length, 2);
  });

  test("✔ Category không có app trả mảng rỗng", async () => {
    const { service } = makeService();
    const results = await service.getAppsByCategory("AI");
    assert.equal(results.length, 0);
  });

  test("✔ Tất cả categories được hỗ trợ", async () => {
    const { service } = makeService();
    const categories = ["SPORT","ANIMAL","WORLD","FINANCE","SECURITY","SOCIAL","AI","UTILITY","OTHER"] as const;
    for (const cat of categories) {
      const results = await service.getAppsByCategory(cat);
      assert.ok(Array.isArray(results));
    }
  });

});

// ─── Stats ────────────────────────────────────────────────────────────────────

describe("AppRegistryService — stats", () => {

  test("✔ Stats trả đúng totalApps", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "s1" });
    await service.registerApp({ ...VALID_APP, slug: "s2" });
    const stats = await service.getStats();
    assert.equal(stats.totalApps, 2);
  });

  test("✔ Stats đếm activeApps đúng", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "active-1",   status: "ACTIVE" });
    await service.registerApp({ ...VALID_APP, slug: "active-2",   status: "ACTIVE" });
    await service.registerApp({ ...VALID_APP, slug: "inactive-1", status: "INACTIVE" });
    const stats = await service.getStats();
    assert.equal(stats.activeApps, 2);
  });

  test("✔ Stats đếm maintenanceApps đúng", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "maint-1", status: "MAINTENANCE" });
    const stats = await service.getStats();
    assert.equal(stats.maintenanceApps, 1);
    assert.equal(stats.inactiveApps,    0);
  });

  test("✔ Stats categories map đúng", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "sport-a", category: "SPORT" });
    await service.registerApp({ ...VALID_APP, slug: "sport-b", category: "SPORT" });
    await service.registerApp({ ...VALID_APP, slug: "world-a", category: "WORLD" });
    const stats = await service.getStats();
    assert.equal(stats.categories["SPORT"], 2);
    assert.equal(stats.categories["WORLD"], 1);
  });

  test("✔ Stats rỗng khi không có app", async () => {
    const { service } = makeService();
    const stats = await service.getStats();
    assert.equal(stats.totalApps,       0);
    assert.equal(stats.activeApps,      0);
    assert.equal(stats.maintenanceApps, 0);
    assert.equal(stats.inactiveApps,    0);
    assert.deepEqual(stats.categories,  {});
  });

  test("✔ Stats có đủ fields bắt buộc", async () => {
    const { service } = makeService();
    const stats = await service.getStats();
    assert.ok("totalApps"       in stats);
    assert.ok("activeApps"      in stats);
    assert.ok("maintenanceApps" in stats);
    assert.ok("inactiveApps"    in stats);
    assert.ok("categories"      in stats);
  });

});

// ─── Seed idempotent ──────────────────────────────────────────────────────────

describe("AppRegistryService — seed idempotent", () => {

  test("✔ initialize() tạo 6 app mặc định", async () => {
    const { service } = await makeSeededService();
    const all = await service.getAllApps();
    assert.equal(all.length, 6);
  });

  test("✔ initialize() idempotent — gọi 2 lần vẫn chỉ có 6 app", async () => {
    const { service } = makeService();
    await service.initialize();
    await service.initialize();
    const all = await service.getAllApps();
    assert.equal(all.length, 6);
  });

  test("✔ Seed có account", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("account");
    assert.equal(app.category, "SECURITY");
    assert.equal(app.status,   "ACTIVE");
  });

  test("✔ Seed có marketplace", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("marketplace");
    assert.equal(app.category, "FINANCE");
  });

  test("✔ Seed có wallet", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("wallet");
    assert.equal(app.category, "FINANCE");
  });

  test("✔ Seed có social", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("social");
    assert.equal(app.category, "SOCIAL");
  });

  test("✔ Seed có worlds", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("worlds");
    assert.equal(app.category, "WORLD");
  });

  test("✔ Seed có ai-studio", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("ai-studio");
    assert.equal(app.category, "AI");
  });

  test("✔ Tất cả seed apps có status ACTIVE", async () => {
    const { service } = await makeSeededService();
    const all = await service.getAllApps();
    assert.ok(all.every(a => a.status === "ACTIVE"));
  });

  test("✔ Seed apps có url hợp lệ", async () => {
    const { service } = await makeSeededService();
    const all = await service.getAllApps();
    for (const app of all) {
      assert.ok(app.url.startsWith("https://"), `${app.slug}.url phải là https`);
    }
  });

});

// ─── Activity integration ─────────────────────────────────────────────────────

describe("AppRegistryService — activity integration", () => {

  test("✔ Đăng ký app mới tạo activity", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const activities = service.getActivities();
    assert.equal(activities.length, 1);
  });

  test("✔ Activity có type SYSTEM và visibility PUBLIC", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const act = service.getActivities()[0]!;
    assert.equal(act.type,       "SYSTEM");
    assert.equal(act.visibility, "PUBLIC");
    assert.equal(act.sourceApp,  "universe-hub");
  });

  test("✔ Activity description chứa tên app", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const act = service.getActivities()[0]!;
    assert.ok(act.description.includes("Test App"));
  });

  test("✔ Nhiều đăng ký tạo nhiều activities", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "app-x" });
    await service.registerApp({ ...VALID_APP, slug: "app-y" });
    assert.equal(service.getActivities().length, 2);
  });

  test("✔ Activity title là 'New Ecosystem App'", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const act = service.getActivities()[0]!;
    assert.equal(act.title, "New Ecosystem App");
  });

  test("✔ Activity có id và createdAt", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const act = service.getActivities()[0]!;
    assert.ok(act.id);
    assert.ok(act.createdAt);
  });

  test("✔ Seed apps không tạo activities", async () => {
    const { service } = await makeSeededService();
    assert.equal(service.getActivities().length, 0);
  });

});

// ─── Validation errors ────────────────────────────────────────────────────────

describe("AppRegistryService — validation errors", () => {

  test("✔ Thiếu slug throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "" }),
      AppRegistryValidationError,
    );
  });

  test("✔ Slug chứa ký tự hoa throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "Invalid-Slug" }),
      AppRegistryValidationError,
    );
  });

  test("✔ Slug chứa khoảng trắng throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "my slug" }),
      AppRegistryValidationError,
    );
  });

  test("✔ Thiếu name throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "ok-slug", name: "" }),
      AppRegistryValidationError,
    );
  });

  test("✔ URL không hợp lệ throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "bad-url", url: "not-a-url" }),
      AppRegistryValidationError,
    );
  });

  test("✔ Category không hợp lệ throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "bad-cat", category: "UNKNOWN" as never }),
      AppRegistryValidationError,
    );
  });

  test("✔ Status không hợp lệ throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "bad-status", status: "DELETED" as never }),
      AppRegistryValidationError,
    );
  });

  test("✔ icon URL không hợp lệ throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "bad-icon", icon: "not-a-url" }),
      AppRegistryValidationError,
    );
  });

  test("✔ Update với url không hợp lệ throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    await assert.rejects(
      () => service.updateApp(created.id, { url: "bad-url" }),
      AppRegistryValidationError,
    );
  });

  test("✔ Update với category không hợp lệ throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    await assert.rejects(
      () => service.updateApp(created.id, { category: "INVALID" as never }),
      AppRegistryValidationError,
    );
  });

  test("✔ Thiếu version throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, slug: "no-ver", version: "" }),
      AppRegistryValidationError,
    );
  });

});
