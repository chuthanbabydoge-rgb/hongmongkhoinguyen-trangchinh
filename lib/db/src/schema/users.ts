import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id:              text("id").primaryKey(),
  username:        text("username").notNull(),
  title:           text("title").notNull().default("Member"),
  status:          text("status").notNull().default("offline"),
  level:           integer("level").notNull().default(1),
  xp:              integer("xp").notNull().default(0),
  maxXp:           integer("max_xp").notNull().default(1000),
  progressPercent: integer("progress_percent").notNull().default(0),
  joinedAt:        timestamp("joined_at", { mode: "string" }).notNull().defaultNow(),
  createdAt:       timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt:       timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export type UserRow = typeof usersTable.$inferSelect;
