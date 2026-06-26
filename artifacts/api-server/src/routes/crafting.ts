import { Router, type IRouter } from "express";
import { requireAuth }          from "../middlewares/requireAuth.js";
import {
  handleGetRecipes, handleGetRecipe,
  handleStartCraft, handleCompleteCraft, handleCancelCraft, handleGetJobs, handleGetHistory,
  handleGetResources, handleGather,
  handleGetShops, handleGetShop, handleBuyItem, handleSellItem,
  handleUpgradeItem, handleEnchantItem,
  handleGetBlueprints, handleUnlockBlueprint,
  handleGetEconomy, handleGetPrices, handleFluctuatePrices, handleGetStations,
} from "../controllers/craftingController.js";

const router: IRouter = Router();

// ─── Recipes (public) ─────────────────────────────────────────────────────────
router.get("/crafting/recipes",       handleGetRecipes);
router.get("/crafting/recipes/:id",   handleGetRecipe);

// ─── Crafting Jobs (auth) ─────────────────────────────────────────────────────
router.post  ("/crafting/start",                requireAuth, handleStartCraft);
router.post  ("/crafting/:jobId/complete",      requireAuth, handleCompleteCraft);
router.post  ("/crafting/:jobId/cancel",        requireAuth, handleCancelCraft);
router.get   ("/crafting/jobs",                 requireAuth, handleGetJobs);
router.get   ("/crafting/history",              requireAuth, handleGetHistory);

// ─── Resources (nodes public, gather auth) ────────────────────────────────────
router.get   ("/resources",            handleGetResources);
router.post  ("/resources/gather",     requireAuth, handleGather);

// ─── Shops (list/detail public, buy/sell auth) ────────────────────────────────
router.get   ("/shops",               handleGetShops);
router.get   ("/shops/:id",           handleGetShop);
router.post  ("/shops/:id/buy",       requireAuth, handleBuyItem);
router.post  ("/shops/:id/sell",      requireAuth, handleSellItem);

// ─── Items ────────────────────────────────────────────────────────────────────
router.post  ("/items/:id/upgrade",   requireAuth, handleUpgradeItem);
router.post  ("/items/:id/enchant",   requireAuth, handleEnchantItem);

// ─── Blueprints ───────────────────────────────────────────────────────────────
router.get   ("/blueprints",          requireAuth, handleGetBlueprints);
router.post  ("/blueprints/:id/unlock", requireAuth, handleUnlockBlueprint);

// ─── Economy ──────────────────────────────────────────────────────────────────
router.get   ("/economy",             handleGetEconomy);
router.get   ("/economy/prices",      handleGetPrices);
router.post  ("/economy/prices/fluctuate", handleFluctuatePrices);

// ─── Stations ─────────────────────────────────────────────────────────────────
router.get   ("/crafting/stations",   handleGetStations);

export default router;
