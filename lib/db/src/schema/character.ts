import { pgTable, text, integer, real, boolean, jsonb, timestamp, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const characterClassEnum = pgEnum("character_class", [
  "WARRIOR", "MAGE", "ARCHER", "ASSASSIN", "ENGINEER", "SUMMONER",
]);

export const characterRaceEnum = pgEnum("character_race", [
  "HUMAN", "ELF", "DWARF", "DEMON", "ANGEL", "BEAST",
]);

export const equipmentSlotEnum = pgEnum("equipment_slot", [
  "HEAD", "CHEST", "LEGS", "BOOTS", "GLOVES", "WEAPON", "OFFHAND", "RING", "NECKLACE", "PET",
]);

export const characterFactionEnum = pgEnum("character_faction", [
  "ALLIANCE", "HORDE", "NEUTRAL", "SHADOW", "LIGHT",
]);

export const skillTypeEnum = pgEnum("skill_type", [
  "ACTIVE", "PASSIVE", "ULTIMATE", "TOGGLE",
]);

// ─── characters ───────────────────────────────────────────────────────────────

export const characters = pgTable("characters", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  userId:       text("user_id").notNull(),
  name:         text("name").notNull(),
  class:        characterClassEnum("class").notNull().default("WARRIOR"),
  race:         characterRaceEnum("race").notNull().default("HUMAN"),
  faction:      characterFactionEnum("faction").notNull().default("NEUTRAL"),
  title:        text("title"),
  level:        integer("level").notNull().default(1),
  experience:   integer("experience").notNull().default(0),
  powerScore:   integer("power_score").notNull().default(100),
  isActive:     boolean("is_active").notNull().default(true),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("characters_user_id_idx").on(t.userId),
  uniqueIndex("characters_user_id_active_idx").on(t.userId, t.isActive),
]);

// ─── character_stats ──────────────────────────────────────────────────────────

export const characterStats = pgTable("character_stats", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  characterId:  text("character_id").notNull(),
  hp:           integer("hp").notNull().default(100),
  maxHp:        integer("max_hp").notNull().default(100),
  mp:           integer("mp").notNull().default(50),
  maxMp:        integer("max_mp").notNull().default(50),
  stamina:      integer("stamina").notNull().default(100),
  attack:       integer("attack").notNull().default(10),
  defense:      integer("defense").notNull().default(5),
  speed:        integer("speed").notNull().default(10),
  critRate:     real("crit_rate").notNull().default(0.05),
  critDamage:   real("crit_damage").notNull().default(1.5),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("character_stats_character_id_idx").on(t.characterId),
]);

// ─── character_attributes ─────────────────────────────────────────────────────

export const characterAttributes = pgTable("character_attributes", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  characterId:  text("character_id").notNull(),
  strength:     integer("strength").notNull().default(10),
  agility:      integer("agility").notNull().default(10),
  intelligence: integer("intelligence").notNull().default(10),
  vitality:     integer("vitality").notNull().default(10),
  wisdom:       integer("wisdom").notNull().default(10),
  luck:         integer("luck").notNull().default(10),
  freePoints:   integer("free_points").notNull().default(0),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("character_attributes_character_id_idx").on(t.characterId),
]);

// ─── character_levels ─────────────────────────────────────────────────────────

export const characterLevels = pgTable("character_levels", {
  id:              text("id").primaryKey().$defaultFn(() => createId()),
  level:           integer("level").notNull(),
  xpRequired:      integer("xp_required").notNull(),
  statPointReward: integer("stat_point_reward").notNull().default(3),
  skillPointReward:integer("skill_point_reward").notNull().default(1),
  creditReward:    integer("credit_reward").notNull().default(0),
  description:     text("description"),
}, (t) => [
  uniqueIndex("character_levels_level_idx").on(t.level),
]);

// ─── skill_trees ──────────────────────────────────────────────────────────────

export const skillTrees = pgTable("skill_trees", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  class:        characterClassEnum("class").notNull(),
  name:         text("name").notNull(),
  description:  text("description"),
  icon:         text("icon"),
  maxLevel:     integer("max_level").notNull().default(10),
  baseDamage:   integer("base_damage").notNull().default(0),
  baseCooldown: integer("base_cooldown").notNull().default(0),
  mpCost:       integer("mp_cost").notNull().default(0),
  skillType:    skillTypeEnum("skill_type").notNull().default("ACTIVE"),
  prerequisites:jsonb("prerequisites"),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("skill_trees_class_idx").on(t.class),
]);

// ─── character_skills ─────────────────────────────────────────────────────────

export const characterSkills = pgTable("character_skills", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  characterId:  text("character_id").notNull(),
  skillId:      text("skill_id").notNull(),
  level:        integer("level").notNull().default(1),
  isEquipped:   boolean("is_equipped").notNull().default(false),
  slotIndex:    integer("slot_index"),
  learnedAt:    timestamp("learned_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("character_skills_character_id_idx").on(t.characterId),
  uniqueIndex("character_skills_char_skill_idx").on(t.characterId, t.skillId),
]);

// ─── character_equipment ──────────────────────────────────────────────────────

export const characterEquipment = pgTable("character_equipment", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  characterId:  text("character_id").notNull(),
  slot:         equipmentSlotEnum("slot").notNull(),
  itemId:       text("item_id"),
  itemName:     text("item_name"),
  itemIcon:     text("item_icon"),
  itemRarity:   text("item_rarity"),
  statBonus:    jsonb("stat_bonus"),
  equippedAt:   timestamp("equipped_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("character_equipment_character_id_idx").on(t.characterId),
  uniqueIndex("character_equipment_char_slot_idx").on(t.characterId, t.slot),
]);

// ─── character_titles ─────────────────────────────────────────────────────────

export const characterTitles = pgTable("character_titles", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  characterId:  text("character_id").notNull(),
  titleKey:     text("title_key").notNull(),
  titleName:    text("title_name").notNull(),
  titleDesc:    text("title_desc"),
  isSelected:   boolean("is_selected").notNull().default(false),
  unlockedAt:   timestamp("unlocked_at").notNull().defaultNow(),
}, (t) => [
  index("character_titles_character_id_idx").on(t.characterId),
  uniqueIndex("character_titles_char_title_idx").on(t.characterId, t.titleKey),
]);

// ─── character_experience_logs ────────────────────────────────────────────────

export const characterExperienceLogs = pgTable("character_experience_logs", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  characterId:  text("character_id").notNull(),
  amount:       integer("amount").notNull(),
  source:       text("source").notNull(),
  sourceId:     text("source_id"),
  totalAfter:   integer("total_after").notNull(),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("character_xp_logs_character_id_idx").on(t.characterId),
  index("character_xp_logs_created_at_idx").on(t.createdAt),
]);

// ─── character_presets ────────────────────────────────────────────────────────

export const characterPresets = pgTable("character_presets", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  characterId:  text("character_id").notNull(),
  name:         text("name").notNull(),
  equipment:    jsonb("equipment"),
  skills:       jsonb("skills"),
  attributes:   jsonb("attributes"),
  isDefault:    boolean("is_default").notNull().default(false),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("character_presets_character_id_idx").on(t.characterId),
]);

// ─── character_customization ──────────────────────────────────────────────────

export const characterCustomization = pgTable("character_customization", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  characterId:  text("character_id").notNull(),
  skinTone:     text("skin_tone").notNull().default("medium"),
  hairStyle:    text("hair_style").notNull().default("default"),
  hairColor:    text("hair_color").notNull().default("#4a3728"),
  eyeColor:     text("eye_color").notNull().default("#3b5998"),
  faceStyle:    text("face_style").notNull().default("default"),
  bodyType:     text("body_type").notNull().default("medium"),
  accessories:  jsonb("accessories"),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("character_customization_character_id_idx").on(t.characterId),
]);

// ─── character_level_rewards ──────────────────────────────────────────────────

export const characterLevelRewards = pgTable("character_level_rewards", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  characterId:  text("character_id").notNull(),
  level:        integer("level").notNull(),
  rewardType:   text("reward_type").notNull(),
  rewardValue:  jsonb("reward_value"),
  claimedAt:    timestamp("claimed_at").notNull().defaultNow(),
}, (t) => [
  index("character_level_rewards_character_id_idx").on(t.characterId),
  uniqueIndex("character_level_rewards_char_level_idx").on(t.characterId, t.level),
]);
