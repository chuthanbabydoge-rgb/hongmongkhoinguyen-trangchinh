import { type Request, type Response } from "express";
import { marketplaceService } from "../container";
import type {
  ListingStatus,
  AuctionStatus,
  MarketplaceCurrency,
  ItemCategory,
  ItemRarity,
} from "../repositories/marketplaceRepository";

const MOCK_USER_ID = "72e296a9-cbff-496f-8c9c-65de33c9b930";

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
    const body = req.body as Record<string, unknown>;

    const sellerId  = (body["sellerId"]  as string | undefined) ?? MOCK_USER_ID;
    const itemId    = body["itemId"]   as string | undefined;
    const itemName  = body["itemName"] as string | undefined;
    const category  = body["category"] as string | undefined;
    const rarity    = body["rarity"]   as string | undefined;
    const price     = body["price"]    != null ? Number(body["price"]) : NaN;
    const currency  = body["currency"] as string | undefined;
    const expiresAt = body["expiresAt"] as string | undefined;

    if (!itemId)    { res.status(400).json({ ok: false, error: "itemId là bắt buộc." }); return; }
    if (!itemName)  { res.status(400).json({ ok: false, error: "itemName là bắt buộc." }); return; }
    if (!category || !VALID_CATEGORIES.includes(category as ItemCategory)) {
      res.status(400).json({ ok: false, error: `category không hợp lệ. Giá trị: ${VALID_CATEGORIES.join(", ")}` }); return;
    }
    if (!rarity || !VALID_RARITIES.includes(rarity as ItemRarity)) {
      res.status(400).json({ ok: false, error: `rarity không hợp lệ. Giá trị: ${VALID_RARITIES.join(", ")}` }); return;
    }
    if (isNaN(price) || price <= 0) { res.status(400).json({ ok: false, error: "price phải lớn hơn 0." }); return; }
    if (!currency || !VALID_CURRENCIES.includes(currency as MarketplaceCurrency)) {
      res.status(400).json({ ok: false, error: `currency không hợp lệ. Giá trị: ${VALID_CURRENCIES.join(", ")}` }); return;
    }

    const listing = await marketplaceService.createListing({
      sellerId,
      itemId,
      itemName,
      category:  category  as ItemCategory,
      rarity:    rarity    as ItemRarity,
      price,
      currency:  currency  as MarketplaceCurrency,
      expiresAt,
    });

    res.status(201).json({ ok: true, data: listing });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.createListing: ${msg}`);
    const httpStatus = msg.includes("không sở hữu") || msg.includes("không tồn tại") ? 403 : 500;
    res.status(httpStatus).json({ ok: false, error: msg });
  }
}

export async function handleDeleteListing(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    await marketplaceService.deleteListing(id);
    res.json({ ok: true, message: "Niêm yết đã được xoá." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.deleteListing: ${msg}`);
    const status = msg.includes("không tìm thấy") ? 404 : 500;
    res.status(status).json({ ok: false, error: msg });
  }
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export async function handlePurchaseListing(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const body = req.body as Record<string, unknown>;

    const buyerId = (body["buyerId"] as string | undefined) ?? MOCK_USER_ID;

    const result = await marketplaceService.purchaseListing(id, { buyerId });
    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.purchaseListing: ${msg}`);
    const httpStatus = msg.includes("không tìm thấy") ? 404
      : msg.includes("không còn hoạt động") || msg.includes("không thể mua") ? 400
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
    const body = req.body as Record<string, unknown>;

    const sellerId      = (body["sellerId"] as string | undefined) ?? MOCK_USER_ID;
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
    const body = req.body as Record<string, unknown>;

    const bidderId = (body["bidderId"] as string | undefined) ?? MOCK_USER_ID;
    const amount   = body["amount"] != null ? Number(body["amount"]) : NaN;

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
