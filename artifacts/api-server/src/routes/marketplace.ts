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
import {
  handleGetNotifications,
  handleGetUnread,
  handleGetUnreadCount,
  handleMarkAllAsRead,
  handleMarkAsRead,
  handleDeleteNotification,
} from "../controllers/marketplaceNotificationController";
import {
  handleAddWatchlist,
  handleRemoveWatchlist,
  handleGetWatchlist,
  handleGetWatchlistCount,
  handleGetPriceDrops,
  handleCheckPrice,
  handleRunPriceCheck,
} from "../controllers/marketplaceWatchlistController";
import {
  handleRate,
  handleGetReputation,
  handleGetTopSellers as handleGetReputationTopSellers,
} from "../controllers/marketplaceReputationController";
import {
  handleCreateSavedSearch,
  handleListSavedSearches,
  handleGetSavedSearch,
  handleUpdateSavedSearch,
  handleDeleteSavedSearch,
  handleRunScan,
} from "../controllers/marketplaceSavedSearchController";

const router: IRouter = Router();

// ─── Stats dashboard (V1.6 — replaces basic stats, superset response) ─────────
router.get("/marketplace/stats/top-sellers", handleGetTopSellers);
router.get("/marketplace/stats/top-buyers",  handleGetTopBuyers);
router.get("/marketplace/stats/top-items",   handleGetTopItems);
router.get("/marketplace/stats",             handleGetStatsDashboard);

// ─── Listings ─────────────────────────────────────────────────────────────────
router.get(    "/marketplace/listings",              handleGetListings);
router.post(   "/marketplace/listings",              handleCreateListing);
router.get(    "/marketplace/listings/:id",          handleGetListing);
router.delete( "/marketplace/listings/:id",          handleDeleteListing);
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

// ─── Notifications (V1.7) ─────────────────────────────────────────────────────
// Note: static sub-paths (unread, count, read-all) must precede /:id patterns.
router.get(   "/marketplace/notifications",            handleGetNotifications);
router.get(   "/marketplace/notifications/unread",     handleGetUnread);
router.get(   "/marketplace/notifications/count",      handleGetUnreadCount);
router.patch( "/marketplace/notifications/read-all",   handleMarkAllAsRead);
router.patch( "/marketplace/notifications/:id/read",   handleMarkAsRead);
router.delete("/marketplace/notifications/:id",        handleDeleteNotification);

// ─── Reputation (V2.4) ────────────────────────────────────────────────────────
// Note: static sub-path (top-sellers) must precede /:userId.
router.post("/marketplace/reputation/rate",         handleRate);
router.get( "/marketplace/reputation/top-sellers",  handleGetReputationTopSellers);
router.get( "/marketplace/reputation/:userId",      handleGetReputation);

// ─── Saved Searches (V2.3) ────────────────────────────────────────────────────
// Note: static sub-paths (run-scan) must precede /:id to avoid routing conflicts.
router.post(  "/marketplace/saved-searches",           handleCreateSavedSearch);
router.get(   "/marketplace/saved-searches",           handleListSavedSearches);
router.post(  "/marketplace/saved-searches/run-scan",  handleRunScan);
router.get(   "/marketplace/saved-searches/:id",       handleGetSavedSearch);
router.patch( "/marketplace/saved-searches/:id",       handleUpdateSavedSearch);
router.delete("/marketplace/saved-searches/:id",       handleDeleteSavedSearch);

// ─── Watchlist (V2.1 / V2.2) ──────────────────────────────────────────────────
// Note: all static sub-paths must precede /:id to avoid routing conflicts.
router.get(   "/marketplace/watchlist",                   handleGetWatchlist);
router.get(   "/marketplace/watchlist/count",             handleGetWatchlistCount);
router.get(   "/marketplace/watchlist/price-drops",       handleGetPriceDrops);
router.post(  "/marketplace/watchlist",                   handleAddWatchlist);
router.post(  "/marketplace/watchlist/run-price-check",   handleRunPriceCheck);
router.post(  "/marketplace/watchlist/:id/check-price",   handleCheckPrice);
router.delete("/marketplace/watchlist/:id",               handleRemoveWatchlist);

export default router;
