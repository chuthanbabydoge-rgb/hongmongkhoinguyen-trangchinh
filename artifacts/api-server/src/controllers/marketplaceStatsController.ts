// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceStatsController
//
// Routes (registered in routes/marketplace.ts):
//   GET /api/marketplace/stats               — full analytics dashboard
//   GET /api/marketplace/stats/top-sellers   — ranked sellers
//   GET /api/marketplace/stats/top-buyers    — ranked buyers
//   GET /api/marketplace/stats/top-items     — ranked items
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { marketplaceStatsService }     from "../container";

function parseLimit(raw: unknown, defaultVal = 10): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 100) : defaultVal;
}

// ─── GET /api/marketplace/stats ───────────────────────────────────────────────

export async function handleGetStatsDashboard(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseLimit(req.query["limit"]);
    const data  = await marketplaceStatsService.getDashboard(limit);
    res.json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceStatsController.getStatsDashboard: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải thống kê marketplace." });
  }
}

// ─── GET /api/marketplace/stats/top-sellers ───────────────────────────────────

export async function handleGetTopSellers(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseLimit(req.query["limit"]);
    const data  = await marketplaceStatsService.getTopSellers(limit);
    res.json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceStatsController.getTopSellers: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải danh sách người bán hàng đầu." });
  }
}

// ─── GET /api/marketplace/stats/top-buyers ────────────────────────────────────

export async function handleGetTopBuyers(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseLimit(req.query["limit"]);
    const data  = await marketplaceStatsService.getTopBuyers(limit);
    res.json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceStatsController.getTopBuyers: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải danh sách người mua hàng đầu." });
  }
}

// ─── GET /api/marketplace/stats/top-items ────────────────────────────────────

export async function handleGetTopItems(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseLimit(req.query["limit"]);
    const data  = await marketplaceStatsService.getTopItems(limit);
    res.json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceStatsController.getTopItems: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải danh sách sản phẩm hàng đầu." });
  }
}
