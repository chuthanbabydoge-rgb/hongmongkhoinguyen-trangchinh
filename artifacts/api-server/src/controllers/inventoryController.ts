import { type Request, type Response } from "express";
import { getInventory, getInventoryItems } from "../services/inventoryService";
import { type InventoryCategory } from "../data/inventoryData";

const MOCK_USER_ID = "user-001";

const VALID_CATEGORIES: InventoryCategory[] = [
  "pets", "football", "world-assets", "tickets", "items",
];

export async function handleGetInventory(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? MOCK_USER_ID;
    const inventory = await getInventory(userId);
    res.json({ ok: true, data: inventory });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải kho đồ." });
  }
}

export async function handleGetInventoryItems(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? MOCK_USER_ID;
    const rawCategory = req.query["category"] as string | undefined;
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 50;

    const category = rawCategory && VALID_CATEGORIES.includes(rawCategory as InventoryCategory)
      ? (rawCategory as InventoryCategory)
      : undefined;

    const items = await getInventoryItems(userId, category, limit);
    res.json({ ok: true, data: items, total: items.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải danh sách vật phẩm." });
  }
}
