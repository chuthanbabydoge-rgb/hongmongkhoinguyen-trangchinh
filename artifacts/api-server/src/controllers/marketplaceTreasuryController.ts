// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceTreasuryController
//
// Routes (registered in routes/marketplace.ts):
//   GET /api/marketplace/treasury — treasury wallet balances + fee/volume stats
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { marketplaceTreasuryService }  from "../container";

// ─── GET /api/marketplace/treasury ───────────────────────────────────────────

export async function handleGetTreasury(req: Request, res: Response): Promise<void> {
  try {
    const data = await marketplaceTreasuryService.getDashboard();
    res.json({ ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceTreasuryController.getTreasury: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải dữ liệu kho bạc." });
  }
}
