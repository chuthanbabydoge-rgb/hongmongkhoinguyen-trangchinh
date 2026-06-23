import { type Request, type Response } from "express";
import { walletService } from "../container";

const REAL_USER_ID = "72e296a9-cbff-496f-8c9c-65de33c9b930";

export async function handleGetWallet(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? REAL_USER_ID;
    console.log("[walletController] handleGetWallet userId =", userId);
    const wallet = await walletService.getWallet(userId);
    res.json({ ok: true, data: wallet });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController error: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải thông tin ví.", detail: msg });
  }
}

export async function handleGetTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? REAL_USER_ID;
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 20;
    console.log("[walletController] handleGetTransactions userId =", userId, "limit =", limit);
    const transactions = await walletService.getTransactions(userId, limit);
    res.json({ ok: true, data: transactions, total: transactions.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController error: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải lịch sử giao dịch.", detail: msg });
  }
}
