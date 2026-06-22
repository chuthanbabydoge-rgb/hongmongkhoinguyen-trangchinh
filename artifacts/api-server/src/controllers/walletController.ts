import { type Request, type Response } from "express";
import { getWallet, getTransactions } from "../services/walletService";

const MOCK_USER_ID = "user-001";

export async function handleGetWallet(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? MOCK_USER_ID;
    const wallet = await getWallet(userId);
    res.json({ ok: true, data: wallet });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải thông tin ví." });
  }
}

export async function handleGetTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? MOCK_USER_ID;
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 20;
    const transactions = await getTransactions(userId, limit);
    res.json({ ok: true, data: transactions, total: transactions.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải lịch sử giao dịch." });
  }
}
