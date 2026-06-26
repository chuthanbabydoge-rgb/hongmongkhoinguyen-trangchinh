import { type Request, type Response } from "express";
import {
  craftingService, resourceService, npcShopService, economyService,
  accountBridgeService,
} from "../container.js";
import { CraftingError } from "../services/craftingService.js";
import { ResourceError }  from "../services/resourceService.js";
import { ShopError }      from "../services/npcShopService.js";
import { EconomyError }   from "../services/economyService.js";
import type { UpgradeType } from "../repositories/craftingRepository.js";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return (profile as { userId?: string; id?: string }).userId
        || (profile as { userId?: string; id?: string }).id
        || null;
  } catch { return null; }
}

function requireUser(userId: string | null, res: Response): userId is string {
  if (!userId) {
    res.status(401).json({ ok: false, code: "UNAUTHORIZED", error: "Authorization header bắt buộc." });
    return false;
  }
  return true;
}

function handleError(err: unknown, res: Response): void {
  if (err instanceof CraftingError || err instanceof ResourceError || err instanceof ShopError || err instanceof EconomyError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export async function handleGetRecipes(req: Request, res: Response): Promise<void> {
  try {
    const category = req.query["category"] as string | undefined;
    const recipes = await craftingService.getRecipes(category);
    res.json({ ok: true, data: recipes });
  } catch (err) { handleError(err, res); }
}

export async function handleGetRecipe(req: Request, res: Response): Promise<void> {
  try {
    const recipe = await craftingService.getRecipe(req.params["id"] as string);
    res.json({ ok: true, data: recipe });
  } catch (err) { handleError(err, res); }
}

// ─── Crafting Jobs ────────────────────────────────────────────────────────────

export async function handleStartCraft(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { recipeId } = req.body as { recipeId?: string };
    if (!recipeId) { res.status(400).json({ ok: false, error: "recipeId là bắt buộc" }); return; }
    const job = await craftingService.startCraft(userId, recipeId);
    res.status(201).json({ ok: true, data: job });
  } catch (err) { handleError(err, res); }
}

export async function handleCompleteCraft(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const jobId = req.params["jobId"] as string;
    const result = await craftingService.completeCraft(userId, jobId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

export async function handleCancelCraft(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const jobId = req.params["jobId"] as string;
    const job = await craftingService.cancelCraft(userId, jobId);
    res.json({ ok: true, data: job });
  } catch (err) { handleError(err, res); }
}

export async function handleGetJobs(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const status = req.query["status"] as string | undefined;
    const jobs = await craftingService.getJobs(userId, status);
    res.json({ ok: true, data: jobs });
  } catch (err) { handleError(err, res); }
}

export async function handleGetHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 20;
    const history = await craftingService.getHistory(userId, limit);
    res.json({ ok: true, data: history });
  } catch (err) { handleError(err, res); }
}

// ─── Resources ────────────────────────────────────────────────────────────────

export async function handleGetResources(req: Request, res: Response): Promise<void> {
  try {
    const worldId = req.query["worldId"] as string | undefined;
    const nodes = await resourceService.getNodes(worldId);
    res.json({ ok: true, data: nodes });
  } catch (err) { handleError(err, res); }
}

export async function handleGather(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { nodeId, amount } = req.body as { nodeId?: string; amount?: number };
    if (!nodeId) { res.status(400).json({ ok: false, error: "nodeId là bắt buộc" }); return; }
    const log = await resourceService.gatherResource(userId, nodeId, amount ?? 1);
    res.status(201).json({ ok: true, data: log });
  } catch (err) { handleError(err, res); }
}

// ─── Shops ────────────────────────────────────────────────────────────────────

export async function handleGetShops(req: Request, res: Response): Promise<void> {
  try {
    const worldId = req.query["worldId"] as string | undefined;
    const shops = await npcShopService.getShops(worldId);
    res.json({ ok: true, data: shops });
  } catch (err) { handleError(err, res); }
}

export async function handleGetShop(req: Request, res: Response): Promise<void> {
  try {
    const shop = await npcShopService.getShop(req.params["id"] as string);
    res.json({ ok: true, data: shop });
  } catch (err) { handleError(err, res); }
}

export async function handleBuyItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const shopId = req.params["id"] as string;
    const { itemId, quantity = 1 } = req.body as { itemId?: string; quantity?: number };
    if (!itemId) { res.status(400).json({ ok: false, error: "itemId là bắt buộc" }); return; }
    const result = await npcShopService.buyItem(userId, shopId, itemId, quantity);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

export async function handleSellItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const shopId = req.params["id"] as string;
    const { itemId, quantity = 1 } = req.body as { itemId?: string; quantity?: number };
    if (!itemId) { res.status(400).json({ ok: false, error: "itemId là bắt buộc" }); return; }
    const result = await npcShopService.sellItem(userId, shopId, itemId, quantity);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function handleUpgradeItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const itemId = req.params["id"] as string;
    const { upgradeType = "LEVEL", cost = 50 } = req.body as { upgradeType?: UpgradeType; cost?: number };
    const upgrade = await craftingService.upgradeItem(userId, itemId, upgradeType, cost);
    res.json({ ok: true, data: upgrade });
  } catch (err) { handleError(err, res); }
}

export async function handleEnchantItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const itemId = req.params["id"] as string;
    const { enchantType = "FIRE", value = 10, cost = 100 } = req.body as { enchantType?: string; value?: number; cost?: number };
    const enchant = await craftingService.enchantItem(userId, itemId, enchantType, value, cost);
    res.json({ ok: true, data: enchant });
  } catch (err) { handleError(err, res); }
}

// ─── Blueprints ───────────────────────────────────────────────────────────────

export async function handleGetBlueprints(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const bps = await craftingService.getBlueprints(userId);
    res.json({ ok: true, data: bps });
  } catch (err) { handleError(err, res); }
}

export async function handleUnlockBlueprint(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const recipeId = req.params["id"] as string;
    const bp = await craftingService.unlockBlueprint(userId, recipeId);
    res.status(201).json({ ok: true, data: bp });
  } catch (err) { handleError(err, res); }
}

// ─── Economy ──────────────────────────────────────────────────────────────────

export async function handleGetEconomy(req: Request, res: Response): Promise<void> {
  try {
    const date = req.query["date"] as string | undefined;
    const dashboard = await economyService.getDashboard();
    res.json({ ok: true, data: dashboard });
  } catch (err) { handleError(err, res); }
}

export async function handleGetPrices(_req: Request, res: Response): Promise<void> {
  try {
    const prices = await economyService.getPrices();
    res.json({ ok: true, data: prices });
  } catch (err) { handleError(err, res); }
}

export async function handleFluctuatePrices(_req: Request, res: Response): Promise<void> {
  try {
    const prices = await economyService.fluctuatePrices();
    res.json({ ok: true, data: prices });
  } catch (err) { handleError(err, res); }
}

export async function handleGetStations(req: Request, res: Response): Promise<void> {
  try {
    const worldId = req.query["worldId"] as string | undefined;
    const stations = await craftingService.getStations(worldId);
    res.json({ ok: true, data: stations });
  } catch (err) { handleError(err, res); }
}
