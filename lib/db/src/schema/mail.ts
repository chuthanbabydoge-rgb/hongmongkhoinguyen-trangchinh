import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const mailTypeEnum = pgEnum("mail_type", [
  "SYSTEM",
  "QUEST",
  "MARKETPLACE",
  "WALLET",
  "SOCIAL",
  "GUILD",
  "EVENT",
  "COMPENSATION",
  "GIFT",
  "ADMIN",
]);

export const mailStatusEnum = pgEnum("mail_status", [
  "UNREAD",
  "READ",
  "CLAIMED",
  "ARCHIVED",
  "DELETED",
]);

export const mailAttachmentTypeEnum = pgEnum("mail_attachment_type", [
  "CREDITS",
  "COINS",
  "TOKENS",
  "REWARD_POINTS",
  "INVENTORY_ITEM",
  "PET",
  "TICKET",
  "NFT",
  "WORLD_ASSET",
  "GUILD_REWARD",
  "QUEST_REWARD",
  "ACHIEVEMENT_REWARD",
]);

export const mailTemplatesTable = pgTable("mail_templates", {
  id:        text("id").primaryKey(),
  slug:      text("slug").notNull().unique(),
  type:      mailTypeEnum("type").notNull(),
  subject:   text("subject").notNull(),
  body:      text("body").notNull(),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mailsTable = pgTable(
  "mails",
  {
    id:         text("id").primaryKey(),
    userId:     text("user_id").notNull(),
    senderId:   text("sender_id"),
    senderName: text("sender_name").notNull().default("Universe System"),
    type:       mailTypeEnum("type").notNull().default("SYSTEM"),
    status:     mailStatusEnum("status").notNull().default("UNREAD"),
    subject:    text("subject").notNull(),
    body:       text("body").notNull(),
    expiresAt:  timestamp("expires_at", { withTimezone: true }),
    readAt:     timestamp("read_at", { withTimezone: true }),
    claimedAt:  timestamp("claimed_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    metadata:   jsonb("metadata"),
    createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt:  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("mails_user_id_idx").on(t.userId),
    index("mails_user_status_idx").on(t.userId, t.status),
    index("mails_user_type_idx").on(t.userId, t.type),
    index("mails_created_at_idx").on(t.createdAt),
  ],
);

export const mailAttachmentsTable = pgTable(
  "mail_attachments",
  {
    id:          text("id").primaryKey(),
    mailId:      text("mail_id").notNull().references(() => mailsTable.id, { onDelete: "cascade" }),
    type:        mailAttachmentTypeEnum("type").notNull(),
    label:       text("label").notNull(),
    amount:      integer("amount"),
    itemId:      text("item_id"),
    itemData:    jsonb("item_data"),
    claimed:     boolean("claimed").notNull().default(false),
    claimedAt:   timestamp("claimed_at", { withTimezone: true }),
  },
  (t) => [
    index("mail_attachments_mail_id_idx").on(t.mailId),
  ],
);

export const mailClaimLogsTable = pgTable(
  "mail_claim_logs",
  {
    id:           text("id").primaryKey(),
    mailId:       text("mail_id").notNull().references(() => mailsTable.id, { onDelete: "cascade" }),
    attachmentId: text("attachment_id").notNull().references(() => mailAttachmentsTable.id, { onDelete: "cascade" }),
    userId:       text("user_id").notNull(),
    claimedAt:    timestamp("claimed_at", { withTimezone: true }).notNull().defaultNow(),
    result:       jsonb("result"),
  },
  (t) => [
    index("mail_claim_logs_mail_id_idx").on(t.mailId),
    index("mail_claim_logs_user_id_idx").on(t.userId),
  ],
);

export const mailLabelsTable = pgTable("mail_labels", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull(),
  name:      text("name").notNull(),
  color:     text("color").notNull().default("#3B82F6"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mailUserLabelsTable = pgTable(
  "mail_user_labels",
  {
    id:      text("id").primaryKey(),
    mailId:  text("mail_id").notNull().references(() => mailsTable.id, { onDelete: "cascade" }),
    labelId: text("label_id").notNull().references(() => mailLabelsTable.id, { onDelete: "cascade" }),
    userId:  text("user_id").notNull(),
  },
  (t) => [
    index("mail_user_labels_mail_id_idx").on(t.mailId),
    index("mail_user_labels_user_id_idx").on(t.userId),
  ],
);
