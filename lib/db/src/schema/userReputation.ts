import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const userReputationTable = pgTable("user_reputation", {
  userId:      text("user_id").primaryKey(),
  totalPoints: integer("total_points").notNull().default(0),
  level:       text("level").notNull().default("Citizen"),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});
