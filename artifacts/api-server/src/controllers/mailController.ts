import type { Request, Response } from "express";
import { mailService, accountBridgeService } from "../container.js";
import {
  MailNotFoundError,
  MailUnauthorizedError,
  AttachmentAlreadyClaimedError,
} from "../services/mailService.js";

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

function handleError(res: Response, err: unknown): void {
  if (err instanceof MailNotFoundError) {
    res.status(404).json({ ok: false, error: err.message });
    return;
  }
  if (err instanceof MailUnauthorizedError) {
    res.status(403).json({ ok: false, error: err.message });
    return;
  }
  if (err instanceof AttachmentAlreadyClaimedError) {
    res.status(409).json({ ok: false, error: err.message });
    return;
  }
  res.status(500).json({ ok: false, error: String(err) });
}

// GET /api/mail
export async function handleGetMail(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const filter = {
      type:           req.query["type"] as string | undefined,
      status:         req.query["status"] as string | undefined,
      labelId:        req.query["labelId"] as string | undefined,
      search:         req.query["search"] as string | undefined,
      hasAttachment:  req.query["hasAttachment"] === "true",
      cursor:         req.query["cursor"] as string | undefined,
      limit:          req.query["limit"] ? Number(req.query["limit"]) : 50,
    } as Parameters<typeof mailService.getMail>[1];
    const data = await mailService.getMail(userId, filter);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// GET /api/mail/unread
export async function handleGetUnread(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await mailService.getUnread(userId);
    const count = await mailService.getUnreadCount(userId);
    res.json({ ok: true, data, count });
  } catch (err) { handleError(res, err); }
}

// GET /api/mail/dashboard
export async function handleGetDashboard(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await mailService.getDashboard(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// GET /api/mail/:id
export async function handleGetMailById(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await mailService.getById(req.params["id"]!, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/mail
export async function handleSendMail(req: Request, res: Response): Promise<void> {
  try {
    const data = await mailService.sendMail(req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// PATCH /api/mail/:id/read
export async function handleMarkRead(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await mailService.markRead(req.params["id"]!, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// PATCH /api/mail/read-all
export async function handleMarkAllRead(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const count = await mailService.markAllRead(userId);
    res.json({ ok: true, count });
  } catch (err) { handleError(res, err); }
}

// POST /api/mail/:id/claim
export async function handleClaimAttachments(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await mailService.claimAttachments(req.params["id"]!, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/mail/:id/archive
export async function handleArchiveMail(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await mailService.archiveMail(req.params["id"]!, userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// DELETE /api/mail/:id
export async function handleDeleteMail(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    await mailService.deleteMail(req.params["id"]!, userId);
    res.json({ ok: true });
  } catch (err) { handleError(res, err); }
}

// GET /api/mail/labels
export async function handleGetLabels(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const data = await mailService.getLabels(userId);
    res.json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/mail/labels
export async function handleCreateLabel(req: Request, res: Response): Promise<void> {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  try {
    const { name, color } = req.body as { name: string; color?: string };
    if (!name) { res.status(400).json({ ok: false, error: "name là bắt buộc." }); return; }
    const data = await mailService.createLabel(userId, name, color ?? "#3B82F6");
    res.status(201).json({ ok: true, data });
  } catch (err) { handleError(res, err); }
}

// POST /api/mail/broadcast  (admin only — no auth check for now, use internal token later)
export async function handleBroadcast(req: Request, res: Response): Promise<void> {
  try {
    const { userIds, subject, body, attachments } = req.body as {
      userIds: string[];
      subject: string;
      body:    string;
      attachments?: unknown[];
    };
    if (!userIds?.length || !subject || !body) {
      res.status(400).json({ ok: false, error: "userIds, subject, body là bắt buộc." });
      return;
    }
    const data = await mailService.sendSystemBroadcast(
      userIds,
      subject,
      body,
      attachments as Parameters<typeof mailService.sendSystemBroadcast>[3],
    );
    res.status(201).json({ ok: true, data, count: data.length });
  } catch (err) { handleError(res, err); }
}
