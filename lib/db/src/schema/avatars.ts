import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const avatarsTable = pgTable("avatars", {
  userId:     text("user_id").primaryKey(),
  initials:   text("initials").notNull(),
  imageUrl:   text("image_url"),
  frameColor: text("frame_color").notNull().default("#7c3aed"),
  badgeIcon:  text("badge_icon"),
  updatedAt:  timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export type AvatarRow = typeof avatarsTable.$inferSelect;
