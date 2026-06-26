import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  real,
} from "drizzle-orm/pg-core";

export const worldTypeEnum = pgEnum("world_type", [
  "PUBLIC",
  "PRIVATE",
  "CREATOR",
  "OFFICIAL",
  "EVENT",
  "GUILD",
  "PARTY",
  "TRAINING",
]);

export const worldStatusEnum = pgEnum("world_status", [
  "ACTIVE",
  "INACTIVE",
  "MAINTENANCE",
  "ARCHIVED",
]);

export const instanceTypeEnum = pgEnum("world_instance_type", [
  "SHARED",
  "PRIVATE",
  "RESERVED",
  "MATCH",
  "EVENT",
]);

export const instanceStatusEnum = pgEnum("world_instance_status", [
  "OPEN",
  "FULL",
  "CLOSED",
  "RESERVED",
]);

export const worldMemberRoleEnum = pgEnum("world_member_role", [
  "OWNER",
  "ADMIN",
  "MODERATOR",
  "MEMBER",
  "VISITOR",
]);

export const worldEventStatusEnum = pgEnum("world_event_status", [
  "UPCOMING",
  "ONGOING",
  "ENDED",
  "CANCELLED",
]);

export const worldsTable = pgTable("worlds", {
  id:           text("id").primaryKey(),
  name:         text("name").notNull(),
  slug:         text("slug").notNull().unique(),
  description:  text("description"),
  thumbnail:    text("thumbnail"),
  banner:       text("banner"),
  ownerId:      text("owner_id").notNull(),
  type:         worldTypeEnum("type").notNull().default("PUBLIC"),
  status:       worldStatusEnum("status").notNull().default("ACTIVE"),
  capacity:     integer("capacity").notNull().default(100),
  playerCount:  integer("player_count").notNull().default(0),
  visitCount:   integer("visit_count").notNull().default(0),
  isFeatured:   boolean("is_featured").notNull().default(false),
  tags:         text("tags").array().notNull().default([]),
  metadata:     jsonb("metadata"),
  guildId:      text("guild_id"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const worldRegionsTable = pgTable("world_regions", {
  id:          text("id").primaryKey(),
  worldId:     text("world_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  capacity:    integer("capacity").notNull().default(50),
  playerCount: integer("player_count").notNull().default(0),
  isDefault:   boolean("is_default").notNull().default(false),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const worldZonesTable = pgTable("world_zones", {
  id:          text("id").primaryKey(),
  regionId:    text("region_id").notNull(),
  worldId:     text("world_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  capacity:    integer("capacity").notNull().default(20),
  playerCount: integer("player_count").notNull().default(0),
  isDefault:   boolean("is_default").notNull().default(false),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const worldInstancesTable = pgTable("world_instances", {
  id:           text("id").primaryKey(),
  zoneId:       text("zone_id").notNull(),
  worldId:      text("world_id").notNull(),
  type:         instanceTypeEnum("type").notNull().default("SHARED"),
  status:       instanceStatusEnum("status").notNull().default("OPEN"),
  capacity:     integer("capacity").notNull().default(20),
  playerCount:  integer("player_count").notNull().default(0),
  ownerId:      text("owner_id"),
  expiresAt:    timestamp("expires_at", { withTimezone: true }),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt:     timestamp("closed_at", { withTimezone: true }),
});

export const worldSpawnPointsTable = pgTable("world_spawn_points", {
  id:          text("id").primaryKey(),
  worldId:     text("world_id").notNull(),
  regionId:    text("region_id"),
  zoneId:      text("zone_id"),
  name:        text("name").notNull(),
  isDefault:   boolean("is_default").notNull().default(false),
  posX:        real("pos_x").notNull().default(0),
  posY:        real("pos_y").notNull().default(0),
  posZ:        real("pos_z").notNull().default(0),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const worldMembersTable = pgTable("world_members", {
  id:         text("id").primaryKey(),
  worldId:    text("world_id").notNull(),
  userId:     text("user_id").notNull(),
  role:       worldMemberRoleEnum("role").notNull().default("MEMBER"),
  joinedAt:   timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  lastVisit:  timestamp("last_visit", { withTimezone: true }),
  visitCount: integer("visit_count").notNull().default(0),
});

export const worldPermissionsTable = pgTable("world_permissions", {
  id:         text("id").primaryKey(),
  worldId:    text("world_id").notNull(),
  role:       worldMemberRoleEnum("role").notNull(),
  permission: text("permission").notNull(),
  granted:    boolean("granted").notNull().default(true),
});

export const worldBookmarksTable = pgTable("world_bookmarks", {
  id:          text("id").primaryKey(),
  worldId:     text("world_id").notNull(),
  userId:      text("user_id").notNull(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const worldTravelHistoryTable = pgTable("world_travel_history", {
  id:           text("id").primaryKey(),
  userId:       text("user_id").notNull(),
  worldId:      text("world_id").notNull(),
  instanceId:   text("instance_id"),
  enteredAt:    timestamp("entered_at", { withTimezone: true }).notNull().defaultNow(),
  leftAt:       timestamp("left_at", { withTimezone: true }),
  durationSecs: integer("duration_secs"),
});

export const worldPresenceTable = pgTable("world_presence", {
  id:         text("id").primaryKey(),
  userId:     text("user_id").notNull().unique(),
  worldId:    text("world_id"),
  regionId:   text("region_id"),
  zoneId:     text("zone_id"),
  instanceId: text("instance_id"),
  joinedAt:   timestamp("joined_at", { withTimezone: true }),
  lastSeen:   timestamp("last_seen", { withTimezone: true }).notNull().defaultNow(),
  isOnline:   boolean("is_online").notNull().default(false),
});

export const worldEventsTable = pgTable("world_events", {
  id:              text("id").primaryKey(),
  worldId:         text("world_id").notNull(),
  creatorId:       text("creator_id").notNull(),
  name:            text("name").notNull(),
  description:     text("description"),
  status:          worldEventStatusEnum("status").notNull().default("UPCOMING"),
  maxParticipants: integer("max_participants"),
  startAt:         timestamp("start_at", { withTimezone: true }).notNull(),
  endAt:           timestamp("end_at", { withTimezone: true }),
  metadata:        jsonb("metadata"),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
