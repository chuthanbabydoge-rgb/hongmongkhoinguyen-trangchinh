import { type Request, type Response } from "express";
import { worldService, accountBridgeService } from "../container.js";
import { WorldError } from "../services/worldService.js";

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
  if (err instanceof WorldError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  const msg = err instanceof Error ? err.message : String(err);
  res.status(500).json({ ok: false, error: msg });
}

// ── World CRUD ────────────────────────────────────────────────────────────────

export async function handleListWorlds(req: Request, res: Response): Promise<void> {
  try {
    const { search, type, ownerId, limit, offset, sortBy, sortDir } = req.query as Record<string, string | undefined>;
    const result = await worldService.listWorlds({
      search, type: type as any, ownerId,
      limit:  limit  ? Number(limit)  : 20,
      offset: offset ? Number(offset) : 0,
      sortBy:  sortBy  as any,
      sortDir: sortDir as any,
    });
    res.json({ ok: true, data: result.worlds, total: result.total });
  } catch (err) { handleError(err, res); }
}

export async function handleCreateWorld(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { name, slug, description, thumbnail, banner, type, capacity, tags, guildId, metadata } = req.body as Record<string, unknown>;
    if (typeof name !== "string") { res.status(400).json({ ok: false, error: "name là bắt buộc." }); return; }
    const world = await worldService.createWorld({ name, slug: slug as string, description: description as string, thumbnail: thumbnail as string, banner: banner as string, ownerId: userId, type: type as any, capacity: capacity as number, tags: tags as string[], guildId: guildId as string, metadata: metadata as any });
    res.status(201).json({ ok: true, data: world });
  } catch (err) { handleError(err, res); }
}

export async function handleGetWorld(req: Request, res: Response): Promise<void> {
  try {
    const world = await worldService.getWorld(req.params["id"] as string);
    res.json({ ok: true, data: world });
  } catch (err) { handleError(err, res); }
}

export async function handleGetWorldBySlug(req: Request, res: Response): Promise<void> {
  try {
    const world = await worldService.getWorldBySlug(req.params["slug"] as string);
    res.json({ ok: true, data: world });
  } catch (err) { handleError(err, res); }
}

export async function handleUpdateWorld(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const world = await worldService.updateWorld(req.params["id"] as string, userId, req.body as any);
    res.json({ ok: true, data: world });
  } catch (err) { handleError(err, res); }
}

export async function handleDeleteWorld(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    await worldService.deleteWorld(req.params["id"] as string, userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

// ── Featured / Popular / Recent / Search ─────────────────────────────────────

export async function handleFeaturedWorlds(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 10;
    const worlds = await worldService.getFeaturedWorlds(limit);
    res.json({ ok: true, data: worlds });
  } catch (err) { handleError(err, res); }
}

export async function handlePopularWorlds(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 20;
    const worlds = await worldService.getPopularWorlds(limit);
    res.json({ ok: true, data: worlds });
  } catch (err) { handleError(err, res); }
}

export async function handleRecentWorlds(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 20;
    const worlds = await worldService.getRecentWorlds(limit);
    res.json({ ok: true, data: worlds });
  } catch (err) { handleError(err, res); }
}

export async function handleSearchWorlds(req: Request, res: Response): Promise<void> {
  try {
    const { q, limit } = req.query as Record<string, string | undefined>;
    if (!q) { res.status(400).json({ ok: false, error: "q (query) là bắt buộc." }); return; }
    const worlds = await worldService.searchWorlds(q, limit ? Number(limit) : 20);
    res.json({ ok: true, data: worlds });
  } catch (err) { handleError(err, res); }
}

// ── Bookmark ──────────────────────────────────────────────────────────────────

export async function handleAddBookmark(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const bm = await worldService.addBookmark(req.params["id"] as string, userId);
    res.status(201).json({ ok: true, data: bm });
  } catch (err) { handleError(err, res); }
}

export async function handleRemoveBookmark(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    await worldService.removeBookmark(req.params["id"] as string, userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

export async function handleListBookmarks(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const bms = await worldService.listBookmarks(userId);
    res.json({ ok: true, data: bms });
  } catch (err) { handleError(err, res); }
}

// ── Join / Leave / Travel ─────────────────────────────────────────────────────

export async function handleJoinWorld(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const result = await worldService.joinWorld(req.params["id"] as string, userId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

export async function handleLeaveWorld(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    await worldService.leaveWorld(req.params["id"] as string, userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

export async function handleTravelToWorld(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const result = await worldService.travelToWorld(req.params["id"] as string, userId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

// ── Members / Presence ────────────────────────────────────────────────────────

export async function handleListMembers(req: Request, res: Response): Promise<void> {
  try {
    const members = await worldService.listMembers(req.params["id"] as string);
    res.json({ ok: true, data: members });
  } catch (err) { handleError(err, res); }
}

export async function handleGetPresence(req: Request, res: Response): Promise<void> {
  try {
    const presence = await worldService.listPresence(req.params["id"] as string);
    res.json({ ok: true, data: presence });
  } catch (err) { handleError(err, res); }
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function handleListWorldEvents(req: Request, res: Response): Promise<void> {
  try {
    const events = await worldService.listWorldEvents(req.params["id"] as string);
    res.json({ ok: true, data: events });
  } catch (err) { handleError(err, res); }
}

export async function handleCreateWorldEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const { name, description, startAt, endAt, maxParticipants } = req.body as Record<string, unknown>;
    if (typeof name !== "string" || typeof startAt !== "string") {
      res.status(400).json({ ok: false, error: "name và startAt là bắt buộc." }); return;
    }
    const event = await worldService.createWorldEvent(req.params["id"] as string, userId, { name, description: description as string, startAt, endAt: endAt as string, maxParticipants: maxParticipants as number });
    res.status(201).json({ ok: true, data: event });
  } catch (err) { handleError(err, res); }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function handleDashboard(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const data = await worldService.getDashboardData(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ── Travel History ────────────────────────────────────────────────────────────

export async function handleTravelHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 20;
    const history = await worldService.listTravelHistory(userId, limit);
    res.json({ ok: true, data: history });
  } catch (err) { handleError(err, res); }
}
