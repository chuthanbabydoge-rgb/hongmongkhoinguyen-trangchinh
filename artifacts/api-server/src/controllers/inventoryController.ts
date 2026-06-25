import { type Request, type Response } from "express";
import { inventoryService, accountBridgeService } from "../container";
import type { InventoryCategory, Rarity, ItemStatus } from "../repositories/inventoryItemsRepository";
import { AccountUnauthorizedError, AccountServiceUnavailableError } from "../services/accountClient";
import { ItemNotFoundError } from "../services/inventoryService";

// ── JWT-local userId extraction ───────────────────────────────────────────────
// Decodes the JWT payload (2nd segment, base64url) to extract userId locally.
// Checks: sub → userId → id  (standard JWT claims)
// No Account API call — inventory works independently.
function extractUserIdFromJwt(authHeader: string): string | null {
  try {
    const token  = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    const parts  = token.split(".");
    if (parts.length !== 3) return null;
    const raw    = Buffer.from(parts[1]!, "base64url").toString("utf8");
    const payload = JSON.parse(raw) as Record<string, unknown>;
    const id      = payload["sub"] ?? payload["userId"] ?? payload["id"];
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

async function resolveUserId(req: Request): Promise<string> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth || !auth.startsWith("Bearer ")) {
    throw Object.assign(new Error("Chưa xác thực."), { status: 401 });
  }

  // 1. Decode userId from JWT locally — no Account API dependency
  const jwtUserId = extractUserIdFromJwt(auth);
  if (jwtUserId) return jwtUserId;

  // 2. Fallback: call Account API (for opaque / non-JWT tokens)
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return profile.userId || profile.id;
  } catch {
    // Account API unavailable and token is not a decodable JWT → 401
    throw Object.assign(new Error("Chưa xác thực. Token không hợp lệ."), { status: 401 });
  }
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

// GET /api/inventory — full inventory (summary + items)
export async function handleGetInventory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    const inventory = await inventoryService.getInventory(userId);
    res.json({ ok: true, data: inventory });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `inventoryController.getInventory: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải kho đồ." });
  }
}

// GET /api/inventory/me — alias of GET /api/inventory
export async function handleGetInventoryMe(req: Request, res: Response): Promise<void> {
  return handleGetInventory(req, res);
}

// GET /api/inventory/summary — count breakdown
export async function handleGetInventorySummary(req: Request, res: Response): Promise<void> {
  try {
    const userId  = await resolveUserId(req);
    const summary = await inventoryService.getInventorySummary(userId);
    res.json({ ok: true, data: summary });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `inventoryController.getSummary: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải tóm tắt kho đồ." });
  }
}

// GET /api/inventory/items — filtered list
export async function handleGetInventoryItems(req: Request, res: Response): Promise<void> {
  try {
    const userId  = await resolveUserId(req);
    const rawCat  = req.query["category"] as string | undefined;
    const rawRar  = req.query["rarity"]   as string | undefined;
    const rawStat = req.query["status"]   as string | undefined;
    const limit   = req.query["limit"] ? Number(req.query["limit"]) : 50;

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

// GET /api/inventory/items/:id — single item detail
export async function handleGetInventoryItemById(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    const id     = req.params["id"] as string;
    const item   = await inventoryService.getItemById(userId, id);
    res.json({ ok: true, data: item });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    if (err instanceof ItemNotFoundError) {
      res.status(404).json({ ok: false, error: err.message });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `inventoryController.getItemById: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải vật phẩm." });
  }
}

// POST /api/inventory/items — create item
export async function handleCreateInventoryItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    const body   = req.body as Record<string, unknown>;

    const category = body["category"] as string | undefined;
    const name     = body["name"]     as string | undefined;
    const rarity   = body["rarity"]   as string | undefined;

    if (!category || !VALID_CATEGORIES.includes(category as InventoryCategory))
      { res.status(400).json({ ok: false, error: "category không hợp lệ" }); return; }
    if (!name || String(name).trim().length === 0)
      { res.status(400).json({ ok: false, error: "name không được rỗng" }); return; }
    if (!rarity || !VALID_RARITIES.includes(rarity as Rarity))
      { res.status(400).json({ ok: false, error: "rarity không hợp lệ" }); return; }

    const item = await inventoryService.createItem(userId, {
      category:    category as InventoryCategory,
      name:        String(name).trim(),
      description: typeof body["description"] === "string" ? body["description"] : undefined,
      rarity:      rarity as Rarity,
      status:      VALID_STATUSES.includes(body["status"] as ItemStatus) ? (body["status"] as ItemStatus) : "active",
      quantity:    typeof body["quantity"] === "number" && body["quantity"] > 0 ? body["quantity"] : 1,
      image:       typeof body["image"]    === "string" ? body["image"]    : undefined,
      metadata:    body["metadata"] && typeof body["metadata"] === "object" ? body["metadata"] as Record<string, unknown> : undefined,
    });
    res.status(201).json({ ok: true, data: item });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `inventoryController.createItem: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tạo vật phẩm." });
  }
}

// PUT /api/inventory/items/:id — update item
export async function handleUpdateInventoryItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    const id     = req.params["id"] as string;
    const body   = req.body as Record<string, unknown>;

    const patch: Record<string, unknown> = {};
    if (typeof body["name"]        === "string") patch["name"]        = String(body["name"]).trim();
    if (typeof body["description"] === "string") patch["description"] = body["description"];
    if (typeof body["rarity"]      === "string" && VALID_RARITIES.includes(body["rarity"] as Rarity))
      patch["rarity"] = body["rarity"];
    if (typeof body["status"]      === "string" && VALID_STATUSES.includes(body["status"] as ItemStatus))
      patch["status"] = body["status"];
    if (typeof body["quantity"]    === "number" && body["quantity"] > 0)
      patch["quantity"] = body["quantity"];
    if (typeof body["image"]       === "string") patch["image"]       = body["image"];
    if (body["metadata"] && typeof body["metadata"] === "object")
      patch["metadata"] = body["metadata"];

    const item = await inventoryService.updateItem(userId, id, patch as Parameters<typeof inventoryService.updateItem>[2]);
    res.json({ ok: true, data: item });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    if (err instanceof ItemNotFoundError) {
      res.status(404).json({ ok: false, error: err.message });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `inventoryController.updateItem: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể cập nhật vật phẩm." });
  }
}

// DELETE /api/inventory/items/:id — delete item
export async function handleDeleteInventoryItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    const id     = req.params["id"] as string;
    await inventoryService.deleteItem(userId, id);
    res.json({ ok: true, message: "Đã xóa vật phẩm thành công." });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    if (err instanceof ItemNotFoundError) {
      res.status(404).json({ ok: false, error: err.message });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `inventoryController.deleteItem: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể xóa vật phẩm." });
  }
}
