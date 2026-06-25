import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const reputationsTable = pgTable("reputations", {
  userId:    text("user_id").primaryKey(),
  score:     integer("score").notNull().default(0),
  tier:      text("tier").notNull().default("bronze"),
  upvotes:   integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  badges:    jsonb("badges").notNull().default([]),
  history:   jsonb("history").notNull().default([]),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export type ReputationRow = typeof reputationsTable.$inferSelect;
