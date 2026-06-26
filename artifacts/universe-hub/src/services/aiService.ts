import { apiFetch } from "@/lib/apiClient";

export type ConversationType = "GENERAL" | "QUEST_HELP" | "MARKETPLACE_ADVICE" | "WALLET_ADVICE" | "GUILD_ADVICE" | "WORLD_GUIDE" | "INVENTORY_HELP" | "SOCIAL_ASSIST";
export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type SuggestionType = "QUEST" | "MARKETPLACE" | "WALLET" | "GUILD" | "SOCIAL" | "WORLD" | "INVENTORY" | "GENERAL";
export type MemoryScope = "SHORT_TERM" | "LONG_TERM" | "PERMANENT";
export type FeedbackType = "THUMBS_UP" | "THUMBS_DOWN" | "REPORT";

export interface AiConversation {
  id:            string;
  userId:        string;
  title:         string;
  type:          ConversationType;
  isArchived:    boolean;
  messageCount:  number;
  lastMessageAt: string | null;
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
  createdAt:      string;
}

export interface AiMemory {
  id:        string;
  userId:    string;
  key:       string;
  value:     string;
  scope:     MemoryScope;
  expiresAt: string | null;
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
  createdAt:   string;
}

export interface AiDashboard {
  provider:     string;
  model:        string;
  personality:  { name: string; tone: string; language: string };
  conversations: AiConversation[];
  suggestions:  AiSuggestion[];
  memoryCount:  number;
  status:       string;
}

async function unwrap<T>(p: Promise<Response>): Promise<T> {
  const res  = await p;
  const json = await res.json() as { ok: boolean; data?: T; error?: string };
  if (!json.ok) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}

export const aiService = {
  status() {
    return unwrap<{ name: string; version: string; status: string }>(apiFetch("/api/ai"));
  },
  dashboard() {
    return unwrap<AiDashboard>(apiFetch("/api/ai/dashboard"));
  },
  listConversations(limit = 20) {
    return unwrap<AiConversation[]>(apiFetch(`/api/ai/conversations?limit=${limit}`));
  },
  createConversation(input: { title?: string; type?: ConversationType }) {
    return unwrap<AiConversation>(apiFetch("/api/ai/conversations", { method: "POST", body: JSON.stringify(input), headers: { "Content-Type": "application/json" } }));
  },
  getConversation(id: string) {
    return unwrap<AiConversation>(apiFetch(`/api/ai/conversations/${id}`));
  },
  deleteConversation(id: string) {
    return unwrap<void>(apiFetch(`/api/ai/conversations/${id}`, { method: "DELETE" }));
  },
  listMessages(conversationId: string, limit = 50) {
    return unwrap<AiMessage[]>(apiFetch(`/api/ai/messages/${conversationId}?limit=${limit}`));
  },
  chat(message: string, conversationId?: string) {
    return unwrap<{ userMsg: AiMessage; assistantMsg: AiMessage; conversation: AiConversation }>(
      apiFetch("/api/ai/chat", { method: "POST", body: JSON.stringify({ message, conversationId }), headers: { "Content-Type": "application/json" } })
    );
  },
  listMemories() {
    return unwrap<AiMemory[]>(apiFetch("/api/ai/memory"));
  },
  createMemory(input: { key: string; value: string; scope?: MemoryScope }) {
    return unwrap<AiMemory>(apiFetch("/api/ai/memory", { method: "POST", body: JSON.stringify(input), headers: { "Content-Type": "application/json" } }));
  },
  deleteMemory(id: string) {
    return unwrap<void>(apiFetch(`/api/ai/memory/${id}`, { method: "DELETE" }));
  },
  listSuggestions() {
    return unwrap<AiSuggestion[]>(apiFetch("/api/ai/suggestions"));
  },
  dismissSuggestion(id: string) {
    return unwrap<void>(apiFetch(`/api/ai/suggestions/${id}`, { method: "DELETE" }));
  },
  generateSuggestions() {
    return unwrap<AiSuggestion[]>(apiFetch("/api/ai/suggestions/generate", { method: "POST" }));
  },
  feedback(messageId: string, type: FeedbackType, comment?: string) {
    return unwrap<void>(apiFetch("/api/ai/feedback", { method: "POST", body: JSON.stringify({ messageId, type, comment }), headers: { "Content-Type": "application/json" } }));
  },
};
