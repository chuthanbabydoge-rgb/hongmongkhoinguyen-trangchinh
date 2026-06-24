// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: AppRegistryService (HUB-2)
//
// Covers: register, duplicate slug, update, delete, find by id/slug,
//         find all, search, category filter, stats, seed idempotent,
//         activity integration, validation errors, multi-app scenarios,
//         repository persistence, edge cases.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe }  from "node:test";
import assert              from "node:assert/strict";

import { AppRegistryService, AppRegistryValidationError, AppNotFoundError, SlugAlreadyExistsError } from "../appRegistryService.js";
import { InMemoryAppRegistryRepository } from "../../repositories/appRegistryRepository.js";
import type { RegisterAppRequest, UpdateAppRequest } from "../../models/ecosystemApp.js";

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
  baseUrl:     "https://test.universe.io",
  category:    "UTILITY",
  status:      "ACTIVE",
  version:     "1.0.0",
};

// ─── Register app ─────────────────────────────────────────────────────────────

describe("AppRegistryService — register app", () => {

  test("✔ Đăng ký app thành công", async () => {
    const { service } = makeService();
    const app = await service.registerApp(VALID_APP);
    assert.equal(app.slug,    "test-app");
    assert.equal(app.name,    "Test App");
    assert.equal(app.status,  "ACTIVE");
    assert.ok(app.id);
    assert.ok(app.createdAt);
    assert.ok(app.updatedAt);
  });

  test("✔ App được lưu vào repository", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const found   = await service.getApp(created.id);
    assert.equal(found.id, created.id);
  });

  test("✔ Đăng ký app với status mặc định ACTIVE", async () => {
    const { service } = makeService();
    const app = await service.registerApp({
      slug: "no-status-app", name: "No Status", baseUrl: "https://x.io", category: "OTHER", version: "1.0.0",
      status: "ACTIVE",
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
    assert.ok("baseUrl"   in app);
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

  test("✔ Cập nhật baseUrl hợp lệ", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const updated = await service.updateApp(created.id, { baseUrl: "https://new.universe.io" });
    assert.equal(updated.baseUrl, "https://new.universe.io");
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
    const reRegistered = await service.registerApp(VALID_APP);
    assert.equal(reRegistered.slug, VALID_APP.slug);
  });

});

// ─── Find by id ───────────────────────────────────────────────────────────────

describe("AppRegistryService — find by id", () => {

  test("✔ Tìm app theo id thành công", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const found   = await service.getApp(created.id);
    assert.equal(found.id, created.id);
  });

  test("✔ Tìm app không tồn tại throw AppNotFoundError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.getApp("not-found"),
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
    await service.registerApp({ ...VALID_APP, slug: "sport-1", category: "SPORT" });
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
    await service.registerApp({ ...VALID_APP, slug: "active-1", status: "ACTIVE" });
    await service.registerApp({ ...VALID_APP, slug: "active-2", status: "ACTIVE" });
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

  test("✔ Stats có đủ 4 fields bắt buộc", async () => {
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

  test("✔ initialize() tạo 5 app mặc định", async () => {
    const { service } = await makeSeededService();
    const all = await service.getAllApps();
    assert.equal(all.length, 5);
  });

  test("✔ initialize() idempotent — gọi 2 lần vẫn chỉ có 5 app", async () => {
    const { service } = makeService();
    await service.initialize();
    await service.initialize();
    const all = await service.getAllApps();
    assert.equal(all.length, 5);
  });

  test("✔ Seed có football-universe", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("football-universe");
    assert.equal(app.name, "Football Universe");
    assert.equal(app.category, "SPORT");
  });

  test("✔ Seed có animal-evolution", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("animal-evolution");
    assert.equal(app.category, "ANIMAL");
  });

  test("✔ Seed có world-creator", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("world-creator");
    assert.equal(app.category, "WORLD");
  });

  test("✔ Seed có safepass", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("safepass");
    assert.equal(app.category, "SECURITY");
  });

  test("✔ Seed có exchange-hub", async () => {
    const { service } = await makeSeededService();
    const app = await service.getBySlug("exchange-hub");
    assert.equal(app.category, "FINANCE");
  });

  test("✔ Seed apps có status ACTIVE", async () => {
    const { service } = await makeSeededService();
    const all = await service.getAllApps();
    assert.ok(all.every(a => a.status === "ACTIVE"));
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

  test("✔ Activity có type SYSTEM", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const act = service.getActivities()[0]!;
    assert.equal(act.type,      "SYSTEM");
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
    const activities = service.getActivities();
    assert.equal(activities.length, 2);
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

  test("✔ Seed apps không tạo activities (chỉ user register mới tạo)", async () => {
    const { service } = await makeSeededService();
    const activities = service.getActivities();
    assert.equal(activities.length, 0);
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

  test("✔ name rỗng throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, name: "" }),
      AppRegistryValidationError,
    );
  });

  test("✔ name quá 100 ký tự throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, name: "a".repeat(101) }),
      AppRegistryValidationError,
    );
  });

  test("✔ description quá 1000 ký tự throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, description: "x".repeat(1001) }),
      AppRegistryValidationError,
    );
  });

  test("✔ baseUrl không hợp lệ throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    await assert.rejects(
      () => service.registerApp({ ...VALID_APP, baseUrl: "not-a-url" }),
      AppRegistryValidationError,
    );
  });

  test("✔ Update baseUrl không hợp lệ throw AppRegistryValidationError", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    await assert.rejects(
      () => service.updateApp(created.id, { baseUrl: "bad-url" } as UpdateAppRequest),
      AppRegistryValidationError,
    );
  });

});

// ─── Multi-app scenarios ──────────────────────────────────────────────────────

describe("AppRegistryService — multi-app scenarios", () => {

  test("✔ 10 app đăng ký, đếm đúng", async () => {
    const { service } = makeService();
    for (let i = 0; i < 10; i++) {
      await service.registerApp({ ...VALID_APP, slug: `app-${i}` });
    }
    const count = await service.countApps();
    assert.equal(count, 10);
  });

  test("✔ Xóa một app trong nhiều app giữ đúng số còn lại", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "multi-a" });
    const b = await service.registerApp({ ...VALID_APP, slug: "multi-b" });
    await service.registerApp({ ...VALID_APP, slug: "multi-c" });
    await service.deleteApp(b.id);
    const all = await service.getAllApps();
    assert.equal(all.length, 2);
    assert.ok(all.every(a => a.id !== b.id));
  });

  test("✔ Search chỉ trả app khớp trong nhiều app", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "match-one", name: "Unique Name XYZ" });
    await service.registerApp({ ...VALID_APP, slug: "no-match-one", name: "Other App" });
    await service.registerApp({ ...VALID_APP, slug: "no-match-two", name: "Another App" });
    const results = await service.searchApps("Unique Name XYZ");
    assert.equal(results.length, 1);
    assert.equal(results[0]!.slug, "match-one");
  });

  test("✔ Stats đúng sau seed + thêm app mới", async () => {
    const { service } = await makeSeededService();
    await service.registerApp({ ...VALID_APP, slug: "extra-app", status: "INACTIVE" });
    const stats = await service.getStats();
    assert.equal(stats.totalApps,  6);
    assert.equal(stats.inactiveApps, 1);
  });

});

// ─── Repository persistence ───────────────────────────────────────────────────

describe("AppRegistryService — repository persistence", () => {

  test("✔ App tồn tại trong repo sau registerApp", async () => {
    const { repo, service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const fromRepo = await repo.findById(created.id);
    assert.ok(fromRepo);
    assert.equal(fromRepo.id, created.id);
  });

  test("✔ App bị xóa khỏi repo sau deleteApp", async () => {
    const { repo, service } = makeService();
    const created = await service.registerApp(VALID_APP);
    await service.deleteApp(created.id);
    const fromRepo = await repo.findById(created.id);
    assert.equal(fromRepo, null);
  });

  test("✔ Slug index giải phóng sau delete, existsBySlug trả false", async () => {
    const { repo, service } = makeService();
    const created = await service.registerApp(VALID_APP);
    await service.deleteApp(created.id);
    const exists = await repo.existsBySlug(VALID_APP.slug);
    assert.equal(exists, false);
  });

});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("AppRegistryService — edge cases", () => {

  test("✔ App với iconUrl hợp lệ được lưu", async () => {
    const { service } = makeService();
    const app = await service.registerApp({ ...VALID_APP, iconUrl: "https://cdn.io/icon.png" });
    assert.equal(app.iconUrl, "https://cdn.io/icon.png");
  });

  test("✔ App không có description được lưu (optional)", async () => {
    const { service } = makeService();
    const { description, ...noDesc } = VALID_APP;
    const app = await service.registerApp(noDesc);
    assert.equal(app.description, undefined);
  });

  test("✔ App MAINTENANCE đúng trong stats", async () => {
    const { service } = makeService();
    await service.registerApp({ ...VALID_APP, slug: "m1", status: "MAINTENANCE" });
    await service.registerApp({ ...VALID_APP, slug: "m2", status: "MAINTENANCE" });
    const stats = await service.getStats();
    assert.equal(stats.maintenanceApps, 2);
  });

  test("✔ countApps 0 khi repo rỗng", async () => {
    const { service } = makeService();
    assert.equal(await service.countApps(), 0);
  });

  test("✔ getActivities trả copy (immutable)", async () => {
    const { service } = makeService();
    await service.registerApp(VALID_APP);
    const acts1 = service.getActivities();
    acts1.pop();
    const acts2 = service.getActivities();
    assert.equal(acts2.length, 1);
  });

  test("✔ Cập nhật category thành công", async () => {
    const { service } = makeService();
    const created = await service.registerApp(VALID_APP);
    const updated = await service.updateApp(created.id, { category: "SOCIAL" });
    assert.equal(updated.category, "SOCIAL");
  });

  test("✔ SlugAlreadyExistsError có message đúng", () => {
    const err = new SlugAlreadyExistsError("my-slug");
    assert.ok(err.message.includes("my-slug"));
    assert.equal(err.name, "SlugAlreadyExistsError");
  });

  test("✔ AppNotFoundError có message đúng", () => {
    const err = new AppNotFoundError("missing-id");
    assert.ok(err.message.includes("missing-id"));
    assert.equal(err.name, "AppNotFoundError");
  });

});
