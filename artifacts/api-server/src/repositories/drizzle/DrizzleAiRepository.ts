import { eq, and, desc, isNull, gt, lte, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  aiConversations,
  aiMessages,
  aiMemories,
  aiSuggestions,
  aiUsageLogs,
  aiFeedback,
  aiPersonality,
} from "@workspace/db/schema";
import type {
  IAiRepository,
  AiConversation, AiMessage, AiMemory, AiSuggestion, AiUsageLog, AiFeedback, AiPersonality,
  CreateConversationInput, CreateMessageInput, CreateMemoryInput, CreateSuggestionInput,
  ConversationType, MemoryScope, FeedbackType, SuggestionType, MessageRole,
} from "../aiRepository.js";

function toConv(row: typeof aiConversations.$inferSelect): AiConversation {
  return {
    id:           row.id,
    userId:       row.userId,
    title:        row.title,
    type:         row.type as ConversationType,
    isArchived:   row.isArchived,
    messageCount: row.messageCount,
    lastMessageAt: row.lastMessageAt?.toISOString() ?? null,
    metadata:     row.metadata as Record<string, unknown> | null,
    createdAt:    row.createdAt.toISOString(),
    updatedAt:    row.updatedAt.toISOString(),
  };
}

function toMsg(row: typeof aiMessages.$inferSelect): AiMessage {
  return {
    id:             row.id,
    conversationId: row.conversationId,
    userId:         row.userId,
    role:           row.role as MessageRole,
    content:        row.content,
    tokens:         row.tokens,
    model:          row.model,
    metadata:       row.metadata as Record<string, unknown> | null,
    createdAt:      row.createdAt.toISOString(),
  };
}

function toMem(row: typeof aiMemories.$inferSelect): AiMemory {
  return {
    id:        row.id,
    userId:    row.userId,
    key:       row.key,
    value:     row.value,
    scope:     row.scope as MemoryScope,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    metadata:  row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toSug(row: typeof aiSuggestions.$inferSelect): AiSuggestion {
  return {
    id:          row.id,
    userId:      row.userId,
    type:        row.type as SuggestionType,
    title:       row.title,
    body:        row.body,
    action:      row.action,
    actionUrl:   row.actionUrl,
    priority:    row.priority,
    isDismissed: row.isDismissed,
    expiresAt:   row.expiresAt?.toISOString() ?? null,
    metadata:    row.metadata as Record<string, unknown> | null,
    createdAt:   row.createdAt.toISOString(),
  };
}

function toFb(row: typeof aiFeedback.$inferSelect): AiFeedback {
  return {
    id: row.id, userId: row.userId, messageId: row.messageId,
    type: row.type as FeedbackType, comment: row.comment, createdAt: row.createdAt.toISOString(),
  };
}

function toPers(row: typeof aiPersonality.$inferSelect): AiPersonality {
  return {
    id:           row.id,
    userId:       row.userId,
    name:         row.name,
    tone:         row.tone,
    language:     row.language,
    systemPrompt: row.systemPrompt,
    preferences:  row.preferences as Record<string, unknown> | null,
    createdAt:    row.createdAt.toISOString(),
    updatedAt:    row.updatedAt.toISOString(),
  };
}

export class DrizzleAiRepository implements IAiRepository {
  async createConversation(input: CreateConversationInput): Promise<AiConversation> {
    const rows = await db.insert(aiConversations).values({
      userId: input.userId, title: input.title ?? "New Conversation",
      type: input.type ?? "GENERAL",
    }).returning();
    return toConv(rows[0]!);
  }

  async getConversation(id: string): Promise<AiConversation | null> {
    const rows = await db.select().from(aiConversations).where(eq(aiConversations.id, id));
    return rows[0] ? toConv(rows[0]) : null;
  }

  async listConversations(userId: string, limit = 20, includeArchived = false): Promise<AiConversation[]> {
    const rows = await db.select().from(aiConversations)
      .where(and(
        eq(aiConversations.userId, userId),
        includeArchived ? undefined : eq(aiConversations.isArchived, false),
      ))
      .orderBy(desc(aiConversations.updatedAt))
      .limit(limit);
    return rows.map(toConv);
  }

  async updateConversation(id: string, updates: Partial<Pick<AiConversation, "title" | "type" | "isArchived" | "messageCount" | "lastMessageAt">>): Promise<AiConversation | null> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.title      !== undefined) set["title"]       = updates.title;
    if (updates.type       !== undefined) set["type"]        = updates.type;
    if (updates.isArchived !== undefined) set["isArchived"]  = updates.isArchived;
    if (updates.messageCount !== undefined) set["messageCount"] = updates.messageCount;
    if (updates.lastMessageAt !== undefined) set["lastMessageAt"] = new Date(updates.lastMessageAt);
    const rows = await db.update(aiConversations).set(set).where(eq(aiConversations.id, id)).returning();
    return rows[0] ? toConv(rows[0]) : null;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const rows = await db.delete(aiConversations).where(eq(aiConversations.id, id)).returning();
    return rows.length > 0;
  }

  async createMessage(input: CreateMessageInput): Promise<AiMessage> {
    const rows = await db.insert(aiMessages).values({
      conversationId: input.conversationId,
      userId:   input.userId,
      role:     input.role,
      content:  input.content,
      tokens:   input.tokens,
      model:    input.model,
      metadata: input.metadata,
    }).returning();
    const msg = toMsg(rows[0]!);
    await db.update(aiConversations)
      .set({ messageCount: sql`${aiConversations.messageCount} + 1`, lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(aiConversations.id, input.conversationId));
    return msg;
  }

  async listMessages(conversationId: string, limit = 100): Promise<AiMessage[]> {
    const rows = await db.select().from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(desc(aiMessages.createdAt))
      .limit(limit);
    return rows.map(toMsg).reverse();
  }

  async upsertMemory(input: CreateMemoryInput): Promise<AiMemory> {
    const rows = await db.insert(aiMemories).values({
      userId: input.userId, key: input.key, value: input.value,
      scope: input.scope ?? "LONG_TERM",
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      metadata: input.metadata,
    })
    .onConflictDoUpdate({
      target: [aiMemories.userId, aiMemories.key],
      set: { value: input.value, updatedAt: new Date(), scope: input.scope ?? "LONG_TERM", metadata: input.metadata },
    })
    .returning();
    return toMem(rows[0]!);
  }

  async getMemory(userId: string, key: string): Promise<AiMemory | null> {
    const rows = await db.select().from(aiMemories).where(and(eq(aiMemories.userId, userId), eq(aiMemories.key, key)));
    return rows[0] ? toMem(rows[0]) : null;
  }

  async listMemories(userId: string, scope?: MemoryScope): Promise<AiMemory[]> {
    const rows = await db.select().from(aiMemories)
      .where(and(
        eq(aiMemories.userId, userId),
        scope ? sql`${aiMemories.scope} = ${scope}` : undefined,
      ))
      .orderBy(desc(aiMemories.updatedAt));
    return rows.map(toMem);
  }

  async deleteMemory(id: string): Promise<boolean> {
    const rows = await db.delete(aiMemories).where(eq(aiMemories.id, id)).returning();
    return rows.length > 0;
  }

  async createSuggestion(input: CreateSuggestionInput): Promise<AiSuggestion> {
    const rows = await db.insert(aiSuggestions).values({
      userId: input.userId, type: input.type, title: input.title, body: input.body,
      action: input.action, actionUrl: input.actionUrl, priority: input.priority ?? 0,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      metadata: input.metadata,
    }).returning();
    return toSug(rows[0]!);
  }

  async listSuggestions(userId: string, includeExpired = false): Promise<AiSuggestion[]> {
    const now = new Date();
    const rows = await db.select().from(aiSuggestions)
      .where(and(
        eq(aiSuggestions.userId, userId),
        eq(aiSuggestions.isDismissed, false),
        includeExpired ? undefined : sql`(${aiSuggestions.expiresAt} IS NULL OR ${aiSuggestions.expiresAt} > NOW())`,
      ))
      .orderBy(desc(aiSuggestions.priority));
    return rows.map(toSug);
  }

  async dismissSuggestion(id: string): Promise<boolean> {
    const rows = await db.update(aiSuggestions).set({ isDismissed: true }).where(eq(aiSuggestions.id, id)).returning();
    return rows.length > 0;
  }

  async deleteSuggestion(id: string): Promise<boolean> {
    const rows = await db.delete(aiSuggestions).where(eq(aiSuggestions.id, id)).returning();
    return rows.length > 0;
  }

  async logUsage(log: Omit<AiUsageLog, "id" | "createdAt">): Promise<void> {
    await db.insert(aiUsageLogs).values(log).catch(() => {});
  }

  async createFeedback(input: Omit<AiFeedback, "id" | "createdAt">): Promise<AiFeedback> {
    const rows = await db.insert(aiFeedback).values(input).returning();
    return toFb(rows[0]!);
  }

  async getPersonality(userId: string): Promise<AiPersonality | null> {
    const rows = await db.select().from(aiPersonality).where(eq(aiPersonality.userId, userId));
    return rows[0] ? toPers(rows[0]) : null;
  }

  async upsertPersonality(userId: string, input: Partial<Omit<AiPersonality, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<AiPersonality> {
    const rows = await db.insert(aiPersonality).values({ userId, ...input })
      .onConflictDoUpdate({ target: aiPersonality.userId, set: { ...input, updatedAt: new Date() } })
      .returning();
    return toPers(rows[0]!);
  }
}
