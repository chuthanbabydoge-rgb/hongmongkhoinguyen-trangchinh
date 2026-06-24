// ─────────────────────────────────────────────────────────────────────────────
// AppLauncherController — HUB-3
//
// POST   /api/launcher/launch     → launch an app
// GET    /api/launcher/recent     → get recent apps
// GET    /api/launcher/favorites  → get most used (favorite) apps
// GET    /api/launcher/dashboard  → get launcher dashboard
// DELETE /api/launcher/history    → clear launch history
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { appLauncherService } from "../container.js";
import {
  AppLauncherValidationError,
  AppNotAvailableError,
} from "../services/appLauncherService.js";
import { AppNotFoundError } from "../services/appRegistryService.js";

// ─── Default userId (no auth yet — mirrors HUB-1/HUB-2 pattern) ──────────────

function resolveUserId(req: Request): string {
  return (req.headers["x-user-id"] as string | undefined) ?? "user-001";
}

function handleError(req: Request, res: Response, err: unknown, context: string): void {
  if (err instanceof AppLauncherValidationError) {
    res.status(400).json({ ok: false, error: err.message });
    return;
  }
  if (err instanceof AppNotFoundError) {
    res.status(404).json({ ok: false, error: err.message });
    return;
  }
  if (err instanceof AppNotAvailableError) {
    res.status(409).json({ ok: false, error: err.message });
    return;
  }
  const msg = err instanceof Error ? err.message : String(err);
  req.log.error({ err }, `${context}: ${msg}`);
  res.status(500).json({ ok: false, error: "Lỗi server không xác định." });
}

// ─── POST /api/launcher/launch ────────────────────────────────────────────────

export async function handleLaunchApp(req: Request, res: Response): Promise<void> {
  try {
    const userId      = resolveUserId(req);
    const { appSlug, launchSource, sessionId } = req.body as {
      appSlug?:       string;
      launchSource?:  string;
      sessionId?:     string;
    };

    if (!appSlug) {
      res.status(400).json({ ok: false, error: "appSlug is required" });
      return;
    }

    const data = await appLauncherService.launchApp(
      userId,
      appSlug,
      launchSource,
      sessionId,
    );

    res.status(200).json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appLauncherController.launchApp");
  }
}

// ─── GET /api/launcher/recent ─────────────────────────────────────────────────

export async function handleGetRecentApps(req: Request, res: Response): Promise<void> {
  try {
    const userId = resolveUserId(req);
    const limit  = req.query["limit"] ? Number(req.query["limit"]) : undefined;
    const data   = await appLauncherService.getMyRecentApps(userId, limit);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appLauncherController.getRecentApps");
  }
}

// ─── GET /api/launcher/favorites ─────────────────────────────────────────────

export async function handleGetFavoriteApps(req: Request, res: Response): Promise<void> {
  try {
    const userId = resolveUserId(req);
    const limit  = req.query["limit"] ? Number(req.query["limit"]) : undefined;
    const data   = await appLauncherService.getMyMostUsedApps(userId, limit);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appLauncherController.getFavoriteApps");
  }
}

// ─── GET /api/launcher/dashboard ─────────────────────────────────────────────

export async function handleGetDashboard(req: Request, res: Response): Promise<void> {
  try {
    const userId = resolveUserId(req);
    const data   = await appLauncherService.getLauncherDashboard(userId);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appLauncherController.getDashboard");
  }
}

// ─── DELETE /api/launcher/history ────────────────────────────────────────────

export async function handleClearHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = resolveUserId(req);
    await appLauncherService.clearLaunchHistory(userId);
    res.json({ ok: true });
  } catch (err) {
    handleError(req, res, err, "appLauncherController.clearHistory");
  }
}
