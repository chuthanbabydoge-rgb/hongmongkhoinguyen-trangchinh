import {
  pgTable, text, integer, real, boolean, jsonb,
  timestamp, pgEnum, index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const battleTypeEnum = pgEnum("battle_type", [
  "PVE", "PVP", "ARENA", "BOSS", "DUNGEON", "RAID", "TRAINING",
]);

export const battleStatusEnum = pgEnum("battle_status", [
  "WAITING", "ACTIVE", "FINISHED", "CANCELLED",
]);

export const participantStatusEnum = pgEnum("participant_status", [
  "ALIVE", "DEAD", "DISCONNECTED",
]);

export const skillTargetEnum = pgEnum("skill_target", [
  "SELF", "ALLY", "ENEMY", "AREA",
]);

// ─── combat_battles ───────────────────────────────────────────────────────────

export const combatBattles = pgTable("combat_battles", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  type:         battleTypeEnum("type").notNull().default("PVE"),
  status:       battleStatusEnum("status").notNull().default("WAITING"),
  creatorId:    text("creator_id").notNull(),
  winnerId:     text("winner_id"),
  currentTurn:  integer("current_turn").notNull().default(0),
  maxTurns:     integer("max_turns").notNull().default(50),
  isRealtime:   boolean("is_realtime").notNull().default(false),
  bossId:       text("boss_id"),
  dungeonId:    text("dungeon_id"),
  arenaId:      text("arena_id"),
  metadata:     jsonb("metadata"),
  startedAt:    timestamp("started_at"),
  finishedAt:   timestamp("finished_at"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("combat_battles_creator_idx").on(t.creatorId),
  index("combat_battles_status_idx").on(t.status),
  index("combat_battles_type_idx").on(t.type),
]);

// ─── combat_participants ──────────────────────────────────────────────────────

export const combatParticipants = pgTable("combat_participants", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  battleId:     text("battle_id").notNull(),
  userId:       text("user_id").notNull(),
  characterId:  text("character_id"),
  team:         integer("team").notNull().default(1),
  status:       participantStatusEnum("status").notNull().default("ALIVE"),
  currentHp:    integer("current_hp").notNull().default(100),
  maxHp:        integer("max_hp").notNull().default(100),
  currentMp:    integer("current_mp").notNull().default(50),
  maxMp:        integer("max_mp").notNull().default(50),
  attack:       integer("attack").notNull().default(10),
  defense:      integer("defense").notNull().default(5),
  speed:        integer("speed").notNull().default(10),
  critRate:     real("crit_rate").notNull().default(0.05),
  critDamage:   real("crit_damage").notNull().default(1.5),
  aggro:        integer("aggro").notNull().default(0),
  comboCount:   integer("combo_count").notNull().default(0),
  isNpc:        boolean("is_npc").notNull().default(false),
  npcName:      text("npc_name"),
  joinedAt:     timestamp("joined_at").notNull().defaultNow(),
}, (t) => [
  index("combat_participants_battle_idx").on(t.battleId),
  index("combat_participants_user_idx").on(t.userId),
]);

// ─── combat_turns ─────────────────────────────────────────────────────────────

export const combatTurns = pgTable("combat_turns", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  battleId:       text("battle_id").notNull(),
  turnNumber:     integer("turn_number").notNull(),
  actorId:        text("actor_id").notNull(),
  targetId:       text("target_id"),
  actionType:     text("action_type").notNull().default("attack"),
  skillId:        text("skill_id"),
  damage:         integer("damage"),
  healing:        integer("healing"),
  isCritical:     boolean("is_critical").notNull().default(false),
  isMiss:         boolean("is_miss").notNull().default(false),
  isDodge:        boolean("is_dodge").notNull().default(false),
  isBlocked:      boolean("is_blocked").notNull().default(false),
  effectsApplied: jsonb("effects_applied"),
  metadata:       jsonb("metadata"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("combat_turns_battle_idx").on(t.battleId),
  index("combat_turns_turn_number_idx").on(t.battleId, t.turnNumber),
]);

// ─── combat_skills ────────────────────────────────────────────────────────────

export const combatSkills = pgTable("combat_skills", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  icon:        text("icon"),
  target:      skillTargetEnum("target").notNull().default("ENEMY"),
  mpCost:      integer("mp_cost").notNull().default(10),
  cooldown:    integer("cooldown").notNull().default(1),
  baseDamage:  integer("base_damage").notNull().default(0),
  baseHealing: integer("base_healing").notNull().default(0),
  effectType:  text("effect_type"),
  effectValue: real("effect_value"),
  effectTurns: integer("effect_turns"),
  comboMultiplier: real("combo_multiplier").notNull().default(1.0),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── combat_effects ───────────────────────────────────────────────────────────

export const combatEffects = pgTable("combat_effects", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  battleId:      text("battle_id").notNull(),
  participantId: text("participant_id").notNull(),
  effectType:    text("effect_type").notNull(),
  value:         real("value").notNull().default(0),
  turnsLeft:     integer("turns_left").notNull().default(1),
  sourceId:      text("source_id"),
  metadata:      jsonb("metadata"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("combat_effects_battle_idx").on(t.battleId),
  index("combat_effects_participant_idx").on(t.participantId),
]);

// ─── combat_damage_logs ───────────────────────────────────────────────────────

export const combatDamageLogs = pgTable("combat_damage_logs", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  battleId:      text("battle_id").notNull(),
  turnId:        text("turn_id"),
  sourceId:      text("source_id").notNull(),
  targetId:      text("target_id").notNull(),
  damage:        integer("damage").notNull().default(0),
  damageType:    text("damage_type").notNull().default("physical"),
  isCritical:    boolean("is_critical").notNull().default(false),
  isMiss:        boolean("is_miss").notNull().default(false),
  isDodge:       boolean("is_dodge").notNull().default(false),
  shieldAbsorbed:integer("shield_absorbed").notNull().default(0),
  netDamage:     integer("net_damage").notNull().default(0),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("combat_damage_logs_battle_idx").on(t.battleId),
]);

// ─── combat_rewards ───────────────────────────────────────────────────────────

export const combatRewards = pgTable("combat_rewards", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  battleId:    text("battle_id").notNull(),
  userId:      text("user_id").notNull(),
  xp:          integer("xp").notNull().default(0),
  gold:        integer("gold").notNull().default(0),
  items:       jsonb("items"),
  reputation:  integer("reputation").notNull().default(0),
  isVictory:   boolean("is_victory").notNull().default(false),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("combat_rewards_battle_idx").on(t.battleId),
  index("combat_rewards_user_idx").on(t.userId),
]);

// ─── combat_history ───────────────────────────────────────────────────────────

export const combatHistory = pgTable("combat_history", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  battleId:    text("battle_id").notNull(),
  userId:      text("user_id").notNull(),
  type:        battleTypeEnum("type").notNull().default("PVE"),
  result:      text("result").notNull().default("DEFEAT"),
  opponentName:text("opponent_name"),
  turnsCount:  integer("turns_count").notNull().default(0),
  xpGained:    integer("xp_gained").notNull().default(0),
  goldGained:  integer("gold_gained").notNull().default(0),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("combat_history_user_idx").on(t.userId),
  index("combat_history_battle_idx").on(t.battleId),
]);

// ─── combat_matchmaking ───────────────────────────────────────────────────────

export const combatMatchmaking = pgTable("combat_matchmaking", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  type:        battleTypeEnum("type").notNull().default("ARENA"),
  powerScore:  integer("power_score").notNull().default(100),
  status:      text("status").notNull().default("QUEUING"),
  battleId:    text("battle_id"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("combat_matchmaking_user_idx").on(t.userId),
  index("combat_matchmaking_status_idx").on(t.status),
]);

// ─── combat_arena ─────────────────────────────────────────────────────────────

export const combatArena = pgTable("combat_arena", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  season:      integer("season").notNull().default(1),
  isActive:    boolean("is_active").notNull().default(true),
  minPower:    integer("min_power").notNull().default(0),
  maxPower:    integer("max_power"),
  rewards:     jsonb("rewards"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── combat_pvp_rank ──────────────────────────────────────────────────────────

export const combatPvpRank = pgTable("combat_pvp_rank", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  userId:       text("user_id").notNull(),
  season:       integer("season").notNull().default(1),
  rating:       integer("rating").notNull().default(1000),
  wins:         integer("wins").notNull().default(0),
  losses:       integer("losses").notNull().default(0),
  draws:        integer("draws").notNull().default(0),
  winStreak:    integer("win_streak").notNull().default(0),
  rank:         text("rank").notNull().default("BRONZE"),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("combat_pvp_rank_user_idx").on(t.userId, t.season),
]);

// ─── combat_bosses ────────────────────────────────────────────────────────────

export const combatBosses = pgTable("combat_bosses", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  name:         text("name").notNull(),
  description:  text("description"),
  icon:         text("icon"),
  level:        integer("level").notNull().default(10),
  hp:           integer("hp").notNull().default(10000),
  attack:       integer("attack").notNull().default(100),
  defense:      integer("defense").notNull().default(50),
  speed:        integer("speed").notNull().default(5),
  skills:       jsonb("skills"),
  lootTable:    jsonb("loot_table"),
  xpReward:     integer("xp_reward").notNull().default(500),
  goldReward:   integer("gold_reward").notNull().default(200),
  isWorldBoss:  boolean("is_world_boss").notNull().default(false),
  isActive:     boolean("is_active").notNull().default(true),
  spawnAt:      timestamp("spawn_at"),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});

// ─── combat_instances ─────────────────────────────────────────────────────────

export const combatInstances = pgTable("combat_instances", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  battleId:     text("battle_id").notNull(),
  bossId:       text("boss_id"),
  instanceType: text("instance_type").notNull().default("BOSS"),
  currentWave:  integer("current_wave").notNull().default(1),
  totalWaves:   integer("total_waves").notNull().default(1),
  isCompleted:  boolean("is_completed").notNull().default(false),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("combat_instances_battle_idx").on(t.battleId),
]);

// ─── combat_wave_progress ─────────────────────────────────────────────────────

export const combatWaveProgress = pgTable("combat_wave_progress", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  instanceId:   text("instance_id").notNull(),
  waveNumber:   integer("wave_number").notNull(),
  isCompleted:  boolean("is_completed").notNull().default(false),
  enemies:      jsonb("enemies"),
  completedAt:  timestamp("completed_at"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("combat_wave_progress_instance_idx").on(t.instanceId),
]);

// ─── combat_statistics ────────────────────────────────────────────────────────

export const combatStatistics = pgTable("combat_statistics", {
  id:              text("id").primaryKey().$defaultFn(() => createId()),
  userId:          text("user_id").notNull(),
  totalBattles:    integer("total_battles").notNull().default(0),
  totalWins:       integer("total_wins").notNull().default(0),
  totalLosses:     integer("total_losses").notNull().default(0),
  totalKills:      integer("total_kills").notNull().default(0),
  totalDamage:     integer("total_damage").notNull().default(0),
  totalHealing:    integer("total_healing").notNull().default(0),
  criticalHits:    integer("critical_hits").notNull().default(0),
  bossesDefeated:  integer("bosses_defeated").notNull().default(0),
  arenaWins:       integer("arena_wins").notNull().default(0),
  longestWinStreak:integer("longest_win_streak").notNull().default(0),
  favoriteSkill:   text("favorite_skill"),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("combat_statistics_user_idx").on(t.userId),
]);
