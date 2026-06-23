import { type Request, type Response } from "express";
import { inventoryService } from "../container";
import type { InventoryCategory, Rarity, ItemStatus } from "../repositories/inventoryItemsRepository";

const MOCK_USER_ID = "72e296a9-cbff-496f-8c9c-65de33c9b930";

const VALID_CATEGORIES: InventoryCategory[] = ["pets", "football", "world-assets", "tickets", "items"];
const VALID_RARITIES:   Rarity[]            = ["common", "rare", "epic", "legendary", "mythic"];
const VALID_STATUSES:   ItemStatus[]        = ["active", "inactive", "locked", "trading", "equipped", "used", "expired"];

export async function handleGetInventory(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? MOCK_USER_ID;
    const inventory = await inventoryService.getInventory(userId);
    res.json({ ok: true, data: inventory });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `inventoryController.getInventory: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải kho đồ." });
  }
}

export async function handleGetInventoryItems(req: Request, res: Response): Promise<void> {
  try {
    const userId   = (req.params["userId"] as string | undefined) ?? MOCK_USER_ID;
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
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `inventoryController.getInventoryItems: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải danh sách vật phẩm." });
  }
}
