// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceRecommendationController (V2.7)
//
// GET /api/marketplace/recommendations
// GET /api/marketplace/recommendations/trending
// GET /api/marketplace/recommendations/similar/:listingId
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response } from "express";
import { recommendationService } from "../container";

// GET /api/marketplace/recommendations?userId=&limit=&offset=
export async function handleGetRecommendations(req: Request, res: Response): Promise<void> {
  const userId = typeof req.query["userId"] === "string" ? req.query["userId"] : "user-001";
  const limit  = parseInt(String(req.query["limit"]  ?? "20"), 10);
  const offset = parseInt(String(req.query["offset"] ?? "0"),  10);

  try {
    const data = await recommendationService.getRecommendations(userId, {
      limit:  isNaN(limit)  ? 20 : limit,
      offset: isNaN(offset) ? 0  : offset,
    });
    res.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ ok: false, error: message });
  }
}

// GET /api/marketplace/recommendations/trending?limit=
export async function handleGetTrending(req: Request, res: Response): Promise<void> {
  const limit = parseInt(String(req.query["limit"] ?? "10"), 10);

  try {
    const data = await recommendationService.getTrending(isNaN(limit) ? 10 : limit);
    res.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ ok: false, error: message });
  }
}

// GET /api/marketplace/recommendations/similar/:listingId?userId=&limit=&offset=
export async function handleGetSimilar(req: Request, res: Response): Promise<void> {
  const { listingId } = req.params as { listingId: string };
  const userId = typeof req.query["userId"] === "string" ? req.query["userId"] : undefined;
  const limit  = parseInt(String(req.query["limit"]  ?? "10"), 10);
  const offset = parseInt(String(req.query["offset"] ?? "0"),  10);

  if (!listingId) {
    res.status(400).json({ ok: false, error: "listingId là bắt buộc." });
    return;
  }

  try {
    const data = await recommendationService.getSimilar(listingId, userId, {
      limit:  isNaN(limit)  ? 10 : limit,
      offset: isNaN(offset) ? 0  : offset,
    });
    res.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ ok: false, error: message });
  }
}
