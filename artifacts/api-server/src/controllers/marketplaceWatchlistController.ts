// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceWatchlistController (V2.1)
//
// Routes (registered in routes/marketplace.ts):
//   POST   /api/marketplace/watchlist                    — add entry (idempotent)
//   DELETE /api/marketplace/watchlist/:id               — remove entry
//   GET    /api/marketplace/watchlist                   — list for userId
//   GET    /api/marketplace/watchlist/count             — count for userId
//   GET    /api/marketplace/watchlist/price-drops       — price-drop entries
//   POST   /api/marketplace/watchlist/:id/check-price   — detect price drop
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { marketplaceWatchlistService, marketplacePricePoller } from "../container";

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
      userId:     userId     ?? "",
      targetType: targetType ?? "",
      targetId:   targetId   ?? "",
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

// ─── GET /api/marketplace/watchlist/price-drops ──────────────────────────────

export async function handleGetPriceDrops(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const data = await marketplaceWatchlistService.getPriceDrops(userId);
    res.json({ ok: true, total: data.length, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `watchlistController.priceDrops: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải mục giảm giá." });
  }
}

// ─── POST /api/marketplace/watchlist/run-price-check (V2.2 admin) ────────────

export async function handleRunPriceCheck(_req: Request, res: Response): Promise<void> {
  try {
    const result = await marketplacePricePoller.runOnce();
    res.json({ ok: true, scanned: result.scanned, drops: result.drops });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}

// ─── POST /api/marketplace/watchlist/:id/check-price ─────────────────────────

export async function handleCheckPrice(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { currentPrice } = req.body as { currentPrice?: number };

    if (currentPrice == null || !Number.isFinite(currentPrice)) {
      res.status(400).json({ ok: false, error: "currentPrice là bắt buộc và phải là số hợp lệ." });
      return;
    }

    const result = await marketplaceWatchlistService.checkPrice(id, currentPrice);

    if (!result) {
      res.status(404).json({ ok: false, error: `Mục theo dõi ${id} không tìm thấy.` });
      return;
    }

    res.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `watchlistController.checkPrice: ${msg}`);
    const isValidation = /bắt buộc|không hợp lệ/u.test(msg);
    res.status(isValidation ? 400 : 500).json({ ok: false, error: msg });
  }
}
