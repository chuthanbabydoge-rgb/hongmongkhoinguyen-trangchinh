import { Router, type IRouter } from "express";
import {
  handleGetWallet,
  handleGetTransactions,
} from "../controllers/walletController";

const router: IRouter = Router();

// GET /api/wallet
// GET /api/wallet/transactions?limit=20
router.get("/wallet", handleGetWallet);
router.get("/wallet/transactions", handleGetTransactions);

export default router;
