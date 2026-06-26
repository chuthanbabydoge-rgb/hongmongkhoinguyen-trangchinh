import { type Request, type Response } from "express";
import { aiService, accountBridgeService } from "../container.js";
import { AiError } from "../services/aiService.js";

async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return (profile as { userId?: string; id?: string }).userId
      || (profile as { userId?: string; id?: string }).id
      || null;
  } catch { return null; }
}

function handleError(err: unknown, res: Response): void {
  if (err instanceof AiError) { res.status(err.status).json({ ok: false, code: err.code, error: err.message }); return; }
  res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
}

// GET /api/ai
export async function handleAiStatus(_req: Request, res: Response): Promise<void> {
  res.json({ ok: true, data: { name: "Universe AI Companion", version: "1.0.0", status: "online", codename: "Nova" } });
}

// GET /api/ai/dashboard
export async function handleAiDashboard(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const data = await aiService.getDashboard(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// GET /api/ai/conversations
export async function handleListConversations(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 20;
    const convs = await aiService.listConversations(userId, limit);
    res.json({ ok: true, data: convs });
  } catch (err) { handleError(err, res); }
}

// POST /api/ai/conversations
export async function handleCreateConversation(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { title, type } = req.body as { title?: string; type?: string };
    const conv = await aiService.createConversation({ userId, title, type: type as any });
    res.status(201).json({ ok: true, data: conv });
  } catch (err) { handleError(err, res); }
}

// GET /api/ai/conversations/:id
export async function handleGetConversation(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const conv = await aiService.getConversation(req.params["id"] as string);
    if (conv.userId !== userId) { res.status(403).json({ ok: false, error: "Forbidden" }); return; }
    res.json({ ok: true, data: conv });
  } catch (err) { handleError(err, res); }
}

// DELETE /api/ai/conversations/:id
export async function handleDeleteConversation(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    await aiService.deleteConversation(req.params["id"] as string, userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

// GET /api/ai/messages/:conversationId
export async function handleListMessages(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 50;
    const msgs = await aiService.listMessages(userId, req.params["conversationId"] as string, limit);
    res.json({ ok: true, data: msgs });
  } catch (err) { handleError(err, res); }
}

// POST /api/ai/chat
export async function handleChat(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { conversationId, message } = req.body as { conversationId?: string; message?: string };
    if (!message?.trim()) { res.status(400).json({ ok: false, error: "message là bắt buộc." }); return; }

    let convId = conversationId;
    if (!convId) {
      const conv = await aiService.createConversation({ userId, title: message.slice(0, 50) });
      convId = conv.id;
    }
    const result = await aiService.chat(userId, convId, message);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

// GET /api/ai/memory
export async function handleListMemory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const mems = await aiService.listMemories(userId);
    res.json({ ok: true, data: mems });
  } catch (err) { handleError(err, res); }
}

// POST /api/ai/memory
export async function handleCreateMemory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { key, value, scope } = req.body as { key?: string; value?: string; scope?: string };
    if (!key?.trim() || !value?.trim()) { res.status(400).json({ ok: false, error: "key và value là bắt buộc." }); return; }
    const mem = await aiService.remember(userId, key, value, scope as any);
    res.status(201).json({ ok: true, data: mem });
  } catch (err) { handleError(err, res); }
}

// DELETE /api/ai/memory/:id
export async function handleDeleteMemory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    await aiService.forget(userId, req.params["id"] as string);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

// GET /api/ai/suggestions
export async function handleListSuggestions(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const sugs = await aiService.listSuggestions(userId);
    res.json({ ok: true, data: sugs });
  } catch (err) { handleError(err, res); }
}

// DELETE /api/ai/suggestions/:id
export async function handleDismissSuggestion(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    await aiService.dismissSuggestion(req.params["id"] as string);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

// POST /api/ai/feedback
export async function handleFeedback(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { messageId, type, comment } = req.body as { messageId?: string; type?: string; comment?: string };
    if (!messageId || !type) { res.status(400).json({ ok: false, error: "messageId và type là bắt buộc." }); return; }
    const fb = await aiService.feedback(userId, messageId, type as any, comment);
    res.status(201).json({ ok: true, data: fb });
  } catch (err) { handleError(err, res); }
}

// POST /api/ai/suggestions/generate
export async function handleGenerateSuggestions(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const sugs = await aiService.generateSuggestions(userId);
    res.json({ ok: true, data: sugs });
  } catch (err) { handleError(err, res); }
}
