import { Router, type IRouter } from "express";
import {
  handleGetListings,
  handleGetListing,
  handleCreateListing,
  handleDeleteListing,
  handleGetTransactions,
  handleGetAuctions,
  handleCreateAuction,
  handlePlaceBid,
} from "../controllers/marketplaceController";

const router: IRouter = Router();

// ─── Listings ─────────────────────────────────────────────────────────────────
router.get(    "/marketplace/listings",     handleGetListings);
router.post(   "/marketplace/listings",     handleCreateListing);
router.get(    "/marketplace/listings/:id", handleGetListing);
router.delete( "/marketplace/listings/:id", handleDeleteListing);

// ─── Transactions ─────────────────────────────────────────────────────────────
router.get("/marketplace/transactions", handleGetTransactions);

// ─── Auctions ─────────────────────────────────────────────────────────────────
router.get(  "/marketplace/auctions",        handleGetAuctions);
router.post( "/marketplace/auctions",        handleCreateAuction);
router.post( "/marketplace/auctions/:id/bid", handlePlaceBid);

export default router;
