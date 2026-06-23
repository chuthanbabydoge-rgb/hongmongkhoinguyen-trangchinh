// ─────────────────────────────────────────────────────────────────────────────
// MarketplacePricingController (V2.8)
//
// GET /api/marketplace/pricing/trends
// GET /api/marketplace/pricing/category/:category
// GET /api/marketplace/pricing/:itemId
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response } from "express";
import { pricingService } from "../container";

// GET /api/marketplace/pricing/trends?limit=
export async function handleGetPricingTrends(req: Request, res: Response): Promise<void> {
  const limit = parseInt(String(req.query["limit"] ?? "10"), 10);
  try {
    const data = await pricingService.getTrends(isNaN(limit) ? 10 : limit);
    res.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ ok: false, error: message });
  }
}

// GET /api/marketplace/pricing/category/:category
export async function handleGetCategoryPricing(req: Request, res: Response): Promise<void> {
  const { category } = req.params as { category: string };
  if (!category) {
    res.status(400).json({ ok: false, error: "category là bắt buộc." });
    return;
  }
  try {
    const data = await pricingService.getCategoryPricing(category);
    if (!data) {
      res.status(404).json({ ok: false, error: `Không có dữ liệu giá cho danh mục: ${category}` });
      return;
    }
    res.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ ok: false, error: message });
  }
}

// GET /api/marketplace/pricing/:itemId?currentPrice=
export async function handleGetItemPricing(req: Request, res: Response): Promise<void> {
  const { itemId } = req.params as { itemId: string };
  const rawPrice    = req.query["currentPrice"];
  const currentPrice = rawPrice != null ? parseFloat(String(rawPrice)) : undefined;

  if (!itemId) {
    res.status(400).json({ ok: false, error: "itemId là bắt buộc." });
    return;
  }
  try {
    const data = await pricingService.getItemPricing(
      itemId,
      currentPrice != null && !isNaN(currentPrice) ? currentPrice : undefined,
    );
    if (!data) {
      res.status(404).json({ ok: false, error: `Không có dữ liệu giá cho mặt hàng: ${itemId}` });
      return;
    }
    res.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ ok: false, error: message });
  }
}
