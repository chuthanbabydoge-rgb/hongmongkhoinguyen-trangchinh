import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

export const questTypeEnum = pgEnum("quest_type", [
  "MAIN",
  "SIDE",
  "DAILY",
  "WEEKLY",
  "EVENT",
]);

export const questStatusEnum = pgEnum("quest_status", [
  "ACTIVE",
  "INACTIVE",
  "FINISHED",
]);

export const questDifficultyEnum = pgEnum("quest_difficulty", [
  "EASY",
  "NORMAL",
  "HARD",
  "LEGENDARY",
]);

export const objectiveTypeEnum = pgEnum("quest_objective_type", [
  "LOGIN",
  "OPEN_APP",
  "BUY_ITEM",
  "SELL_ITEM",
  "CREATE_LISTING",
  "TRANSFER_WALLET",
  "GAIN_REPUTATION",
  "ADD_FRIEND",
  "JOIN_GUILD",
  "CONTRIBUTE_GUILD",
  "COLLECT_ITEM",
  "OWN_ITEM",
  "LEVEL_REPUTATION",
  "CUSTOM",
]);

export const userQuestStatusEnum = pgEnum("user_quest_status", [
  "IN_PROGRESS",
  "COMPLETED",
  "CLAIMED",
  "CANCELLED",
]);

export const questsTable = pgTable("quests", {
  id:               text("id").primaryKey(),
  title:            text("title").notNull(),
  description:      text("description").notNull(),
  type:             questTypeEnum("type").notNull().default("SIDE"),
  status:           questStatusEnum("status").notNull().default("ACTIVE"),
  difficulty:       questDifficultyEnum("difficulty").notNull().default("NORMAL"),
  requiredLevel:    integer("required_level").notNull().default(0),
  repeatable:       boolean("repeatable").notNull().default(false),
  startAt:          timestamp("start_at"),
  endAt:            timestamp("end_at"),
  rewardCredits:    integer("reward_credits").notNull().default(0),
  rewardCoins:      integer("reward_coins").notNull().default(0),
  rewardTokens:     integer("reward_tokens").notNull().default(0),
  rewardReputation: integer("reward_reputation").notNull().default(0),
  metadata:         jsonb("metadata"),
  createdAt:        timestamp("created_at").notNull().defaultNow(),
  updatedAt:        timestamp("updated_at").notNull().defaultNow(),
});

export const questObjectivesTable = pgTable("quest_objectives", {
  id:          text("id").primaryKey(),
  questId:     text("quest_id").notNull().references(() => questsTable.id, { onDelete: "cascade" }),
  type:        objectiveTypeEnum("type").notNull(),
  description: text("description").notNull(),
  targetCount: integer("target_count").notNull().default(1),
  metadata:    jsonb("metadata"),
  orderIndex:  integer("order_index").notNull().default(0),
});

export const userQuestsTable = pgTable("user_quests", {
  id:          text("id").primaryKey(),
  userId:      text("user_id").notNull(),
  questId:     text("quest_id").notNull().references(() => questsTable.id, { onDelete: "cascade" }),
  status:      userQuestStatusEnum("status").notNull().default("IN_PROGRESS"),
  startedAt:   timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  claimedAt:   timestamp("claimed_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  unique("uq_user_quest_active").on(t.userId, t.questId, t.status),
]);

export const userQuestProgressTable = pgTable("user_quest_progress", {
  id:           text("id").primaryKey(),
  userQuestId:  text("user_quest_id").notNull().references(() => userQuestsTable.id, { onDelete: "cascade" }),
  objectiveId:  text("objective_id").notNull().references(() => questObjectivesTable.id, { onDelete: "cascade" }),
  currentCount: integer("current_count").notNull().default(0),
  completed:    boolean("completed").notNull().default(false),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});
