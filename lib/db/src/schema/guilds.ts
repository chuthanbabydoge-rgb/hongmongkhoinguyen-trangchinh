import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";

export const guildRoleEnum = pgEnum("guild_role", [
  "OWNER",
  "LEADER",
  "OFFICER",
  "ELDER",
  "MEMBER",
  "RECRUIT",
]);

export const guildVisibilityEnum = pgEnum("guild_visibility", [
  "PUBLIC",
  "PRIVATE",
  "INVITE_ONLY",
]);

export const joinRequestStatusEnum = pgEnum("guild_join_request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const guildInviteStatusEnum = pgEnum("guild_invite_status", [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
]);

export const guildEventStatusEnum = pgEnum("guild_event_status", [
  "UPCOMING",
  "ONGOING",
  "ENDED",
  "CANCELLED",
]);

export const guildContributionTypeEnum = pgEnum("guild_contribution_type", [
  "CREDITS",
  "COINS",
  "ITEM",
]);

export const guildLogActionEnum = pgEnum("guild_log_action", [
  "GUILD_CREATED",
  "MEMBER_JOINED",
  "MEMBER_LEFT",
  "MEMBER_KICKED",
  "MEMBER_INVITED",
  "INVITE_ACCEPTED",
  "INVITE_DECLINED",
  "JOIN_REQUEST_SENT",
  "JOIN_REQUEST_APPROVED",
  "JOIN_REQUEST_REJECTED",
  "ROLE_CHANGED",
  "ANNOUNCEMENT_POSTED",
  "EVENT_CREATED",
  "EVENT_JOINED",
  "TREASURY_DEPOSIT",
  "TREASURY_WITHDRAW",
  "WAREHOUSE_DEPOSIT",
  "WAREHOUSE_WITHDRAW",
  "GUILD_UPDATED",
]);

export const guildsTable = pgTable("guilds", {
  id:              text("id").primaryKey(),
  name:            text("name").notNull(),
  tag:             text("tag").notNull().unique(),
  description:     text("description"),
  avatar:          text("avatar"),
  banner:          text("banner"),
  ownerId:         text("owner_id").notNull(),
  memberLimit:     integer("member_limit").notNull().default(50),
  level:           integer("level").notNull().default(1),
  xp:              integer("xp").notNull().default(0),
  treasuryCredits: integer("treasury_credits").notNull().default(0),
  treasuryCoins:   integer("treasury_coins").notNull().default(0),
  reputation:      integer("reputation").notNull().default(0),
  visibility:      guildVisibilityEnum("visibility").notNull().default("PUBLIC"),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guildMembersTable = pgTable(
  "guild_members",
  {
    guildId:      text("guild_id").notNull(),
    userId:       text("user_id").notNull(),
    role:         guildRoleEnum("role").notNull().default("RECRUIT"),
    joinedAt:     timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    contribution: integer("contribution").notNull().default(0),
    lastActive:   timestamp("last_active", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.userId] })],
);

export const guildJoinRequestsTable = pgTable("guild_join_requests", {
  id:        text("id").primaryKey(),
  guildId:   text("guild_id").notNull(),
  userId:    text("user_id").notNull(),
  message:   text("message"),
  status:    joinRequestStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guildInvitesTable = pgTable("guild_invites", {
  id:         text("id").primaryKey(),
  guildId:    text("guild_id").notNull(),
  inviterId:  text("inviter_id").notNull(),
  inviteeId:  text("invitee_id").notNull(),
  status:     guildInviteStatusEnum("status").notNull().default("PENDING"),
  createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt:  timestamp("expires_at", { withTimezone: true }),
});

export const guildAnnouncementsTable = pgTable("guild_announcements", {
  id:        text("id").primaryKey(),
  guildId:   text("guild_id").notNull(),
  authorId:  text("author_id").notNull(),
  title:     text("title").notNull(),
  content:   text("content").notNull(),
  isPinned:  boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guildLogsTable = pgTable("guild_logs", {
  id:        text("id").primaryKey(),
  guildId:   text("guild_id").notNull(),
  actorId:   text("actor_id").notNull(),
  action:    guildLogActionEnum("action").notNull(),
  targetId:  text("target_id"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guildRolePermissionsTable = pgTable(
  "guild_role_permissions",
  {
    guildId:     text("guild_id").notNull(),
    role:        guildRoleEnum("role").notNull(),
    permissions: jsonb("permissions").notNull(),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.role] })],
);

export const guildContributionsTable = pgTable("guild_contributions", {
  id:        text("id").primaryKey(),
  guildId:   text("guild_id").notNull(),
  userId:    text("user_id").notNull(),
  type:      guildContributionTypeEnum("type").notNull(),
  amount:    integer("amount").notNull().default(0),
  itemId:    text("item_id"),
  note:      text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guildEventsTable = pgTable("guild_events", {
  id:              text("id").primaryKey(),
  guildId:         text("guild_id").notNull(),
  creatorId:       text("creator_id").notNull(),
  title:           text("title").notNull(),
  description:     text("description"),
  startAt:         timestamp("start_at", { withTimezone: true }).notNull(),
  endAt:           timestamp("end_at", { withTimezone: true }),
  maxParticipants: integer("max_participants"),
  status:          guildEventStatusEnum("status").notNull().default("UPCOMING"),
  rewardPoints:    integer("reward_points").notNull().default(0),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guildEventParticipantsTable = pgTable(
  "guild_event_participants",
  {
    eventId:  text("event_id").notNull(),
    userId:   text("user_id").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })],
);

export const guildWarehouseItemsTable = pgTable("guild_warehouse_items", {
  id:          text("id").primaryKey(),
  guildId:     text("guild_id").notNull(),
  itemId:      text("item_id").notNull(),
  itemName:    text("item_name").notNull(),
  quantity:    integer("quantity").notNull().default(1),
  depositedBy: text("deposited_by").notNull(),
  depositedAt: timestamp("deposited_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guildTreasuryTransactionsTable = pgTable("guild_treasury_transactions", {
  id:        text("id").primaryKey(),
  guildId:   text("guild_id").notNull(),
  userId:    text("user_id").notNull(),
  type:      text("type").notNull(),
  currency:  text("currency").notNull(),
  amount:    integer("amount").notNull(),
  note:      text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GuildRow                      = typeof guildsTable.$inferSelect;
export type GuildMemberRow                = typeof guildMembersTable.$inferSelect;
export type GuildJoinRequestRow           = typeof guildJoinRequestsTable.$inferSelect;
export type GuildInviteRow                = typeof guildInvitesTable.$inferSelect;
export type GuildAnnouncementRow          = typeof guildAnnouncementsTable.$inferSelect;
export type GuildLogRow                   = typeof guildLogsTable.$inferSelect;
export type GuildContributionRow          = typeof guildContributionsTable.$inferSelect;
export type GuildEventRow                 = typeof guildEventsTable.$inferSelect;
export type GuildEventParticipantRow      = typeof guildEventParticipantsTable.$inferSelect;
export type GuildWarehouseItemRow         = typeof guildWarehouseItemsTable.$inferSelect;
export type GuildTreasuryTransactionRow   = typeof guildTreasuryTransactionsTable.$inferSelect;
