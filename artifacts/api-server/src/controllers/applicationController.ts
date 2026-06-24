// ─────────────────────────────────────────────────────────────────────────────
// ApplicationController — HUB-5
//
// GET    /api/apps              → danh sách tất cả apps (phân trang)
// GET    /api/apps/featured     → featured apps
// GET    /api/apps/recent       → recently added apps
// GET    /api/apps/my           → my installed apps (userId từ header)
// GET    /api/apps/:slug        → chi tiết app theo slug
// POST   /api/apps/register     → đăng ký app mới
// POST   /api/apps/install      → cài đặt app
// DELETE /api/apps/install/:slug → gỡ cài đặt app
// POST   /api/apps/:slug/open   → mở app (cập nhật lastOpenedAt)
// PATCH  /api/apps/:slug/disable → vô hiệu hóa app
// PATCH  /api/apps/:slug/enable  → kích hoạt app
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { applicationRegistryService } from "../container.js";
import {
  AppAlreadyExistsError,
  AppHUB5NotFoundError,
  AppDisabledError,
  AppValidationError,
  AppNotInstalledError,
} from "../services/applicationRegistryService.js";
import type { PaginationOptions } from "../models/application.js";

// ─── User ID extraction ───────────────────────────────────────────────────────

function getUserId(req: Request): string {
  return (req.headers["x-user-id"] as string | undefined)
    ?? (req.query["userId"] as string | undefined)
    ?? "user-default";
}

function parsePaginationOptions(req: Request): PaginationOptions {
  const page  = parseInt(req.query["page"]  as string ?? "1",  10);
  const limit = parseInt(req.query["limit"] as string ?? "20", 10);
  const sort  = req.query["sort"]  as PaginationOptions["sort"]  | undefined;
  const order = req.query["order"] as PaginationOptions["order"] | undefined;
  return {
    page:  isNaN(page)  ? 1  : Math.max(1, page),
    limit: isNaN(limit) ? 20 : Math.min(100, Math.max(1, limit)),
    sort,
    order,
  };
}

// ─── Error handler ────────────────────────────────────────────────────────────

function handleError(req: Request, res: Response, err: unknown, ctx: string): void {
  if (err instanceof AppAlreadyExistsError) {
    res.status(409).json({ ok: false, error: err.message }); return;
  }
  if (err instanceof AppValidationError) {
    res.status(400).json({ ok: false, error: err.message }); return;
  }
  if (err instanceof AppHUB5NotFoundError) {
    res.status(404).json({ ok: false, error: err.message }); return;
  }
  if (err instanceof AppDisabledError) {
    res.status(403).json({ ok: false, error: err.message }); return;
  }
  if (err instanceof AppNotInstalledError) {
    res.status(404).json({ ok: false, error: err.message }); return;
  }
  const msg = err instanceof Error ? err.message : String(err);
  req.log.error({ err }, `${ctx}: ${msg}`);
  res.status(500).json({ ok: false, error: "Lỗi server không xác định." });
}

// ─── GET /api/apps ────────────────────────────────────────────────────────────

export async function handleGetApps(req: Request, res: Response): Promise<void> {
  try {
    const opts = parsePaginationOptions(req);
    const data = await applicationRegistryService.getApps(opts);
    res.json({ ok: true, ...data });
  } catch (err) {
    handleError(req, res, err, "applicationController.getApps");
  }
}

// ─── GET /api/apps/featured ───────────────────────────────────────────────────

export async function handleGetFeaturedApps(req: Request, res: Response): Promise<void> {
  try {
    const opts = parsePaginationOptions(req);
    const data = await applicationRegistryService.getFeaturedApps(opts);
    res.json({ ok: true, ...data });
  } catch (err) {
    handleError(req, res, err, "applicationController.getFeaturedApps");
  }
}

// ─── GET /api/apps/recent ─────────────────────────────────────────────────────

export async function handleGetRecentApps(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query["limit"] as string ?? "10", 10);
    const data  = await applicationRegistryService.getRecentlyAdded(isNaN(limit) ? 10 : limit);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "applicationController.getRecentApps");
  }
}

// ─── GET /api/apps/my ─────────────────────────────────────────────────────────

export async function handleGetMyApps(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const items  = await applicationRegistryService.getMyApps(userId);
    res.json({ ok: true, data: items });
  } catch (err) {
    handleError(req, res, err, "applicationController.getMyApps");
  }
}

// ─── GET /api/apps/:slug ──────────────────────────────────────────────────────

export async function handleGetAppBySlug(req: Request, res: Response): Promise<void> {
  try {
    const slug = req.params["slug"] as string;
    const data = await applicationRegistryService.getApp(slug);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "applicationController.getAppBySlug");
  }
}

// ─── POST /api/apps/register ──────────────────────────────────────────────────

export async function handleRegisterApp(req: Request, res: Response): Promise<void> {
  try {
    const data = await applicationRegistryService.registerApp(req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "applicationController.registerApp");
  }
}

// ─── POST /api/apps/install ───────────────────────────────────────────────────

export async function handleInstallApp(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const data   = await applicationRegistryService.installApp(userId, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "applicationController.installApp");
  }
}

// ─── DELETE /api/apps/install/:slug ──────────────────────────────────────────

export async function handleUninstallApp(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const slug   = req.params["slug"] as string;
    await applicationRegistryService.uninstallApp(userId, slug);
    res.json({ ok: true });
  } catch (err) {
    handleError(req, res, err, "applicationController.uninstallApp");
  }
}

// ─── POST /api/apps/:slug/open ────────────────────────────────────────────────

export async function handleOpenApp(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const slug   = req.params["slug"] as string;
    const data   = await applicationRegistryService.openApp(userId, slug);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "applicationController.openApp");
  }
}

// ─── PATCH /api/apps/:slug/disable ───────────────────────────────────────────

export async function handleDisableApp(req: Request, res: Response): Promise<void> {
  try {
    const slug = req.params["slug"] as string;
    const data = await applicationRegistryService.disableApp(slug);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "applicationController.disableApp");
  }
}

// ─── PATCH /api/apps/:slug/enable ────────────────────────────────────────────

export async function handleEnableApp(req: Request, res: Response): Promise<void> {
  try {
    const slug = req.params["slug"] as string;
    const data = await applicationRegistryService.enableApp(slug);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "applicationController.enableApp");
  }
}
