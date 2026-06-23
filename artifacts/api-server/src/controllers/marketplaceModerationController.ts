// ─────────────────────────────────────────────────────────────────────────────
// Marketplace Moderation Controller — V2.5
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response } from "express";
import { moderationService } from "../container";

// GET /api/marketplace/admin/dashboard
export async function handleGetDashboard(_req: Request, res: Response): Promise<void> {
  try {
    const data = await moderationService.getDashboard();
    res.status(200).json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(500).json({ ok: false, error: msg });
  }
}

// GET /api/marketplace/admin/reported
export async function handleGetReported(_req: Request, res: Response): Promise<void> {
  try {
    const data = await moderationService.getReported();
    res.status(200).json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(500).json({ ok: false, error: msg });
  }
}

// POST /api/marketplace/admin/remove-listing
export async function handleRemoveListing(req: Request, res: Response): Promise<void> {
  try {
    const { adminId, listingId, reason } = req.body as Record<string, string>;
    if (!adminId || !listingId || !reason) {
      res.status(400).json({ ok: false, error: "adminId, listingId, reason là bắt buộc." });
      return;
    }
    const data = await moderationService.removeListing(adminId, listingId, reason);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(400).json({ ok: false, error: msg });
  }
}

// POST /api/marketplace/admin/remove-auction
export async function handleRemoveAuction(req: Request, res: Response): Promise<void> {
  try {
    const { adminId, auctionId, reason } = req.body as Record<string, string>;
    if (!adminId || !auctionId || !reason) {
      res.status(400).json({ ok: false, error: "adminId, auctionId, reason là bắt buộc." });
      return;
    }
    const data = await moderationService.removeAuction(adminId, auctionId, reason);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(400).json({ ok: false, error: msg });
  }
}

// POST /api/marketplace/admin/suspend-seller
export async function handleSuspendSeller(req: Request, res: Response): Promise<void> {
  try {
    const { adminId, sellerId, reason } = req.body as Record<string, string>;
    if (!adminId || !sellerId || !reason) {
      res.status(400).json({ ok: false, error: "adminId, sellerId, reason là bắt buộc." });
      return;
    }
    const data = await moderationService.suspendSeller(adminId, sellerId, reason);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(400).json({ ok: false, error: msg });
  }
}

// POST /api/marketplace/admin/ban-seller
export async function handleBanSeller(req: Request, res: Response): Promise<void> {
  try {
    const { adminId, sellerId, reason } = req.body as Record<string, string>;
    if (!adminId || !sellerId || !reason) {
      res.status(400).json({ ok: false, error: "adminId, sellerId, reason là bắt buộc." });
      return;
    }
    const data = await moderationService.banSeller(adminId, sellerId, reason);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(400).json({ ok: false, error: msg });
  }
}

// GET /api/marketplace/admin/actions
export async function handleGetActions(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query["limit"] ? Number(req.query["limit"]) : undefined;
    const data  = await moderationService.getActions(limit);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(500).json({ ok: false, error: msg });
  }
}
