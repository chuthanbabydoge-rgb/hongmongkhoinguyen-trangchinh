import { pgTable, pgEnum, text, integer, boolean, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const conversationTypeEnum = pgEnum("conversation_type", [
  "GENERAL", "QUEST_HELP", "MARKETPLACE_ADVICE", "WALLET_ADVICE",
  "GUILD_ADVICE", "WORLD_GUIDE", "INVENTORY_HELP", "SOCIAL_ASSIST",
]);

export const messageRoleEnum = pgEnum("message_role", ["USER", "ASSISTANT", "SYSTEM"]);

export const suggestionTypeEnum = pgEnum("suggestion_type", [
  "QUEST", "MARKETPLACE", "WALLET", "GUILD", "SOCIAL", "WORLD", "INVENTORY", "GENERAL",
]);

export const feedbackTypeEnum = pgEnum("feedback_type", ["THUMBS_UP", "THUMBS_DOWN", "REPORT"]);

export const memoryScopeEnum = pgEnum("memory_scope", ["SHORT_TERM", "LONG_TERM", "PERMANENT"]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const aiConversations = pgTable("ai_conversations", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  title:       text("title").notNull().default("New Conversation"),
  type:        conversationTypeEnum("type").notNull().default("GENERAL"),
  isArchived:  boolean("is_archived").notNull().default(false),
  messageCount: integer("message_count").notNull().default(0),
  lastMessageAt: timestamp("last_message_at"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, t => [
  index("ai_conv_user_idx").on(t.userId),
  index("ai_conv_type_idx").on(t.type),
]);

export const aiMessages = pgTable("ai_messages", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  conversationId: text("conversation_id").notNull().references(() => aiConversations.id, { onDelete: "cascade" }),
  userId:         text("user_id").notNull(),
  role:           messageRoleEnum("role").notNull(),
  content:        text("content").notNull(),
  tokens:         integer("tokens"),
  model:          text("model"),
  metadata:       jsonb("metadata"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
}, t => [
  index("ai_msg_conv_idx").on(t.conversationId),
  index("ai_msg_user_idx").on(t.userId),
]);

export const aiMemories = pgTable("ai_memories", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  userId:    text("user_id").notNull(),
  key:       text("key").notNull(),
  value:     text("value").notNull(),
  scope:     memoryScopeEnum("scope").notNull().default("LONG_TERM"),
  expiresAt: timestamp("expires_at"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, t => [
  index("ai_mem_user_idx").on(t.userId),
  uniqueIndex("ai_mem_user_key_idx").on(t.userId, t.key),
]);

export const aiSuggestions = pgTable("ai_suggestions", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  userId:    text("user_id").notNull(),
  type:      suggestionTypeEnum("type").notNull().default("GENERAL"),
  title:     text("title").notNull(),
  body:      text("body").notNull(),
  action:    text("action"),
  actionUrl: text("action_url"),
  priority:  integer("priority").notNull().default(0),
  isDismissed: boolean("is_dismissed").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, t => [
  index("ai_sug_user_idx").on(t.userId),
  index("ai_sug_type_idx").on(t.type),
]);

export const aiSessions = pgTable("ai_sessions", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  userId:         text("user_id").notNull(),
  conversationId: text("conversation_id"),
  provider:       text("provider").notNull().default("mock"),
  model:          text("model"),
  isActive:       boolean("is_active").notNull().default(true),
  startedAt:      timestamp("started_at").notNull().defaultNow(),
  endedAt:        timestamp("ended_at"),
  metadata:       jsonb("metadata"),
}, t => [
  index("ai_sess_user_idx").on(t.userId),
]);

export const aiUsageLogs = pgTable("ai_usage_logs", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  userId:         text("user_id").notNull(),
  conversationId: text("conversation_id"),
  provider:       text("provider").notNull(),
  model:          text("model"),
  promptTokens:   integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  totalTokens:    integer("total_tokens").notNull().default(0),
  latencyMs:      integer("latency_ms"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
}, t => [
  index("ai_usage_user_idx").on(t.userId),
  index("ai_usage_conv_idx").on(t.conversationId),
]);

export const aiPromptTemplates = pgTable("ai_prompt_templates", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  slug:        text("slug").notNull().unique(),
  name:        text("name").notNull(),
  description: text("description"),
  template:    text("template").notNull(),
  variables:   jsonb("variables"),
  isActive:    boolean("is_active").notNull().default(true),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export const aiContextCache = pgTable("ai_context_cache", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  userId:    text("user_id").notNull(),
  contextKey: text("context_key").notNull(),
  data:      jsonb("data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, t => [
  index("ai_ctx_user_idx").on(t.userId),
  uniqueIndex("ai_ctx_user_key_idx").on(t.userId, t.contextKey),
]);

export const aiFeedback = pgTable("ai_feedback", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  userId:    text("user_id").notNull(),
  messageId: text("message_id").notNull().references(() => aiMessages.id, { onDelete: "cascade" }),
  type:      feedbackTypeEnum("type").notNull(),
  comment:   text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, t => [
  index("ai_fb_user_idx").on(t.userId),
  index("ai_fb_msg_idx").on(t.messageId),
]);

export const aiPersonality = pgTable("ai_personality", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull().unique(),
  name:        text("name").notNull().default("Nova"),
  tone:        text("tone").notNull().default("friendly"),
  language:    text("language").notNull().default("vi"),
  systemPrompt: text("system_prompt"),
  preferences: jsonb("preferences"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});
