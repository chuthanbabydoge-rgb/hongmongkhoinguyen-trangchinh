import { Router, type IRouter } from "express";
import {
  handleGetInventory,
  handleGetInventoryMe,
  handleGetInventorySummary,
  handleGetInventoryItems,
  handleGetInventoryItemById,
  handleCreateInventoryItem,
  handleUpdateInventoryItem,
  handleDeleteInventoryItem,
} from "../controllers/inventoryController";

const router: IRouter = Router();

// ── Read ──────────────────────────────────────────────────────────────────────
router.get("/inventory",          handleGetInventory);
router.get("/inventory/me",       handleGetInventoryMe);
router.get("/inventory/summary",  handleGetInventorySummary);
router.get("/inventory/items",    handleGetInventoryItems);
router.get("/inventory/items/:id", handleGetInventoryItemById);

// ── Write ─────────────────────────────────────────────────────────────────────
router.post("/inventory/items",        handleCreateInventoryItem);
router.put("/inventory/items/:id",     handleUpdateInventoryItem);
router.delete("/inventory/items/:id",  handleDeleteInventoryItem);

export default router;
