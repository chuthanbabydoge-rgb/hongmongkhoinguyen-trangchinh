// ─────────────────────────────────────────────────────────────────────────────
// creatorController — HUB-24
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { creatorService, accountBridgeService } from "../container.js";
import { CreatorError } from "../services/creatorService.js";

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

function requireUser(userId: string | null, res: Response): userId is string {
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return false; }
  return true;
}

function handleError(err: unknown, res: Response): void {
  if (err instanceof CreatorError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function handleCreatorDashboard(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const data = await creatorService.dashboard(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function handleListProjects(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { search, type, status, limit, offset } = req.query as Record<string, string>;
    let projects;
    if (search) {
      projects = await creatorService.searchProjects(search, {
        ownerId: userId,
        type: type as never,
        status: status as never,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });
    } else {
      projects = await creatorService.listProjects({
        ownerId: userId,
        type: type as never,
        status: status as never,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });
    }
    res.json({ ok: true, data: projects });
  } catch (err) { handleError(err, res); }
}

export async function handleListPublicProjects(req: Request, res: Response): Promise<void> {
  try {
    const { limit, offset } = req.query as Record<string, string>;
    const data = await creatorService.listPublicProjects(
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined,
    );
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleGetProject(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const data = await creatorService.getProjectById(id);
    if (!data) { res.status(404).json({ ok: false, error: "Project không tìm thấy" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleCreateProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const body = req.body as Record<string, unknown>;
    const data = await creatorService.createProject({ ...(body as object), ownerId: userId } as never);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleUpdateProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const data = await creatorService.updateProject(id, userId, req.body as never);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleDeleteProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const ok = await creatorService.deleteProject(id, userId);
    res.json({ ok });
  } catch (err) { handleError(err, res); }
}

export async function handlePublishProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const { notes } = req.body as { notes?: string };
    const data = await creatorService.publishProject(id, userId, notes);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleForkProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const data = await creatorService.forkProject(id, userId);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ─── Versioning ───────────────────────────────────────────────────────────────

export async function handleSaveVersion(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const { label } = req.body as { label?: string };
    const data = await creatorService.saveVersion(id, userId, label);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleRestoreVersion(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const { versionId } = req.body as { versionId: string };
    const data = await creatorService.restoreVersion(id, versionId, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleGetVersions(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const data = await creatorService.getVersions(id);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export async function handleGetFavorites(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const data = await creatorService.getFavorites(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleFavorite(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const data = await creatorService.favoriteProject(id, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleUnfavorite(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const ok = await creatorService.unfavoriteProject(id, userId);
    res.json({ ok });
  } catch (err) { handleError(err, res); }
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function handleGetTemplates(req: Request, res: Response): Promise<void> {
  try {
    const data = await creatorService.getTemplates();
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ─── Assets ───────────────────────────────────────────────────────────────────

export async function handleUploadAsset(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const assetBody = req.body as Record<string, unknown>;
    const data = await creatorService.uploadAsset({ ...(assetBody as object), ownerId: userId } as never);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleGetAssets(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { projectId } = req.query as { projectId?: string };
    const data = await creatorService.getAssets(userId, projectId);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function handleAddMember(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const { targetUserId, role } = req.body as { targetUserId: string; role?: string };
    const data = await creatorService.addMember(id, userId, targetUserId, role as never);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleRemoveMember(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const { targetUserId } = req.body as { targetUserId: string };
    const ok = await creatorService.removeMember(id, userId, targetUserId);
    res.json({ ok });
  } catch (err) { handleError(err, res); }
}

export async function handleGetMembers(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const data = await creatorService.getMembers(id);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function handleAddComment(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const id = req.params["id"] as string;
    const { content } = req.body as { content: string };
    const data = await creatorService.addComment(id, userId, content);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleGetComments(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const data = await creatorService.getComments(id);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}
