import {
  pgTable, text, integer, real, boolean, jsonb,
  timestamp, pgEnum, index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const petRarityEnum = pgEnum("pet_rarity", [
  "COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC",
]);

export const petTypeEnum = pgEnum("pet_type", [
  "BEAST", "DRAGON", "SPIRIT", "MECHANICAL", "ELEMENTAL", "CELESTIAL",
]);

export const mountTypeEnum = pgEnum("mount_type", [
  "HORSE", "WOLF", "DRAGON", "PHOENIX", "TIGER", "MECH",
]);

export const mountStatusEnum = pgEnum("mount_status", [
  "ACTIVE", "RESTING", "TRAINING", "TRAVELING",
]);

// ─── pet_species ──────────────────────────────────────────────────────────────

export const petSpecies = pgTable("pet_species", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  name:           text("name").notNull(),
  description:    text("description"),
  type:           petTypeEnum("type").notNull().default("BEAST"),
  rarity:         petRarityEnum("rarity").notNull().default("COMMON"),
  icon:           text("icon"),
  maxLevel:       integer("max_level").notNull().default(100),
  evolutionLevel: integer("evolution_level"),
  evolutionInto:  text("evolution_into"),
  baseHp:         integer("base_hp").notNull().default(100),
  baseAttack:     integer("base_attack").notNull().default(10),
  baseDefense:    integer("base_defense").notNull().default(5),
  baseSpeed:      integer("base_speed").notNull().default(10),
  baseHappiness:  integer("base_happiness").notNull().default(100),
  bondBonus:      jsonb("bond_bonus"),
  metadata:       jsonb("metadata"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("pet_species_type_idx").on(t.type),
  index("pet_species_rarity_idx").on(t.rarity),
]);

// ─── pets ─────────────────────────────────────────────────────────────────────

export const pets = pgTable("pets", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  speciesId:   text("species_id").notNull(),
  name:        text("name").notNull(),
  nickname:    text("nickname"),
  type:        petTypeEnum("type").notNull().default("BEAST"),
  rarity:      petRarityEnum("rarity").notNull().default("COMMON"),
  level:       integer("level").notNull().default(1),
  experience:  integer("experience").notNull().default(0),
  happiness:   integer("happiness").notNull().default(100),
  hunger:      integer("hunger").notNull().default(100),
  loyalty:     integer("loyalty").notNull().default(0),
  hp:          integer("hp").notNull().default(100),
  maxHp:       integer("max_hp").notNull().default(100),
  attack:      integer("attack").notNull().default(10),
  defense:     integer("defense").notNull().default(5),
  speed:       integer("speed").notNull().default(10),
  isSummoned:  boolean("is_summoned").notNull().default(false),
  isActive:    boolean("is_active").notNull().default(true),
  evolutionStage: integer("evolution_stage").notNull().default(1),
  lastFedAt:   timestamp("last_fed_at"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("pets_user_id_idx").on(t.userId),
  index("pets_species_idx").on(t.speciesId),
  index("pets_summoned_idx").on(t.userId, t.isSummoned),
]);

// ─── pet_skills ───────────────────────────────────────────────────────────────

export const petSkills = pgTable("pet_skills", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  icon:        text("icon"),
  type:        text("type").notNull().default("ACTIVE"),
  baseDamage:  integer("base_damage").notNull().default(0),
  baseHealing: integer("base_healing").notNull().default(0),
  cooldown:    integer("cooldown").notNull().default(1),
  energyCost:  integer("energy_cost").notNull().default(10),
  petType:     petTypeEnum("pet_type"),
  minLevel:    integer("min_level").notNull().default(1),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── pet_levels ───────────────────────────────────────────────────────────────

export const petLevels = pgTable("pet_levels", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  level:        integer("level").notNull(),
  xpRequired:   integer("xp_required").notNull(),
  hpBonus:      integer("hp_bonus").notNull().default(5),
  attackBonus:  integer("attack_bonus").notNull().default(2),
  defenseBonus: integer("defense_bonus").notNull().default(1),
  speedBonus:   integer("speed_bonus").notNull().default(1),
  creditReward: integer("credit_reward").notNull().default(0),
  description:  text("description"),
}, (t) => [
  uniqueIndex("pet_levels_level_idx").on(t.level),
]);

// ─── pet_equipment ────────────────────────────────────────────────────────────

export const petEquipment = pgTable("pet_equipment", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  petId:      text("pet_id").notNull(),
  slot:       text("slot").notNull().default("armor"),
  itemId:     text("item_id"),
  itemName:   text("item_name"),
  itemIcon:   text("item_icon"),
  itemRarity: text("item_rarity"),
  statBonus:  jsonb("stat_bonus"),
  equippedAt: timestamp("equipped_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("pet_equipment_pet_id_idx").on(t.petId),
  uniqueIndex("pet_equipment_pet_slot_idx").on(t.petId, t.slot),
]);

// ─── pet_training ─────────────────────────────────────────────────────────────

export const petTraining = pgTable("pet_training", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  petId:        text("pet_id").notNull(),
  userId:       text("user_id").notNull(),
  trainingType: text("training_type").notNull().default("combat"),
  xpGained:     integer("xp_gained").notNull().default(0),
  statImproved: text("stat_improved"),
  statGain:     integer("stat_gain").notNull().default(0),
  cost:         integer("cost").notNull().default(0),
  duration:     integer("duration").notNull().default(60),
  completedAt:  timestamp("completed_at"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("pet_training_pet_id_idx").on(t.petId),
  index("pet_training_user_id_idx").on(t.userId),
]);

// ─── pet_evolution ────────────────────────────────────────────────────────────

export const petEvolution = pgTable("pet_evolution", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  petId:          text("pet_id").notNull(),
  userId:         text("user_id").notNull(),
  fromStage:      integer("from_stage").notNull(),
  toStage:        integer("to_stage").notNull(),
  fromSpeciesId:  text("from_species_id"),
  toSpeciesId:    text("to_species_id"),
  statsBefore:    jsonb("stats_before"),
  statsAfter:     jsonb("stats_after"),
  evolvedAt:      timestamp("evolved_at").notNull().defaultNow(),
}, (t) => [
  index("pet_evolution_pet_id_idx").on(t.petId),
]);

// ─── pet_bonds ────────────────────────────────────────────────────────────────

export const petBonds = pgTable("pet_bonds", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  petId:        text("pet_id").notNull(),
  userId:       text("user_id").notNull(),
  bondLevel:    integer("bond_level").notNull().default(1),
  bondPoints:   integer("bond_points").notNull().default(0),
  bonusType:    text("bonus_type"),
  bonusValue:   real("bonus_value"),
  lastInteract: timestamp("last_interact"),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("pet_bonds_pet_user_idx").on(t.petId, t.userId),
]);

// ─── pet_inventory ────────────────────────────────────────────────────────────

export const petInventory = pgTable("pet_inventory", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  userId:     text("user_id").notNull(),
  itemType:   text("item_type").notNull().default("food"),
  itemKey:    text("item_key").notNull(),
  itemName:   text("item_name").notNull(),
  itemIcon:   text("item_icon"),
  quantity:   integer("quantity").notNull().default(1),
  effect:     jsonb("effect"),
  metadata:   jsonb("metadata"),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("pet_inventory_user_id_idx").on(t.userId),
  uniqueIndex("pet_inventory_user_item_idx").on(t.userId, t.itemKey),
]);

// ─── pet_logs ─────────────────────────────────────────────────────────────────

export const petLogs = pgTable("pet_logs", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  petId:     text("pet_id").notNull(),
  userId:    text("user_id").notNull(),
  action:    text("action").notNull(),
  detail:    text("detail"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("pet_logs_pet_id_idx").on(t.petId),
  index("pet_logs_user_id_idx").on(t.userId),
]);

// ─── pet_learned_skills ───────────────────────────────────────────────────────

export const petLearnedSkills = pgTable("pet_learned_skills", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  petId:      text("pet_id").notNull(),
  skillId:    text("skill_id").notNull(),
  level:      integer("level").notNull().default(1),
  isEquipped: boolean("is_equipped").notNull().default(false),
  learnedAt:  timestamp("learned_at").notNull().defaultNow(),
}, (t) => [
  index("pet_learned_skills_pet_id_idx").on(t.petId),
  uniqueIndex("pet_learned_skills_pet_skill_idx").on(t.petId, t.skillId),
]);

// ─── mount_types ──────────────────────────────────────────────────────────────

export const mountTypes = pgTable("mount_types", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  name:         text("name").notNull(),
  type:         mountTypeEnum("type").notNull().default("HORSE"),
  description:  text("description"),
  icon:         text("icon"),
  rarity:       petRarityEnum("rarity").notNull().default("COMMON"),
  baseSpeed:    integer("base_speed").notNull().default(100),
  baseStamina:  integer("base_stamina").notNull().default(100),
  maxLevel:     integer("max_level").notNull().default(50),
  travelBonus:  real("travel_bonus").notNull().default(1.0),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});

// ─── mounts ───────────────────────────────────────────────────────────────────

export const mounts = pgTable("mounts", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  typeId:      text("type_id").notNull(),
  name:        text("name").notNull(),
  type:        mountTypeEnum("type").notNull().default("HORSE"),
  rarity:      petRarityEnum("rarity").notNull().default("COMMON"),
  status:      mountStatusEnum("status").notNull().default("RESTING"),
  level:       integer("level").notNull().default(1),
  experience:  integer("experience").notNull().default(0),
  speed:       integer("speed").notNull().default(100),
  stamina:     integer("stamina").notNull().default(100),
  maxStamina:  integer("max_stamina").notNull().default(100),
  isActive:    boolean("is_active").notNull().default(true),
  color:       text("color"),
  pattern:     text("pattern"),
  accessories: jsonb("accessories"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("mounts_user_id_idx").on(t.userId),
  index("mounts_status_idx").on(t.status),
]);

// ─── mount_levels ─────────────────────────────────────────────────────────────

export const mountLevels = pgTable("mount_levels", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  level:         integer("level").notNull(),
  xpRequired:    integer("xp_required").notNull(),
  speedBonus:    integer("speed_bonus").notNull().default(5),
  staminaBonus:  integer("stamina_bonus").notNull().default(10),
  travelBonus:   real("travel_bonus").notNull().default(0.01),
  creditReward:  integer("credit_reward").notNull().default(0),
}, (t) => [
  uniqueIndex("mount_levels_level_idx").on(t.level),
]);

// ─── mount_equipment ──────────────────────────────────────────────────────────

export const mountEquipment = pgTable("mount_equipment", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  mountId:    text("mount_id").notNull(),
  slot:       text("slot").notNull().default("saddle"),
  itemId:     text("item_id"),
  itemName:   text("item_name"),
  itemIcon:   text("item_icon"),
  itemRarity: text("item_rarity"),
  statBonus:  jsonb("stat_bonus"),
  equippedAt: timestamp("equipped_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("mount_equipment_mount_id_idx").on(t.mountId),
  uniqueIndex("mount_equipment_mount_slot_idx").on(t.mountId, t.slot),
]);

// ─── mount_skills ─────────────────────────────────────────────────────────────

export const mountSkills = pgTable("mount_skills", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  icon:        text("icon"),
  effect:      text("effect").notNull().default("speed"),
  value:       real("value").notNull().default(1.1),
  mountType:   mountTypeEnum("mount_type"),
  minLevel:    integer("min_level").notNull().default(1),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── mount_learned_skills ─────────────────────────────────────────────────────

export const mountLearnedSkills = pgTable("mount_learned_skills", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  mountId:   text("mount_id").notNull(),
  skillId:   text("skill_id").notNull(),
  level:     integer("level").notNull().default(1),
  learnedAt: timestamp("learned_at").notNull().defaultNow(),
}, (t) => [
  index("mount_learned_skills_mount_id_idx").on(t.mountId),
  uniqueIndex("mount_learned_skills_mount_skill_idx").on(t.mountId, t.skillId),
]);

// ─── mount_training ───────────────────────────────────────────────────────────

export const mountTraining = pgTable("mount_training", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  mountId:      text("mount_id").notNull(),
  userId:       text("user_id").notNull(),
  trainingType: text("training_type").notNull().default("speed"),
  xpGained:     integer("xp_gained").notNull().default(0),
  statImproved: text("stat_improved"),
  statGain:     integer("stat_gain").notNull().default(0),
  cost:         integer("cost").notNull().default(0),
  duration:     integer("duration").notNull().default(60),
  completedAt:  timestamp("completed_at"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("mount_training_mount_id_idx").on(t.mountId),
  index("mount_training_user_id_idx").on(t.userId),
]);

// ─── mount_routes ─────────────────────────────────────────────────────────────

export const mountRoutes = pgTable("mount_routes", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  origin:      text("origin").notNull(),
  destination: text("destination").notNull(),
  distance:    integer("distance").notNull().default(100),
  baseDuration:integer("base_duration").notNull().default(3600),
  xpReward:    integer("xp_reward").notNull().default(50),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("mount_routes_origin_idx").on(t.origin),
]);

// ─── mount_travel_logs ────────────────────────────────────────────────────────

export const mountTravelLogs = pgTable("mount_travel_logs", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  mountId:     text("mount_id").notNull(),
  userId:      text("user_id").notNull(),
  routeId:     text("route_id"),
  origin:      text("origin").notNull(),
  destination: text("destination").notNull(),
  distance:    integer("distance").notNull().default(100),
  duration:    integer("duration").notNull().default(3600),
  xpGained:   integer("xp_gained").notNull().default(0),
  staminaUsed: integer("stamina_used").notNull().default(10),
  startedAt:   timestamp("started_at").notNull().defaultNow(),
  arrivedAt:   timestamp("arrived_at"),
  status:      text("status").notNull().default("TRAVELING"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("mount_travel_logs_mount_id_idx").on(t.mountId),
  index("mount_travel_logs_user_id_idx").on(t.userId),
]);

// ─── mount_statistics ─────────────────────────────────────────────────────────

export const mountStatistics = pgTable("mount_statistics", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  userId:         text("user_id").notNull(),
  totalMounts:    integer("total_mounts").notNull().default(0),
  totalTravels:   integer("total_travels").notNull().default(0),
  totalDistance:  integer("total_distance").notNull().default(0),
  totalXpEarned:  integer("total_xp_earned").notNull().default(0),
  fastestTravel:  integer("fastest_travel"),
  favoriteMount:  text("favorite_mount"),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("mount_statistics_user_id_idx").on(t.userId),
]);

// ─── mount_customization ──────────────────────────────────────────────────────

export const mountCustomization = pgTable("mount_customization", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  mountId:     text("mount_id").notNull(),
  color:       text("color").notNull().default("#8B4513"),
  pattern:     text("pattern").notNull().default("solid"),
  saddle:      text("saddle").notNull().default("default"),
  armor:       text("armor").notNull().default("none"),
  accessories: jsonb("accessories"),
  glowEffect:  text("glow_effect"),
  trailEffect: text("trail_effect"),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("mount_customization_mount_id_idx").on(t.mountId),
]);
