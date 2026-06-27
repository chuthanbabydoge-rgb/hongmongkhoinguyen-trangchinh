// ─────────────────────────────────────────────────────────────────────────────
// DrizzleLandRepository — HUB-28
// ─────────────────────────────────────────────────────────────────────────────

import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@workspace/db";
import {
  landRegionsTable, landCitiesTable, landDistrictsTable, landParcelsTable,
  landPlotsTable, landOwnershipsTable, landBuildingsTable, buildingTemplatesTable,
  buildingLevelsTable, constructionProjectsTable, constructionMaterialsTable,
  roadsTable, bridgesTable, utilitiesTable, teleportPortsTable,
  landBookmarksTable, landPermissionsTable, landVisitorsTable, landRatingsTable,
  landMarketplaceTable, landTransactionsTable, landEventsTable, landStatisticsTable,
  landLogsTable, landSettingsTable,
  type LandRegion, type NewLandRegion, type LandCity, type NewLandCity,
  type LandDistrict, type NewLandDistrict, type LandParcel, type NewLandParcel,
  type LandOwnership, type NewLandOwnership, type LandBuilding, type NewLandBuilding,
  type BuildingTemplate, type ConstructionProject, type NewConstructionProject,
  type Road, type NewRoad, type Utility, type NewUtility,
  type TeleportPort, type NewTeleportPort,
  type LandMarketplaceListing, type NewLandMarketplaceListing,
  type LandTransaction, type NewLandTransaction,
  type LandBookmark, type LandPermission, type LandVisitor,
  type LandRating, type LandEvent, type LandStatistic, type LandLog,
} from "@workspace/db/schema";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ILandRepository {
  // Regions
  listRegions(opts?: { search?: string; limit?: number; offset?: number }): Promise<LandRegion[]>;
  getRegion(id: string): Promise<LandRegion | null>;
  getRegionBySlug(slug: string): Promise<LandRegion | null>;
  createRegion(input: Omit<NewLandRegion, "id" | "createdAt" | "updatedAt">): Promise<LandRegion>;
  updateRegion(id: string, input: Partial<LandRegion>): Promise<LandRegion | null>;
  deleteRegion(id: string): Promise<boolean>;
  countRegions(): Promise<number>;

  // Cities
  listCities(opts?: { regionId?: string; search?: string; limit?: number; offset?: number }): Promise<LandCity[]>;
  getCity(id: string): Promise<LandCity | null>;
  getCityBySlug(slug: string): Promise<LandCity | null>;
  createCity(input: Omit<NewLandCity, "id" | "createdAt" | "updatedAt">): Promise<LandCity>;
  updateCity(id: string, input: Partial<LandCity>): Promise<LandCity | null>;
  deleteCity(id: string): Promise<boolean>;
  countCities(): Promise<number>;

  // Districts
  listDistricts(opts?: { cityId?: string; type?: string; limit?: number; offset?: number }): Promise<LandDistrict[]>;
  getDistrict(id: string): Promise<LandDistrict | null>;
  createDistrict(input: Omit<NewLandDistrict, "id" | "createdAt" | "updatedAt">): Promise<LandDistrict>;
  updateDistrict(id: string, input: Partial<LandDistrict>): Promise<LandDistrict | null>;
  deleteDistrict(id: string): Promise<boolean>;
  countDistricts(): Promise<number>;

  // Parcels
  listParcels(opts?: { districtId?: string; status?: string; type?: string; search?: string; limit?: number; offset?: number }): Promise<LandParcel[]>;
  getParcel(id: string): Promise<LandParcel | null>;
  getParcelBySlug(slug: string): Promise<LandParcel | null>;
  createParcel(input: Omit<NewLandParcel, "id" | "createdAt" | "updatedAt">): Promise<LandParcel>;
  updateParcel(id: string, input: Partial<LandParcel>): Promise<LandParcel | null>;
  deleteParcel(id: string): Promise<boolean>;
  countParcels(): Promise<number>;

  // Ownerships
  getOwnership(parcelId: string): Promise<LandOwnership | null>;
  getOwnershipsByUser(userId: string): Promise<LandOwnership[]>;
  createOwnership(input: Omit<NewLandOwnership, "id" | "createdAt" | "updatedAt">): Promise<LandOwnership>;
  updateOwnership(id: string, input: Partial<LandOwnership>): Promise<LandOwnership | null>;
  transferOwnership(parcelId: string, newOwnerId: string, price: number): Promise<LandOwnership>;

  // Buildings
  listBuildings(opts?: { parcelId?: string; ownerId?: string; type?: string; status?: string; limit?: number; offset?: number }): Promise<LandBuilding[]>;
  getBuilding(id: string): Promise<LandBuilding | null>;
  createBuilding(input: Omit<NewLandBuilding, "id" | "createdAt" | "updatedAt">): Promise<LandBuilding>;
  updateBuilding(id: string, input: Partial<LandBuilding>): Promise<LandBuilding | null>;
  deleteBuilding(id: string): Promise<boolean>;
  countBuildings(): Promise<number>;

  // Building Templates
  listTemplates(): Promise<BuildingTemplate[]>;
  getTemplate(id: string): Promise<BuildingTemplate | null>;
  createTemplate(input: Omit<BuildingTemplate, "id" | "createdAt">): Promise<BuildingTemplate>;

  // Construction
  listProjects(opts?: { parcelId?: string; ownerId?: string; status?: string; limit?: number }): Promise<ConstructionProject[]>;
  getProject(id: string): Promise<ConstructionProject | null>;
  createProject(input: Omit<NewConstructionProject, "id" | "createdAt" | "updatedAt">): Promise<ConstructionProject>;
  updateProject(id: string, input: Partial<ConstructionProject>): Promise<ConstructionProject | null>;
  cancelProject(id: string): Promise<ConstructionProject | null>;
  completeProject(id: string): Promise<ConstructionProject | null>;

  // Roads
  listRoads(opts?: { districtId?: string; type?: string; limit?: number }): Promise<Road[]>;
  getRoad(id: string): Promise<Road | null>;
  createRoad(input: Omit<NewRoad, "id" | "createdAt" | "updatedAt">): Promise<Road>;
  updateRoad(id: string, input: Partial<Road>): Promise<Road | null>;
  countRoads(): Promise<number>;

  // Utilities
  listUtilities(opts?: { districtId?: string; type?: string }): Promise<Utility[]>;
  getUtility(id: string): Promise<Utility | null>;
  createUtility(input: Omit<NewUtility, "id" | "createdAt" | "updatedAt">): Promise<Utility>;
  updateUtility(id: string, input: Partial<Utility>): Promise<Utility | null>;

  // Teleports
  listTeleports(opts?: { type?: string; parcelId?: string }): Promise<TeleportPort[]>;
  getTeleport(id: string): Promise<TeleportPort | null>;
  createTeleport(input: Omit<NewTeleportPort, "id" | "createdAt" | "updatedAt">): Promise<TeleportPort>;
  updateTeleport(id: string, input: Partial<TeleportPort>): Promise<TeleportPort | null>;
  useTeleport(id: string): Promise<TeleportPort | null>;

  // Bookmarks
  listBookmarks(userId: string): Promise<(LandBookmark & { parcel: LandParcel | null })[]>;
  addBookmark(userId: string, parcelId: string, note?: string): Promise<LandBookmark>;
  removeBookmark(userId: string, parcelId: string): Promise<boolean>;

  // Permissions
  listPermissions(parcelId: string): Promise<LandPermission[]>;
  grantPermission(input: Omit<LandPermission, "id" | "grantedAt">): Promise<LandPermission>;
  revokePermission(id: string): Promise<boolean>;

  // Visitors
  recordVisit(parcelId: string, userId: string, duration?: number): Promise<LandVisitor>;
  getVisitors(parcelId: string, limit?: number): Promise<LandVisitor[]>;

  // Ratings
  listRatings(parcelId: string): Promise<LandRating[]>;
  rateParcel(parcelId: string, userId: string, rating: number, review?: string): Promise<LandRating>;

  // Marketplace
  listListings(opts?: { isActive?: boolean; listingType?: string; limit?: number; offset?: number }): Promise<LandMarketplaceListing[]>;
  getListing(id: string): Promise<LandMarketplaceListing | null>;
  createListing(input: Omit<NewLandMarketplaceListing, "id" | "createdAt" | "updatedAt">): Promise<LandMarketplaceListing>;
  updateListing(id: string, input: Partial<LandMarketplaceListing>): Promise<LandMarketplaceListing | null>;
  delistListing(id: string): Promise<boolean>;
  countListings(): Promise<number>;

  // Transactions
  listTransactions(opts?: { parcelId?: string; userId?: string; limit?: number; offset?: number }): Promise<LandTransaction[]>;
  createTransaction(input: Omit<NewLandTransaction, "id" | "createdAt">): Promise<LandTransaction>;
  countTransactions(): Promise<number>;

  // Events
  listEvents(opts?: { regionId?: string; cityId?: string; isActive?: boolean }): Promise<LandEvent[]>;
  createEvent(input: Omit<LandEvent, "id" | "createdAt">): Promise<LandEvent>;

  // Statistics
  getStats(): Promise<LandStatistic | null>;
  upsertStats(input: Partial<LandStatistic>): Promise<LandStatistic>;

  // Logs
  log(entry: { userId?: string; parcelId?: string; action: string; description?: string; metadata?: Record<string, unknown> }): Promise<LandLog>;

  // Seed
  seedData(): Promise<void>;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class DrizzleLandRepository implements ILandRepository {

  // ── Regions ──────────────────────────────────────────────────────────────

  async listRegions(opts: { search?: string; limit?: number; offset?: number } = {}): Promise<LandRegion[]> {
    const { search, limit = 50, offset = 0 } = opts;
    const q = db.select().from(landRegionsTable).orderBy(desc(landRegionsTable.createdAt)).limit(limit).offset(offset);
    if (search) return db.select().from(landRegionsTable).where(ilike(landRegionsTable.name, `%${search}%`)).limit(limit).offset(offset);
    return q;
  }

  async getRegion(id: string): Promise<LandRegion | null> {
    const [row] = await db.select().from(landRegionsTable).where(eq(landRegionsTable.id, id)).limit(1);
    return row ?? null;
  }

  async getRegionBySlug(slug: string): Promise<LandRegion | null> {
    const [row] = await db.select().from(landRegionsTable).where(eq(landRegionsTable.slug, slug)).limit(1);
    return row ?? null;
  }

  async createRegion(input: Omit<NewLandRegion, "id" | "createdAt" | "updatedAt">): Promise<LandRegion> {
    const [row] = await db.insert(landRegionsTable).values({ id: createId(), ...input }).returning();
    return row as LandRegion;
  }

  async updateRegion(id: string, input: Partial<LandRegion>): Promise<LandRegion | null> {
    const [row] = await db.update(landRegionsTable).set({ ...input, updatedAt: new Date() }).where(eq(landRegionsTable.id, id)).returning();
    return row ?? null;
  }

  async deleteRegion(id: string): Promise<boolean> {
    const res = await db.delete(landRegionsTable).where(eq(landRegionsTable.id, id));
    return (res.rowCount ?? 0) > 0;
  }

  async countRegions(): Promise<number> {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(landRegionsTable);
    return r?.c ?? 0;
  }

  // ── Cities ────────────────────────────────────────────────────────────────

  async listCities(opts: { regionId?: string; search?: string; limit?: number; offset?: number } = {}): Promise<LandCity[]> {
    const { regionId, search, limit = 50, offset = 0 } = opts;
    const conditions = [];
    if (regionId) conditions.push(eq(landCitiesTable.regionId, regionId));
    if (search) conditions.push(ilike(landCitiesTable.name, `%${search}%`));
    return db.select().from(landCitiesTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(landCitiesTable.createdAt)).limit(limit).offset(offset);
  }

  async getCity(id: string): Promise<LandCity | null> {
    const [row] = await db.select().from(landCitiesTable).where(eq(landCitiesTable.id, id)).limit(1);
    return row ?? null;
  }

  async getCityBySlug(slug: string): Promise<LandCity | null> {
    const [row] = await db.select().from(landCitiesTable).where(eq(landCitiesTable.slug, slug)).limit(1);
    return row ?? null;
  }

  async createCity(input: Omit<NewLandCity, "id" | "createdAt" | "updatedAt">): Promise<LandCity> {
    const [row] = await db.insert(landCitiesTable).values({ id: createId(), ...input }).returning();
    return row as LandCity;
  }

  async updateCity(id: string, input: Partial<LandCity>): Promise<LandCity | null> {
    const [row] = await db.update(landCitiesTable).set({ ...input, updatedAt: new Date() }).where(eq(landCitiesTable.id, id)).returning();
    return row ?? null;
  }

  async deleteCity(id: string): Promise<boolean> {
    const res = await db.delete(landCitiesTable).where(eq(landCitiesTable.id, id));
    return (res.rowCount ?? 0) > 0;
  }

  async countCities(): Promise<number> {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(landCitiesTable);
    return r?.c ?? 0;
  }

  // ── Districts ─────────────────────────────────────────────────────────────

  async listDistricts(opts: { cityId?: string; type?: string; limit?: number; offset?: number } = {}): Promise<LandDistrict[]> {
    const { cityId, type, limit = 100, offset = 0 } = opts;
    const conditions = [];
    if (cityId) conditions.push(eq(landDistrictsTable.cityId, cityId));
    if (type) conditions.push(sql`${landDistrictsTable.type} = ${type}`);
    return db.select().from(landDistrictsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(landDistrictsTable.name).limit(limit).offset(offset);
  }

  async getDistrict(id: string): Promise<LandDistrict | null> {
    const [row] = await db.select().from(landDistrictsTable).where(eq(landDistrictsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createDistrict(input: Omit<NewLandDistrict, "id" | "createdAt" | "updatedAt">): Promise<LandDistrict> {
    const [row] = await db.insert(landDistrictsTable).values({ id: createId(), ...input }).returning();
    return row as LandDistrict;
  }

  async updateDistrict(id: string, input: Partial<LandDistrict>): Promise<LandDistrict | null> {
    const [row] = await db.update(landDistrictsTable).set({ ...input, updatedAt: new Date() }).where(eq(landDistrictsTable.id, id)).returning();
    return row ?? null;
  }

  async deleteDistrict(id: string): Promise<boolean> {
    const res = await db.delete(landDistrictsTable).where(eq(landDistrictsTable.id, id));
    return (res.rowCount ?? 0) > 0;
  }

  async countDistricts(): Promise<number> {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(landDistrictsTable);
    return r?.c ?? 0;
  }

  // ── Parcels ───────────────────────────────────────────────────────────────

  async listParcels(opts: { districtId?: string; status?: string; type?: string; search?: string; limit?: number; offset?: number } = {}): Promise<LandParcel[]> {
    const { districtId, status, type, search, limit = 100, offset = 0 } = opts;
    const conditions = [];
    if (districtId) conditions.push(eq(landParcelsTable.districtId, districtId));
    if (status) conditions.push(sql`${landParcelsTable.status} = ${status}`);
    if (type) conditions.push(sql`${landParcelsTable.type} = ${type}`);
    if (search) conditions.push(ilike(landParcelsTable.name, `%${search}%`));
    return db.select().from(landParcelsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(landParcelsTable.currentValue)).limit(limit).offset(offset);
  }

  async getParcel(id: string): Promise<LandParcel | null> {
    const [row] = await db.select().from(landParcelsTable).where(eq(landParcelsTable.id, id)).limit(1);
    return row ?? null;
  }

  async getParcelBySlug(slug: string): Promise<LandParcel | null> {
    const [row] = await db.select().from(landParcelsTable).where(eq(landParcelsTable.slug, slug)).limit(1);
    return row ?? null;
  }

  async createParcel(input: Omit<NewLandParcel, "id" | "createdAt" | "updatedAt">): Promise<LandParcel> {
    const [row] = await db.insert(landParcelsTable).values({ id: createId(), ...input }).returning();
    return row as LandParcel;
  }

  async updateParcel(id: string, input: Partial<LandParcel>): Promise<LandParcel | null> {
    const [row] = await db.update(landParcelsTable).set({ ...input, updatedAt: new Date() }).where(eq(landParcelsTable.id, id)).returning();
    return row ?? null;
  }

  async deleteParcel(id: string): Promise<boolean> {
    const res = await db.delete(landParcelsTable).where(eq(landParcelsTable.id, id));
    return (res.rowCount ?? 0) > 0;
  }

  async countParcels(): Promise<number> {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(landParcelsTable);
    return r?.c ?? 0;
  }

  // ── Ownerships ────────────────────────────────────────────────────────────

  async getOwnership(parcelId: string): Promise<LandOwnership | null> {
    const [row] = await db.select().from(landOwnershipsTable)
      .where(and(eq(landOwnershipsTable.parcelId, parcelId), eq(landOwnershipsTable.isActive, true))).limit(1);
    return row ?? null;
  }

  async getOwnershipsByUser(userId: string): Promise<LandOwnership[]> {
    return db.select().from(landOwnershipsTable)
      .where(and(eq(landOwnershipsTable.ownerId, userId), eq(landOwnershipsTable.isActive, true)))
      .orderBy(desc(landOwnershipsTable.acquiredAt));
  }

  async createOwnership(input: Omit<NewLandOwnership, "id" | "createdAt" | "updatedAt">): Promise<LandOwnership> {
    const [row] = await db.insert(landOwnershipsTable).values({ id: createId(), ...input }).returning();
    return row as LandOwnership;
  }

  async updateOwnership(id: string, input: Partial<LandOwnership>): Promise<LandOwnership | null> {
    const [row] = await db.update(landOwnershipsTable).set({ ...input, updatedAt: new Date() }).where(eq(landOwnershipsTable.id, id)).returning();
    return row ?? null;
  }

  async transferOwnership(parcelId: string, newOwnerId: string, price: number): Promise<LandOwnership> {
    await db.update(landOwnershipsTable).set({ isActive: false, updatedAt: new Date() }).where(eq(landOwnershipsTable.parcelId, parcelId));
    const [row] = await db.insert(landOwnershipsTable).values({
      id: createId(), parcelId, ownerId: newOwnerId, ownerType: "PLAYER", purchasePrice: price, isActive: true,
    }).returning();
    await db.update(landParcelsTable).set({ status: "OWNED", updatedAt: new Date() }).where(eq(landParcelsTable.id, parcelId));
    return row as LandOwnership;
  }

  // ── Buildings ─────────────────────────────────────────────────────────────

  async listBuildings(opts: { parcelId?: string; ownerId?: string; type?: string; status?: string; limit?: number; offset?: number } = {}): Promise<LandBuilding[]> {
    const { parcelId, ownerId, limit = 50, offset = 0 } = opts;
    const conditions = [];
    if (parcelId) conditions.push(eq(landBuildingsTable.parcelId, parcelId));
    if (ownerId) conditions.push(eq(landBuildingsTable.ownerId, ownerId));
    return db.select().from(landBuildingsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(landBuildingsTable.createdAt)).limit(limit).offset(offset);
  }

  async getBuilding(id: string): Promise<LandBuilding | null> {
    const [row] = await db.select().from(landBuildingsTable).where(eq(landBuildingsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createBuilding(input: Omit<NewLandBuilding, "id" | "createdAt" | "updatedAt">): Promise<LandBuilding> {
    const [row] = await db.insert(landBuildingsTable).values({ id: createId(), ...input }).returning();
    return row as LandBuilding;
  }

  async updateBuilding(id: string, input: Partial<LandBuilding>): Promise<LandBuilding | null> {
    const [row] = await db.update(landBuildingsTable).set({ ...input, updatedAt: new Date() }).where(eq(landBuildingsTable.id, id)).returning();
    return row ?? null;
  }

  async deleteBuilding(id: string): Promise<boolean> {
    const res = await db.delete(landBuildingsTable).where(eq(landBuildingsTable.id, id));
    return (res.rowCount ?? 0) > 0;
  }

  async countBuildings(): Promise<number> {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(landBuildingsTable);
    return r?.c ?? 0;
  }

  // ── Building Templates ────────────────────────────────────────────────────

  async listTemplates(): Promise<BuildingTemplate[]> {
    return db.select().from(buildingTemplatesTable).where(eq(buildingTemplatesTable.isActive, true)).orderBy(buildingTemplatesTable.name);
  }

  async getTemplate(id: string): Promise<BuildingTemplate | null> {
    const [row] = await db.select().from(buildingTemplatesTable).where(eq(buildingTemplatesTable.id, id)).limit(1);
    return row ?? null;
  }

  async createTemplate(input: Omit<BuildingTemplate, "id" | "createdAt">): Promise<BuildingTemplate> {
    const [row] = await db.insert(buildingTemplatesTable).values({ id: createId(), ...input }).returning();
    return row as BuildingTemplate;
  }

  // ── Construction ──────────────────────────────────────────────────────────

  async listProjects(opts: { parcelId?: string; ownerId?: string; status?: string; limit?: number } = {}): Promise<ConstructionProject[]> {
    const { parcelId, ownerId, limit = 50 } = opts;
    const conditions = [];
    if (parcelId) conditions.push(eq(constructionProjectsTable.parcelId, parcelId));
    if (ownerId) conditions.push(eq(constructionProjectsTable.ownerId, ownerId));
    return db.select().from(constructionProjectsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(constructionProjectsTable.createdAt)).limit(limit);
  }

  async getProject(id: string): Promise<ConstructionProject | null> {
    const [row] = await db.select().from(constructionProjectsTable).where(eq(constructionProjectsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createProject(input: Omit<NewConstructionProject, "id" | "createdAt" | "updatedAt">): Promise<ConstructionProject> {
    const [row] = await db.insert(constructionProjectsTable).values({ id: createId(), ...input }).returning();
    return row as ConstructionProject;
  }

  async updateProject(id: string, input: Partial<ConstructionProject>): Promise<ConstructionProject | null> {
    const [row] = await db.update(constructionProjectsTable).set({ ...input, updatedAt: new Date() }).where(eq(constructionProjectsTable.id, id)).returning();
    return row ?? null;
  }

  async cancelProject(id: string): Promise<ConstructionProject | null> {
    const [row] = await db.update(constructionProjectsTable)
      .set({ status: "CANCELLED", updatedAt: new Date() })
      .where(eq(constructionProjectsTable.id, id)).returning();
    return row ?? null;
  }

  async completeProject(id: string): Promise<ConstructionProject | null> {
    const [row] = await db.update(constructionProjectsTable)
      .set({ status: "COMPLETED", progress: 100, completedAt: new Date(), updatedAt: new Date() })
      .where(eq(constructionProjectsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Roads ─────────────────────────────────────────────────────────────────

  async listRoads(opts: { districtId?: string; type?: string; limit?: number } = {}): Promise<Road[]> {
    const { districtId, limit = 100 } = opts;
    if (districtId) return db.select().from(roadsTable).where(eq(roadsTable.districtId, districtId)).limit(limit);
    return db.select().from(roadsTable).orderBy(roadsTable.name).limit(limit);
  }

  async getRoad(id: string): Promise<Road | null> {
    const [row] = await db.select().from(roadsTable).where(eq(roadsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createRoad(input: Omit<NewRoad, "id" | "createdAt" | "updatedAt">): Promise<Road> {
    const [row] = await db.insert(roadsTable).values({ id: createId(), ...input }).returning();
    return row as Road;
  }

  async updateRoad(id: string, input: Partial<Road>): Promise<Road | null> {
    const [row] = await db.update(roadsTable).set({ ...input, updatedAt: new Date() }).where(eq(roadsTable.id, id)).returning();
    return row ?? null;
  }

  async countRoads(): Promise<number> {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(roadsTable);
    return r?.c ?? 0;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  async listUtilities(opts: { districtId?: string; type?: string } = {}): Promise<Utility[]> {
    const { districtId } = opts;
    if (districtId) return db.select().from(utilitiesTable).where(eq(utilitiesTable.districtId, districtId));
    return db.select().from(utilitiesTable).orderBy(utilitiesTable.name);
  }

  async getUtility(id: string): Promise<Utility | null> {
    const [row] = await db.select().from(utilitiesTable).where(eq(utilitiesTable.id, id)).limit(1);
    return row ?? null;
  }

  async createUtility(input: Omit<NewUtility, "id" | "createdAt" | "updatedAt">): Promise<Utility> {
    const [row] = await db.insert(utilitiesTable).values({ id: createId(), ...input }).returning();
    return row as Utility;
  }

  async updateUtility(id: string, input: Partial<Utility>): Promise<Utility | null> {
    const [row] = await db.update(utilitiesTable).set({ ...input, updatedAt: new Date() }).where(eq(utilitiesTable.id, id)).returning();
    return row ?? null;
  }

  // ── Teleports ─────────────────────────────────────────────────────────────

  async listTeleports(opts: { type?: string; parcelId?: string } = {}): Promise<TeleportPort[]> {
    const { parcelId } = opts;
    if (parcelId) return db.select().from(teleportPortsTable).where(eq(teleportPortsTable.parcelId, parcelId));
    return db.select().from(teleportPortsTable).where(eq(teleportPortsTable.isActive, true)).orderBy(teleportPortsTable.name);
  }

  async getTeleport(id: string): Promise<TeleportPort | null> {
    const [row] = await db.select().from(teleportPortsTable).where(eq(teleportPortsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createTeleport(input: Omit<NewTeleportPort, "id" | "createdAt" | "updatedAt">): Promise<TeleportPort> {
    const [row] = await db.insert(teleportPortsTable).values({ id: createId(), ...input }).returning();
    return row as TeleportPort;
  }

  async updateTeleport(id: string, input: Partial<TeleportPort>): Promise<TeleportPort | null> {
    const [row] = await db.update(teleportPortsTable).set({ ...input, updatedAt: new Date() }).where(eq(teleportPortsTable.id, id)).returning();
    return row ?? null;
  }

  async useTeleport(id: string): Promise<TeleportPort | null> {
    const port = await this.getTeleport(id);
    if (!port) return null;
    const [row] = await db.update(teleportPortsTable)
      .set({ usageCount: (port.usageCount ?? 0) + 1, updatedAt: new Date() })
      .where(eq(teleportPortsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Bookmarks ─────────────────────────────────────────────────────────────

  async listBookmarks(userId: string): Promise<(LandBookmark & { parcel: LandParcel | null })[]> {
    const rows = await db.select().from(landBookmarksTable)
      .where(eq(landBookmarksTable.userId, userId))
      .orderBy(desc(landBookmarksTable.createdAt));
    const result = await Promise.all(rows.map(async (bm) => ({
      ...bm,
      parcel: await this.getParcel(bm.parcelId),
    })));
    return result;
  }

  async addBookmark(userId: string, parcelId: string, note?: string): Promise<LandBookmark> {
    const [row] = await db.insert(landBookmarksTable).values({ id: createId(), userId, parcelId, note }).returning();
    return row as LandBookmark;
  }

  async removeBookmark(userId: string, parcelId: string): Promise<boolean> {
    const res = await db.delete(landBookmarksTable)
      .where(and(eq(landBookmarksTable.userId, userId), eq(landBookmarksTable.parcelId, parcelId)));
    return (res.rowCount ?? 0) > 0;
  }

  // ── Permissions ───────────────────────────────────────────────────────────

  async listPermissions(parcelId: string): Promise<LandPermission[]> {
    return db.select().from(landPermissionsTable).where(eq(landPermissionsTable.parcelId, parcelId));
  }

  async grantPermission(input: Omit<LandPermission, "id" | "grantedAt">): Promise<LandPermission> {
    const [row] = await db.insert(landPermissionsTable).values({ id: createId(), ...input }).returning();
    return row as LandPermission;
  }

  async revokePermission(id: string): Promise<boolean> {
    const res = await db.delete(landPermissionsTable).where(eq(landPermissionsTable.id, id));
    return (res.rowCount ?? 0) > 0;
  }

  // ── Visitors ──────────────────────────────────────────────────────────────

  async recordVisit(parcelId: string, userId: string, duration?: number): Promise<LandVisitor> {
    const [row] = await db.insert(landVisitorsTable).values({ id: createId(), parcelId, userId, duration }).returning();
    return row as LandVisitor;
  }

  async getVisitors(parcelId: string, limit = 20): Promise<LandVisitor[]> {
    return db.select().from(landVisitorsTable)
      .where(eq(landVisitorsTable.parcelId, parcelId))
      .orderBy(desc(landVisitorsTable.visitedAt)).limit(limit);
  }

  // ── Ratings ───────────────────────────────────────────────────────────────

  async listRatings(parcelId: string): Promise<LandRating[]> {
    return db.select().from(landRatingsTable).where(eq(landRatingsTable.parcelId, parcelId)).orderBy(desc(landRatingsTable.createdAt));
  }

  async rateParcel(parcelId: string, userId: string, rating: number, review?: string): Promise<LandRating> {
    const existing = await db.select().from(landRatingsTable)
      .where(and(eq(landRatingsTable.parcelId, parcelId), eq(landRatingsTable.userId, userId))).limit(1);
    if (existing[0]) {
      const [row] = await db.update(landRatingsTable)
        .set({ rating, review, updatedAt: new Date() })
        .where(eq(landRatingsTable.id, existing[0].id)).returning();
      return row as LandRating;
    }
    const [row] = await db.insert(landRatingsTable).values({ id: createId(), parcelId, userId, rating, review }).returning();
    return row as LandRating;
  }

  // ── Marketplace ───────────────────────────────────────────────────────────

  async listListings(opts: { isActive?: boolean; listingType?: string; limit?: number; offset?: number } = {}): Promise<LandMarketplaceListing[]> {
    const { isActive = true, limit = 50, offset = 0 } = opts;
    return db.select().from(landMarketplaceTable)
      .where(eq(landMarketplaceTable.isActive, isActive))
      .orderBy(desc(landMarketplaceTable.createdAt)).limit(limit).offset(offset);
  }

  async getListing(id: string): Promise<LandMarketplaceListing | null> {
    const [row] = await db.select().from(landMarketplaceTable).where(eq(landMarketplaceTable.id, id)).limit(1);
    return row ?? null;
  }

  async createListing(input: Omit<NewLandMarketplaceListing, "id" | "createdAt" | "updatedAt">): Promise<LandMarketplaceListing> {
    const [row] = await db.insert(landMarketplaceTable).values({ id: createId(), ...input }).returning();
    await db.update(landParcelsTable).set({ isListed: true, listingPrice: input.price, updatedAt: new Date() }).where(eq(landParcelsTable.id, input.parcelId));
    return row as LandMarketplaceListing;
  }

  async updateListing(id: string, input: Partial<LandMarketplaceListing>): Promise<LandMarketplaceListing | null> {
    const [row] = await db.update(landMarketplaceTable).set({ ...input, updatedAt: new Date() }).where(eq(landMarketplaceTable.id, id)).returning();
    return row ?? null;
  }

  async delistListing(id: string): Promise<boolean> {
    const listing = await this.getListing(id);
    if (!listing) return false;
    await db.update(landMarketplaceTable).set({ isActive: false, updatedAt: new Date() }).where(eq(landMarketplaceTable.id, id));
    await db.update(landParcelsTable).set({ isListed: false, listingPrice: null, updatedAt: new Date() }).where(eq(landParcelsTable.id, listing.parcelId));
    return true;
  }

  async countListings(): Promise<number> {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(landMarketplaceTable).where(eq(landMarketplaceTable.isActive, true));
    return r?.c ?? 0;
  }

  // ── Transactions ──────────────────────────────────────────────────────────

  async listTransactions(opts: { parcelId?: string; userId?: string; limit?: number; offset?: number } = {}): Promise<LandTransaction[]> {
    const { parcelId, userId, limit = 50, offset = 0 } = opts;
    const conditions = [];
    if (parcelId) conditions.push(eq(landTransactionsTable.parcelId, parcelId));
    if (userId) conditions.push(eq(landTransactionsTable.toUserId, userId));
    return db.select().from(landTransactionsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(landTransactionsTable.createdAt)).limit(limit).offset(offset);
  }

  async createTransaction(input: Omit<NewLandTransaction, "id" | "createdAt">): Promise<LandTransaction> {
    const [row] = await db.insert(landTransactionsTable).values({ id: createId(), ...input }).returning();
    return row as LandTransaction;
  }

  async countTransactions(): Promise<number> {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(landTransactionsTable);
    return r?.c ?? 0;
  }

  // ── Events ────────────────────────────────────────────────────────────────

  async listEvents(opts: { regionId?: string; cityId?: string; isActive?: boolean } = {}): Promise<LandEvent[]> {
    const { regionId, cityId, isActive } = opts;
    const conditions = [];
    if (regionId) conditions.push(eq(landEventsTable.regionId, regionId));
    if (cityId) conditions.push(eq(landEventsTable.cityId, cityId));
    if (isActive !== undefined) conditions.push(eq(landEventsTable.isActive, isActive));
    return db.select().from(landEventsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(landEventsTable.createdAt));
  }

  async createEvent(input: Omit<LandEvent, "id" | "createdAt">): Promise<LandEvent> {
    const [row] = await db.insert(landEventsTable).values({ id: createId(), ...input }).returning();
    return row as LandEvent;
  }

  // ── Statistics ────────────────────────────────────────────────────────────

  async getStats(): Promise<LandStatistic | null> {
    const [row] = await db.select().from(landStatisticsTable).orderBy(desc(landStatisticsTable.recordedAt)).limit(1);
    return row ?? null;
  }

  async upsertStats(input: Partial<LandStatistic>): Promise<LandStatistic> {
    const [row] = await db.insert(landStatisticsTable).values({ id: createId(), ...input }).returning();
    return row as LandStatistic;
  }

  // ── Logs ──────────────────────────────────────────────────────────────────

  async log(entry: { userId?: string; parcelId?: string; action: string; description?: string; metadata?: Record<string, unknown> }): Promise<LandLog> {
    const [row] = await db.insert(landLogsTable).values({ id: createId(), ...entry }).returning();
    return row as LandLog;
  }

  // ── Seed Data ─────────────────────────────────────────────────────────────

  async seedData(): Promise<void> {
    const existing = await this.countRegions();
    if (existing > 0) return;

    const regions = [
      { name: "Arcadia Prime", slug: "arcadia-prime", description: "Vùng đất trung tâm Universe", biome: "TEMPERATE", mapX: 0, mapY: 0, width: 2000, height: 2000, maxCities: 15 },
      { name: "Frozen Frontier", slug: "frozen-frontier", description: "Vùng cực bắc băng giá", biome: "ARCTIC", mapX: -2500, mapY: -2000, width: 1500, height: 1500, maxCities: 5 },
      { name: "Ember Wastes", slug: "ember-wastes", description: "Sa mạc núi lửa phía nam", biome: "VOLCANIC", mapX: 2000, mapY: 2000, width: 1800, height: 1200, maxCities: 8 },
      { name: "Azure Coast", slug: "azure-coast", description: "Vùng ven biển xanh ngắt", biome: "TROPICAL", mapX: -1000, mapY: 1500, width: 1200, height: 800, maxCities: 12 },
      { name: "Verdant Highlands", slug: "verdant-highlands", description: "Cao nguyên xanh tươi phía tây", biome: "HIGHLAND", mapX: -2000, mapY: 500, width: 1600, height: 1000, maxCities: 10 },
    ];

    const regionRows: { id: string; name: string; slug: string }[] = [];
    for (const r of regions) {
      const row = await this.createRegion(r);
      regionRows.push({ id: row.id, name: row.name, slug: row.slug });
    }

    const cityTypes: Array<{ name: string; slug: string; type: "CAPITAL" | "METROPOLIS" | "CITY" | "TOWN" | "VILLAGE" | "OUTPOST" | "SPECIAL" }> = [
      { name: "Nova Centrum", slug: "nova-centrum", type: "CAPITAL" },
      { name: "Silvergate", slug: "silvergate", type: "METROPOLIS" },
      { name: "Port Lumina", slug: "port-lumina", type: "CITY" },
      { name: "Ironhold", slug: "ironhold", type: "CITY" },
      { name: "Ashenvale", slug: "ashenvale", type: "TOWN" },
      { name: "Crystalspire", slug: "crystalspire", type: "CITY" },
      { name: "Blackrock", slug: "blackrock", type: "OUTPOST" },
      { name: "Tidehaven", slug: "tidehaven", type: "METROPOLIS" },
      { name: "Verdant Falls", slug: "verdant-falls", type: "TOWN" },
      { name: "Aurora Station", slug: "aurora-station", type: "SPECIAL" },
    ];

    const cityRows: { id: string; name: string }[] = [];
    for (let i = 0; i < cityTypes.length; i++) {
      const regionId = regionRows[i % regionRows.length]?.id;
      if (!regionId) continue;
      const row = await this.createCity({ regionId, ...cityTypes[i], population: Math.floor(Math.random() * 10000) + 1000, taxRate: 0.05, mapX: Math.random() * 200, mapY: Math.random() * 200 });
      cityRows.push({ id: row.id, name: row.name });
    }

    const districtTypes: Array<"RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" | "EDUCATION" | "SPORTS" | "GOVERNMENT" | "MIXED"> = [
      "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "EDUCATION", "SPORTS", "GOVERNMENT", "MIXED",
    ];

    const districtRows: { id: string }[] = [];
    for (const city of cityRows) {
      for (let j = 0; j < 3; j++) {
        const type = districtTypes[j % districtTypes.length] ?? "MIXED";
        const row = await this.createDistrict({
          cityId: city.id,
          name: `${city.name} — ${type} District`,
          slug: `${city.id}-${type.toLowerCase()}-${j}`,
          type,
          maxParcels: 50,
          landValueBase: 100 + Math.random() * 500,
          mapX: Math.random() * 100,
          mapY: Math.random() * 100,
        });
        districtRows.push({ id: row.id });
      }
    }

    const parcelTypes: Array<"RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" | "AGRICULTURAL"> = [
      "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "AGRICULTURAL",
    ];

    for (let i = 0; i < 50; i++) {
      const district = districtRows[i % districtRows.length];
      if (!district) continue;
      const type = parcelTypes[i % parcelTypes.length] ?? "RESIDENTIAL";
      const value = 500 + Math.random() * 5000;
      await this.createParcel({
        districtId: district.id,
        name: `Parcel #${String(i + 1).padStart(3, "0")}`,
        slug: `parcel-${createId().slice(0, 8)}`,
        type,
        status: "AVAILABLE",
        size: 50 + Math.random() * 200,
        baseValue: value,
        currentValue: value,
        mapX: Math.random() * 50,
        mapY: Math.random() * 50,
        width: 10 + Math.random() * 20,
        height: 10 + Math.random() * 20,
        maxBuildings: 3,
      });
    }

    const buildingTemplateData = [
      { name: "Simple House", slug: "simple-house", type: "HOUSE" as const, buildCost: 500, buildTime: 1800, icon: "🏠" },
      { name: "Apartment Block", slug: "apartment-block", type: "APARTMENT" as const, buildCost: 2000, buildTime: 7200, icon: "🏢" },
      { name: "Office Tower", slug: "office-tower", type: "OFFICE" as const, buildCost: 5000, buildTime: 14400, icon: "🏗️" },
      { name: "Retail Shop", slug: "retail-shop", type: "SHOP" as const, buildCost: 1000, buildTime: 3600, icon: "🏪" },
      { name: "Factory Unit", slug: "factory-unit", type: "FACTORY" as const, buildCost: 3000, buildTime: 10800, icon: "🏭" },
    ];

    for (const t of buildingTemplateData) {
      await this.createTemplate({ ...t, maxLevel: 10, sizeRequired: 20, isActive: true });
    }

    const roadTypes: Array<"HIGHWAY" | "AVENUE" | "STREET"> = ["HIGHWAY", "AVENUE", "STREET"];
    for (let i = 0; i < 20; i++) {
      const district = districtRows[i % districtRows.length];
      const type = roadTypes[i % roadTypes.length] ?? "STREET";
      await this.createRoad({
        districtId: district?.id,
        name: `Road ${String(i + 1).padStart(2, "0")}`,
        type,
        fromX: Math.random() * 100, fromY: Math.random() * 100,
        toX: Math.random() * 100, toY: Math.random() * 100,
        length: 100 + Math.random() * 500,
        speedLimit: 50,
        lanes: 2,
        isActive: true,
      });
    }

    const utilityTypes: Array<"ELECTRICITY" | "WATER" | "INTERNET" | "GAS"> = ["ELECTRICITY", "WATER", "INTERNET", "GAS"];
    for (let i = 0; i < 10; i++) {
      const district = districtRows[i % districtRows.length];
      const type = utilityTypes[i % utilityTypes.length] ?? "ELECTRICITY";
      await this.createUtility({
        districtId: district?.id,
        name: `${type} Grid ${i + 1}`,
        type,
        capacity: 10000,
        usage: Math.random() * 5000,
        costPerUnit: 0.1,
        isActive: true,
      });
    }

    const teleportTypeValues: Array<"PUBLIC" | "PRIVATE" | "WORLD"> = ["PUBLIC", "PRIVATE", "WORLD"];
    for (let i = 0; i < 10; i++) {
      const type = teleportTypeValues[i % teleportTypeValues.length] ?? "PUBLIC";
      await this.createTeleport({
        name: `Teleport Gate ${String(i + 1).padStart(2, "0")}`,
        type,
        destinationX: Math.random() * 500,
        destinationY: Math.random() * 500,
        cooldown: 300,
        cost: type === "PUBLIC" ? 0 : 10,
        isActive: true,
      });
    }

    await this.upsertStats({
      totalParcels: 50,
      ownedParcels: 0,
      totalBuildings: 0,
      totalPopulation: cityRows.reduce(() => 0, 0),
      totalValue: 0,
      avgParcelValue: 0,
      totalRevenue: 0,
    });
  }
}
