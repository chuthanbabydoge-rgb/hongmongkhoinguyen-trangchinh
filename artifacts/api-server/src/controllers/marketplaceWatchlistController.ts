// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceWatchlistController
//
// Routes (registered in routes/marketplace.ts):
//   POST   /api/marketplace/watchlist       — add entry (idempotent on dup)
//   DELETE /api/marketplace/watchlist/:id   — remove entry
//   GET    /api/marketplace/watchlist       — list for userId
//   GET    /api/marketplace/watchlist/count — count for userId
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { marketplaceWatchlistService } from "../container";

function requireUserId(req: Request, res: Response): string | null {
  const userId = req.query["userId"] as string | undefined;
  if (!userId?.trim()) {
    res.status(400).json({ ok: false, error: "userId là bắt buộc." });
    return null;
  }
  return userId;
}

// ─── POST /api/marketplace/watchlist ─────────────────────────────────────────

export async function handleAddWatchlist(req: Request, res: Response): Promise<void> {
  try {
    const { userId, targetType, targetId, itemName, price, rarity, status } = req.body as {
      userId?:     string;
      targetType?: string;
      targetId?:   string;
      itemName?:   string;
      price?:      number;
      rarity?:     string;
      status?:     string;
    };

    const result = await marketplaceWatchlistService.add({
      userId:    userId    ?? "",
      targetType: targetType ?? "",
      targetId:  targetId  ?? "",
      itemName,
      price,
      rarity,
      status,
    });

    const statusCode = result.created ? 201 : 200;
    res.status(statusCode).json({ ok: true, created: result.created, data: result.entry });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `watchlistController.add: ${msg}`);
    const isValidation = /bắt buộc|không hợp lệ/u.test(msg);
    res.status(isValidation ? 400 : 500).json({ ok: false, error: msg });
  }
}

// ─── DELETE /api/marketplace/watchlist/:id ────────────────────────────────────

export async function handleRemoveWatchlist(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const deleted = await marketplaceWatchlistService.remove(id);

    if (!deleted) {
      res.status(404).json({ ok: false, error: `Mục theo dõi ${id} không tìm thấy.` });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `watchlistController.remove: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể xóa mục theo dõi." });
  }
}

// ─── GET /api/marketplace/watchlist ──────────────────────────────────────────

export async function handleGetWatchlist(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const data = await marketplaceWatchlistService.list(userId);
    res.json({ ok: true, total: data.length, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `watchlistController.list: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải danh sách theo dõi." });
  }
}

// ─── GET /api/marketplace/watchlist/count ────────────────────────────────────

export async function handleGetWatchlistCount(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const count = await marketplaceWatchlistService.count(userId);
    res.json({ ok: true, count });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `watchlistController.count: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể đếm danh sách theo dõi." });
  }
}
