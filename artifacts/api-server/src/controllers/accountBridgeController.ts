// ─────────────────────────────────────────────────────────────────────────────
// AccountBridgeController — Hub endpoints that proxy Universe Account data
//
// GET /api/hub/me              → { profile, avatar, reputation, settings }
// GET /api/hub/dashboard       → { profile, avatar, reputation, achievementCount,
//                                   unreadNotifications, latestActivities }
// GET /api/hub/account-health  → { connected: boolean, error?: string }
//
// If Account service is down → 503 { code: "ACCOUNT_SERVICE_UNAVAILABLE" }
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { accountBridgeService } from "../container.js";
import { AccountServiceUnavailableError, AccountUnauthorizedError } from "../services/accountClient.js";

function extractToken(req: Request): string | undefined {
  const auth = req.headers["authorization"];
  return typeof auth === "string" ? auth : undefined;
}

function handleServiceError(req: Request, res: Response, err: unknown): void {
  if (err instanceof AccountUnauthorizedError) {
    req.log.warn({ err }, "accountBridgeController: unauthorized");
    res.status(401).json({ ok: false, code: "UNAUTHORIZED" });
    return;
  }
  if (err instanceof AccountServiceUnavailableError) {
    req.log.warn({ err }, "accountBridgeController: Account service unavailable");
    res.status(503).json({ ok: false, code: "ACCOUNT_SERVICE_UNAVAILABLE" });
    return;
  }
  const msg = err instanceof Error ? err.message : String(err);
  req.log.error({ err }, `accountBridgeController: unexpected error — ${msg}`);
  res.status(500).json({ ok: false, error: "Lỗi không xác định từ Account service." });
}

// ─── GET /api/hub/me ─────────────────────────────────────────────────────────

export async function handleGetHubMe(req: Request, res: Response): Promise<void> {
  try {
    const token = extractToken(req);
    const data  = await accountBridgeService.getHubMe(token);
    res.json({ ok: true, data });
  } catch (err) {
    handleServiceError(req, res, err);
  }
}

// ─── GET /api/hub/dashboard ──────────────────────────────────────────────────

export async function handleGetHubDashboard(req: Request, res: Response): Promise<void> {
  try {
    const token = extractToken(req);
    const data  = await accountBridgeService.getHubDashboard(token);
    res.json({ ok: true, data });
  } catch (err) {
    handleServiceError(req, res, err);
  }
}

// ─── GET /api/hub/account-health ─────────────────────────────────────────────

export async function handleGetAccountHealth(req: Request, res: Response): Promise<void> {
  try {
    const token  = extractToken(req);
    const health = await accountBridgeService.checkAccountHealth(token);
    res.json({ ok: true, data: health });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "accountBridgeController: health check failed");
    res.status(500).json({ ok: false, data: { connected: false, error: msg } });
  }
}
