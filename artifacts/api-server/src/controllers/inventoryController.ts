import { type Request, type Response } from "express";
import { inventoryService, accountBridgeService } from "../container";
import type { InventoryCategory, Rarity, ItemStatus } from "../repositories/inventoryItemsRepository";
import { AccountUnauthorizedError, AccountServiceUnavailableError } from "../services/accountClient";

async function resolveUserId(req: Request): Promise<string> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) throw Object.assign(new Error("Chưa xác thực."), { status: 401 });
  const profile = await accountBridgeService.getProfileCached(auth);
  return profile.userId || profile.id;
}

function handleAuthError(res: Response, err: unknown): boolean {
  if (err instanceof AccountUnauthorizedError || (err as { status?: number }).status === 401) {
    res.status(401).json({ ok: false, error: "Chưa xác thực. Vui lòng đăng nhập." });
    return true;
  }
  if (err instanceof AccountServiceUnavailableError) {
    res.status(503).json({ ok: false, error: "Không thể kết nối Account service." });
    return true;
  }
  return false;
}

const VALID_CATEGORIES: InventoryCategory[] = ["pets", "football", "world-assets", "tickets", "items"];
const VALID_RARITIES:   Rarity[]            = ["common", "rare", "epic", "legendary", "mythic"];
const VALID_STATUSES:   ItemStatus[]        = ["active", "inactive", "locked", "trading", "equipped", "used", "expired"];

export async function handleGetInventory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params["userId"] as string | undefined
      ?? await resolveUserId(req);
    const inventory = await inventoryService.getInventory(userId);
    res.json({ ok: true, data: inventory });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `inventoryController.getInventory: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải kho đồ." });
  }
}

export async function handleGetInventoryItems(req: Request, res: Response): Promise<void> {
  try {
    const userId   = req.params["userId"] as string | undefined
      ?? await resolveUserId(req);
    const rawCat   = req.query["category"] as string | undefined;
    const rawRar   = req.query["rarity"]   as string | undefined;
    const rawStat  = req.query["status"]   as string | undefined;
    const limit    = req.query["limit"] ? Number(req.query["limit"]) : 50;

    const category = rawCat  && VALID_CATEGORIES.includes(rawCat  as InventoryCategory) ? (rawCat  as InventoryCategory) : undefined;
    const rarity   = rawRar  && VALID_RARITIES.includes(rawRar   as Rarity)             ? (rawRar  as Rarity)            : undefined;
    const status   = rawStat && VALID_STATUSES.includes(rawStat  as ItemStatus)         ? (rawStat as ItemStatus)        : undefined;

    const items = await inventoryService.getInventoryItems(userId, { category, rarity, status }, limit);
    res.json({ ok: true, data: items, total: items.length });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `inventoryController.getInventoryItems: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải danh sách vật phẩm." });
  }
}
