import {
  pgTable, text, integer, real, boolean, jsonb,
  timestamp, pgEnum, index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const dungeonDifficultyEnum = pgEnum("dungeon_difficulty", [
  "NORMAL", "HARD", "ELITE", "LEGENDARY", "MYTHIC",
]);

export const dungeonStatusEnum = pgEnum("dungeon_status", [
  "WAITING", "ACTIVE", "COMPLETED", "FAILED", "EXPIRED",
]);

export const raidDifficultyEnum = pgEnum("raid_difficulty", [
  "NORMAL", "HEROIC", "MYTHIC", "NIGHTMARE",
]);

export const raidRoleEnum = pgEnum("raid_role", [
  "TANK", "HEALER", "DPS", "SUPPORT",
]);

// ─── dungeons ─────────────────────────────────────────────────────────────────

export const dungeons = pgTable("dungeons", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  difficulty:  dungeonDifficultyEnum("difficulty").notNull().default("NORMAL"),
  minLevel:    integer("min_level").notNull().default(1),
  maxPlayers:  integer("max_players").notNull().default(5),
  timeLimit:   integer("time_limit").notNull().default(3600),
  rewardCredits: integer("reward_credits").notNull().default(100),
  rewardXp:    integer("reward_xp").notNull().default(500),
  icon:        text("icon"),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("dungeons_difficulty_idx").on(t.difficulty),
  index("dungeons_active_idx").on(t.isActive),
]);

// ─── dungeon_regions ──────────────────────────────────────────────────────────

export const dungeonRegions = pgTable("dungeon_regions", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  dungeonId:   text("dungeon_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  order:       integer("order").notNull().default(1),
  icon:        text("icon"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("dungeon_regions_dungeon_idx").on(t.dungeonId),
]);

// ─── dungeon_rooms ────────────────────────────────────────────────────────────

export const dungeonRooms = pgTable("dungeon_rooms", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  regionId:    text("region_id").notNull(),
  dungeonId:   text("dungeon_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  order:       integer("order").notNull().default(1),
  type:        text("type").notNull().default("COMBAT"),
  isBossRoom:  boolean("is_boss_room").notNull().default(false),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("dungeon_rooms_region_idx").on(t.regionId),
  index("dungeon_rooms_dungeon_idx").on(t.dungeonId),
]);

// ─── dungeon_instances ────────────────────────────────────────────────────────

export const dungeonInstances = pgTable("dungeon_instances", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  dungeonId:   text("dungeon_id").notNull(),
  leaderId:    text("leader_id").notNull(),
  status:      dungeonStatusEnum("status").notNull().default("WAITING"),
  difficulty:  dungeonDifficultyEnum("difficulty").notNull().default("NORMAL"),
  currentRoom: integer("current_room").notNull().default(0),
  startedAt:   timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  expiresAt:   timestamp("expires_at"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("dungeon_instances_dungeon_idx").on(t.dungeonId),
  index("dungeon_instances_leader_idx").on(t.leaderId),
  index("dungeon_instances_status_idx").on(t.status),
]);

// ─── dungeon_members ──────────────────────────────────────────────────────────

export const dungeonMembers = pgTable("dungeon_members", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  instanceId: text("instance_id").notNull(),
  userId:     text("user_id").notNull(),
  hp:         integer("hp").notNull().default(100),
  maxHp:      integer("max_hp").notNull().default(100),
  isAlive:    boolean("is_alive").notNull().default(true),
  revives:    integer("revives").notNull().default(0),
  joinedAt:   timestamp("joined_at").notNull().defaultNow(),
  leftAt:     timestamp("left_at"),
}, (t) => [
  index("dungeon_members_instance_idx").on(t.instanceId),
  index("dungeon_members_user_idx").on(t.userId),
]);

// ─── dungeon_monsters ─────────────────────────────────────────────────────────

export const dungeonMonsters = pgTable("dungeon_monsters", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  roomId:      text("room_id").notNull(),
  dungeonId:   text("dungeon_id").notNull(),
  name:        text("name").notNull(),
  type:        text("type").notNull().default("NORMAL"),
  hp:          integer("hp").notNull().default(100),
  maxHp:       integer("max_hp").notNull().default(100),
  attack:      integer("attack").notNull().default(10),
  defense:     integer("defense").notNull().default(5),
  xpReward:    integer("xp_reward").notNull().default(50),
  goldReward:  integer("gold_reward").notNull().default(10),
  icon:        text("icon"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("dungeon_monsters_room_idx").on(t.roomId),
  index("dungeon_monsters_dungeon_idx").on(t.dungeonId),
]);

// ─── dungeon_bosses ───────────────────────────────────────────────────────────

export const dungeonBosses = pgTable("dungeon_bosses", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  dungeonId:   text("dungeon_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  hp:          integer("hp").notNull().default(5000),
  maxHp:       integer("max_hp").notNull().default(5000),
  attack:      integer("attack").notNull().default(50),
  defense:     integer("defense").notNull().default(30),
  abilities:   jsonb("abilities"),
  lootTable:   jsonb("loot_table"),
  icon:        text("icon"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("dungeon_bosses_dungeon_idx").on(t.dungeonId),
]);

// ─── dungeon_loot_tables ──────────────────────────────────────────────────────

export const dungeonLootTables = pgTable("dungeon_loot_tables", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  dungeonId:   text("dungeon_id").notNull(),
  bossId:      text("boss_id"),
  itemName:    text("item_name").notNull(),
  itemType:    text("item_type").notNull().default("MATERIAL"),
  rarity:      text("rarity").notNull().default("COMMON"),
  dropRate:    real("drop_rate").notNull().default(0.1),
  quantity:    integer("quantity").notNull().default(1),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("dungeon_loot_dungeon_idx").on(t.dungeonId),
]);

// ─── dungeon_rewards ──────────────────────────────────────────────────────────

export const dungeonRewards = pgTable("dungeon_rewards", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  instanceId:  text("instance_id").notNull(),
  userId:      text("user_id").notNull(),
  credits:     integer("credits").notNull().default(0),
  xp:          integer("xp").notNull().default(0),
  items:       jsonb("items"),
  claimedAt:   timestamp("claimed_at").notNull().defaultNow(),
}, (t) => [
  index("dungeon_rewards_instance_idx").on(t.instanceId),
  index("dungeon_rewards_user_idx").on(t.userId),
]);

// ─── dungeon_progress ─────────────────────────────────────────────────────────

export const dungeonProgress = pgTable("dungeon_progress", {
  id:              text("id").primaryKey().$defaultFn(() => createId()),
  instanceId:      text("instance_id").notNull(),
  roomId:          text("room_id"),
  checkpointName:  text("checkpoint_name").notNull(),
  reachedAt:       timestamp("reached_at").notNull().defaultNow(),
}, (t) => [
  index("dungeon_progress_instance_idx").on(t.instanceId),
]);

// ─── dungeon_statistics ───────────────────────────────────────────────────────

export const dungeonStatistics = pgTable("dungeon_statistics", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  dungeonId:   text("dungeon_id").notNull(),
  completions: integer("completions").notNull().default(0),
  failures:    integer("failures").notNull().default(0),
  totalKills:  integer("total_kills").notNull().default(0),
  totalDeaths: integer("total_deaths").notNull().default(0),
  bestTime:    integer("best_time"),
  totalXpEarned: integer("total_xp_earned").notNull().default(0),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("dungeon_stats_user_idx").on(t.userId),
  index("dungeon_stats_dungeon_idx").on(t.dungeonId),
]);

// ─── raid_groups ──────────────────────────────────────────────────────────────

export const raidGroups = pgTable("raid_groups", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  name:       text("name").notNull(),
  leaderId:   text("leader_id").notNull(),
  maxMembers: integer("max_members").notNull().default(20),
  status:     text("status").notNull().default("FORMING"),
  metadata:   jsonb("metadata"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("raid_groups_leader_idx").on(t.leaderId),
  index("raid_groups_status_idx").on(t.status),
]);

// ─── raid_members ─────────────────────────────────────────────────────────────

export const raidMembers = pgTable("raid_members", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  raidGroupId: text("raid_group_id").notNull(),
  userId:      text("user_id").notNull(),
  role:        raidRoleEnum("role").notNull().default("DPS"),
  isReady:     boolean("is_ready").notNull().default(false),
  joinedAt:    timestamp("joined_at").notNull().defaultNow(),
  leftAt:      timestamp("left_at"),
}, (t) => [
  index("raid_members_group_idx").on(t.raidGroupId),
  index("raid_members_user_idx").on(t.userId),
]);

// ─── raid_bosses ──────────────────────────────────────────────────────────────

export const raidBosses = pgTable("raid_bosses", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  difficulty:  raidDifficultyEnum("difficulty").notNull().default("NORMAL"),
  hp:          integer("hp").notNull().default(100000),
  maxHp:       integer("max_hp").notNull().default(100000),
  attack:      integer("attack").notNull().default(200),
  defense:     integer("defense").notNull().default(100),
  phases:      integer("phases").notNull().default(1),
  abilities:   jsonb("abilities"),
  lootTable:   jsonb("loot_table"),
  icon:        text("icon"),
  minPlayers:  integer("min_players").notNull().default(10),
  maxPlayers:  integer("max_players").notNull().default(20),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("raid_bosses_difficulty_idx").on(t.difficulty),
]);

// ─── raid_instances ───────────────────────────────────────────────────────────

export const raidInstances = pgTable("raid_instances", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  raidBossId:  text("raid_boss_id").notNull(),
  groupId:     text("group_id"),
  leaderId:    text("leader_id").notNull(),
  status:      dungeonStatusEnum("status").notNull().default("WAITING"),
  difficulty:  raidDifficultyEnum("difficulty").notNull().default("NORMAL"),
  currentPhase: integer("current_phase").notNull().default(1),
  bossHpRemaining: integer("boss_hp_remaining").notNull().default(100000),
  startedAt:   timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("raid_instances_boss_idx").on(t.raidBossId),
  index("raid_instances_leader_idx").on(t.leaderId),
  index("raid_instances_status_idx").on(t.status),
]);

// ─── raid_progress ────────────────────────────────────────────────────────────

export const raidProgress = pgTable("raid_progress", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  instanceId:  text("instance_id").notNull(),
  phase:       integer("phase").notNull().default(1),
  startedAt:   timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (t) => [
  index("raid_progress_instance_idx").on(t.instanceId),
]);

// ─── raid_rewards ─────────────────────────────────────────────────────────────

export const raidRewards = pgTable("raid_rewards", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  instanceId: text("instance_id").notNull(),
  userId:     text("user_id").notNull(),
  role:       raidRoleEnum("role").notNull().default("DPS"),
  credits:    integer("credits").notNull().default(0),
  xp:         integer("xp").notNull().default(0),
  items:      jsonb("items"),
  claimedAt:  timestamp("claimed_at").notNull().defaultNow(),
}, (t) => [
  index("raid_rewards_instance_idx").on(t.instanceId),
  index("raid_rewards_user_idx").on(t.userId),
]);

// ─── raid_damage_logs ─────────────────────────────────────────────────────────

export const raidDamageLogs = pgTable("raid_damage_logs", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  instanceId: text("instance_id").notNull(),
  userId:     text("user_id").notNull(),
  target:     text("target").notNull().default("BOSS"),
  damage:     integer("damage").notNull().default(0),
  healing:    integer("healing").notNull().default(0),
  skill:      text("skill"),
  loggedAt:   timestamp("logged_at").notNull().defaultNow(),
}, (t) => [
  index("raid_damage_instance_idx").on(t.instanceId),
  index("raid_damage_user_idx").on(t.userId),
]);

// ─── raid_rankings ────────────────────────────────────────────────────────────

export const raidRankings = pgTable("raid_rankings", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  bossId:      text("boss_id").notNull(),
  bestTime:    integer("best_time"),
  totalDamage: integer("total_damage").notNull().default(0),
  totalHealing: integer("total_healing").notNull().default(0),
  role:        raidRoleEnum("role").notNull().default("DPS"),
  kills:       integer("kills").notNull().default(0),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("raid_rankings_boss_idx").on(t.bossId),
  index("raid_rankings_user_idx").on(t.userId),
  index("raid_rankings_damage_idx").on(t.totalDamage),
]);

// ─── raid_history ─────────────────────────────────────────────────────────────

export const raidHistory = pgTable("raid_history", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  instanceId:  text("instance_id").notNull(),
  bossId:      text("boss_id").notNull(),
  result:      text("result").notNull().default("FAILED"),
  role:        raidRoleEnum("role").notNull().default("DPS"),
  damage:      integer("damage").notNull().default(0),
  healing:     integer("healing").notNull().default(0),
  kills:       integer("kills").notNull().default(0),
  duration:    integer("duration").notNull().default(0),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
}, (t) => [
  index("raid_history_user_idx").on(t.userId),
  index("raid_history_boss_idx").on(t.bossId),
  index("raid_history_instance_idx").on(t.instanceId),
]);
