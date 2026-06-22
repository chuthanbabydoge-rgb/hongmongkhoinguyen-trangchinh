import { Router, type IRouter } from "express";
import {
  handleGetMarketplace,
  handleGetListings,
  handleGetAuctions,
  handleGetTrades,
} from "../controllers/marketplaceController";

const router: IRouter = Router();

// GET /api/marketplace                           — full snapshot
// GET /api/marketplace/listings?status=active
// GET /api/marketplace/auctions?status=live
// GET /api/marketplace/trades
router.get("/marketplace", handleGetMarketplace);
router.get("/marketplace/listings", handleGetListings);
router.get("/marketplace/auctions", handleGetAuctions);
router.get("/marketplace/trades", handleGetTrades);

export default router;
