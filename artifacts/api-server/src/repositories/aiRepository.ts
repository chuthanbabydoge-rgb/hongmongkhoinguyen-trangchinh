import { randomUUID } from "node:crypto";

export type ConversationType = "GENERAL" | "QUEST_HELP" | "MARKETPLACE_ADVICE" | "WALLET_ADVICE" | "GUILD_ADVICE" | "WORLD_GUIDE" | "INVENTORY_HELP" | "SOCIAL_ASSIST";
export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type SuggestionType = "QUEST" | "MARKETPLACE" | "WALLET" | "GUILD" | "SOCIAL" | "WORLD" | "INVENTORY" | "GENERAL";
export type FeedbackType = "THUMBS_UP" | "THUMBS_DOWN" | "REPORT";
export type MemoryScope = "SHORT_TERM" | "LONG_TERM" | "PERMANENT";

export interface AiConversation {
  id:            string;
  userId:        string;
  title:         string;
  type:          ConversationType;
  isArchived:    boolean;
  messageCount:  number;
  lastMessageAt: string | null;
  metadata:      Record<string, unknown> | null;
  createdAt:     string;
  updatedAt:     string;
}

export interface AiMessage {
  id:             string;
  conversationId: string;
  userId:         string;
  role:           MessageRole;
  content:        string;
  tokens:         number | null;
  model:          string | null;
  metadata:       Record<string, unknown> | null;
  createdAt:      string;
}

export interface AiMemory {
  id:        string;
  userId:    string;
  key:       string;
  value:     string;
  scope:     MemoryScope;
  expiresAt: string | null;
  metadata:  Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiSuggestion {
  id:          string;
  userId:      string;
  type:        SuggestionType;
  title:       string;
  body:        string;
  action:      string | null;
  actionUrl:   string | null;
  priority:    number;
  isDismissed: boolean;
  expiresAt:   string | null;
  metadata:    Record<string, unknown> | null;
  createdAt:   string;
}

export interface AiUsageLog {
  id:               string;
  userId:           string;
  conversationId:   string | null;
  provider:         string;
  model:            string | null;
  promptTokens:     number;
  completionTokens: number;
  totalTokens:      number;
  latencyMs:        number | null;
  createdAt:        string;
}

export interface AiFeedback {
  id:        string;
  userId:    string;
  messageId: string;
  type:      FeedbackType;
  comment:   string | null;
  createdAt: string;
}

export interface AiPersonality {
  id:           string;
  userId:       string;
  name:         string;
  tone:         string;
  language:     string;
  systemPrompt: string | null;
  preferences:  Record<string, unknown> | null;
  createdAt:    string;
  updatedAt:    string;
}

export interface CreateConversationInput {
  userId: string;
  title?: string;
  type?:  ConversationType;
}

export interface CreateMessageInput {
  conversationId: string;
  userId:         string;
  role:           MessageRole;
  content:        string;
  tokens?:        number;
  model?:         string;
  metadata?:      Record<string, unknown>;
}

export interface CreateMemoryInput {
  userId:    string;
  key:       string;
  value:     string;
  scope?:    MemoryScope;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateSuggestionInput {
  userId:    string;
  type:      SuggestionType;
  title:     string;
  body:      string;
  action?:   string;
  actionUrl?: string;
  priority?: number;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface IAiRepository {
  // Conversations
  createConversation(input: CreateConversationInput): Promise<AiConversation>;
  getConversation(id: string): Promise<AiConversation | null>;
  listConversations(userId: string, limit?: number, includeArchived?: boolean): Promise<AiConversation[]>;
  updateConversation(id: string, updates: Partial<Pick<AiConversation, "title" | "type" | "isArchived" | "messageCount" | "lastMessageAt">>): Promise<AiConversation | null>;
  deleteConversation(id: string): Promise<boolean>;
  // Messages
  createMessage(input: CreateMessageInput): Promise<AiMessage>;
  listMessages(conversationId: string, limit?: number): Promise<AiMessage[]>;
  // Memory
  upsertMemory(input: CreateMemoryInput): Promise<AiMemory>;
  getMemory(userId: string, key: string): Promise<AiMemory | null>;
  listMemories(userId: string, scope?: MemoryScope): Promise<AiMemory[]>;
  deleteMemory(id: string): Promise<boolean>;
  // Suggestions
  createSuggestion(input: CreateSuggestionInput): Promise<AiSuggestion>;
  listSuggestions(userId: string, includeExpired?: boolean): Promise<AiSuggestion[]>;
  dismissSuggestion(id: string): Promise<boolean>;
  deleteSuggestion(id: string): Promise<boolean>;
  // Usage
  logUsage(log: Omit<AiUsageLog, "id" | "createdAt">): Promise<void>;
  // Feedback
  createFeedback(input: Omit<AiFeedback, "id" | "createdAt">): Promise<AiFeedback>;
  // Personality
  getPersonality(userId: string): Promise<AiPersonality | null>;
  upsertPersonality(userId: string, input: Partial<Omit<AiPersonality, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<AiPersonality>;
}

// ─── InMemory Implementation ──────────────────────────────────────────────────

function now() { return new Date().toISOString(); }

export class InMemoryAiRepository implements IAiRepository {
  private conversations = new Map<string, AiConversation>();
  private messages      = new Map<string, AiMessage>();
  private memories      = new Map<string, AiMemory>();
  private suggestions   = new Map<string, AiSuggestion>();
  private feedback      = new Map<string, AiFeedback>();
  private personalities = new Map<string, AiPersonality>();

  async createConversation(input: CreateConversationInput): Promise<AiConversation> {
    const c: AiConversation = {
      id: randomUUID(), userId: input.userId, title: input.title ?? "New Conversation",
      type: input.type ?? "GENERAL", isArchived: false, messageCount: 0,
      lastMessageAt: null, metadata: null, createdAt: now(), updatedAt: now(),
    };
    this.conversations.set(c.id, c);
    return c;
  }

  async getConversation(id: string): Promise<AiConversation | null> {
    return this.conversations.get(id) ?? null;
  }

  async listConversations(userId: string, limit = 20, includeArchived = false): Promise<AiConversation[]> {
    return [...this.conversations.values()]
      .filter(c => c.userId === userId && (includeArchived || !c.isArchived))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit);
  }

  async updateConversation(id: string, updates: Partial<Pick<AiConversation, "title" | "type" | "isArchived" | "messageCount" | "lastMessageAt">>): Promise<AiConversation | null> {
    const c = this.conversations.get(id);
    if (!c) return null;
    Object.assign(c, updates, { updatedAt: now() });
    return c;
  }

  async deleteConversation(id: string): Promise<boolean> {
    // delete messages
    for (const [k, m] of this.messages) if (m.conversationId === id) this.messages.delete(k);
    return this.conversations.delete(id);
  }

  async createMessage(input: CreateMessageInput): Promise<AiMessage> {
    const m: AiMessage = {
      id: randomUUID(), ...input, tokens: input.tokens ?? null,
      model: input.model ?? null, metadata: input.metadata ?? null, createdAt: now(),
    };
    this.messages.set(m.id, m);
    const conv = this.conversations.get(input.conversationId);
    if (conv) {
      conv.messageCount++;
      conv.lastMessageAt = m.createdAt;
      conv.updatedAt = m.createdAt;
    }
    return m;
  }

  async listMessages(conversationId: string, limit = 100): Promise<AiMessage[]> {
    return [...this.messages.values()]
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(-limit);
  }

  async upsertMemory(input: CreateMemoryInput): Promise<AiMemory> {
    const existing = [...this.memories.values()].find(m => m.userId === input.userId && m.key === input.key);
    if (existing) {
      Object.assign(existing, { value: input.value, scope: input.scope ?? existing.scope, expiresAt: input.expiresAt ?? existing.expiresAt, metadata: input.metadata ?? existing.metadata, updatedAt: now() });
      return existing;
    }
    const m: AiMemory = {
      id: randomUUID(), userId: input.userId, key: input.key, value: input.value,
      scope: input.scope ?? "LONG_TERM", expiresAt: input.expiresAt ?? null,
      metadata: input.metadata ?? null, createdAt: now(), updatedAt: now(),
    };
    this.memories.set(m.id, m);
    return m;
  }

  async getMemory(userId: string, key: string): Promise<AiMemory | null> {
    return [...this.memories.values()].find(m => m.userId === userId && m.key === key) ?? null;
  }

  async listMemories(userId: string, scope?: MemoryScope): Promise<AiMemory[]> {
    return [...this.memories.values()]
      .filter(m => m.userId === userId && (!scope || m.scope === scope))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async deleteMemory(id: string): Promise<boolean> { return this.memories.delete(id); }

  async createSuggestion(input: CreateSuggestionInput): Promise<AiSuggestion> {
    const s: AiSuggestion = {
      id: randomUUID(), userId: input.userId, type: input.type, title: input.title,
      body: input.body, action: input.action ?? null, actionUrl: input.actionUrl ?? null,
      priority: input.priority ?? 0, isDismissed: false,
      expiresAt: input.expiresAt ?? null, metadata: input.metadata ?? null, createdAt: now(),
    };
    this.suggestions.set(s.id, s);
    return s;
  }

  async listSuggestions(userId: string, includeExpired = false): Promise<AiSuggestion[]> {
    const n = new Date();
    return [...this.suggestions.values()]
      .filter(s => s.userId === userId && !s.isDismissed && (includeExpired || !s.expiresAt || new Date(s.expiresAt) > n))
      .sort((a, b) => b.priority - a.priority);
  }

  async dismissSuggestion(id: string): Promise<boolean> {
    const s = this.suggestions.get(id);
    if (!s) return false;
    s.isDismissed = true;
    return true;
  }

  async deleteSuggestion(id: string): Promise<boolean> { return this.suggestions.delete(id); }

  async logUsage(_log: Omit<AiUsageLog, "id" | "createdAt">): Promise<void> {}

  async createFeedback(input: Omit<AiFeedback, "id" | "createdAt">): Promise<AiFeedback> {
    const f: AiFeedback = { id: randomUUID(), ...input, createdAt: now() };
    this.feedback.set(f.id, f);
    return f;
  }

  async getPersonality(userId: string): Promise<AiPersonality | null> {
    return this.personalities.get(userId) ?? null;
  }

  async upsertPersonality(userId: string, input: Partial<Omit<AiPersonality, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<AiPersonality> {
    const existing = this.personalities.get(userId);
    if (existing) {
      Object.assign(existing, input, { updatedAt: now() });
      return existing;
    }
    const p: AiPersonality = {
      id: randomUUID(), userId, name: "Nova", tone: "friendly", language: "vi",
      systemPrompt: null, preferences: null, createdAt: now(), updatedAt: now(),
      ...input,
    };
    this.personalities.set(userId, p);
    return p;
  }
}
