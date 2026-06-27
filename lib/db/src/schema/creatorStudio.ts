import {
  pgTable, text, integer, boolean, timestamp, pgEnum, jsonb, index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const studioDocTypeEnum = pgEnum("studio_doc_type", [
  "WORLD", "NPC", "QUEST", "BOSS", "DUNGEON", "ITEM", "SKILL",
  "PET", "MOUNT", "BUILDING", "CITY", "SPORTS", "EDUCATION", "COMPANY", "DIALOG",
]);

export const studioPublishStatusEnum = pgEnum("studio_publish_status", [
  "PENDING", "VALIDATING", "PACKAGING", "PUBLISHING", "DONE", "FAILED",
]);

export const studioAssetTypeEnum = pgEnum("studio_asset_type", [
  "IMAGE", "AUDIO", "VIDEO", "MODEL_3D", "SCRIPT", "DATA", "OTHER",
]);

export const studioPluginStatusEnum = pgEnum("studio_plugin_status", [
  "ACTIVE", "INACTIVE", "ERROR",
]);

export const studioHistoryActionEnum = pgEnum("studio_history_action", [
  "CREATE", "UPDATE", "DELETE", "PUBLISH", "IMPORT", "CLONE", "RESTORE",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const studioEditorsTable = pgTable("studio_editors", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  userId:       text("user_id").notNull(),
  name:         text("name").notNull(),
  description:  text("description"),
  currentDocId: text("current_doc_id"),
  currentDocType: studioDocTypeEnum("current_doc_type"),
  preferences:  jsonb("preferences"),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("studio_editors_user_idx").on(t.userId)]);

export const editorSessionsTable = pgTable("editor_sessions", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  editorId:   text("editor_id").notNull().references(() => studioEditorsTable.id, { onDelete: "cascade" }),
  userId:     text("user_id").notNull(),
  docId:      text("doc_id"),
  docType:    studioDocTypeEnum("doc_type"),
  startedAt:  timestamp("started_at").notNull().defaultNow(),
  endedAt:    timestamp("ended_at"),
  metadata:   jsonb("metadata"),
}, (t) => [index("editor_sessions_editor_idx").on(t.editorId)]);

export const editorLayoutsTable = pgTable("editor_layouts", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  userId:    text("user_id").notNull(),
  editorId:  text("editor_id"),
  name:      text("name").notNull(),
  layout:    jsonb("layout").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("editor_layouts_user_idx").on(t.userId)]);

export const editorPreferencesTable = pgTable("editor_preferences", {
  id:               text("id").primaryKey().$defaultFn(() => createId()),
  userId:           text("user_id").notNull().unique(),
  theme:            text("theme").notNull().default("dark"),
  fontSize:         integer("font_size").notNull().default(14),
  autosave:         boolean("autosave").notNull().default(true),
  autosaveInterval: integer("autosave_interval").notNull().default(30),
  keybindings:      jsonb("keybindings"),
  metadata:         jsonb("metadata"),
  updatedAt:        timestamp("updated_at").notNull().defaultNow(),
});

// ─── Document Tables ───────────────────────────────────────────────────────────

export const worldDocumentsTable = pgTable("world_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  worldId:     text("world_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("world_docs_user_idx").on(t.userId)]);

export const npcDocumentsTable = pgTable("npc_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  npcId:       text("npc_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("npc_docs_user_idx").on(t.userId)]);

export const questDocumentsTable = pgTable("quest_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  questId:     text("quest_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("quest_docs_user_idx").on(t.userId)]);

export const bossDocumentsTable = pgTable("boss_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  bossId:      text("boss_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("boss_docs_user_idx").on(t.userId)]);

export const dungeonDocumentsTable = pgTable("dungeon_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  dungeonId:   text("dungeon_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("dungeon_docs_user_idx").on(t.userId)]);

export const itemDocumentsTable = pgTable("item_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  itemId:      text("item_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("item_docs_user_idx").on(t.userId)]);

export const skillDocumentsTable = pgTable("skill_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  skillId:     text("skill_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("skill_docs_user_idx").on(t.userId)]);

export const petDocumentsTable = pgTable("pet_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  petId:       text("pet_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("pet_docs_user_idx").on(t.userId)]);

export const mountDocumentsTable = pgTable("mount_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  mountId:     text("mount_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("mount_docs_user_idx").on(t.userId)]);

export const buildingDocumentsTable = pgTable("building_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  buildingId:  text("building_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("building_docs_user_idx").on(t.userId)]);

export const cityDocumentsTable = pgTable("city_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  cityId:      text("city_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("city_docs_user_idx").on(t.userId)]);

export const sportsDocumentsTable = pgTable("sports_studio_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  sportsId:    text("sports_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("sports_studio_docs_user_idx").on(t.userId)]);

export const educationDocumentsTable = pgTable("education_documents", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  projectId:    text("project_id"),
  userId:       text("user_id").notNull(),
  educationId:  text("education_id"),
  name:         text("name").notNull(),
  description:  text("description"),
  data:         jsonb("data").notNull().default({}),
  version:      integer("version").notNull().default(1),
  isDraft:      boolean("is_draft").notNull().default(true),
  publishedAt:  timestamp("published_at"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("education_docs_user_idx").on(t.userId)]);

export const companyDocumentsTable = pgTable("company_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  companyId:   text("company_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("company_docs_user_idx").on(t.userId)]);

export const dialogDocumentsTable = pgTable("dialog_documents", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  nodes:       jsonb("nodes").notNull().default([]),
  edges:       jsonb("edges").notNull().default([]),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("dialog_docs_user_idx").on(t.userId)]);

// ─── Visual Scripting ─────────────────────────────────────────────────────────

export const behaviorTreesTable = pgTable("behavior_trees", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  rootNode:    jsonb("root_node"),
  nodes:       jsonb("nodes").notNull().default([]),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("behavior_trees_user_idx").on(t.userId)]);

export const visualScriptsTable = pgTable("visual_scripts", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  nodes:       jsonb("nodes").notNull().default([]),
  edges:       jsonb("edges").notNull().default([]),
  variables:   jsonb("variables").notNull().default([]),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("visual_scripts_user_idx").on(t.userId)]);

export const logicGraphsTable = pgTable("logic_graphs", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  projectId:   text("project_id"),
  userId:      text("user_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  nodes:       jsonb("nodes").notNull().default([]),
  edges:       jsonb("edges").notNull().default([]),
  version:     integer("version").notNull().default(1),
  isDraft:     boolean("is_draft").notNull().default(true),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("logic_graphs_user_idx").on(t.userId)]);

// ─── Publish Pipeline ─────────────────────────────────────────────────────────

export const publishJobsTable = pgTable("publish_jobs", {
  id:               text("id").primaryKey().$defaultFn(() => createId()),
  projectId:        text("project_id"),
  userId:           text("user_id").notNull(),
  docId:            text("doc_id"),
  docType:          studioDocTypeEnum("doc_type"),
  status:           studioPublishStatusEnum("status").notNull().default("PENDING"),
  logs:             jsonb("logs").notNull().default([]),
  validationErrors: jsonb("validation_errors").notNull().default([]),
  version:          text("version").notNull().default("1.0.0"),
  startedAt:        timestamp("started_at"),
  completedAt:      timestamp("completed_at"),
  createdAt:        timestamp("created_at").notNull().defaultNow(),
  updatedAt:        timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("publish_jobs_user_idx").on(t.userId)]);

// ─── Assets ───────────────────────────────────────────────────────────────────

export const studioAssetsTable = pgTable("studio_assets", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  userId:    text("user_id").notNull(),
  projectId: text("project_id"),
  name:      text("name").notNull(),
  type:      studioAssetTypeEnum("type").notNull(),
  url:       text("url").notNull(),
  size:      integer("size").notNull().default(0),
  mimeType:  text("mime_type"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("studio_assets_user_idx").on(t.userId)]);

// ─── Packages ─────────────────────────────────────────────────────────────────

export const studioPackagesTable = pgTable("studio_packages", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  userId:        text("user_id").notNull(),
  name:          text("name").notNull(),
  version:       text("version").notNull().default("1.0.0"),
  description:   text("description"),
  contents:      jsonb("contents").notNull().default([]),
  isPublic:      boolean("is_public").notNull().default(false),
  downloadCount: integer("download_count").notNull().default(0),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("studio_packages_user_idx").on(t.userId)]);

// ─── Plugins ──────────────────────────────────────────────────────────────────

export const studioPluginsTable = pgTable("studio_plugins", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  version:     text("version").notNull().default("1.0.0"),
  code:        text("code"),
  config:      jsonb("config"),
  status:      studioPluginStatusEnum("status").notNull().default("ACTIVE"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("studio_plugins_user_idx").on(t.userId)]);

// ─── Templates ────────────────────────────────────────────────────────────────

export const studioTemplatesTable = pgTable("studio_templates", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  docType:     studioDocTypeEnum("doc_type").notNull(),
  thumbnail:   text("thumbnail"),
  data:        jsonb("data").notNull().default({}),
  isPublic:    boolean("is_public").notNull().default(false),
  useCount:    integer("use_count").notNull().default(0),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("studio_templates_user_idx").on(t.userId)]);

// ─── History ──────────────────────────────────────────────────────────────────

export const studioHistoryTable = pgTable("studio_history", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  userId:    text("user_id").notNull(),
  docId:     text("doc_id").notNull(),
  docType:   studioDocTypeEnum("doc_type"),
  action:    studioHistoryActionEnum("action").notNull(),
  snapshot:  jsonb("snapshot"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("studio_history_doc_idx").on(t.docId), index("studio_history_user_idx").on(t.userId)]);

// ─── Backups ──────────────────────────────────────────────────────────────────

export const studioBackupsTable = pgTable("studio_backups", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  projectId:   text("project_id"),
  name:        text("name").notNull(),
  description: text("description"),
  data:        jsonb("data").notNull().default({}),
  size:        integer("size").notNull().default(0),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("studio_backups_user_idx").on(t.userId)]);
