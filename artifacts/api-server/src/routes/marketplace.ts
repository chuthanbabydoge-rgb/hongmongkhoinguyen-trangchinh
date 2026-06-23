import { Router, type IRouter } from "express";
import {
  handleGetStats,
  handleGetListings,
  handleGetListing,
  handleCreateListing,
  handleDeleteListing,
  handlePurchaseListing,
  handleGetTransactions,
  handleGetAuctions,
  handleCreateAuction,
  handleCancelAuction,
  handleCompleteAuction,
  handleSettleExpiredAuctions,
  handlePlaceBid,
} from "../controllers/marketplaceController";
import {
  handleGetPayments,
  handleGetPayment,
} from "../controllers/marketplacePaymentController";
import { handleGetTreasury } from "../controllers/marketplaceTreasuryController";
import {
  handleGetStatsDashboard,
  handleGetTopSellers,
  handleGetTopBuyers,
  handleGetTopItems,
} from "../controllers/marketplaceStatsController";

const router: IRouter = Router();

// ─── Stats dashboard (V1.6 — replaces basic stats, superset response) ─────────
router.get("/marketplace/stats/top-sellers", handleGetTopSellers);
router.get("/marketplace/stats/top-buyers",  handleGetTopBuyers);
router.get("/marketplace/stats/top-items",   handleGetTopItems);
router.get("/marketplace/stats",             handleGetStatsDashboard);

// ─── Listings ─────────────────────────────────────────────────────────────────
router.get(    "/marketplace/listings",             handleGetListings);
router.post(   "/marketplace/listings",             handleCreateListing);
router.get(    "/marketplace/listings/:id",         handleGetListing);
router.delete( "/marketplace/listings/:id",         handleDeleteListing);
router.post(   "/marketplace/listings/:id/purchase", handlePurchaseListing);

// ─── Transactions ─────────────────────────────────────────────────────────────
router.get("/marketplace/transactions", handleGetTransactions);

// ─── Auctions ─────────────────────────────────────────────────────────────────
router.get(    "/marketplace/auctions",                        handleGetAuctions);
router.post(   "/marketplace/auctions",                        handleCreateAuction);
router.post(   "/marketplace/auctions/settle-expired",         handleSettleExpiredAuctions);
router.delete( "/marketplace/auctions/:id",                    handleCancelAuction);
router.post(   "/marketplace/auctions/:id/complete",           handleCompleteAuction);
router.post(   "/marketplace/auctions/:id/bid",                handlePlaceBid);

// ─── Payment history ──────────────────────────────────────────────────────────
router.get("/marketplace/payments",     handleGetPayments);
router.get("/marketplace/payments/:id", handleGetPayment);

// ─── Treasury ─────────────────────────────────────────────────────────────────
router.get("/marketplace/treasury", handleGetTreasury);

export default router;
