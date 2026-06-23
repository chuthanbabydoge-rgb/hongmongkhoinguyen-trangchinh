// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceRealtimeController (V2.6)
//
// GET /api/marketplace/realtime/stats
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response } from "express";
import { getRealtimeStats } from "../realtime/marketplaceWebSocketServer";

export function handleGetRealtimeStats(_req: Request, res: Response): void {
  res.json({ ok: true, data: getRealtimeStats() });
}
