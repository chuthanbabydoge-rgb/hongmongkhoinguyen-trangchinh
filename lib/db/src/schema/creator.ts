import {
  pgTable, text, integer, boolean, timestamp, pgEnum, jsonb, index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const projectTypeEnum = pgEnum("creator_project_type", [
  "WORLD", "NPC", "QUEST", "BUSINESS", "STORY",
  "EVENT", "TOURNAMENT", "SHOP", "GUILD", "DUNGEON",
]);

export const projectStatusEnum = pgEnum("creator_project_status", [
  "DRAFT", "PRIVATE", "PUBLIC", "PUBLISHED", "ARCHIVED",
]);

export const creatorMemberRoleEnum = pgEnum("creator_member_role", [
  "OWNER", "ADMIN", "EDITOR", "VIEWER",
]);

export const assetTypeEnum = pgEnum("creator_asset_type", [
  "IMAGE", "MODEL", "JSON", "SCRIPT", "TEXT", "ICON",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorCategoriesTable = pgTable("creator_categories", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull().unique(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  icon:        text("icon"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export const creatorTemplatesTable = pgTable("creator_templates", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  type:        projectTypeEnum("type").notNull().default("WORLD"),
  categoryId:  text("category_id"),
  thumbnail:   text("thumbnail"),
  content:     jsonb("content"),
  tags:        jsonb("tags").$type<string[]>().default([]),
  isOfficial:  boolean("is_official").notNull().default(false),
  useCount:    integer("use_count").notNull().default(0),
  createdBy:   text("created_by").notNull(),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("creator_templates_type_idx").on(t.type),
  index("creator_templates_official_idx").on(t.isOfficial),
]);

export const creatorProjectsTable = pgTable("creator_projects", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  type:        projectTypeEnum("type").notNull().default("WORLD"),
  status:      projectStatusEnum("status").notNull().default("DRAFT"),
  ownerId:     text("owner_id").notNull(),
  templateId:  text("template_id"),
  forkedFrom:  text("forked_from"),
  categoryId:  text("category_id"),
  thumbnail:   text("thumbnail"),
  content:     jsonb("content"),
  tags:        jsonb("tags").$type<string[]>().default([]),
  isPublic:    boolean("is_public").notNull().default(false),
  viewCount:   integer("view_count").notNull().default(0),
  forkCount:   integer("fork_count").notNull().default(0),
  likeCount:   integer("like_count").notNull().default(0),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
}, (t) => [
  index("creator_projects_owner_idx").on(t.ownerId),
  index("creator_projects_status_idx").on(t.status),
  index("creator_projects_type_idx").on(t.type),
]);

export const creatorTagsTable = pgTable("creator_tags", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull(),
  tag:       text("tag").notNull(),
}, (t) => [
  index("creator_tags_project_idx").on(t.projectId),
]);

export const creatorProjectMembersTable = pgTable("creator_project_members", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull(),
  userId:    text("user_id").notNull(),
  role:      creatorMemberRoleEnum("role").notNull().default("VIEWER"),
  joinedAt:  timestamp("joined_at").notNull().defaultNow(),
}, (t) => [
  index("creator_members_project_idx").on(t.projectId),
  index("creator_members_user_idx").on(t.userId),
]);

export const creatorVersionsTable = pgTable("creator_versions", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull(),
  version:   integer("version").notNull().default(1),
  label:     text("label"),
  content:   jsonb("content"),
  savedBy:   text("saved_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("creator_versions_project_idx").on(t.projectId),
]);

export const creatorPublishLogsTable = pgTable("creator_publish_logs", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id").notNull(),
  publishedBy: text("published_by").notNull(),
  version:     integer("version").notNull().default(1),
  notes:       text("notes"),
  status:      text("status").notNull().default("SUCCESS"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("creator_publish_logs_project_idx").on(t.projectId),
]);

export const creatorFavoritesTable = pgTable("creator_favorites", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull(),
  userId:    text("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("creator_favorites_user_idx").on(t.userId),
  index("creator_favorites_project_idx").on(t.projectId),
]);

export const creatorAssetsTable = pgTable("creator_assets", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id"),
  ownerId:   text("owner_id").notNull(),
  name:      text("name").notNull(),
  type:      assetTypeEnum("type").notNull().default("IMAGE"),
  url:       text("url").notNull(),
  size:      integer("size").notNull().default(0),
  mimeType:  text("mime_type"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("creator_assets_owner_idx").on(t.ownerId),
  index("creator_assets_project_idx").on(t.projectId),
]);

export const creatorCommentsTable = pgTable("creator_comments", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull(),
  userId:    text("user_id").notNull(),
  content:   text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("creator_comments_project_idx").on(t.projectId),
]);

// ─── Type exports ─────────────────────────────────────────────────────────────

export type CreatorProject     = typeof creatorProjectsTable.$inferSelect;
export type CreatorTemplate    = typeof creatorTemplatesTable.$inferSelect;
export type CreatorAsset       = typeof creatorAssetsTable.$inferSelect;
export type CreatorTag         = typeof creatorTagsTable.$inferSelect;
export type CreatorMember      = typeof creatorProjectMembersTable.$inferSelect;
export type CreatorVersion     = typeof creatorVersionsTable.$inferSelect;
export type CreatorPublishLog  = typeof creatorPublishLogsTable.$inferSelect;
export type CreatorFavorite    = typeof creatorFavoritesTable.$inferSelect;
export type CreatorCategory    = typeof creatorCategoriesTable.$inferSelect;
export type CreatorComment     = typeof creatorCommentsTable.$inferSelect;
