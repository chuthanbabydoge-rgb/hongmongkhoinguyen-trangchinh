// ─────────────────────────────────────────────────────────────────────────────
// AppRegistryController — HUB-2
//
// GET  /api/ecosystem/apps              → list all (supports ?q= search)
// GET  /api/ecosystem/apps/:slug        → get by slug
// GET  /api/ecosystem/categories/:cat  → list by category
// POST /api/ecosystem/apps             → register new app
// PATCH /api/ecosystem/apps/:id        → update app
// DELETE /api/ecosystem/apps/:id       → delete app
// GET  /api/ecosystem/stats            → registry stats
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { appRegistryService } from "../container.js";
import {
  AppRegistryValidationError,
  AppNotFoundError,
  SlugAlreadyExistsError,
} from "../services/appRegistryService.js";
import { APP_CATEGORIES } from "../models/ecosystemApp.js";
import type { AppCategory } from "../models/ecosystemApp.js";

function handleError(req: Request, res: Response, err: unknown, context: string): void {
  if (err instanceof SlugAlreadyExistsError) {
    res.status(409).json({ ok: false, error: err.message });
    return;
  }
  if (err instanceof AppRegistryValidationError) {
    res.status(400).json({ ok: false, error: err.message });
    return;
  }
  if (err instanceof AppNotFoundError) {
    res.status(404).json({ ok: false, error: err.message });
    return;
  }
  const msg = err instanceof Error ? err.message : String(err);
  req.log.error({ err }, `${context}: ${msg}`);
  res.status(500).json({ ok: false, error: "Lỗi server không xác định." });
}

// ─── GET /api/ecosystem/apps ─────────────────────────────────────────────────

export async function handleGetApps(req: Request, res: Response): Promise<void> {
  try {
    const q = req.query["q"] as string | undefined;
    const data = q
      ? await appRegistryService.searchApps(q)
      : await appRegistryService.getAllApps();
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.getApps");
  }
}

// ─── GET /api/ecosystem/apps/:slug ───────────────────────────────────────────

export async function handleGetAppBySlug(req: Request, res: Response): Promise<void> {
  try {
    const slug = req.params["slug"] as string;
    const data = await appRegistryService.getBySlug(slug);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.getAppBySlug");
  }
}

// ─── GET /api/ecosystem/categories/:category ─────────────────────────────────

export async function handleGetByCategory(req: Request, res: Response): Promise<void> {
  try {
    const rawCat = (req.params["category"] as string | undefined)?.toUpperCase() ?? "";
    if (!(APP_CATEGORIES as readonly string[]).includes(rawCat)) {
      res.status(400).json({ ok: false, error: `Category không hợp lệ: ${rawCat}` });
      return;
    }
    const data = await appRegistryService.getAppsByCategory(rawCat as AppCategory);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.getByCategory");
  }
}

// ─── POST /api/ecosystem/apps ────────────────────────────────────────────────

export async function handleRegisterApp(req: Request, res: Response): Promise<void> {
  try {
    const data = await appRegistryService.registerApp(req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.registerApp");
  }
}

// ─── PATCH /api/ecosystem/apps/:id ───────────────────────────────────────────

export async function handleUpdateApp(req: Request, res: Response): Promise<void> {
  try {
    const id   = req.params["id"] as string;
    const data = await appRegistryService.updateApp(id, req.body);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.updateApp");
  }
}

// ─── DELETE /api/ecosystem/apps/:id ──────────────────────────────────────────

export async function handleDeleteApp(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    await appRegistryService.deleteApp(id);
    res.json({ ok: true });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.deleteApp");
  }
}

// ─── GET /api/ecosystem/stats ─────────────────────────────────────────────────

export async function handleGetStats(req: Request, res: Response): Promise<void> {
  try {
    const data = await appRegistryService.getStats();
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.getStats");
  }
}
