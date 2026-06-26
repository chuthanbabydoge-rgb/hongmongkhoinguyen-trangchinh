import { type Request, type Response } from "express";
import { guildService, accountBridgeService } from "../container.js";
import { GuildError } from "../services/guildService.js";
import type { GuildRole } from "../repositories/guildRepository.js";

async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return (profile as { userId?: string; id?: string }).userId
      || (profile as { userId?: string; id?: string }).id
      || null;
  } catch {
    return null;
  }
}

function handleError(err: unknown, res: Response): void {
  if (err instanceof GuildError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  const msg = err instanceof Error ? err.message : String(err);
  res.status(500).json({ ok: false, error: msg });
}

// ── Guild CRUD ────────────────────────────────────────────────────────────────

export async function handleCreateGuild(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const { name, tag, description, avatar, banner, memberLimit, visibility } = req.body as Record<string, unknown>;
    if (typeof name !== "string" || typeof tag !== "string") {
      res.status(400).json({ ok: false, error: "name và tag là bắt buộc." }); return;
    }
    const guild = await guildService.createGuild({ name, tag, description: description as string | undefined, avatar: avatar as string | undefined, banner: banner as string | undefined, memberLimit: memberLimit as number | undefined, visibility: visibility as any, ownerId: userId });
    res.status(201).json({ ok: true, data: guild });
  } catch (err) { handleError(err, res); }
}

export async function handleListGuilds(req: Request, res: Response): Promise<void> {
  try {
    const { search, limit, offset } = req.query as Record<string, string | undefined>;
    const guilds = await guildService.listGuilds({
      search,
      limit:  limit  ? Number(limit)  : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    res.json({ ok: true, data: guilds, total: guilds.length });
  } catch (err) { handleError(err, res); }
}

export async function handleGetGuild(req: Request, res: Response): Promise<void> {
  try {
    const guild = await guildService.getGuild(req.params["id"] as string);
    const memberCount = guild ? undefined : 0;
    res.json({ ok: true, data: guild });
    void memberCount;
  } catch (err) { handleError(err, res); }
}

export async function handleUpdateGuild(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const guild = await guildService.updateGuild(req.params["id"] as string, userId, req.body as Record<string, unknown>);
    res.json({ ok: true, data: guild });
  } catch (err) { handleError(err, res); }
}

export async function handleDeleteGuild(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    await guildService.deleteGuild(req.params["id"] as string, userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function handleGetMembers(req: Request, res: Response): Promise<void> {
  try {
    const members = await guildService.getMembers(req.params["id"] as string);
    res.json({ ok: true, data: members, total: members.length });
  } catch (err) { handleError(err, res); }
}

export async function handleInvite(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { inviteeId } = req.body as { inviteeId?: string };
    if (!inviteeId) { res.status(400).json({ ok: false, error: "inviteeId là bắt buộc." }); return; }
    const invite = await guildService.invite(req.params["id"] as string, userId, inviteeId);
    res.status(201).json({ ok: true, data: invite });
  } catch (err) { handleError(err, res); }
}

export async function handleJoinRequest(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { message } = req.body as { message?: string };
    const req_ = await guildService.joinRequest(req.params["id"] as string, userId, message);
    res.status(201).json({ ok: true, data: req_ });
  } catch (err) { handleError(err, res); }
}

export async function handleApproveJoin(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { requestId } = req.body as { requestId?: string };
    if (!requestId) { res.status(400).json({ ok: false, error: "requestId là bắt buộc." }); return; }
    const member = await guildService.approveJoin(req.params["id"] as string, userId, requestId);
    res.json({ ok: true, data: member });
  } catch (err) { handleError(err, res); }
}

export async function handleRejectJoin(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { requestId } = req.body as { requestId?: string };
    if (!requestId) { res.status(400).json({ ok: false, error: "requestId là bắt buộc." }); return; }
    const r = await guildService.rejectJoin(req.params["id"] as string, userId, requestId);
    res.json({ ok: true, data: r });
  } catch (err) { handleError(err, res); }
}

export async function handleLeave(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    await guildService.leaveGuild(req.params["id"] as string, userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

export async function handleKick(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { targetUserId } = req.body as { targetUserId?: string };
    if (!targetUserId) { res.status(400).json({ ok: false, error: "targetUserId là bắt buộc." }); return; }
    await guildService.kickMember(req.params["id"] as string, userId, targetUserId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

export async function handleChangeRole(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { role } = req.body as { role?: string };
    if (!role) { res.status(400).json({ ok: false, error: "role là bắt buộc." }); return; }
    const member = await guildService.changeMemberRole(req.params["id"] as string, userId, req.params["userId"] as string, role as GuildRole);
    res.json({ ok: true, data: member });
  } catch (err) { handleError(err, res); }
}

// ── Announcements ─────────────────────────────────────────────────────────────

export async function handlePostAnnouncement(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { title, content, isPinned } = req.body as { title?: string; content?: string; isPinned?: boolean };
    if (!title || !content) { res.status(400).json({ ok: false, error: "title và content là bắt buộc." }); return; }
    const ann = await guildService.postAnnouncement(req.params["id"] as string, userId, title, content, isPinned ?? false);
    res.status(201).json({ ok: true, data: ann });
  } catch (err) { handleError(err, res); }
}

export async function handleGetAnnouncements(req: Request, res: Response): Promise<void> {
  try {
    const list = await guildService.getAnnouncements(req.params["id"] as string);
    res.json({ ok: true, data: list });
  } catch (err) { handleError(err, res); }
}

// ── Contributions ─────────────────────────────────────────────────────────────

export async function handleContribute(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { type, amount, itemId, note } = req.body as { type?: string; amount?: number; itemId?: string; note?: string };
    if (!type || !amount) { res.status(400).json({ ok: false, error: "type và amount là bắt buộc." }); return; }
    const c = await guildService.contribute(req.params["id"] as string, userId, type as "CREDITS" | "COINS" | "ITEM", amount, itemId, note);
    res.status(201).json({ ok: true, data: c });
  } catch (err) { handleError(err, res); }
}

export async function handleGetContributions(req: Request, res: Response): Promise<void> {
  try {
    const list = await guildService.getContributions(req.params["id"] as string);
    res.json({ ok: true, data: list });
  } catch (err) { handleError(err, res); }
}

// ── Treasury ──────────────────────────────────────────────────────────────────

export async function handleWithdrawTreasury(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { currency, amount, note } = req.body as { currency?: string; amount?: number; note?: string };
    if (!currency || !amount) { res.status(400).json({ ok: false, error: "currency và amount là bắt buộc." }); return; }
    const guild = await guildService.withdrawTreasury(req.params["id"] as string, userId, currency as "CREDITS" | "COINS", amount, note);
    res.json({ ok: true, data: guild });
  } catch (err) { handleError(err, res); }
}

export async function handleGetTreasuryTransactions(req: Request, res: Response): Promise<void> {
  try {
    const list = await guildService.getTreasuryTransactions(req.params["id"] as string);
    res.json({ ok: true, data: list });
  } catch (err) { handleError(err, res); }
}

// ── Warehouse ─────────────────────────────────────────────────────────────────

export async function handleGetWarehouse(req: Request, res: Response): Promise<void> {
  try {
    const items = await guildService.getWarehouseItems(req.params["id"] as string);
    res.json({ ok: true, data: items });
  } catch (err) { handleError(err, res); }
}

export async function handleWithdrawWarehouse(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { itemId, quantity } = req.body as { itemId?: string; quantity?: number };
    if (!itemId || !quantity) { res.status(400).json({ ok: false, error: "itemId và quantity là bắt buộc." }); return; }
    await guildService.withdrawWarehouseItem(req.params["id"] as string, userId, itemId, quantity);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function handleCreateEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { title, description, startAt, endAt, maxParticipants, rewardPoints } = req.body as Record<string, unknown>;
    if (!title || !startAt) { res.status(400).json({ ok: false, error: "title và startAt là bắt buộc." }); return; }
    const event = await guildService.createEvent(req.params["id"] as string, userId, {
      title:           String(title),
      description:     description ? String(description) : null,
      startAt:         String(startAt),
      endAt:           endAt ? String(endAt) : null,
      maxParticipants: maxParticipants ? Number(maxParticipants) : null,
      rewardPoints:    rewardPoints ? Number(rewardPoints) : 0,
      status:          "UPCOMING",
    });
    res.status(201).json({ ok: true, data: event });
  } catch (err) { handleError(err, res); }
}

export async function handleGetEvents(req: Request, res: Response): Promise<void> {
  try {
    const events = await guildService.getEvents(req.params["id"] as string);
    res.json({ ok: true, data: events });
  } catch (err) { handleError(err, res); }
}

export async function handleJoinEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    await guildService.joinEvent(req.params["id"] as string, req.params["eventId"] as string, userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export async function handleGetLogs(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const logs = await guildService.getLogs(req.params["id"] as string, userId);
    res.json({ ok: true, data: logs });
  } catch (err) { handleError(err, res); }
}

// ── Dashboard / My Guild ──────────────────────────────────────────────────────

export async function handleGetMyGuild(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const result = await guildService.getUserGuild(userId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

export async function handleGetLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const { limit } = req.query as { limit?: string };
    const guilds = await guildService.getLeaderboard(limit ? Number(limit) : 20);
    res.json({ ok: true, data: guilds });
  } catch (err) { handleError(err, res); }
}
