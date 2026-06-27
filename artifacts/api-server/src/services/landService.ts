// ─────────────────────────────────────────────────────────────────────────────
// LandService — HUB-28
// ─────────────────────────────────────────────────────────────────────────────

import type { ILandRepository } from "../repositories/drizzle/DrizzleLandRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService }    from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { landEventBus } from "../realtime/landEventBus.js";

// ─── Error ────────────────────────────────────────────────────────────────────

export class LandError extends Error {
  constructor(message: string, public code: string, public status = 400) {
    super(message);
    this.name = "LandError";
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function resolveUserId(auth: string | undefined): string | undefined {
  if (!auth) return undefined;
  try {
    const payload = auth.replace("Bearer ", "").split(".")[1];
    if (!payload) return undefined;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return (decoded as Record<string, unknown>)["sub"] as string | undefined
      || (decoded as Record<string, unknown>)["userId"] as string | undefined
      || (decoded as Record<string, unknown>)["id"] as string | undefined;
  } catch { return undefined; }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class LandService {
  constructor(
    public  readonly repo:           ILandRepository,
    private readonly notifService:   NotificationsService,
    private readonly actService:     ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  // ── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard() {
    const [regions, cities, parcels, buildings, projects, listings, stats] = await Promise.all([
      this.repo.listRegions({ limit: 5 }),
      this.repo.listCities({ limit: 5 }),
      this.repo.listParcels({ limit: 5 }),
      this.repo.listBuildings({ limit: 5 }),
      this.repo.listProjects({ limit: 5 }),
      this.repo.listListings({ limit: 5 }),
      this.repo.getStats(),
    ]);
    const [totalRegions, totalCities, totalParcels, totalBuildings, totalListings] = await Promise.all([
      this.repo.countRegions(),
      this.repo.countCities(),
      this.repo.countParcels(),
      this.repo.countBuildings(),
      this.repo.countListings(),
    ]);
    return { regions, cities, parcels, buildings, projects, listings, stats, totals: { regions: totalRegions, cities: totalCities, parcels: totalParcels, buildings: totalBuildings, listings: totalListings } };
  }

  // ── Regions ────────────────────────────────────────────────────────────────

  async listRegions(opts: { search?: string; limit?: number; offset?: number } = {}) {
    return this.repo.listRegions(opts);
  }

  async getRegion(id: string) {
    const region = await this.repo.getRegion(id);
    if (!region) throw new LandError("Không tìm thấy vùng", "REGION_NOT_FOUND", 404);
    return region;
  }

  async createRegion(input: { name: string; slug: string; description?: string; biome?: string }, auth?: string) {
    const region = await this.repo.createRegion({ ...input, biome: input.biome ?? "TEMPERATE", mapX: 0, mapY: 0, width: 1000, height: 1000, maxCities: 10, isActive: true });
    landEventBus.emit("LAND_CREATED", { regionId: region.id, name: region.name });
    const userId = resolveUserId(auth);
    if (userId) {
      await Promise.all([
        this.actService.createActivity({ userId, type: "LAND_CREATED" as never, title: "Tạo vùng mới", description: `Tạo vùng ${region.name}`, metadata: { regionId: region.id } }),
        this.reputationRepo.upsert(userId, 10),
      ]).catch(() => {});
    }
    return region;
  }

  async updateRegion(id: string, input: Record<string, unknown>) {
    const region = await this.repo.updateRegion(id, input as never);
    if (!region) throw new LandError("Không tìm thấy vùng", "REGION_NOT_FOUND", 404);
    landEventBus.emit("LAND_CREATED", { regionId: region.id });
    return region;
  }

  async deleteRegion(id: string) {
    const ok = await this.repo.deleteRegion(id);
    if (!ok) throw new LandError("Không thể xóa vùng", "DELETE_FAILED", 404);
    return { success: true };
  }

  // ── Cities ─────────────────────────────────────────────────────────────────

  async listCities(opts: { regionId?: string; search?: string; limit?: number; offset?: number } = {}) {
    return this.repo.listCities(opts);
  }

  async getCity(id: string) {
    const city = await this.repo.getCity(id);
    if (!city) throw new LandError("Không tìm thấy thành phố", "CITY_NOT_FOUND", 404);
    return city;
  }

  async createCity(input: { regionId: string; name: string; slug: string; type?: string }, auth?: string) {
    const city = await this.repo.createCity({ ...input, type: (input.type ?? "CITY") as never, population: 0, taxRate: 0.05, mapX: 0, mapY: 0, isActive: true });
    landEventBus.emit("CITY_CREATED", { cityId: city.id, name: city.name });
    const userId = resolveUserId(auth);
    if (userId) {
      await this.actService.createActivity({ userId, type: "CITY_CREATED" as never, title: "Tạo thành phố", description: `Tạo thành phố ${city.name}`, metadata: { cityId: city.id } }).catch(() => {});
    }
    return city;
  }

  async updateCity(id: string, input: Record<string, unknown>) {
    const city = await this.repo.updateCity(id, input as never);
    if (!city) throw new LandError("Không tìm thấy thành phố", "CITY_NOT_FOUND", 404);
    return city;
  }

  async deleteCity(id: string) {
    const ok = await this.repo.deleteCity(id);
    if (!ok) throw new LandError("Không thể xóa thành phố", "DELETE_FAILED", 404);
    return { success: true };
  }

  // ── Districts ──────────────────────────────────────────────────────────────

  async listDistricts(opts: { cityId?: string; type?: string; limit?: number } = {}) {
    return this.repo.listDistricts(opts);
  }

  async getDistrict(id: string) {
    const district = await this.repo.getDistrict(id);
    if (!district) throw new LandError("Không tìm thấy quận/huyện", "DISTRICT_NOT_FOUND", 404);
    return district;
  }

  async createDistrict(input: { cityId: string; name: string; slug: string; type?: string }, auth?: string) {
    const district = await this.repo.createDistrict({ ...input, type: (input.type ?? "MIXED") as never, maxParcels: 100, landValueBase: 100, mapX: 0, mapY: 0, isActive: true });
    landEventBus.emit("DISTRICT_CREATED", { districtId: district.id, name: district.name });
    const userId = resolveUserId(auth);
    if (userId) {
      await this.actService.createActivity({ userId, type: "DISTRICT_CREATED" as never, title: "Tạo quận mới", description: `Tạo quận ${district.name}`, metadata: { districtId: district.id } }).catch(() => {});
    }
    return district;
  }

  async updateDistrict(id: string, input: Record<string, unknown>) {
    const district = await this.repo.updateDistrict(id, input as never);
    if (!district) throw new LandError("Không tìm thấy quận/huyện", "DISTRICT_NOT_FOUND", 404);
    return district;
  }

  // ── Parcels ────────────────────────────────────────────────────────────────

  async listParcels(opts: { districtId?: string; status?: string; type?: string; search?: string; limit?: number; offset?: number } = {}) {
    return this.repo.listParcels(opts);
  }

  async getParcel(id: string) {
    const parcel = await this.repo.getParcel(id);
    if (!parcel) throw new LandError("Không tìm thấy ô đất", "PARCEL_NOT_FOUND", 404);
    const [ownership, buildings, ratings] = await Promise.all([
      this.repo.getOwnership(id),
      this.repo.listBuildings({ parcelId: id }),
      this.repo.listRatings(id),
    ]);
    return { parcel, ownership, buildings, ratings };
  }

  async createParcel(input: { districtId: string; name: string; slug: string; type?: string; size?: number; baseValue?: number }, auth?: string) {
    const baseValue = input.baseValue ?? 1000;
    const parcel = await this.repo.createParcel({
      ...input,
      type: (input.type ?? "RESIDENTIAL") as never,
      status: "AVAILABLE",
      size: input.size ?? 100,
      baseValue,
      currentValue: baseValue,
      mapX: 0, mapY: 0, width: 10, height: 10, maxBuildings: 5,
    });
    landEventBus.emit("LAND_CREATED", { parcelId: parcel.id, name: parcel.name });
    const userId = resolveUserId(auth);
    if (userId) {
      await Promise.all([
        this.actService.createActivity({ userId, type: "LAND_CREATED" as never, title: "Tạo ô đất mới", description: `Tạo ô đất ${parcel.name}`, metadata: { parcelId: parcel.id } }),
        this.reputationRepo.upsert(userId, 5),
      ]).catch(() => {});
    }
    return parcel;
  }

  async updateParcel(id: string, input: Record<string, unknown>) {
    const parcel = await this.repo.updateParcel(id, input as never);
    if (!parcel) throw new LandError("Không tìm thấy ô đất", "PARCEL_NOT_FOUND", 404);
    return parcel;
  }

  async buyParcel(id: string, auth?: string) {
    const parcel = await this.repo.getParcel(id);
    if (!parcel) throw new LandError("Không tìm thấy ô đất", "PARCEL_NOT_FOUND", 404);
    if (parcel.status === "OWNED") throw new LandError("Ô đất đã có chủ", "PARCEL_OWNED", 409);
    const userId = resolveUserId(auth);
    if (!userId) throw new LandError("Cần đăng nhập", "UNAUTHORIZED", 401);
    const ownership = await this.repo.transferOwnership(id, userId, parcel.currentValue);
    landEventBus.emit("LAND_PURCHASED", { parcelId: id, buyerId: userId, price: parcel.currentValue });
    await Promise.all([
      this.actService.createActivity({ userId, type: "LAND_PURCHASED" as never, title: "Mua đất thành công", description: `Mua ô đất ${parcel.name}`, metadata: { parcelId: id } }),
      this.notifService.create({ userId, type: "ACHIEVEMENT" as never, title: "Mua đất thành công!", message: `Bạn đã mua ${parcel.name}` }),
      this.reputationRepo.upsert(userId, 20),
    ]).catch(() => {});
    return { parcel, ownership };
  }

  async sellParcel(id: string, price: number, auth?: string) {
    const parcel = await this.repo.getParcel(id);
    if (!parcel) throw new LandError("Không tìm thấy ô đất", "PARCEL_NOT_FOUND", 404);
    const userId = resolveUserId(auth);
    const listing = await this.repo.createListing({ parcelId: id, sellerId: userId ?? "system", price, listingType: "SALE", isActive: true });
    landEventBus.emit("LAND_SOLD", { parcelId: id, sellerId: userId, price });
    return listing;
  }

  async rentParcel(id: string, input: { duration: number; price: number }, auth?: string) {
    const parcel = await this.repo.getParcel(id);
    if (!parcel) throw new LandError("Không tìm thấy ô đất", "PARCEL_NOT_FOUND", 404);
    const userId = resolveUserId(auth);
    const listing = await this.repo.createListing({ parcelId: id, sellerId: userId ?? "system", price: input.price, listingType: "RENT", rentalDuration: input.duration, isActive: true });
    landEventBus.emit("LAND_RENTED", { parcelId: id, userId, price: input.price });
    return listing;
  }

  // ── Buildings ──────────────────────────────────────────────────────────────

  async listBuildings(opts: { parcelId?: string; ownerId?: string; status?: string; limit?: number } = {}) {
    return this.repo.listBuildings(opts);
  }

  async getBuilding(id: string) {
    const building = await this.repo.getBuilding(id);
    if (!building) throw new LandError("Không tìm thấy công trình", "BUILDING_NOT_FOUND", 404);
    return building;
  }

  async createBuilding(input: { parcelId: string; name: string; type: string; templateId?: string }, auth?: string) {
    const userId = resolveUserId(auth) ?? "system";
    const building = await this.repo.createBuilding({
      parcelId: input.parcelId,
      templateId: input.templateId,
      ownerId: userId,
      name: input.name,
      type: input.type as never,
      status: "UNDER_CONSTRUCTION",
      level: 1,
      health: 100,
      maxHealth: 100,
      value: 1000,
      incomeRate: 0,
      mapX: 0, mapY: 0,
    });
    landEventBus.emit("BUILDING_CREATED", { buildingId: building.id, parcelId: input.parcelId, type: input.type });
    await Promise.all([
      this.actService.createActivity({ userId, type: "BUILDING_CREATED" as never, title: "Xây công trình mới", description: `Xây ${building.name}`, metadata: { buildingId: building.id } }),
      this.reputationRepo.upsert(userId, 15),
    ]).catch(() => {});
    return building;
  }

  async upgradeBuilding(id: string, auth?: string) {
    const building = await this.repo.getBuilding(id);
    if (!building) throw new LandError("Không tìm thấy công trình", "BUILDING_NOT_FOUND", 404);
    const upgraded = await this.repo.updateBuilding(id, { level: building.level + 1, value: building.value * 1.5 });
    if (!upgraded) throw new LandError("Không thể nâng cấp", "UPGRADE_FAILED");
    landEventBus.emit("BUILDING_UPGRADED", { buildingId: id, newLevel: upgraded.level });
    const userId = resolveUserId(auth);
    if (userId) await this.reputationRepo.upsert(userId, 10).catch(() => {});
    return upgraded;
  }

  async destroyBuilding(id: string, auth?: string) {
    const ok = await this.repo.deleteBuilding(id);
    if (!ok) throw new LandError("Không thể phá dỡ công trình", "DESTROY_FAILED", 404);
    landEventBus.emit("BUILDING_DESTROYED", { buildingId: id });
    const userId = resolveUserId(auth);
    if (userId) await this.reputationRepo.upsert(userId, -5).catch(() => {});
    return { success: true };
  }

  // ── Building Templates ─────────────────────────────────────────────────────

  async listTemplates() { return this.repo.listTemplates(); }
  async getTemplate(id: string) {
    const t = await this.repo.getTemplate(id);
    if (!t) throw new LandError("Không tìm thấy mẫu", "TEMPLATE_NOT_FOUND", 404);
    return t;
  }

  // ── Construction ───────────────────────────────────────────────────────────

  async listProjects(opts: { parcelId?: string; ownerId?: string; status?: string; limit?: number } = {}) {
    return this.repo.listProjects(opts);
  }

  async getProject(id: string) {
    const proj = await this.repo.getProject(id);
    if (!proj) throw new LandError("Không tìm thấy dự án", "PROJECT_NOT_FOUND", 404);
    return proj;
  }

  async createProject(input: { parcelId: string; name: string; type: string; cost?: number; workers?: number }, auth?: string) {
    const userId = resolveUserId(auth) ?? "system";
    const project = await this.repo.createProject({
      parcelId: input.parcelId,
      ownerId: userId,
      name: input.name,
      type: input.type as never,
      status: "QUEUED",
      progress: 0,
      totalSteps: 100,
      cost: input.cost ?? 1000,
      workers: input.workers ?? 1,
    });
    landEventBus.emit("CONSTRUCTION_STARTED", { projectId: project.id, parcelId: input.parcelId });
    await this.actService.createActivity({ userId, type: "CONSTRUCTION_STARTED" as never, title: "Khởi công dự án", description: `Khởi công ${project.name}`, metadata: { projectId: project.id } }).catch(() => {});
    return project;
  }

  async completeProject(id: string, auth?: string) {
    const project = await this.repo.completeProject(id);
    if (!project) throw new LandError("Không tìm thấy dự án", "PROJECT_NOT_FOUND", 404);
    landEventBus.emit("CONSTRUCTION_COMPLETED", { projectId: id, parcelId: project.parcelId });
    const userId = resolveUserId(auth);
    if (userId) await this.reputationRepo.upsert(userId, 25).catch(() => {});
    return project;
  }

  async cancelProject(id: string) {
    const project = await this.repo.cancelProject(id);
    if (!project) throw new LandError("Không tìm thấy dự án", "PROJECT_NOT_FOUND", 404);
    return project;
  }

  // ── Roads ──────────────────────────────────────────────────────────────────

  async listRoads(opts: { districtId?: string; type?: string; limit?: number } = {}) {
    return this.repo.listRoads(opts);
  }

  async createRoad(input: { name: string; type?: string; districtId?: string; fromX?: number; fromY?: number; toX?: number; toY?: number }, auth?: string) {
    const road = await this.repo.createRoad({
      name: input.name,
      type: (input.type ?? "STREET") as never,
      districtId: input.districtId,
      fromX: input.fromX ?? 0, fromY: input.fromY ?? 0,
      toX: input.toX ?? 0, toY: input.toY ?? 0,
      length: 100, speedLimit: 50, lanes: 2, isActive: true,
    });
    landEventBus.emit("ROAD_CREATED", { roadId: road.id, name: road.name });
    return road;
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  async listUtilities(opts: { districtId?: string; type?: string } = {}) {
    return this.repo.listUtilities(opts);
  }

  async createUtility(input: { name: string; type: string; districtId?: string; capacity?: number; costPerUnit?: number }, auth?: string) {
    const utility = await this.repo.createUtility({
      name: input.name,
      type: input.type as never,
      districtId: input.districtId,
      capacity: input.capacity ?? 1000,
      usage: 0,
      costPerUnit: input.costPerUnit ?? 0.1,
      isActive: true,
    });
    landEventBus.emit("UTILITY_CONNECTED", { utilityId: utility.id, type: input.type });
    return utility;
  }

  // ── Teleports ──────────────────────────────────────────────────────────────

  async listTeleports(opts: { type?: string } = {}) {
    return this.repo.listTeleports(opts);
  }

  async getTeleport(id: string) {
    const t = await this.repo.getTeleport(id);
    if (!t) throw new LandError("Không tìm thấy cổng dịch chuyển", "TELEPORT_NOT_FOUND", 404);
    return t;
  }

  async createTeleport(input: { name: string; type?: string; parcelId?: string; destinationX?: number; destinationY?: number; cooldown?: number; cost?: number }, auth?: string) {
    const teleport = await this.repo.createTeleport({
      name: input.name,
      type: (input.type ?? "PUBLIC") as never,
      parcelId: input.parcelId,
      ownerId: resolveUserId(auth),
      destinationX: input.destinationX ?? 0,
      destinationY: input.destinationY ?? 0,
      cooldown: input.cooldown ?? 300,
      cost: input.cost ?? 0,
      isActive: true,
    });
    return teleport;
  }

  async useTeleport(id: string, auth?: string) {
    const teleport = await this.repo.useTeleport(id);
    if (!teleport) throw new LandError("Không tìm thấy cổng dịch chuyển", "TELEPORT_NOT_FOUND", 404);
    landEventBus.emit("TELEPORT_USED", { teleportId: id, userId: resolveUserId(auth) });
    return teleport;
  }

  // ── Bookmarks ──────────────────────────────────────────────────────────────

  async listBookmarks(auth?: string) {
    const userId = resolveUserId(auth);
    if (!userId) throw new LandError("Cần đăng nhập", "UNAUTHORIZED", 401);
    return this.repo.listBookmarks(userId);
  }

  async addBookmark(parcelId: string, note?: string, auth?: string) {
    const userId = resolveUserId(auth);
    if (!userId) throw new LandError("Cần đăng nhập", "UNAUTHORIZED", 401);
    return this.repo.addBookmark(userId, parcelId, note);
  }

  async removeBookmark(parcelId: string, auth?: string) {
    const userId = resolveUserId(auth);
    if (!userId) throw new LandError("Cần đăng nhập", "UNAUTHORIZED", 401);
    return this.repo.removeBookmark(userId, parcelId);
  }

  // ── Permissions ────────────────────────────────────────────────────────────

  async listPermissions(parcelId: string) { return this.repo.listPermissions(parcelId); }
  async grantPermission(parcelId: string, userId: string, perms: { canBuild?: boolean; canDestroy?: boolean; canVisit?: boolean; canManage?: boolean }, grantedBy: string) {
    return this.repo.grantPermission({ parcelId, userId, grantedBy, canBuild: perms.canBuild ?? false, canDestroy: perms.canDestroy ?? false, canVisit: perms.canVisit ?? true, canManage: perms.canManage ?? false });
  }
  async revokePermission(id: string) { return this.repo.revokePermission(id); }

  // ── Visitors ───────────────────────────────────────────────────────────────

  async recordVisit(parcelId: string, auth?: string) {
    const userId = resolveUserId(auth) ?? "anonymous";
    await this.repo.recordVisit(parcelId, userId);
    return { success: true };
  }

  async getVisitors(parcelId: string, limit?: number) { return this.repo.getVisitors(parcelId, limit); }

  // ── Ratings ────────────────────────────────────────────────────────────────

  async rateParcel(parcelId: string, rating: number, review?: string, auth?: string) {
    const userId = resolveUserId(auth);
    if (!userId) throw new LandError("Cần đăng nhập", "UNAUTHORIZED", 401);
    return this.repo.rateParcel(parcelId, userId, rating, review);
  }

  // ── Marketplace ────────────────────────────────────────────────────────────

  async listMarketplace(opts: { isActive?: boolean; listingType?: string; limit?: number; offset?: number } = {}) {
    return this.repo.listListings(opts);
  }

  async getListing(id: string) {
    const listing = await this.repo.getListing(id);
    if (!listing) throw new LandError("Không tìm thấy listing", "LISTING_NOT_FOUND", 404);
    return listing;
  }

  async createListing(parcelId: string, price: number, listingType: string, auth?: string) {
    const userId = resolveUserId(auth) ?? "system";
    return this.repo.createListing({ parcelId, sellerId: userId, price, listingType, isActive: true });
  }

  async delistListing(id: string) {
    const ok = await this.repo.delistListing(id);
    if (!ok) throw new LandError("Không thể hủy listing", "DELIST_FAILED", 404);
    return { success: true };
  }

  // ── Transactions ───────────────────────────────────────────────────────────

  async listTransactions(opts: { parcelId?: string; userId?: string; limit?: number } = {}) {
    return this.repo.listTransactions(opts);
  }

  async createTransaction(input: { parcelId: string; type: string; amount: number; fromUserId?: string; toUserId?: string; description?: string }) {
    return this.repo.createTransaction(input);
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  async listEvents(opts: { regionId?: string; cityId?: string; isActive?: boolean } = {}) {
    return this.repo.listEvents(opts);
  }

  async createLandEvent(input: { name: string; type?: string; regionId?: string; cityId?: string; description?: string }) {
    return this.repo.createEvent({ ...input, type: input.type ?? "GENERAL", isActive: true });
  }

  // ── Statistics ─────────────────────────────────────────────────────────────

  async getStatistics() {
    const [stats, regions, cities, parcels, buildings, roads, utilities, teleports] = await Promise.all([
      this.repo.getStats(),
      this.repo.countRegions(),
      this.repo.countCities(),
      this.repo.countParcels(),
      this.repo.countBuildings(),
      this.repo.countRoads(),
      this.repo.listUtilities(),
      this.repo.listTeleports(),
    ]);
    return { stats, counts: { regions, cities, parcels, buildings, roads, utilities: utilities.length, teleports: teleports.length } };
  }

  async getAnalytics() {
    const [totalParcels, ownedParcels, totalBuildings, listings] = await Promise.all([
      this.repo.countParcels(),
      this.repo.listParcels({ status: "OWNED" }),
      this.repo.countBuildings(),
      this.repo.listListings({ limit: 100 }),
    ]);
    const totalListingValue = listings.reduce((s, l) => s + l.price, 0);
    const avgListingValue = listings.length ? totalListingValue / listings.length : 0;
    return {
      totalParcels,
      ownedParcels: ownedParcels.length,
      availableParcels: totalParcels - ownedParcels.length,
      totalBuildings,
      activeListings: listings.length,
      totalListingValue,
      avgListingValue,
    };
  }
}
