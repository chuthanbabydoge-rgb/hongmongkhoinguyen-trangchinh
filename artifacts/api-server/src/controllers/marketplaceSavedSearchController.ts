// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceSavedSearchController (V2.3)
//
// Routes (registered in routes/marketplace.ts):
//   POST   /api/marketplace/saved-searches            — create
//   GET    /api/marketplace/saved-searches?userId=... — list by user
//   GET    /api/marketplace/saved-searches/:id        — get one
//   PATCH  /api/marketplace/saved-searches/:id        — update
//   DELETE /api/marketplace/saved-searches/:id        — delete
//   POST   /api/marketplace/saved-searches/run-scan   — admin: trigger scan
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { savedSearchService, savedSearchPoller } from "../container";

function isValidation(msg: string) {
  return /bắt buộc|không hợp lệ|để trống|lớn hơn/u.test(msg);
}

// ─── POST /api/marketplace/saved-searches ────────────────────────────────────

export async function handleCreateSavedSearch(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as {
      userId?: string; name?: string; query?: string; category?: string;
      rarity?: string; currency?: string; minPrice?: number; maxPrice?: number;
    };
    const result = await savedSearchService.create({
      userId:   body.userId   ?? "",
      name:     body.name     ?? "",
      query:    body.query    ?? null,
      category: body.category ?? null,
      rarity:   body.rarity   ?? null,
      currency: body.currency ?? null,
      minPrice: body.minPrice ?? null,
      maxPrice: body.maxPrice ?? null,
    });
    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `savedSearchController.create: ${msg}`);
    res.status(isValidation(msg) ? 400 : 500).json({ ok: false, error: msg });
  }
}

// ─── GET /api/marketplace/saved-searches ─────────────────────────────────────

export async function handleListSavedSearches(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.query["userId"] as string | undefined;
    if (!userId?.trim()) {
      res.status(400).json({ ok: false, error: "userId là bắt buộc." });
      return;
    }
    const data = await savedSearchService.list(userId);
    res.json({ ok: true, total: data.length, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `savedSearchController.list: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải danh sách tìm kiếm đã lưu." });
  }
}

// ─── GET /api/marketplace/saved-searches/:id ─────────────────────────────────

export async function handleGetSavedSearch(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = await savedSearchService.findById(id);
    if (!data) {
      res.status(404).json({ ok: false, error: `Tìm kiếm đã lưu ${id} không tìm thấy.` });
      return;
    }
    res.json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `savedSearchController.get: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải tìm kiếm đã lưu." });
  }
}

// ─── PATCH /api/marketplace/saved-searches/:id ───────────────────────────────

export async function handleUpdateSavedSearch(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const body = req.body as {
      name?: string; query?: string | null; category?: string | null;
      rarity?: string | null; currency?: string | null;
      minPrice?: number | null; maxPrice?: number | null;
    };
    const result = await savedSearchService.update(id, body);
    if (!result) {
      res.status(404).json({ ok: false, error: `Tìm kiếm đã lưu ${id} không tìm thấy.` });
      return;
    }
    res.json({ ok: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `savedSearchController.update: ${msg}`);
    res.status(isValidation(msg) ? 400 : 500).json({ ok: false, error: msg });
  }
}

// ─── DELETE /api/marketplace/saved-searches/:id ──────────────────────────────

export async function handleDeleteSavedSearch(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const deleted = await savedSearchService.delete(id);
    if (!deleted) {
      res.status(404).json({ ok: false, error: `Tìm kiếm đã lưu ${id} không tìm thấy.` });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `savedSearchController.delete: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể xóa tìm kiếm đã lưu." });
  }
}

// ─── POST /api/marketplace/saved-searches/run-scan (V2.3 admin) ──────────────

export async function handleRunScan(_req: Request, res: Response): Promise<void> {
  try {
    const result = await savedSearchPoller.runOnce();
    res.json({ ok: true, savedSearches: result.savedSearches, newMatches: result.newMatches });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}
