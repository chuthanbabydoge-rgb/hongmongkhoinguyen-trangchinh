import { pgTable, text, jsonb, timestamp, unique } from "drizzle-orm/pg-core";

export const hubAchievementsTable = pgTable("hub_achievements", {
  id:          text("id").primaryKey(),
  key:         text("key").notNull().unique(),
  title:       text("title").notNull(),
  description: text("description").notNull(),
  icon:        text("icon").notNull().default("🏆"),
  criteria:    jsonb("criteria"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export const userAchievementsTable = pgTable("user_achievements", {
  id:             text("id").primaryKey(),
  userId:         text("user_id").notNull(),
  achievementKey: text("achievement_key").notNull(),
  unlockedAt:     timestamp("unlocked_at").notNull().defaultNow(),
}, (t) => [
  unique().on(t.userId, t.achievementKey),
]);
