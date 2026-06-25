import { pgTable, text, timestamp, pgEnum, primaryKey } from "drizzle-orm/pg-core";

export const relationshipTypeEnum = pgEnum("relationship_type", [
  "FRIEND",
  "FOLLOWING",
  "BLOCKED",
]);

export const friendRequestStatusEnum = pgEnum("friend_request_status", [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "CANCELLED",
]);

export const presenceStatusEnum = pgEnum("presence_status", [
  "ONLINE",
  "AWAY",
  "OFFLINE",
]);

export const socialRelationshipsTable = pgTable(
  "social_relationships",
  {
    userId:    text("user_id").notNull(),
    targetId:  text("target_id").notNull(),
    type:      relationshipTypeEnum("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.targetId, t.type] })],
);

export const friendRequestsTable = pgTable("friend_requests", {
  id:          text("id").primaryKey(),
  fromUserId:  text("from_user_id").notNull(),
  toUserId:    text("to_user_id").notNull(),
  status:      friendRequestStatusEnum("status").notNull().default("PENDING"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userPresenceTable = pgTable("user_presence", {
  userId:     text("user_id").primaryKey(),
  status:     presenceStatusEnum("status").notNull().default("OFFLINE"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userProfilesPublicTable = pgTable("user_profiles_public", {
  userId:      text("user_id").primaryKey(),
  displayName: text("display_name").notNull().default(""),
  avatarUrl:   text("avatar_url"),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
