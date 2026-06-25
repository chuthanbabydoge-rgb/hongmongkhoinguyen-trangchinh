import { type Request, type Response } from "express";
import { marketplaceService, inventoryMutationRepo } from "../container";
import type {
  ListingStatus,
  AuctionStatus,
  MarketplaceCurrency,
  ItemCategory,
  ItemRarity,
} from "../repositories/marketplaceRepository";
import { accountBridgeService } from "../container";
import { AccountUnauthorizedError, AccountServiceUnavailableError } from "../services/accountClient";

// ─── Auth helpers (same pattern as inventoryController) ───────────────────────

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
  const jwtUserId = extractUserIdFromJwt(auth);
  if (jwtUserId) return jwtUserId;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return profile.userId || profile.id;
  } catch {
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

const VALID_LISTING_STATUSES:  ListingStatus[]       = ["active", "sold", "cancelled", "expired"];
const VALID_AUCTION_STATUSES:  AuctionStatus[]        = ["live", "ended", "cancelled"];
const VALID_CURRENCIES:        MarketplaceCurrency[]  = ["credits", "stars", "eth"];
const VALID_CATEGORIES:        ItemCategory[]         = ["pets", "football", "world-assets", "tickets", "items"];
const VALID_RARITIES:          ItemRarity[]           = ["common", "rare", "epic", "legendary", "mythic"];
const VALID_LISTING_SORTS      = ["price", "createdAt", "updatedAt", "rarity", "itemName"] as const;
const VALID_AUCTION_SORTS      = ["price", "currentPrice", "createdAt", "rarity", "itemName", "bidCount", "endsAt"] as const;

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function handleGetStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await marketplaceService.getStats();
    res.json({ ok: true, data: stats });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.getStats: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải thống kê marketplace." });
  }
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export async function handleGetListings(req: Request, res: Response): Promise<void> {
  try {
    const q        = req.query["q"]        as string | undefined;
    const rawCat   = req.query["category"] as string | undefined;
    const rawRar   = req.query["rarity"]   as string | undefined;
    const rawCur   = req.query["currency"] as string | undefined;
    const sellerId = req.query["sellerId"] as string | undefined;
    const rawStat  = req.query["status"]   as string | undefined;
    const rawSort  = req.query["sort"]     as string | undefined;
    const rawOrd   = req.query["order"]    as string | undefined;
    const limit    = req.query["limit"]    ? Math.max(1, Number(req.query["limit"]))  : 50;
    const offset   = req.query["offset"]   ? Math.max(0, Number(req.query["offset"])) : 0;
    const minPrice = req.query["minPrice"] ? Number(req.query["minPrice"]) : undefined;
    const maxPrice = req.query["maxPrice"] ? Number(req.query["maxPrice"]) : undefined;

    const listings = await marketplaceService.getListings({
      q,
      category: rawCat && VALID_CATEGORIES.includes(rawCat as ItemCategory)               ? (rawCat as ItemCategory)         : undefined,
      rarity:   rawRar && VALID_RARITIES.includes(rawRar as ItemRarity)                   ? (rawRar as ItemRarity)           : undefined,
      currency: rawCur && VALID_CURRENCIES.includes(rawCur as MarketplaceCurrency)        ? (rawCur as MarketplaceCurrency)  : undefined,
      sellerId,
      minPrice: minPrice != null && !isNaN(minPrice) ? minPrice : undefined,
      maxPrice: maxPrice != null && !isNaN(maxPrice) ? maxPrice : undefined,
      status:   rawStat && VALID_LISTING_STATUSES.includes(rawStat as ListingStatus)     ? (rawStat as ListingStatus)        : undefined,
      sort:     rawSort && (VALID_LISTING_SORTS as readonly string[]).includes(rawSort)   ? (rawSort as typeof VALID_LISTING_SORTS[number]) : undefined,
      order:    rawOrd === "asc" || rawOrd === "desc"                                     ? rawOrd                           : undefined,
      limit,
      offset,
    });
    res.json({ ok: true, data: listings, total: listings.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.getListings: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải danh sách niêm yết." });
  }
}

export async function handleGetListing(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const listing = await marketplaceService.getListing(id);
    if (!listing) {
      res.status(404).json({ ok: false, error: "Không tìm thấy niêm yết." });
      return;
    }
    res.json({ ok: true, data: listing });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.getListing: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải niêm yết." });
  }
}

export async function handleCreateListing(req: Request, res: Response): Promise<void> {
  try {
    const sellerId = await resolveUserId(req);
    const body = req.body as Record<string, unknown>;

    // Accept inventoryItemId (AC-1 spec) or legacy itemId
    const itemId    = (body["inventoryItemId"] ?? body["itemId"]) as string | undefined;
    const price     = body["price"]    != null ? Number(body["price"]) : NaN;
    const rawCur    = body["currency"] as string | undefined;
    const expiresAt = body["expiresAt"] as string | undefined;

    if (!itemId) { res.status(400).json({ ok: false, error: "inventoryItemId là bắt buộc." }); return; }
    if (isNaN(price) || price <= 0) { res.status(400).json({ ok: false, error: "price phải lớn hơn 0." }); return; }

    // Normalize currency: accept CREDITS/credits/stars/eth
    const currency = rawCur ? rawCur.toLowerCase() : undefined;
    if (!currency || !VALID_CURRENCIES.includes(currency as MarketplaceCurrency)) {
      res.status(400).json({ ok: false, error: `currency không hợp lệ. Giá trị: ${VALID_CURRENCIES.join(", ")}` }); return;
    }

    // Look up item from inventory to get name/category/rarity (AC-2)
    const invItem = await inventoryMutationRepo.getById(itemId);
    if (!invItem) {
      res.status(404).json({ ok: false, error: `Vật phẩm ${itemId} không tồn tại trong kho hàng.` }); return;
    }

    // Allow caller to override itemName/category/rarity if provided (backward compat)
    const itemName = (body["itemName"] as string | undefined) ?? invItem.name;
    const category = (body["category"] as string | undefined) ?? invItem.category;
    const rarity   = (body["rarity"]   as string | undefined) ?? invItem.rarity;

    if (!VALID_CATEGORIES.includes(category as ItemCategory)) {
      res.status(400).json({ ok: false, error: `category không hợp lệ: ${category}` }); return;
    }
    if (!VALID_RARITIES.includes(rarity as ItemRarity)) {
      res.status(400).json({ ok: false, error: `rarity không hợp lệ: ${rarity}` }); return;
    }

    const listing = await marketplaceService.createListing({
      sellerId,
      itemId,
      itemName,
      category: category as ItemCategory,
      rarity:   rarity   as ItemRarity,
      price,
      currency: currency as MarketplaceCurrency,
      expiresAt,
    });

    res.status(201).json({ ok: true, data: { listingId: listing.id, status: listing.status, ...listing } });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.createListing: ${msg}`);
    const httpStatus = msg.includes("không sở hữu") || msg.includes("không tồn tại") ? 403
      : (err as { status?: number }).status === 401 ? 401 : 500;
    res.status(httpStatus).json({ ok: false, error: msg });
  }
}

export async function handleDeleteListing(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const userId = await resolveUserId(req).catch(() => null);

    const listing = await marketplaceService.getListing(id);
    if (!listing) { res.status(404).json({ ok: false, error: "Không tìm thấy niêm yết." }); return; }
    if (userId && listing.sellerId !== userId) {
      res.status(403).json({ ok: false, error: "Bạn không có quyền xóa niêm yết này." }); return;
    }

    await marketplaceService.deleteListing(id);
    res.json({ ok: true, message: "Niêm yết đã được xoá." });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.deleteListing: ${msg}`);
    const status = msg.includes("không tìm thấy") ? 404 : 500;
    res.status(status).json({ ok: false, error: msg });
  }
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export async function handlePurchaseListing(req: Request, res: Response): Promise<void> {
  try {
    const id      = req.params["id"] as string;
    const buyerId = await resolveUserId(req);

    const result = await marketplaceService.purchaseListing(id, { buyerId });
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.purchaseListing: ${msg}`);
    const httpStatus = msg.includes("không tìm thấy") ? 404
      : msg.includes("không còn hoạt động") || msg.includes("không thể mua") || msg.includes("Số dư") ? 400
      : 500;
    res.status(httpStatus).json({ ok: false, error: msg });
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function handleGetTransactions(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 50;
    const transactions = await marketplaceService.getTransactions(limit);
    res.json({ ok: true, data: transactions, total: transactions.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.getTransactions: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải giao dịch." });
  }
}

// ─── Auctions ─────────────────────────────────────────────────────────────────

export async function handleGetAuctions(req: Request, res: Response): Promise<void> {
  try {
    const q        = req.query["q"]        as string | undefined;
    const rawCat   = req.query["category"] as string | undefined;
    const rawRar   = req.query["rarity"]   as string | undefined;
    const rawCur   = req.query["currency"] as string | undefined;
    const sellerId = req.query["sellerId"] as string | undefined;
    const rawStat  = req.query["status"]   as string | undefined;
    const rawSort  = req.query["sort"]     as string | undefined;
    const rawOrd   = req.query["order"]    as string | undefined;
    const limit    = req.query["limit"]    ? Math.max(1, Number(req.query["limit"]))  : 50;
    const offset   = req.query["offset"]   ? Math.max(0, Number(req.query["offset"])) : 0;
    const minPrice = req.query["minPrice"] ? Number(req.query["minPrice"]) : undefined;
    const maxPrice = req.query["maxPrice"] ? Number(req.query["maxPrice"]) : undefined;

    const auctions = await marketplaceService.getAuctions({
      q,
      category: rawCat && VALID_CATEGORIES.includes(rawCat as ItemCategory)               ? (rawCat as ItemCategory)         : undefined,
      rarity:   rawRar && VALID_RARITIES.includes(rawRar as ItemRarity)                   ? (rawRar as ItemRarity)           : undefined,
      currency: rawCur && VALID_CURRENCIES.includes(rawCur as MarketplaceCurrency)        ? (rawCur as MarketplaceCurrency)  : undefined,
      sellerId,
      minPrice: minPrice != null && !isNaN(minPrice) ? minPrice : undefined,
      maxPrice: maxPrice != null && !isNaN(maxPrice) ? maxPrice : undefined,
      status:   rawStat && VALID_AUCTION_STATUSES.includes(rawStat as AuctionStatus)      ? (rawStat as AuctionStatus)       : undefined,
      sort:     rawSort && (VALID_AUCTION_SORTS as readonly string[]).includes(rawSort)    ? (rawSort as typeof VALID_AUCTION_SORTS[number]) : undefined,
      order:    rawOrd === "asc" || rawOrd === "desc"                                      ? rawOrd                          : undefined,
      limit,
      offset,
    });
    res.json({ ok: true, data: auctions, total: auctions.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.getAuctions: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải phiên đấu giá." });
  }
}

export async function handleCreateAuction(req: Request, res: Response): Promise<void> {
  try {
    const sellerId = await resolveUserId(req);
    const body = req.body as Record<string, unknown>;
    const itemId        = body["itemId"]        as string | undefined;
    const itemName      = body["itemName"]      as string | undefined;
    const category      = body["category"]      as string | undefined;
    const rarity        = body["rarity"]        as string | undefined;
    const startingPrice = body["startingPrice"] != null ? Number(body["startingPrice"]) : NaN;
    const currency      = body["currency"]      as string | undefined;
    const endsAt        = body["endsAt"]        as string | undefined;

    if (!itemId)    { res.status(400).json({ ok: false, error: "itemId là bắt buộc." }); return; }
    if (!itemName)  { res.status(400).json({ ok: false, error: "itemName là bắt buộc." }); return; }
    if (!category || !VALID_CATEGORIES.includes(category as ItemCategory)) {
      res.status(400).json({ ok: false, error: `category không hợp lệ. Giá trị: ${VALID_CATEGORIES.join(", ")}` }); return;
    }
    if (!rarity || !VALID_RARITIES.includes(rarity as ItemRarity)) {
      res.status(400).json({ ok: false, error: `rarity không hợp lệ. Giá trị: ${VALID_RARITIES.join(", ")}` }); return;
    }
    if (isNaN(startingPrice) || startingPrice <= 0) {
      res.status(400).json({ ok: false, error: "startingPrice phải lớn hơn 0." }); return;
    }
    if (!currency || !VALID_CURRENCIES.includes(currency as MarketplaceCurrency)) {
      res.status(400).json({ ok: false, error: `currency không hợp lệ. Giá trị: ${VALID_CURRENCIES.join(", ")}` }); return;
    }
    if (!endsAt) { res.status(400).json({ ok: false, error: "endsAt là bắt buộc (ISO 8601)." }); return; }

    const auction = await marketplaceService.createAuction({
      sellerId,
      itemId,
      itemName,
      category:      category      as ItemCategory,
      rarity:        rarity        as ItemRarity,
      startingPrice,
      currency:      currency      as MarketplaceCurrency,
      endsAt,
    });

    res.status(201).json({ ok: true, data: auction });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.createAuction: ${msg}`);
    res.status(400).json({ ok: false, error: msg });
  }
}

export async function handleCancelAuction(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const auction = await marketplaceService.cancelAuction(id);
    res.json({ ok: true, data: auction, message: "Phiên đấu giá đã bị hủy." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.cancelAuction: ${msg}`);
    const status = msg.includes("không tìm thấy") ? 404
      : msg.includes("không thể hủy") ? 400
      : 500;
    res.status(status).json({ ok: false, error: msg });
  }
}

export async function handleCompleteAuction(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const result = await marketplaceService.completeAuction(id);
    res.json({ ok: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.completeAuction: ${msg}`);
    const status = msg.includes("không tìm thấy") ? 404
      : msg.includes("không thể hoàn tất") ? 400
      : 500;
    res.status(status).json({ ok: false, error: msg });
  }
}

export async function handleSettleExpiredAuctions(req: Request, res: Response): Promise<void> {
  try {
    const summary = await marketplaceService.settleExpiredAuctions();
    res.json({ ok: true, ...summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.settleExpiredAuctions: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể thanh toán các phiên đấu giá đã hết hạn." });
  }
}

export async function handlePlaceBid(req: Request, res: Response): Promise<void> {
  try {
    const auctionId = req.params["id"] as string;
    const bidderId  = await resolveUserId(req);
    const body = req.body as Record<string, unknown>;

    const amount = body["amount"] != null ? Number(body["amount"]) : NaN;

    if (isNaN(amount) || amount <= 0) {
      res.status(400).json({ ok: false, error: "amount phải lớn hơn 0." }); return;
    }

    const result = await marketplaceService.placeBid(auctionId, { bidderId, amount });
    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.placeBid: ${msg}`);
    const status = msg.includes("không tìm thấy") ? 404 : 400;
    res.status(status).json({ ok: false, error: msg });
  }
}
