import type { Request, Response } from "express";
import { chatService, accountBridgeService } from "../container.js";
import {
  ChatRoomNotFoundError,
  ChatUnauthorizedError,
  ChatBlockedError,
  ChatRoomFullError,
} from "../services/chatService.js";

async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers["authorization"];
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return profile?.id ?? null;
  } catch {
    return null;
  }
}

async function resolveProfile(req: Request): Promise<{ id: string; name: string } | null> {
  const auth = req.headers["authorization"];
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    if (!profile?.id) return null;
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username || "Người dùng";
    return { id: profile.id, name };
  } catch {
    return null;
  }
}

function handleError(res: Response, err: unknown): void {
  if (err instanceof ChatRoomNotFoundError) { res.status(404).json({ ok: false, error: err.message }); return; }
  if (err instanceof ChatUnauthorizedError) { res.status(403).json({ ok: false, error: err.message }); return; }
  if (err instanceof ChatBlockedError)      { res.status(403).json({ ok: false, error: err.message }); return; }
  if (err instanceof ChatRoomFullError)     { res.status(409).json({ ok: false, error: err.message }); return; }
  res.status(500).json({ ok: false, error: String(err) });
}

// ─── Room handlers ────────────────────────────────────────────────────────────

// GET /api/chat/rooms
export async function handleGetRooms(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await chatService.getUserRooms(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/rooms
export async function handleCreateRoom(req: Request, res: Response): Promise<void> {
  const profile = await resolveProfile(req);
  if (!profile) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await chatService.createRoom(req.body, profile.id);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// GET /api/chat/rooms/:id
export async function handleGetRoom(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await chatService.getRoom(req.params["id"]!);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// DELETE /api/chat/rooms/:id
export async function handleDeleteRoom(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    await chatService.deleteRoom(req.params["id"]!, userId);
    res.json({ ok: true });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/rooms/:id/join
export async function handleJoinRoom(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await chatService.joinRoom(req.params["id"]!, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/rooms/:id/leave
export async function handleLeaveRoom(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    await chatService.leaveRoom(req.params["id"]!, userId);
    res.json({ ok: true });
  } catch (err) { handleError(res, err); }
}

// GET /api/chat/rooms/:id/members
export async function handleGetMembers(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await chatService.getMembers(req.params["id"]!);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/rooms/private
export async function handleGetOrCreatePrivate(req: Request, res: Response): Promise<void> {
  const profile = await resolveProfile(req);
  if (!profile) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const { targetUserId, targetUserName } = req.body as { targetUserId: string; targetUserName?: string };
  if (!targetUserId) { res.status(400).json({ ok: false, error: "targetUserId là bắt buộc" }); return; }
  try {
    const data = await chatService.getOrCreatePrivateRoom(profile.id, profile.name, targetUserId, targetUserName ?? "Người dùng");
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/rooms/guild
export async function handleGetOrCreateGuild(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const { guildId, guildName } = req.body as { guildId: string; guildName: string };
  if (!guildId || !guildName) { res.status(400).json({ ok: false, error: "guildId và guildName là bắt buộc" }); return; }
  try {
    const data = await chatService.getOrCreateGuildRoom(guildId, guildName);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// ─── Message handlers ─────────────────────────────────────────────────────────

// GET /api/chat/rooms/:id/messages
export async function handleGetMessages(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const filter = {
      cursor: req.query["cursor"] as string | undefined,
      limit:  req.query["limit"] ? Number(req.query["limit"]) : 50,
      search: req.query["search"] as string | undefined,
    };
    const data = await chatService.getMessages(req.params["id"]!, userId, filter);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/rooms/:id/messages
export async function handleSendMessage(req: Request, res: Response): Promise<void> {
  const profile = await resolveProfile(req);
  if (!profile) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const { content, type, replyToId, metadata } = req.body as {
    content:    string;
    type?:      string;
    replyToId?: string;
    metadata?:  Record<string, unknown>;
  };
  if (!content?.trim()) { res.status(400).json({ ok: false, error: "content là bắt buộc" }); return; }
  try {
    const data = await chatService.sendMessage({
      roomId:     req.params["id"]!,
      senderId:   profile.id,
      senderName: profile.name,
      content:    content.trim(),
      type:       (type as "TEXT") ?? "TEXT",
      replyToId,
      metadata,
    });
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// PATCH /api/chat/messages/:id/edit
export async function handleEditMessage(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const { content } = req.body as { content: string };
  if (!content?.trim()) { res.status(400).json({ ok: false, error: "content là bắt buộc" }); return; }
  try {
    const data = await chatService.editMessage(req.params["id"]!, userId, content.trim());
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// DELETE /api/chat/messages/:id
export async function handleDeleteMessage(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    await chatService.deleteMessage(req.params["id"]!, userId);
    res.json({ ok: true });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/messages/:id/react
export async function handleReact(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const { emoji } = req.body as { emoji: string };
  if (!emoji) { res.status(400).json({ ok: false, error: "emoji là bắt buộc" }); return; }
  try {
    await chatService.reactToMessage(req.params["id"]!, userId, emoji);
    res.json({ ok: true });
  } catch (err) { handleError(res, err); }
}

// DELETE /api/chat/messages/:id/react
export async function handleRemoveReact(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const { emoji } = req.body as { emoji: string };
  if (!emoji) { res.status(400).json({ ok: false, error: "emoji là bắt buộc" }); return; }
  try {
    await chatService.removeReaction(req.params["id"]!, userId, emoji);
    res.json({ ok: true });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/messages/:id/read
export async function handleMarkRead(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const roomId = req.body["roomId"] as string;
  if (!roomId) { res.status(400).json({ ok: false, error: "roomId là bắt buộc" }); return; }
  try {
    await chatService.markMessageRead(req.params["id"]!, roomId, userId);
    res.json({ ok: true });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/messages/:id/pin
export async function handlePinMessage(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const roomId = req.body["roomId"] as string;
  if (!roomId) { res.status(400).json({ ok: false, error: "roomId là bắt buộc" }); return; }
  try {
    const data = await chatService.pinMessage(roomId, req.params["id"]!, userId, req.body["note"]);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/messages/:id/unpin
export async function handleUnpinMessage(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    await chatService.unpinMessage(req.params["id"]!, userId);
    res.json({ ok: true });
  } catch (err) { handleError(res, err); }
}

// GET /api/chat/rooms/:id/pins
export async function handleGetPins(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await chatService.getPins(req.params["id"]!);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// GET /api/chat/rooms/:id/search
export async function handleSearchMessages(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const q = req.query["q"] as string;
  if (!q) { res.status(400).json({ ok: false, error: "q là bắt buộc" }); return; }
  try {
    const data = await chatService.searchMessages(req.params["id"]!, userId, q);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

// POST /api/chat/rooms/:id/typing
export async function handleTyping(req: Request, res: Response): Promise<void> {
  const profile = await resolveProfile(req);
  if (!profile) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const { isTyping } = req.body as { isTyping?: boolean };
  chatService.publishTyping(req.params["id"]!, profile.id, profile.name, isTyping !== false);
  res.json({ ok: true });
}

// ─── Settings / Blocks / Reports ──────────────────────────────────────────────

// GET /api/chat/settings
export async function handleGetSettings(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await chatService.getSettings(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// PATCH /api/chat/settings
export async function handleUpdateSettings(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await chatService.updateSettings(userId, req.body);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/blocks
export async function handleBlockUser(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const { blockedUserId, reason } = req.body as { blockedUserId: string; reason?: string };
  if (!blockedUserId) { res.status(400).json({ ok: false, error: "blockedUserId là bắt buộc" }); return; }
  try {
    const data = await chatService.blockUser(userId, blockedUserId, reason);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// DELETE /api/chat/blocks/:blockedUserId
export async function handleUnblockUser(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    await chatService.unblockUser(userId, req.params["blockedUserId"]!);
    res.json({ ok: true });
  } catch (err) { handleError(res, err); }
}

// POST /api/chat/messages/:id/report
export async function handleReportMessage(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const { reason } = req.body as { reason: string };
  if (!reason) { res.status(400).json({ ok: false, error: "reason là bắt buộc" }); return; }
  try {
    const data = await chatService.reportMessage(req.params["id"]!, userId, reason);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// GET /api/chat/dashboard
export async function handleGetDashboard(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await chatService.getDashboard(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}
