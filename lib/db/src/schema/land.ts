import {
  pgTable, text, integer, boolean, timestamp, pgEnum, jsonb, real, index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const landTypeEnum = pgEnum("land_type", [
  "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "AGRICULTURAL", "FOREST",
  "WATER", "DESERT", "MOUNTAIN", "SNOW", "VOLCANIC", "SPECIAL", "VOID",
]);

export const parcelStatusEnum = pgEnum("parcel_status", [
  "AVAILABLE", "OWNED", "RENTED", "RESERVED", "LOCKED", "AUCTION",
]);

export const ownershipTypeEnum = pgEnum("ownership_type", [
  "PLAYER", "GUILD", "COMPANY", "NPC", "GOVERNMENT", "UNIVERSE",
]);

export const buildingTypeEnum = pgEnum("building_type", [
  "HOUSE", "APARTMENT", "OFFICE", "SHOP", "FACTORY", "WAREHOUSE",
  "FARM", "CASTLE", "TEMPLE", "STADIUM", "LAB", "SPECIAL",
]);

export const buildingStatusEnum = pgEnum("building_status", [
  "ACTIVE", "UNDER_CONSTRUCTION", "DAMAGED", "ABANDONED", "DESTROYED",
]);

export const constructionStatusEnum = pgEnum("construction_status", [
  "QUEUED", "IN_PROGRESS", "PAUSED", "COMPLETED", "CANCELLED", "FAILED",
]);

export const cityTypeEnum = pgEnum("city_type", [
  "CAPITAL", "METROPOLIS", "CITY", "TOWN", "VILLAGE", "OUTPOST", "SPECIAL",
]);

export const districtTypeEnum = pgEnum("district_type", [
  "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "EDUCATION", "SPORTS",
  "GOVERNMENT", "MIXED", "PARK", "HARBOR", "AIRPORT",
]);

export const roadTypeEnum = pgEnum("road_type", [
  "HIGHWAY", "AVENUE", "STREET", "ALLEY", "BRIDGE", "TUNNEL", "RAIL", "SKY",
]);

export const utilityTypeEnum = pgEnum("utility_type", [
  "ELECTRICITY", "WATER", "INTERNET", "GAS", "SEWER", "HEATING", "SOLAR",
]);

export const teleportTypeEnum = pgEnum("teleport_type", [
  "PUBLIC", "PRIVATE", "GUILD", "WORLD", "PREMIUM", "EMERGENCY",
]);

export const rentalStatusEnum = pgEnum("rental_status", [
  "ACTIVE", "EXPIRED", "CANCELLED", "PENDING", "OVERDUE",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const landRegionsTable = pgTable("land_regions", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  biome:       text("biome").notNull().default("TEMPERATE"),
  mapX:        real("map_x").notNull().default(0),
  mapY:        real("map_y").notNull().default(0),
  width:       real("width").notNull().default(1000),
  height:      real("height").notNull().default(1000),
  population:  integer("population").notNull().default(0),
  maxCities:   integer("max_cities").notNull().default(10),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export type LandRegion = typeof landRegionsTable.$inferSelect;
export type NewLandRegion = typeof landRegionsTable.$inferInsert;

export const landCitiesTable = pgTable("land_cities", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  regionId:    text("region_id").notNull().references(() => landRegionsTable.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  type:        cityTypeEnum("type").notNull().default("CITY"),
  mayorId:     text("mayor_id"),
  population:  integer("population").notNull().default(0),
  maxDistricts: integer("max_districts").notNull().default(10),
  taxRate:     real("tax_rate").notNull().default(0.05),
  mapX:        real("map_x").notNull().default(0),
  mapY:        real("map_y").notNull().default(0),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("land_cities_region_idx").on(t.regionId)]);

export type LandCity = typeof landCitiesTable.$inferSelect;
export type NewLandCity = typeof landCitiesTable.$inferInsert;

export const landDistrictsTable = pgTable("land_districts", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  cityId:      text("city_id").notNull().references(() => landCitiesTable.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  slug:        text("slug").notNull(),
  description: text("description"),
  type:        districtTypeEnum("type").notNull().default("MIXED"),
  population:  integer("population").notNull().default(0),
  maxParcels:  integer("max_parcels").notNull().default(100),
  landValueBase: real("land_value_base").notNull().default(100),
  mapX:        real("map_x").notNull().default(0),
  mapY:        real("map_y").notNull().default(0),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("land_districts_city_idx").on(t.cityId)]);

export type LandDistrict = typeof landDistrictsTable.$inferSelect;
export type NewLandDistrict = typeof landDistrictsTable.$inferInsert;

export const landParcelsTable = pgTable("land_parcels", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  districtId:  text("district_id").notNull().references(() => landDistrictsTable.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  type:        landTypeEnum("type").notNull().default("RESIDENTIAL"),
  status:      parcelStatusEnum("status").notNull().default("AVAILABLE"),
  size:        real("size").notNull().default(100),
  baseValue:   real("base_value").notNull().default(1000),
  currentValue: real("current_value").notNull().default(1000),
  mapX:        real("map_x").notNull().default(0),
  mapY:        real("map_y").notNull().default(0),
  width:       real("width").notNull().default(10),
  height:      real("height").notNull().default(10),
  maxBuildings: integer("max_buildings").notNull().default(5),
  isListed:    boolean("is_listed").notNull().default(false),
  listingPrice: real("listing_price"),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("land_parcels_district_idx").on(t.districtId),
  index("land_parcels_status_idx").on(t.status),
]);

export type LandParcel = typeof landParcelsTable.$inferSelect;
export type NewLandParcel = typeof landParcelsTable.$inferInsert;

export const landPlotsTable = pgTable("land_plots", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  parcelId:    text("parcel_id").notNull().references(() => landParcelsTable.id, { onDelete: "cascade" }),
  plotIndex:   integer("plot_index").notNull(),
  isOccupied:  boolean("is_occupied").notNull().default(false),
  occupiedBy:  text("occupied_by"),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export type LandPlot = typeof landPlotsTable.$inferSelect;

export const landOwnershipsTable = pgTable("land_ownerships", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  parcelId:    text("parcel_id").notNull().references(() => landParcelsTable.id, { onDelete: "cascade" }),
  ownerId:     text("owner_id").notNull(),
  ownerType:   ownershipTypeEnum("owner_type").notNull().default("PLAYER"),
  acquiredAt:  timestamp("acquired_at").notNull().defaultNow(),
  purchasePrice: real("purchase_price"),
  rentalStatus: rentalStatusEnum("rental_status"),
  rentalStart:  timestamp("rental_start"),
  rentalEnd:    timestamp("rental_end"),
  rentalPrice:  real("rental_price"),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("land_ownerships_parcel_idx").on(t.parcelId),
  index("land_ownerships_owner_idx").on(t.ownerId),
]);

export type LandOwnership = typeof landOwnershipsTable.$inferSelect;
export type NewLandOwnership = typeof landOwnershipsTable.$inferInsert;

export const buildingTemplatesTable = pgTable("building_templates", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  type:        buildingTypeEnum("type").notNull(),
  maxLevel:    integer("max_level").notNull().default(10),
  buildCost:   real("build_cost").notNull().default(500),
  buildTime:   integer("build_time").notNull().default(3600),
  sizeRequired: real("size_required").notNull().default(10),
  icon:        text("icon").notNull().default("🏠"),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export type BuildingTemplate = typeof buildingTemplatesTable.$inferSelect;

export const landBuildingsTable = pgTable("land_buildings", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  parcelId:    text("parcel_id").notNull().references(() => landParcelsTable.id, { onDelete: "cascade" }),
  templateId:  text("template_id").references(() => buildingTemplatesTable.id),
  ownerId:     text("owner_id").notNull(),
  name:        text("name").notNull(),
  type:        buildingTypeEnum("type").notNull(),
  status:      buildingStatusEnum("status").notNull().default("ACTIVE"),
  level:       integer("level").notNull().default(1),
  health:      integer("health").notNull().default(100),
  maxHealth:   integer("max_health").notNull().default(100),
  value:       real("value").notNull().default(1000),
  incomeRate:  real("income_rate").notNull().default(0),
  mapX:        real("map_x").notNull().default(0),
  mapY:        real("map_y").notNull().default(0),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  builtAt:     timestamp("built_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("land_buildings_parcel_idx").on(t.parcelId),
  index("land_buildings_owner_idx").on(t.ownerId),
]);

export type LandBuilding = typeof landBuildingsTable.$inferSelect;
export type NewLandBuilding = typeof landBuildingsTable.$inferInsert;

export const buildingLevelsTable = pgTable("building_levels", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  templateId:  text("template_id").notNull().references(() => buildingTemplatesTable.id, { onDelete: "cascade" }),
  level:       integer("level").notNull(),
  upgradeCost: real("upgrade_cost").notNull(),
  upgradeTime: integer("upgrade_time").notNull(),
  bonusMultiplier: real("bonus_multiplier").notNull().default(1),
  description: text("description"),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
});

export type BuildingLevel = typeof buildingLevelsTable.$inferSelect;

export const constructionProjectsTable = pgTable("construction_projects", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  parcelId:    text("parcel_id").notNull().references(() => landParcelsTable.id, { onDelete: "cascade" }),
  buildingId:  text("building_id").references(() => landBuildingsTable.id),
  ownerId:     text("owner_id").notNull(),
  name:        text("name").notNull(),
  type:        buildingTypeEnum("type").notNull(),
  status:      constructionStatusEnum("status").notNull().default("QUEUED"),
  progress:    integer("progress").notNull().default(0),
  totalSteps:  integer("total_steps").notNull().default(100),
  cost:        real("cost").notNull().default(0),
  workers:     integer("workers").notNull().default(1),
  startAt:     timestamp("start_at"),
  endAt:       timestamp("end_at"),
  completedAt: timestamp("completed_at"),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("construction_projects_parcel_idx").on(t.parcelId)]);

export type ConstructionProject = typeof constructionProjectsTable.$inferSelect;
export type NewConstructionProject = typeof constructionProjectsTable.$inferInsert;

export const constructionMaterialsTable = pgTable("construction_materials", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  projectId:     text("project_id").notNull().references(() => constructionProjectsTable.id, { onDelete: "cascade" }),
  materialName:  text("material_name").notNull(),
  quantity:      real("quantity").notNull().default(0),
  unit:          text("unit").notNull().default("unit"),
  cost:          real("cost").notNull().default(0),
  isDelivered:   boolean("is_delivered").notNull().default(false),
  deliveredAt:   timestamp("delivered_at"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
});

export type ConstructionMaterial = typeof constructionMaterialsTable.$inferSelect;

export const roadsTable = pgTable("roads", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  districtId:  text("district_id").references(() => landDistrictsTable.id),
  name:        text("name").notNull(),
  type:        roadTypeEnum("type").notNull().default("STREET"),
  fromX:       real("from_x").notNull().default(0),
  fromY:       real("from_y").notNull().default(0),
  toX:         real("to_x").notNull().default(0),
  toY:         real("to_y").notNull().default(0),
  length:      real("length").notNull().default(0),
  speedLimit:  integer("speed_limit").notNull().default(50),
  lanes:       integer("lanes").notNull().default(2),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export type Road = typeof roadsTable.$inferSelect;
export type NewRoad = typeof roadsTable.$inferInsert;

export const bridgesTable = pgTable("bridges", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  fromDistrictId: text("from_district_id").references(() => landDistrictsTable.id),
  toDistrictId:   text("to_district_id").references(() => landDistrictsTable.id),
  fromX:       real("from_x").notNull().default(0),
  fromY:       real("from_y").notNull().default(0),
  toX:         real("to_x").notNull().default(0),
  toY:         real("to_y").notNull().default(0),
  length:      real("length").notNull().default(0),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export type Bridge = typeof bridgesTable.$inferSelect;

export const utilitiesTable = pgTable("utilities", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  districtId:  text("district_id").references(() => landDistrictsTable.id),
  name:        text("name").notNull(),
  type:        utilityTypeEnum("type").notNull(),
  capacity:    real("capacity").notNull().default(1000),
  usage:       real("usage").notNull().default(0),
  isActive:    boolean("is_active").notNull().default(true),
  costPerUnit: real("cost_per_unit").notNull().default(0.1),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export type Utility = typeof utilitiesTable.$inferSelect;
export type NewUtility = typeof utilitiesTable.$inferInsert;

export const teleportPortsTable = pgTable("teleport_ports", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  parcelId:    text("parcel_id").references(() => landParcelsTable.id),
  ownerId:     text("owner_id"),
  name:        text("name").notNull(),
  type:        teleportTypeEnum("type").notNull().default("PUBLIC"),
  destinationX: real("destination_x").notNull().default(0),
  destinationY: real("destination_y").notNull().default(0),
  cooldown:    integer("cooldown").notNull().default(300),
  usageCount:  integer("usage_count").notNull().default(0),
  maxUses:     integer("max_uses"),
  cost:        real("cost").notNull().default(0),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export type TeleportPort = typeof teleportPortsTable.$inferSelect;
export type NewTeleportPort = typeof teleportPortsTable.$inferInsert;

export const landBookmarksTable = pgTable("land_bookmarks", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  userId:    text("user_id").notNull(),
  parcelId:  text("parcel_id").notNull().references(() => landParcelsTable.id, { onDelete: "cascade" }),
  note:      text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type LandBookmark = typeof landBookmarksTable.$inferSelect;

export const landPermissionsTable = pgTable("land_permissions", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  parcelId:    text("parcel_id").notNull().references(() => landParcelsTable.id, { onDelete: "cascade" }),
  userId:      text("user_id").notNull(),
  canBuild:    boolean("can_build").notNull().default(false),
  canDestroy:  boolean("can_destroy").notNull().default(false),
  canVisit:    boolean("can_visit").notNull().default(true),
  canManage:   boolean("can_manage").notNull().default(false),
  grantedBy:   text("granted_by").notNull(),
  grantedAt:   timestamp("granted_at").notNull().defaultNow(),
  expiresAt:   timestamp("expires_at"),
});

export type LandPermission = typeof landPermissionsTable.$inferSelect;

export const landVisitorsTable = pgTable("land_visitors", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  parcelId:  text("parcel_id").notNull().references(() => landParcelsTable.id, { onDelete: "cascade" }),
  userId:    text("user_id").notNull(),
  visitedAt: timestamp("visited_at").notNull().defaultNow(),
  duration:  integer("duration"),
});

export type LandVisitor = typeof landVisitorsTable.$inferSelect;

export const landRatingsTable = pgTable("land_ratings", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  parcelId:  text("parcel_id").notNull().references(() => landParcelsTable.id, { onDelete: "cascade" }),
  userId:    text("user_id").notNull(),
  rating:    integer("rating").notNull().default(5),
  review:    text("review"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type LandRating = typeof landRatingsTable.$inferSelect;

export const landMarketplaceTable = pgTable("land_marketplace", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  parcelId:    text("parcel_id").notNull().references(() => landParcelsTable.id, { onDelete: "cascade" }),
  sellerId:    text("seller_id").notNull(),
  price:       real("price").notNull(),
  listingType: text("listing_type").notNull().default("SALE"),
  rentalDuration: integer("rental_duration"),
  description: text("description"),
  isActive:    boolean("is_active").notNull().default(true),
  expiresAt:   timestamp("expires_at"),
  soldAt:      timestamp("sold_at"),
  buyerId:     text("buyer_id"),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("land_marketplace_parcel_idx").on(t.parcelId)]);

export type LandMarketplaceListing = typeof landMarketplaceTable.$inferSelect;
export type NewLandMarketplaceListing = typeof landMarketplaceTable.$inferInsert;

export const landTransactionsTable = pgTable("land_transactions", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  parcelId:    text("parcel_id").notNull().references(() => landParcelsTable.id),
  fromUserId:  text("from_user_id"),
  toUserId:    text("to_user_id"),
  type:        text("type").notNull(),
  amount:      real("amount").notNull().default(0),
  description: text("description"),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("land_transactions_parcel_idx").on(t.parcelId)]);

export type LandTransaction = typeof landTransactionsTable.$inferSelect;
export type NewLandTransaction = typeof landTransactionsTable.$inferInsert;

export const landEventsTable = pgTable("land_events", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  regionId:    text("region_id").references(() => landRegionsTable.id),
  cityId:      text("city_id").references(() => landCitiesTable.id),
  name:        text("name").notNull(),
  description: text("description"),
  type:        text("type").notNull().default("GENERAL"),
  startAt:     timestamp("start_at"),
  endAt:       timestamp("end_at"),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export type LandEvent = typeof landEventsTable.$inferSelect;

export const landStatisticsTable = pgTable("land_statistics", {
  id:              text("id").primaryKey().$defaultFn(() => createId()),
  regionId:        text("region_id").references(() => landRegionsTable.id),
  cityId:          text("city_id").references(() => landCitiesTable.id),
  totalParcels:    integer("total_parcels").notNull().default(0),
  ownedParcels:    integer("owned_parcels").notNull().default(0),
  totalBuildings:  integer("total_buildings").notNull().default(0),
  totalPopulation: integer("total_population").notNull().default(0),
  totalValue:      real("total_value").notNull().default(0),
  avgParcelValue:  real("avg_parcel_value").notNull().default(0),
  totalRevenue:    real("total_revenue").notNull().default(0),
  recordedAt:      timestamp("recorded_at").notNull().defaultNow(),
});

export type LandStatistic = typeof landStatisticsTable.$inferSelect;

export const landLogsTable = pgTable("land_logs", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id"),
  parcelId:    text("parcel_id").references(() => landParcelsTable.id),
  action:      text("action").notNull(),
  description: text("description"),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export type LandLog = typeof landLogsTable.$inferSelect;

export const landSettingsTable = pgTable("land_settings", {
  id:                text("id").primaryKey().$defaultFn(() => createId()),
  key:               text("key").notNull().unique(),
  value:             text("value").notNull(),
  description:       text("description"),
  updatedAt:         timestamp("updated_at").notNull().defaultNow(),
});

export type LandSetting = typeof landSettingsTable.$inferSelect;
