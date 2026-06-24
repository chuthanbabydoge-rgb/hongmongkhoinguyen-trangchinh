// ─────────────────────────────────────────────────────────────────────────────
// AppRegistryController — HUB-2
//
// GET    /api/apps          → list all (supports ?q= search, ?category=)
// GET    /api/apps/:id      → get by id
// POST   /api/apps/register → register new app
// PUT    /api/apps/:id      → update app
// DELETE /api/apps/:id      → delete app
// GET    /api/ecosystem/stats         → registry stats (ecosystem router)
// GET    /api/ecosystem/apps          → alias list (ecosystem router)
// GET    /api/ecosystem/apps/:slug    → get by slug (ecosystem router)
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { appRegistryService } from "../container.js";
import {
  AppRegistryValidationError,
  AppNotFoundError,
  SlugAlreadyExistsError,
} from "../services/appRegistryService.js";
import { APP_CATEGORIES } from "../models/appRegistry.js";
import type { AppCategory } from "../models/appRegistry.js";

function handleError(req: Request, res: Response, err: unknown, ctx: string): void {
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
  req.log.error({ err }, `${ctx}: ${msg}`);
  res.status(500).json({ ok: false, error: "Lỗi server không xác định." });
}

// ─── GET /api/apps ────────────────────────────────────────────────────────────

export async function handleGetApps(req: Request, res: Response): Promise<void> {
  try {
    const q        = req.query["q"] as string | undefined;
    const category = req.query["category"] as string | undefined;

    let data;
    if (q) {
      data = await appRegistryService.searchApps(q);
    } else if (category) {
      const cat = category.toUpperCase();
      if (!(APP_CATEGORIES as readonly string[]).includes(cat)) {
        res.status(400).json({ ok: false, error: `category không hợp lệ: ${cat}` });
        return;
      }
      data = await appRegistryService.getAppsByCategory(cat as AppCategory);
    } else {
      data = await appRegistryService.getAllApps();
    }

    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.getApps");
  }
}

// ─── GET /api/apps/:id ────────────────────────────────────────────────────────

export async function handleGetAppById(req: Request, res: Response): Promise<void> {
  try {
    const id   = req.params["id"] as string;
    const data = await appRegistryService.getAppById(id);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.getAppById");
  }
}

// ─── GET /api/ecosystem/apps/:slug (alias — lookup by slug) ──────────────────

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

// ─── POST /api/apps/register ──────────────────────────────────────────────────

export async function handleRegisterApp(req: Request, res: Response): Promise<void> {
  try {
    const data = await appRegistryService.registerApp(req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.registerApp");
  }
}

// ─── PUT /api/apps/:id ────────────────────────────────────────────────────────

export async function handleUpdateApp(req: Request, res: Response): Promise<void> {
  try {
    const id   = req.params["id"] as string;
    const data = await appRegistryService.updateApp(id, req.body);
    res.json({ ok: true, data });
  } catch (err) {
    handleError(req, res, err, "appRegistryController.updateApp");
  }
}

// ─── DELETE /api/apps/:id ─────────────────────────────────────────────────────

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
