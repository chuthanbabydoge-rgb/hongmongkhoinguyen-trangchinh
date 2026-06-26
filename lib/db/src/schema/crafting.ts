import {
  pgTable, pgEnum, text, integer, boolean, timestamp,
  jsonb, index, uniqueIndex, real,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const craftJobStatusEnum = pgEnum("craft_job_status", [
  "PENDING", "CRAFTING", "FINISHED", "FAILED", "CANCELLED",
]);

export const resourceTypeEnum = pgEnum("resource_type", [
  "WOOD", "STONE", "IRON", "GOLD", "CRYSTAL", "MAGIC", "FOOD", "HERB",
]);

export const upgradeTypeEnum = pgEnum("upgrade_type", [
  "LEVEL", "RARITY", "ENCHANT", "SOCKET",
]);

// ─── Crafting Recipes ─────────────────────────────────────────────────────────

export const craftingRecipes = pgTable("crafting_recipes", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  name:           text("name").notNull(),
  description:    text("description"),
  category:       text("category").notNull().default("GENERAL"),
  craftingTime:   integer("crafting_time").notNull().default(60),
  craftingCost:   integer("crafting_cost").notNull().default(0),
  requiredLevel:  integer("required_level").notNull().default(1),
  stationId:      text("station_id"),
  isEnabled:      boolean("is_enabled").notNull().default(true),
  metadata:       jsonb("metadata"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
}, t => [
  index("cr_category_idx").on(t.category),
  index("cr_enabled_idx").on(t.isEnabled),
]);

export const recipeIngredients = pgTable("recipe_ingredients", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  recipeId:     text("recipe_id").notNull().references(() => craftingRecipes.id, { onDelete: "cascade" }),
  resourceType: resourceTypeEnum("resource_type"),
  itemType:     text("item_type"),
  quantity:     integer("quantity").notNull().default(1),
}, t => [
  index("ri_recipe_idx").on(t.recipeId),
]);

export const recipeOutputs = pgTable("recipe_outputs", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  recipeId:       text("recipe_id").notNull().references(() => craftingRecipes.id, { onDelete: "cascade" }),
  resourceType:   resourceTypeEnum("resource_type"),
  itemType:       text("item_type"),
  quantity:       integer("quantity").notNull().default(1),
  chance:         real("chance").notNull().default(100),
  isGuaranteed:   boolean("is_guaranteed").notNull().default(true),
}, t => [
  index("ro_recipe_idx").on(t.recipeId),
]);

// ─── Crafting Jobs ────────────────────────────────────────────────────────────

export const userCraftingJobs = pgTable("user_crafting_jobs", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  recipeId:    text("recipe_id").notNull().references(() => craftingRecipes.id),
  status:      craftJobStatusEnum("status").notNull().default("PENDING"),
  startedAt:   timestamp("started_at").notNull().defaultNow(),
  finishesAt:  timestamp("finishes_at").notNull(),
  completedAt: timestamp("completed_at"),
  metadata:    jsonb("metadata"),
}, t => [
  index("ucj_user_idx").on(t.userId),
  index("ucj_status_idx").on(t.status),
]);

// ─── Resource Nodes ───────────────────────────────────────────────────────────

export const resourceNodes = pgTable("resource_nodes", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  worldId:      text("world_id"),
  name:         text("name").notNull(),
  resourceType: resourceTypeEnum("resource_type").notNull(),
  maxAmount:    integer("max_amount").notNull().default(100),
  currentAmount: integer("current_amount").notNull().default(100),
  respawnTime:  integer("respawn_time").notNull().default(300),
  posX:         real("pos_x").notNull().default(0),
  posY:         real("pos_y").notNull().default(0),
  isActive:     boolean("is_active").notNull().default(true),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, t => [
  index("rn_world_idx").on(t.worldId),
  index("rn_type_idx").on(t.resourceType),
  index("rn_active_idx").on(t.isActive),
]);

export const resourceSpawns = pgTable("resource_spawns", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  nodeId:    text("node_id").notNull().references(() => resourceNodes.id, { onDelete: "cascade" }),
  amount:    integer("amount").notNull(),
  spawnedAt: timestamp("spawned_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
}, t => [
  index("rs_node_idx").on(t.nodeId),
]);

export const resourceGatherLogs = pgTable("resource_gather_logs", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  nodeId:      text("node_id").notNull().references(() => resourceNodes.id),
  amount:      integer("amount").notNull(),
  gatheredAt:  timestamp("gathered_at").notNull().defaultNow(),
}, t => [
  index("rgl_user_idx").on(t.userId),
  index("rgl_node_idx").on(t.nodeId),
]);

// ─── NPC Shops ────────────────────────────────────────────────────────────────

export const npcShops = pgTable("npc_shops", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  worldId:     text("world_id"),
  name:        text("name").notNull(),
  description: text("description"),
  currency:    text("currency").notNull().default("CREDITS"),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, t => [
  index("ns_world_idx").on(t.worldId),
  index("ns_active_idx").on(t.isActive),
]);

export const npcShopItems = pgTable("npc_shop_items", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  shopId:       text("shop_id").notNull().references(() => npcShops.id, { onDelete: "cascade" }),
  name:         text("name").notNull(),
  resourceType: resourceTypeEnum("resource_type"),
  itemType:     text("item_type"),
  buyPrice:     integer("buy_price").notNull().default(0),
  sellPrice:    integer("sell_price").notNull().default(0),
  stock:        integer("stock").notNull().default(-1),
  maxStock:     integer("max_stock").notNull().default(-1),
  isInfinite:   boolean("is_infinite").notNull().default(true),
  metadata:     jsonb("metadata"),
}, t => [
  index("nsi_shop_idx").on(t.shopId),
]);

// ─── Crafting Stations ────────────────────────────────────────────────────────

export const craftingStations = pgTable("crafting_stations", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  name:          text("name").notNull(),
  stationType:   text("station_type").notNull().default("BASIC"),
  requiredLevel: integer("required_level").notNull().default(1),
  isGuild:       boolean("is_guild").notNull().default(false),
  guildId:       text("guild_id"),
  worldId:       text("world_id"),
  isActive:      boolean("is_active").notNull().default(true),
  metadata:      jsonb("metadata"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
}, t => [
  index("cs_type_idx").on(t.stationType),
  index("cs_guild_idx").on(t.guildId),
]);

// ─── User Blueprints ──────────────────────────────────────────────────────────

export const userBlueprints = pgTable("user_blueprints", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  recipeId:    text("recipe_id").notNull().references(() => craftingRecipes.id),
  unlockedAt:  timestamp("unlocked_at").notNull().defaultNow(),
}, t => [
  index("ub_user_idx").on(t.userId),
  uniqueIndex("ub_user_recipe_idx").on(t.userId, t.recipeId),
]);

// ─── Item Enchantments & Upgrades ─────────────────────────────────────────────

export const itemEnchantments = pgTable("item_enchantments", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  itemId:       text("item_id").notNull(),
  userId:       text("user_id").notNull(),
  enchantType:  text("enchant_type").notNull(),
  value:        real("value").notNull().default(0),
  metadata:     jsonb("metadata"),
  enchantedAt:  timestamp("enchanted_at").notNull().defaultNow(),
}, t => [
  index("ie_item_idx").on(t.itemId),
  index("ie_user_idx").on(t.userId),
]);

export const itemUpgrades = pgTable("item_upgrades", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  itemId:      text("item_id").notNull(),
  userId:      text("user_id").notNull(),
  upgradeType: upgradeTypeEnum("upgrade_type").notNull().default("LEVEL"),
  level:       integer("level").notNull().default(1),
  cost:        integer("cost").notNull().default(0),
  metadata:    jsonb("metadata"),
  upgradedAt:  timestamp("upgraded_at").notNull().defaultNow(),
}, t => [
  index("iu_item_idx").on(t.itemId),
  index("iu_user_idx").on(t.userId),
]);

// ─── Economy ──────────────────────────────────────────────────────────────────

export const economyStatistics = pgTable("economy_statistics", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  date:          text("date").notNull(),
  totalCrafted:  integer("total_crafted").notNull().default(0),
  totalGathered: integer("total_gathered").notNull().default(0),
  totalTraded:   integer("total_traded").notNull().default(0),
  totalNpcBuys:  integer("total_npc_buys").notNull().default(0),
  totalNpcSells: integer("total_npc_sells").notNull().default(0),
  creditsSpent:  integer("credits_spent").notNull().default(0),
  creditsEarned: integer("credits_earned").notNull().default(0),
  metadata:      jsonb("metadata"),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
}, t => [
  uniqueIndex("es_date_idx").on(t.date),
]);

export const resourceMarketPrices = pgTable("resource_market_prices", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  resourceType: resourceTypeEnum("resource_type").notNull(),
  price:        integer("price").notNull().default(10),
  change:       real("change").notNull().default(0),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, t => [
  uniqueIndex("rmp_type_idx").on(t.resourceType),
]);

export const craftingHistory = pgTable("crafting_history", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  userId:       text("user_id").notNull(),
  recipeId:     text("recipe_id").notNull().references(() => craftingRecipes.id),
  jobId:        text("job_id"),
  success:      boolean("success").notNull().default(true),
  outputItemId: text("output_item_id"),
  creditsSpent: integer("credits_spent").notNull().default(0),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, t => [
  index("ch_user_idx").on(t.userId),
  index("ch_recipe_idx").on(t.recipeId),
]);
