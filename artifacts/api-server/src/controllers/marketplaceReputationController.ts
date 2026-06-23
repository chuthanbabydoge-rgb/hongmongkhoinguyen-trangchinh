// ─────────────────────────────────────────────────────────────────────────────
// Marketplace Reputation Controller — V2.4
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response } from "express";
import { sellerReputationService as reputationService } from "../container";

// POST /api/marketplace/reputation/rate
export async function handleRate(req: Request, res: Response): Promise<void> {
  try {
    const { buyerId, sellerId, transactionId, rating } = req.body as {
      buyerId:       string;
      sellerId:      string;
      transactionId: string;
      rating:        number;
    };

    if (!buyerId || !sellerId || !transactionId) {
      res.status(400).json({ ok: false, error: "buyerId, sellerId, transactionId là bắt buộc." });
      return;
    }
    if (rating !== 1 && rating !== -1) {
      res.status(400).json({ ok: false, error: "rating phải là 1 hoặc -1." });
      return;
    }

    const data = await reputationService.submitRating({
      buyerId,
      sellerId,
      transactionId,
      rating: rating as 1 | -1,
    });
    res.status(200).json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(400).json({ ok: false, error: msg });
  }
}

// GET /api/marketplace/reputation/top-sellers
export async function handleGetTopSellers(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 20;
    const data  = await reputationService.getTopSellers(limit);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(500).json({ ok: false, error: msg });
  }
}

// GET /api/marketplace/reputation/:userId
export async function handleGetReputation(req: Request, res: Response): Promise<void> {
  try {
    const data = await reputationService.getReputation(req.params["userId"]!);
    if (!data) {
      res.status(404).json({ ok: false, error: "Không tìm thấy uy tín người bán." });
      return;
    }
    res.status(200).json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(500).json({ ok: false, error: msg });
  }
}
