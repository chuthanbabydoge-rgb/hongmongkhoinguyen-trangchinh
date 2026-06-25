import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const chatRoomTypeEnum = pgEnum("chat_room_type", [
  "GLOBAL",
  "PRIVATE",
  "GUILD",
  "PARTY",
  "MARKETPLACE",
  "SYSTEM",
  "SUPPORT",
]);

export const chatMemberRoleEnum = pgEnum("chat_member_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
]);

export const chatMessageTypeEnum = pgEnum("chat_message_type", [
  "TEXT",
  "IMAGE",
  "FILE",
  "SYSTEM",
  "ITEM_SHARE",
  "QUEST_SHARE",
  "ACHIEVEMENT",
  "LOCATION",
]);

export const chatReportStatusEnum = pgEnum("chat_report_status", [
  "PENDING",
  "REVIEWED",
  "DISMISSED",
  "ACTIONED",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const chatRoomsTable = pgTable(
  "chat_rooms",
  {
    id:         text("id").primaryKey(),
    type:       chatRoomTypeEnum("type").notNull(),
    name:       text("name").notNull(),
    slug:       text("slug").unique(),
    description: text("description"),
    icon:       text("icon"),
    ownerId:    text("owner_id"),
    metadata:   jsonb("metadata"),
    maxMembers: integer("max_members").default(500),
    isPublic:   boolean("is_public").notNull().default(false),
    isArchived: boolean("is_archived").notNull().default(false),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt:  timestamp("created_at",  { withTimezone: true }).notNull().defaultNow(),
    updatedAt:  timestamp("updated_at",  { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_chat_rooms_type").on(t.type), index("idx_chat_rooms_owner").on(t.ownerId)],
);

export const chatMembersTable = pgTable(
  "chat_members",
  {
    id:                    text("id").primaryKey(),
    roomId:                text("room_id").notNull(),
    userId:                text("user_id").notNull(),
    role:                  chatMemberRoleEnum("role").notNull().default("MEMBER"),
    joinedAt:              timestamp("joined_at",        { withTimezone: true }).notNull().defaultNow(),
    lastReadAt:            timestamp("last_read_at",     { withTimezone: true }),
    lastReadMessageId:     text("last_read_message_id"),
    notificationsEnabled:  boolean("notifications_enabled").notNull().default(true),
    leftAt:                timestamp("left_at",          { withTimezone: true }),
    unreadCount:           integer("unread_count").notNull().default(0),
  },
  (t) => [
    uniqueIndex("idx_chat_members_room_user").on(t.roomId, t.userId),
    index("idx_chat_members_user").on(t.userId),
    index("idx_chat_members_room").on(t.roomId),
  ],
);

export const chatMessagesTable = pgTable(
  "chat_messages",
  {
    id:         text("id").primaryKey(),
    roomId:     text("room_id").notNull(),
    senderId:   text("sender_id").notNull(),
    senderName: text("sender_name").notNull(),
    type:       chatMessageTypeEnum("type").notNull().default("TEXT"),
    content:    text("content").notNull(),
    replyToId:  text("reply_to_id"),
    editedAt:   timestamp("edited_at",  { withTimezone: true }),
    deletedAt:  timestamp("deleted_at", { withTimezone: true }),
    isPinned:   boolean("is_pinned").notNull().default(false),
    metadata:   jsonb("metadata"),
    createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt:  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_chat_messages_room").on(t.roomId),
    index("idx_chat_messages_sender").on(t.senderId),
    index("idx_chat_messages_created").on(t.createdAt),
    index("idx_chat_messages_reply").on(t.replyToId),
  ],
);

export const chatMessageReadsTable = pgTable(
  "chat_message_reads",
  {
    id:        text("id").primaryKey(),
    messageId: text("message_id").notNull(),
    roomId:    text("room_id").notNull(),
    userId:    text("user_id").notNull(),
    readAt:    timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_chat_reads_msg_user").on(t.messageId, t.userId),
    index("idx_chat_reads_room_user").on(t.roomId, t.userId),
  ],
);

export const chatAttachmentsTable = pgTable(
  "chat_attachments",
  {
    id:        text("id").primaryKey(),
    messageId: text("message_id").notNull(),
    type:      text("type").notNull(),
    url:       text("url").notNull(),
    filename:  text("filename"),
    size:      integer("size"),
    mimeType:  text("mime_type"),
    metadata:  jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_chat_attachments_message").on(t.messageId)],
);

export const chatPinsTable = pgTable(
  "chat_pins",
  {
    id:        text("id").primaryKey(),
    roomId:    text("room_id").notNull(),
    messageId: text("message_id").notNull(),
    pinnedBy:  text("pinned_by").notNull(),
    note:      text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_chat_pins_room").on(t.roomId),
    uniqueIndex("idx_chat_pins_msg").on(t.messageId),
  ],
);

export const chatReactionsTable = pgTable(
  "chat_reactions",
  {
    id:        text("id").primaryKey(),
    messageId: text("message_id").notNull(),
    userId:    text("user_id").notNull(),
    emoji:     text("emoji").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_chat_reactions_msg_user_emoji").on(t.messageId, t.userId, t.emoji),
    index("idx_chat_reactions_msg").on(t.messageId),
  ],
);

export const chatSettingsTable = pgTable(
  "chat_settings",
  {
    id:                   text("id").primaryKey(),
    userId:               text("user_id").notNull().unique(),
    notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
    soundEnabled:         boolean("sound_enabled").notNull().default(true),
    showOnlineStatus:     boolean("show_online_status").notNull().default(true),
    theme:                text("theme").default("dark"),
    metadata:             jsonb("metadata"),
    createdAt:            timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt:            timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const chatBlocksTable = pgTable(
  "chat_blocks",
  {
    id:            text("id").primaryKey(),
    userId:        text("user_id").notNull(),
    blockedUserId: text("blocked_user_id").notNull(),
    reason:        text("reason"),
    createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("idx_chat_blocks_pair").on(t.userId, t.blockedUserId)],
);

export const chatReportsTable = pgTable(
  "chat_reports",
  {
    id:           text("id").primaryKey(),
    messageId:    text("message_id").notNull(),
    reportedBy:   text("reported_by").notNull(),
    reason:       text("reason").notNull(),
    status:       chatReportStatusEnum("status").notNull().default("PENDING"),
    resolvedBy:   text("resolved_by"),
    resolvedAt:   timestamp("resolved_at", { withTimezone: true }),
    createdAt:    timestamp("created_at",  { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_chat_reports_msg").on(t.messageId)],
);
