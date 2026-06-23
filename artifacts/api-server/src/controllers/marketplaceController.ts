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

// ─── Listings ─────────────────────────────────────────────────────────────────

export async function handleGetListings(req: Request, res: Response): Promise<void> {
  try {
    const rawStatus = req.query["status"] as string | undefined;
    const limit     = req.query["limit"] ? Number(req.query["limit"]) : 50;
    const status    = rawStatus && VALID_LISTING_STATUSES.includes(rawStatus as ListingStatus)
      ? (rawStatus as ListingStatus)
      : undefined;

    const listings = await marketplaceService.getListings(status, limit);
    res.json({ ok: true, data: listings, total: listings.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.getListings: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải danh sách niêm yết." });
  }
}

export async function handleGetListing(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
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

    if (!itemId)    { res.status(400).json({ ok: false, error: "itemId requis." }); return; }
    if (!itemName)  { res.status(400).json({ ok: false, error: "itemName requis." }); return; }
    if (!category || !VALID_CATEGORIES.includes(category as ItemCategory)) {
      res.status(400).json({ ok: false, error: `category invalide. Valeurs: ${VALID_CATEGORIES.join(", ")}` }); return;
    }
    if (!rarity || !VALID_RARITIES.includes(rarity as ItemRarity)) {
      res.status(400).json({ ok: false, error: `rarity invalide. Valeurs: ${VALID_RARITIES.join(", ")}` }); return;
    }
    if (isNaN(price) || price <= 0) { res.status(400).json({ ok: false, error: "price doit être > 0." }); return; }
    if (!currency || !VALID_CURRENCIES.includes(currency as MarketplaceCurrency)) {
      res.status(400).json({ ok: false, error: `currency invalide. Valeurs: ${VALID_CURRENCIES.join(", ")}` }); return;
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
    res.status(500).json({ ok: false, error: msg });
  }
}

export async function handleDeleteListing(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await marketplaceService.deleteListing(id);
    res.json({ ok: true, message: "Niêm yết đã được xoá." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.deleteListing: ${msg}`);
    const status = msg.includes("not found") ? 404 : 500;
    res.status(status).json({ ok: false, error: msg });
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
    const rawStatus = req.query["status"] as string | undefined;
    const limit     = req.query["limit"] ? Number(req.query["limit"]) : 50;
    const status    = rawStatus && VALID_AUCTION_STATUSES.includes(rawStatus as AuctionStatus)
      ? (rawStatus as AuctionStatus)
      : undefined;

    const auctions = await marketplaceService.getAuctions(status, limit);
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

    if (!itemId)    { res.status(400).json({ ok: false, error: "itemId requis." }); return; }
    if (!itemName)  { res.status(400).json({ ok: false, error: "itemName requis." }); return; }
    if (!category || !VALID_CATEGORIES.includes(category as ItemCategory)) {
      res.status(400).json({ ok: false, error: `category invalide. Valeurs: ${VALID_CATEGORIES.join(", ")}` }); return;
    }
    if (!rarity || !VALID_RARITIES.includes(rarity as ItemRarity)) {
      res.status(400).json({ ok: false, error: `rarity invalide. Valeurs: ${VALID_RARITIES.join(", ")}` }); return;
    }
    if (isNaN(startingPrice) || startingPrice <= 0) {
      res.status(400).json({ ok: false, error: "startingPrice doit être > 0." }); return;
    }
    if (!currency || !VALID_CURRENCIES.includes(currency as MarketplaceCurrency)) {
      res.status(400).json({ ok: false, error: `currency invalide. Valeurs: ${VALID_CURRENCIES.join(", ")}` }); return;
    }
    if (!endsAt) { res.status(400).json({ ok: false, error: "endsAt requis (ISO 8601)." }); return; }

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

export async function handlePlaceBid(req: Request, res: Response): Promise<void> {
  try {
    const { id: auctionId } = req.params;
    const body = req.body as Record<string, unknown>;

    const bidderId = (body["bidderId"] as string | undefined) ?? MOCK_USER_ID;
    const amount   = body["amount"] != null ? Number(body["amount"]) : NaN;

    if (isNaN(amount) || amount <= 0) {
      res.status(400).json({ ok: false, error: "amount doit être > 0." }); return;
    }

    const result = await marketplaceService.placeBid(auctionId, { bidderId, amount });
    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplaceController.placeBid: ${msg}`);
    const status = msg.includes("not found") ? 404 : 400;
    res.status(status).json({ ok: false, error: msg });
  }
}
