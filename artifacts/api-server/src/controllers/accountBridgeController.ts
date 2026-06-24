import { type Request, type Response } from "express";
import { accountBridgeService, walletService, inventoryService } from "../container.js";
import { AccountServiceUnavailableError, AccountUnauthorizedError } from "../services/accountClient.js";
import type { WalletSnapshot, InventorySnapshot } from "../models/accountBridge.js";

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

const EMPTY_WALLET: WalletSnapshot = {
  credits: 0,
  coins: 0,
  tokens: 0,
  rewardPoints: 0,
  weeklyChangePercent: 0,
};

const EMPTY_INVENTORY: InventorySnapshot = {
  pets: 0,
  footballPlayers: 0,
  tickets: 0,
  worldAssets: 0,
  items: 0,
  total: 0,
};

export async function handleGetHubDashboard(req: Request, res: Response): Promise<void> {
  try {
    const token = extractToken(req);

    const profile = await accountBridgeService.getProfileCached(token);
    const userId  = profile.userId || profile.id;

    const [accountData, rawWallet, rawInventory] = await Promise.all([
      accountBridgeService.getHubDashboard(token),
      walletService.getWallet(userId).catch(() => null),
      inventoryService.getInventory(userId).catch(() => null),
    ]);

    const wallet: WalletSnapshot = rawWallet
      ? {
          credits:             rawWallet.credits,
          coins:               rawWallet.coins,
          tokens:              rawWallet.tokens,
          rewardPoints:        rawWallet.rewardPoints,
          weeklyChangePercent: rawWallet.weeklyChangePercent ?? 0,
        }
      : EMPTY_WALLET;

    const inv = rawInventory?.summary ?? null;
    const inventory: InventorySnapshot = inv
      ? {
          pets:            inv.pets            ?? 0,
          footballPlayers: inv.footballPlayers  ?? 0,
          tickets:         inv.tickets         ?? 0,
          worldAssets:     inv.worldAssets     ?? 0,
          items:           inv.items           ?? 0,
          total:           inv.total           ?? 0,
        }
      : EMPTY_INVENTORY;

    res.json({ ok: true, data: { ...accountData, wallet, inventory } });
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
