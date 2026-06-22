import { Router, type IRouter } from "express";
import {
  handleGetInventory,
  handleGetInventoryItems,
} from "../controllers/inventoryController";

const router: IRouter = Router();

// GET /api/inventory               — summary + items
// GET /api/inventory/items?category=pets&limit=50
router.get("/inventory", handleGetInventory);
router.get("/inventory/items", handleGetInventoryItems);

export default router;
