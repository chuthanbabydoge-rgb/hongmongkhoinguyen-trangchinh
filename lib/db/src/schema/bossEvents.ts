import {
  pgTable, text, integer, real, boolean, jsonb,
  timestamp, pgEnum, index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const bossTypeEnum = pgEnum("boss_type", [
  "WORLD", "DUNGEON", "RAID", "SEASONAL", "LEGENDARY",
]);

export const bossStateEnum = pgEnum("boss_state", [
  "IDLE", "SPAWNING", "ACTIVE", "ENRAGED", "RETREAT", "DEAD",
]);

export const eventTypeEnum = pgEnum("world_event_type", [
  "INVASION", "DEFENSE", "ESCORT", "TREASURE", "WORLD_BOSS", "SEASONAL",
]);

export const weatherTypeEnum = pgEnum("weather_type", [
  "SUNNY", "RAIN", "SNOW", "STORM", "FOG", "MAGIC",
]);

// ─── world_bosses ─────────────────────────────────────────────────────────────

export const worldBosses = pgTable("world_bosses", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  name:           text("name").notNull(),
  description:    text("description"),
  type:           bossTypeEnum("type").notNull().default("WORLD"),
  state:          bossStateEnum("state").notNull().default("IDLE"),
  level:          integer("level").notNull().default(1),
  hp:             integer("hp").notNull().default(100000),
  maxHp:          integer("max_hp").notNull().default(100000),
  attack:         integer("attack").notNull().default(500),
  defense:        integer("defense").notNull().default(200),
  speed:          integer("speed").notNull().default(100),
  currentPhase:   integer("current_phase").notNull().default(1),
  totalPhases:    integer("total_phases").notNull().default(3),
  enrageThreshold: real("enrage_threshold").notNull().default(0.3),
  isEnraged:      boolean("is_enraged").notNull().default(false),
  minPlayers:     integer("min_players").notNull().default(5),
  maxPlayers:     integer("max_players").notNull().default(50),
  rewardCredits:  integer("reward_credits").notNull().default(1000),
  rewardXp:       integer("reward_xp").notNull().default(5000),
  respawnSeconds: integer("respawn_seconds").notNull().default(3600),
  icon:           text("icon"),
  region:         text("region"),
  lore:           text("lore"),
  metadata:       jsonb("metadata"),
  lastSpawnAt:    timestamp("last_spawn_at"),
  nextSpawnAt:    timestamp("next_spawn_at"),
  defeatedAt:     timestamp("defeated_at"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("world_bosses_type_idx").on(t.type),
  index("world_bosses_state_idx").on(t.state),
]);

// ─── boss_spawn_points ────────────────────────────────────────────────────────

export const bossSpawnPoints = pgTable("boss_spawn_points", {
  id:       text("id").primaryKey().$defaultFn(() => createId()),
  bossId:   text("boss_id").notNull(),
  region:   text("region").notNull(),
  coordX:   real("coord_x").notNull().default(0),
  coordY:   real("coord_y").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("boss_spawn_boss_idx").on(t.bossId),
]);

// ─── boss_spawn_schedule ──────────────────────────────────────────────────────

export const bossSpawnSchedule = pgTable("boss_spawn_schedule", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  bossId:     text("boss_id").notNull(),
  cronExpr:   text("cron_expr"),
  intervalSec: integer("interval_sec"),
  nextSpawnAt: timestamp("next_spawn_at"),
  isActive:   boolean("is_active").notNull().default(true),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("boss_schedule_boss_idx").on(t.bossId),
]);

// ─── boss_ai_states ───────────────────────────────────────────────────────────

export const bossAiStates = pgTable("boss_ai_states", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  bossId:        text("boss_id").notNull(),
  threatTable:   jsonb("threat_table"),
  currentTarget: text("current_target"),
  lastSkillUsed: text("last_skill_used"),
  nextSkillAt:   timestamp("next_skill_at"),
  aiMode:        text("ai_mode").notNull().default("NORMAL"),
  metadata:      jsonb("metadata"),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("boss_ai_boss_idx").on(t.bossId),
]);

// ─── boss_skills ──────────────────────────────────────────────────────────────

export const bossSkills = pgTable("boss_skills", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  bossId:      text("boss_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  type:        text("type").notNull().default("DAMAGE"),
  damage:      integer("damage").notNull().default(0),
  healing:     integer("healing").notNull().default(0),
  cooldownSec: integer("cooldown_sec").notNull().default(10),
  aoeRadius:   real("aoe_radius").notNull().default(0),
  phase:       integer("phase").notNull().default(1),
  isEnrageSkill: boolean("is_enrage_skill").notNull().default(false),
  icon:        text("icon"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("boss_skills_boss_idx").on(t.bossId),
]);

// ─── boss_skill_rotation ──────────────────────────────────────────────────────

export const bossSkillRotation = pgTable("boss_skill_rotation", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  bossId:      text("boss_id").notNull(),
  skillId:     text("skill_id").notNull(),
  instanceId:  text("instance_id"),
  casterId:    text("caster_id"),
  targetId:    text("target_id"),
  damage:      integer("damage").notNull().default(0),
  castedAt:    timestamp("casted_at").notNull().defaultNow(),
}, (t) => [
  index("boss_rotation_boss_idx").on(t.bossId),
  index("boss_rotation_instance_idx").on(t.instanceId),
]);

// ─── boss_phases ──────────────────────────────────────────────────────────────

export const bossPhases = pgTable("boss_phases", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  bossId:        text("boss_id").notNull(),
  phase:         integer("phase").notNull().default(1),
  name:          text("name").notNull(),
  description:   text("description"),
  hpThreshold:   real("hp_threshold").notNull().default(1.0),
  damageMulti:   real("damage_multi").notNull().default(1.0),
  speedMulti:    real("speed_multi").notNull().default(1.0),
  isEnragePhase: boolean("is_enrage_phase").notNull().default(false),
  metadata:      jsonb("metadata"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("boss_phases_boss_idx").on(t.bossId),
]);

// ─── boss_loot_tables ─────────────────────────────────────────────────────────

export const bossLootTables = pgTable("boss_loot_tables", {
  id:       text("id").primaryKey().$defaultFn(() => createId()),
  bossId:   text("boss_id").notNull(),
  itemName: text("item_name").notNull(),
  itemType: text("item_type").notNull().default("MATERIAL"),
  rarity:   text("rarity").notNull().default("COMMON"),
  dropRate: real("drop_rate").notNull().default(0.1),
  quantity: integer("quantity").notNull().default(1),
  minLevel: integer("min_level").notNull().default(1),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("boss_loot_boss_idx").on(t.bossId),
]);

// ─── boss_damage_logs ─────────────────────────────────────────────────────────

export const bossDamageLogs = pgTable("boss_damage_logs", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  bossId:     text("boss_id").notNull(),
  userId:     text("user_id").notNull(),
  skillName:  text("skill_name"),
  damage:     integer("damage").notNull().default(0),
  healing:    integer("healing").notNull().default(0),
  isCrit:     boolean("is_crit").notNull().default(false),
  bossHpAfter: integer("boss_hp_after"),
  phase:      integer("phase").notNull().default(1),
  loggedAt:   timestamp("logged_at").notNull().defaultNow(),
}, (t) => [
  index("boss_damage_boss_idx").on(t.bossId),
  index("boss_damage_user_idx").on(t.userId),
]);

// ─── boss_participants ────────────────────────────────────────────────────────

export const bossParticipants = pgTable("boss_participants", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  bossId:       text("boss_id").notNull(),
  userId:       text("user_id").notNull(),
  totalDamage:  integer("total_damage").notNull().default(0),
  totalHealing: integer("total_healing").notNull().default(0),
  joinedAt:     timestamp("joined_at").notNull().defaultNow(),
  leftAt:       timestamp("left_at"),
  isAlive:      boolean("is_alive").notNull().default(true),
  hp:           integer("hp").notNull().default(1000),
  maxHp:        integer("max_hp").notNull().default(1000),
}, (t) => [
  index("boss_participants_boss_idx").on(t.bossId),
  index("boss_participants_user_idx").on(t.userId),
]);

// ─── world_events ─────────────────────────────────────────────────────────────

export const worldEvents = pgTable("world_events", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  name:         text("name").notNull(),
  description:  text("description"),
  type:         eventTypeEnum("type").notNull().default("INVASION"),
  status:       text("status").notNull().default("UPCOMING"),
  region:       text("region"),
  maxParticipants: integer("max_participants").notNull().default(100),
  rewardCredits: integer("reward_credits").notNull().default(500),
  rewardXp:     integer("reward_xp").notNull().default(2000),
  startsAt:     timestamp("starts_at"),
  endsAt:       timestamp("ends_at"),
  completedAt:  timestamp("completed_at"),
  icon:         text("icon"),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("world_events_type_idx").on(t.type),
  index("world_events_status_idx").on(t.status),
]);

// ─── world_event_objectives ───────────────────────────────────────────────────

export const worldEventObjectives = pgTable("world_event_objectives", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  eventId:   text("event_id").notNull(),
  name:      text("name").notNull(),
  description: text("description"),
  target:    integer("target").notNull().default(100),
  current:   integer("current").notNull().default(0),
  isComplete: boolean("is_complete").notNull().default(false),
  order:     integer("order").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("event_objectives_event_idx").on(t.eventId),
]);

// ─── world_event_rewards ──────────────────────────────────────────────────────

export const worldEventRewards = pgTable("world_event_rewards", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  eventId:    text("event_id").notNull(),
  userId:     text("user_id").notNull(),
  credits:    integer("credits").notNull().default(0),
  xp:         integer("xp").notNull().default(0),
  items:      jsonb("items"),
  claimedAt:  timestamp("claimed_at").notNull().defaultNow(),
}, (t) => [
  index("event_rewards_event_idx").on(t.eventId),
  index("event_rewards_user_idx").on(t.userId),
]);

// ─── world_event_progress ─────────────────────────────────────────────────────

export const worldEventProgress = pgTable("world_event_progress", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  eventId:     text("event_id").notNull(),
  objectiveId: text("objective_id").notNull(),
  userId:      text("user_id").notNull(),
  contribution: integer("contribution").notNull().default(0),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("event_progress_event_idx").on(t.eventId),
  index("event_progress_user_idx").on(t.userId),
]);

// ─── world_event_participants ─────────────────────────────────────────────────

export const worldEventParticipants = pgTable("world_event_participants", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  eventId:     text("event_id").notNull(),
  userId:      text("user_id").notNull(),
  contribution: integer("contribution").notNull().default(0),
  joinedAt:    timestamp("joined_at").notNull().defaultNow(),
  leftAt:      timestamp("left_at"),
}, (t) => [
  index("event_participants_event_idx").on(t.eventId),
  index("event_participants_user_idx").on(t.userId),
]);

// ─── world_weather ────────────────────────────────────────────────────────────

export const worldWeather = pgTable("world_weather", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  region:      text("region").notNull().default("global"),
  weather:     weatherTypeEnum("weather").notNull().default("SUNNY"),
  intensity:   real("intensity").notNull().default(1.0),
  description: text("description"),
  endsAt:      timestamp("ends_at"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("world_weather_region_idx").on(t.region),
]);

// ─── world_disasters ──────────────────────────────────────────────────────────

export const worldDisasters = pgTable("world_disasters", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  region:      text("region").notNull(),
  severity:    integer("severity").notNull().default(1),
  isActive:    boolean("is_active").notNull().default(true),
  startsAt:    timestamp("starts_at").notNull().defaultNow(),
  endsAt:      timestamp("ends_at"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("world_disasters_region_idx").on(t.region),
  index("world_disasters_active_idx").on(t.isActive),
]);

// ─── dynamic_regions ──────────────────────────────────────────────────────────

export const dynamicRegions = pgTable("dynamic_regions", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  name:         text("name").notNull(),
  description:  text("description"),
  currentBossId: text("current_boss_id"),
  currentEventId: text("current_event_id"),
  weather:      weatherTypeEnum("weather").notNull().default("SUNNY"),
  dangerLevel:  integer("danger_level").notNull().default(1),
  isUnlocked:   boolean("is_unlocked").notNull().default(true),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

// ─── boss_statistics ──────────────────────────────────────────────────────────

export const bossStatistics = pgTable("boss_statistics", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  userId:         text("user_id").notNull(),
  bossId:         text("boss_id").notNull(),
  kills:          integer("kills").notNull().default(0),
  totalDamage:    integer("total_damage").notNull().default(0),
  totalHealing:   integer("total_healing").notNull().default(0),
  bestDamage:     integer("best_damage").notNull().default(0),
  participations: integer("participations").notNull().default(0),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("boss_stats_user_idx").on(t.userId),
  index("boss_stats_boss_idx").on(t.bossId),
]);

// ─── boss_rankings ────────────────────────────────────────────────────────────

export const bossRankings = pgTable("boss_rankings", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  bossId:       text("boss_id").notNull(),
  userId:       text("user_id").notNull(),
  totalDamage:  integer("total_damage").notNull().default(0),
  totalHealing: integer("total_healing").notNull().default(0),
  kills:        integer("kills").notNull().default(0),
  rank:         integer("rank"),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("boss_rankings_boss_idx").on(t.bossId),
  index("boss_rankings_damage_idx").on(t.totalDamage),
  index("boss_rankings_user_idx").on(t.userId),
]);
