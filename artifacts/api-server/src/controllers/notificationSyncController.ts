// ─────────────────────────────────────────────────────────────────────────────
// NotificationSyncController — HUB-4
//
// POST  /api/notifications/sync        → force sync from Universe Account
// GET   /api/notifications/center      → notification center dashboard
// GET   /api/notifications/feed        → paginated notification list
// GET   /api/notifications/state       → sync state
// PATCH /api/notifications/:id/read    → mark single notification read
// PATCH /api/notifications/read-all    → mark all notifications read
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { notificationSyncService } from "../container.js";
import { NotificationSyncValidationError } from "../services/notificationSyncService.js";
import { AccountServiceUnavailableError }  from "../services/accountClient.js";

function resolveUserId(req: Request): string {
  return (req.headers["x-user-id"] as string | undefined) ?? "user-001";
}

function extractToken(req: Request): string | undefined {
  const auth = req.headers["authorization"];
  return typeof auth === "string" ? auth : undefined;
}

function handleError(req: Request, res: Response, err: unknown, context: string): void {
  if (err instanceof NotificationSyncValidationError) {
    res.status(400).json({ ok: false, error: err.message });
    return;
  }
  if (err instanceof AccountServiceUnavailableError) {
    req.log.warn({ err }, `${context}: Account service unavailable`);
    res.status(503).json({ ok: false, code: "ACCOUNT_SERVICE_UNAVAILABLE" });
    return;
  }
  const msg = err instanceof Error ? err.message : String(err);
  req.log.error({ err }, `${context}: ${msg}`);
  res.status(500).json({ ok: false, error: "Lỗi server không xác định." });
}

// ─── POST /api/notifications/sync ────────────────────────────────────────────

export async function handleSync(req: Request, res: Response): Promise<void> {
  try {
    const userId = resolveUserId(req);
    const token  = extractToken(req);
    const data   = await notificationSyncService.syncNotifications(userId, token);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "notificationSyncController.sync");
  }
}

// ─── GET /api/notifications/center ───────────────────────────────────────────

export async function handleGetCenter(req: Request, res: Response): Promise<void> {
  try {
    const userId = resolveUserId(req);
    const token  = extractToken(req);
    const data   = await notificationSyncService.getNotificationCenter(userId, token);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "notificationSyncController.getCenter");
  }
}

// ─── GET /api/notifications/feed ─────────────────────────────────────────────

export async function handleGetFeed(req: Request, res: Response): Promise<void> {
  try {
    const userId = resolveUserId(req);
    const limit  = req.query["limit"]  ? Number(req.query["limit"])  : undefined;
    const offset = req.query["offset"] ? Number(req.query["offset"]) : undefined;
    const data   = await notificationSyncService.getNotifications(userId, limit, offset);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "notificationSyncController.getFeed");
  }
}

// ─── GET /api/notifications/state ────────────────────────────────────────────

export async function handleGetState(req: Request, res: Response): Promise<void> {
  try {
    const userId = resolveUserId(req);
    const data   = await notificationSyncService.getSyncState(userId);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "notificationSyncController.getState");
  }
}

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────

export async function handleMarkRead(req: Request, res: Response): Promise<void> {
  try {
    const userId         = resolveUserId(req);
    const notificationId = req.params["id"] as string;
    const token          = extractToken(req);
    await notificationSyncService.markRead(userId, notificationId, token);
    res.json({ ok: true });
  } catch (err) {
    handleError(req, res, err, "notificationSyncController.markRead");
  }
}

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────

export async function handleMarkAllRead(req: Request, res: Response): Promise<void> {
  try {
    const userId  = resolveUserId(req);
    const token   = extractToken(req);
    const updated = await notificationSyncService.markAllRead(userId, token);
    res.json({ ok: true, data: { updated } });
  } catch (err) {
    handleError(req, res, err, "notificationSyncController.markAllRead");
  }
}
