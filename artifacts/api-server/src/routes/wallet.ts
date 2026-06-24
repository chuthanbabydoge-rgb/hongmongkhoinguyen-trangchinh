import { Router, type IRouter } from "express";
import {
  handleGetWalletMe,
  handleGetBalance,
  handleGetWallet,
  handleGetTransactions,
  handleTransfer,
} from "../controllers/walletController";

const router: IRouter = Router();

// GET  /api/wallet/me           — thông tin ví của user hiện tại
// GET  /api/wallet/balance      — số dư theo định dạng frontend
// GET  /api/wallet              — thông tin ví (raw WalletData)
// GET  /api/wallet/transactions — lịch sử giao dịch
// POST /api/wallet/transfer     — chuyển giữa các loại ví
router.get("/wallet/me",           handleGetWalletMe);
router.get("/wallet/balance",      handleGetBalance);
router.get("/wallet",              handleGetWallet);
router.get("/wallet/transactions", handleGetTransactions);
router.post("/wallet/transfer",    handleTransfer);

export default router;
