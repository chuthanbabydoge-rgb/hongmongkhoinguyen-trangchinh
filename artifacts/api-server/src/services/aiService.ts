import { aiEventBus } from "../realtime/aiEventBus.js";
import { questEventBus } from "../realtime/questEventBus.js";
import type { IAiRepository, AiConversation, AiMessage, AiMemory, AiSuggestion, CreateConversationInput, ConversationType, SuggestionType } from "../repositories/aiRepository.js";
import type { IAiProvider, ChatMessage } from "./ai/IAiProvider.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { UserReputationService } from "./userReputationService.js";

// Context providers injected so we can read real data
export interface AiContextProviders {
  getWalletContext?(userId: string): Promise<Record<string, unknown>>;
  getInventoryContext?(userId: string): Promise<Record<string, unknown>>;
  getQuestContext?(userId: string): Promise<Record<string, unknown>>;
  getGuildContext?(userId: string): Promise<Record<string, unknown>>;
  getWorldContext?(userId: string): Promise<Record<string, unknown>>;
  getMailContext?(userId: string): Promise<Record<string, unknown>>;
  getSocialContext?(userId: string): Promise<Record<string, unknown>>;
  getMarketplaceContext?(userId: string): Promise<Record<string, unknown>>;
}

export class AiError extends Error {
  constructor(message: string, public readonly code: string, public readonly status = 400) {
    super(message);
    this.name = "AiError";
  }
}

export class AiService {
  constructor(
    private readonly repo:         IAiRepository,
    private readonly provider:     IAiProvider,
    private readonly notifService: NotificationsService,
    private readonly actService:   ActivitiesService,
    private readonly repService:   UserReputationService,
    private readonly ctx:          AiContextProviders = {},
  ) {}

  // ─── Context ────────────────────────────────────────────────────────────────

  async buildContext(userId: string): Promise<Record<string, unknown>> {
    const results = await Promise.allSettled([
      this.ctx.getWalletContext?.(userId)    ?? Promise.resolve({}),
      this.ctx.getInventoryContext?.(userId) ?? Promise.resolve({}),
      this.ctx.getQuestContext?.(userId)     ?? Promise.resolve({}),
      this.ctx.getGuildContext?.(userId)     ?? Promise.resolve({}),
      this.ctx.getWorldContext?.(userId)     ?? Promise.resolve({}),
      this.ctx.getMailContext?.(userId)      ?? Promise.resolve({}),
      this.ctx.getSocialContext?.(userId)    ?? Promise.resolve({}),
      this.ctx.getMarketplaceContext?.(userId) ?? Promise.resolve({}),
    ]);

    const [wallet, inventory, quests, guild, world, mail, social, marketplace] = results.map(r =>
      r.status === "fulfilled" ? r.value : {}
    );

    return { wallet, inventory, quests, guild, world, mail, social, marketplace };
  }

  private buildSystemPrompt(userId: string, ctx: Record<string, unknown>, personality?: { name?: string; tone?: string; systemPrompt?: string | null }): string {
    const name = personality?.name ?? "Nova";
    const tone = personality?.tone ?? "friendly";
    const custom = personality?.systemPrompt ?? "";

    const basePrompt = `Bạn là ${name} — AI Companion thông minh của Universe Hub.
Phong cách: ${tone}. Ngôn ngữ: Tiếng Việt (có thể trả lời bằng ngôn ngữ người dùng dùng).
Luôn thân thiện, ngắn gọn và hữu ích. Đưa ra gợi ý cụ thể dựa trên dữ liệu thật của người dùng.
${custom}`.trim();

    const ctxJson = JSON.stringify(ctx, null, 2);
    return `${basePrompt}\n\n[CONTEXT_JSON]${ctxJson}[/CONTEXT_JSON]`;
  }

  // ─── Conversations ──────────────────────────────────────────────────────────

  async createConversation(input: CreateConversationInput): Promise<AiConversation> {
    const conv = await this.repo.createConversation(input);
    questEventBus.publish({ userId: input.userId, type: "AI_CONVERSATION", amount: 1 });
    return conv;
  }

  async getConversation(id: string): Promise<AiConversation> {
    const c = await this.repo.getConversation(id);
    if (!c) throw new AiError("Conversation không tồn tại.", "NOT_FOUND", 404);
    return c;
  }

  async listConversations(userId: string, limit = 20): Promise<AiConversation[]> {
    return this.repo.listConversations(userId, limit);
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    const conv = await this.getConversation(id);
    if (conv.userId !== userId) throw new AiError("Không có quyền.", "FORBIDDEN", 403);
    await this.repo.deleteConversation(id);
  }

  // ─── Chat ───────────────────────────────────────────────────────────────────

  async chat(userId: string, conversationId: string, userMessage: string): Promise<{ userMsg: AiMessage; assistantMsg: AiMessage; conversation: AiConversation }> {
    const conv = await this.getConversation(conversationId);
    if (conv.userId !== userId) throw new AiError("Không có quyền.", "FORBIDDEN", 403);

    // Emit typing
    aiEventBus.publish({ type: "AI_TYPING", userId, conversationId, payload: { typing: true }, timestamp: new Date().toISOString() });

    // Save user message
    const userMsg = await this.repo.createMessage({ conversationId, userId, role: "USER", content: userMessage });
    aiEventBus.publish({ type: "AI_MESSAGE", userId, conversationId, payload: { message: userMsg }, timestamp: new Date().toISOString() });

    // Build context + load history
    const [ctx, history, personality] = await Promise.all([
      this.buildContext(userId),
      this.repo.listMessages(conversationId, 20),
      this.repo.getPersonality(userId),
    ]);

    const systemPrompt = this.buildSystemPrompt(userId, ctx, personality ?? undefined);

    const chatHistory: ChatMessage[] = history
      .filter(m => m.role !== "SYSTEM")
      .map(m => ({ role: m.role === "USER" ? "user" : "assistant", content: m.content }));

    // Call AI provider
    const start = Date.now();
    let aiResp;
    try {
      aiResp = await this.provider.chat(chatHistory, systemPrompt);
    } catch (err) {
      aiEventBus.publish({ type: "AI_ERROR", userId, conversationId, payload: { error: String(err) }, timestamp: new Date().toISOString() });
      throw new AiError("AI provider gặp lỗi. Vui lòng thử lại.", "PROVIDER_ERROR", 503);
    }

    // Save assistant message
    const assistantMsg = await this.repo.createMessage({
      conversationId, userId, role: "ASSISTANT",
      content: aiResp.content, tokens: aiResp.totalTokens, model: aiResp.model,
    });

    // Log usage
    await this.repo.logUsage({
      userId, conversationId, provider: aiResp.provider, model: aiResp.model,
      promptTokens: aiResp.promptTokens, completionTokens: aiResp.completionTokens,
      totalTokens: aiResp.totalTokens, latencyMs: aiResp.latencyMs,
    });

    aiEventBus.publish({ type: "AI_TYPING", userId, conversationId, payload: { typing: false }, timestamp: new Date().toISOString() });
    aiEventBus.publish({ type: "AI_MESSAGE", userId, conversationId, payload: { message: assistantMsg }, timestamp: new Date().toISOString() });

    // Side effects
    this.repService.fire(userId, "AI_CHAT");
    this.actService.fire({
      userId, type: "ai", title: "Chat với AI",
      description: `Bạn đã chat với Nova AI.`,
      metadata: { conversationId, provider: aiResp.provider }, sourceApp: "universe-ai",
    });
    questEventBus.publish({ userId, type: "AI_ASSIST", amount: 1, metadata: { conversationId } });

    // Auto-remember context hints
    this._autoRemember(userId, userMessage, aiResp.content).catch(() => {});

    // Auto-generate suggestions from context
    this._maybeGenerateSuggestions(userId, ctx).catch(() => {});

    const updatedConv = await this.repo.getConversation(conversationId);
    return { userMsg, assistantMsg, conversation: updatedConv! };
  }

  // ─── Memory ─────────────────────────────────────────────────────────────────

  async remember(userId: string, key: string, value: string, scope: "SHORT_TERM" | "LONG_TERM" | "PERMANENT" = "LONG_TERM"): Promise<AiMemory> {
    const mem = await this.repo.upsertMemory({ userId, key, value, scope });
    questEventBus.publish({ userId, type: "AI_MEMORY_CREATED", amount: 1 });
    aiEventBus.publish({ type: "AI_MEMORY_UPDATED", userId, payload: { memory: mem }, timestamp: new Date().toISOString() });
    return mem;
  }

  async forget(userId: string, memoryId: string): Promise<void> {
    await this.repo.deleteMemory(memoryId);
    aiEventBus.publish({ type: "AI_MEMORY_UPDATED", userId, payload: { deleted: memoryId }, timestamp: new Date().toISOString() });
  }

  async listMemories(userId: string): Promise<AiMemory[]> {
    return this.repo.listMemories(userId);
  }

  // ─── Suggestions ────────────────────────────────────────────────────────────

  async listSuggestions(userId: string): Promise<AiSuggestion[]> {
    return this.repo.listSuggestions(userId);
  }

  async dismissSuggestion(id: string): Promise<void> {
    await this.repo.dismissSuggestion(id);
  }

  async generateSuggestions(userId: string): Promise<AiSuggestion[]> {
    const ctx = await this.buildContext(userId);
    return this._maybeGenerateSuggestions(userId, ctx);
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard(userId: string) {
    const [conversations, suggestions, memories, personality] = await Promise.all([
      this.repo.listConversations(userId, 5),
      this.repo.listSuggestions(userId),
      this.repo.listMemories(userId),
      this.repo.getPersonality(userId),
    ]);
    return {
      provider:   this.provider.name,
      model:      this.provider.model,
      personality: personality ?? { name: "Nova", tone: "friendly", language: "vi" },
      conversations,
      suggestions: suggestions.slice(0, 5),
      memoryCount: memories.length,
      status:     "online",
    };
  }

  // ─── Feedback ───────────────────────────────────────────────────────────────

  async feedback(userId: string, messageId: string, type: "THUMBS_UP" | "THUMBS_DOWN" | "REPORT", comment?: string) {
    const fb = await this.repo.createFeedback({ userId, messageId, type, comment: comment ?? null });
    aiEventBus.publish({ type: "AI_FEEDBACK", userId, payload: { feedback: fb }, timestamp: new Date().toISOString() });
    return fb;
  }

  // ─── Messages ───────────────────────────────────────────────────────────────

  async listMessages(userId: string, conversationId: string, limit = 50): Promise<AiMessage[]> {
    const conv = await this.getConversation(conversationId);
    if (conv.userId !== userId) throw new AiError("Không có quyền.", "FORBIDDEN", 403);
    return this.repo.listMessages(conversationId, limit);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async _autoRemember(userId: string, userMsg: string, _aiMsg: string): Promise<void> {
    const nameMatch = userMsg.match(/(?:tên tôi là|I am|my name is)\s+(\w+)/i);
    if (nameMatch) {
      await this.repo.upsertMemory({ userId, key: "user_name", value: nameMatch[1]!, scope: "PERMANENT" });
    }
    const prefMatch = userMsg.match(/(?:tôi thích|I like|I prefer|yêu thích)\s+(.+)/i);
    if (prefMatch) {
      await this.repo.upsertMemory({ userId, key: `pref_${Date.now()}`, value: prefMatch[1]!, scope: "LONG_TERM" });
    }
  }

  private async _maybeGenerateSuggestions(userId: string, ctx: Record<string, unknown>): Promise<AiSuggestion[]> {
    const created: AiSuggestion[] = [];
    const existing = await this.repo.listSuggestions(userId);
    const types = new Set(existing.map(s => s.type));
    const expIn24h = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    const wallet = ctx["wallet"] as Record<string, unknown> | undefined;
    if (wallet && (wallet["credits"] as number) < 100 && !types.has("WALLET")) {
      created.push(await this.repo.createSuggestion({
        userId, type: "WALLET", priority: 10,
        title: "Credits của bạn đang thấp!",
        body: "Hãy hoàn thành Quest hoặc bán vật phẩm trên Marketplace để kiếm thêm Credits.",
        actionUrl: "/marketplace", expiresAt: expIn24h,
      }));
    }

    const quests = ctx["quests"] as unknown[] | undefined;
    if (quests && quests.length === 0 && !types.has("QUEST")) {
      created.push(await this.repo.createSuggestion({
        userId, type: "QUEST", priority: 8,
        title: "Bắt đầu Quest mới!",
        body: "Bạn chưa có quest nào. Hoàn thành quest để nhận XP và phần thưởng.",
        actionUrl: "/quests", expiresAt: expIn24h,
      }));
    }

    const mail = ctx["mail"] as Record<string, unknown> | undefined;
    if (mail && (mail["unreadCount"] as number) > 0 && !types.has("GENERAL")) {
      created.push(await this.repo.createSuggestion({
        userId, type: "GENERAL", priority: 6,
        title: `Bạn có ${mail["unreadCount"]} mail chưa đọc`,
        body: "Có thể có phần thưởng đang chờ bạn trong hộp thư!",
        actionUrl: "/mail", expiresAt: expIn24h,
      }));
    }

    const guild = ctx["guild"] as Record<string, unknown> | undefined;
    if (!guild && !types.has("GUILD")) {
      created.push(await this.repo.createSuggestion({
        userId, type: "GUILD", priority: 5,
        title: "Tham gia Guild để nhận buff!",
        body: "Gia nhập một guild để cùng hoàn thành quest, chia sẻ tài nguyên và nhận buff team.",
        actionUrl: "/guild/list", expiresAt: expIn24h,
      }));
    }

    if (created.length > 0) {
      aiEventBus.publish({ type: "AI_SUGGESTION", userId, payload: { suggestions: created }, timestamp: new Date().toISOString() });
      this.notifService.fire(userId, "ai", "💡 Nova có gợi ý mới cho bạn", `${created.length} gợi ý mới từ AI Companion.`);
    }

    return created;
  }
}
