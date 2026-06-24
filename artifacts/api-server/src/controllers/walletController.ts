import { type Request, type Response } from "express";
import { walletService } from "../container";
import type { EntryDirection, EntryStatus } from "../services/walletService";

const REAL_USER_ID = "user-001";

const BALANCE_META: Record<string, { label: string; symbol: string; color: string }> = {
  credits:      { label: "Credits",       symbol: "CR",  color: "#6366f1" },
  coins:        { label: "Coins",         symbol: "C",   color: "#f59e0b" },
  tokens:       { label: "Tokens",        symbol: "TKN", color: "#10b981" },
  rewardPoints: { label: "Reward Points", symbol: "PTS", color: "#ec4899" },
};

export async function handleGetWalletMe(req: Request, res: Response): Promise<void> {
  try {
    const userId = REAL_USER_ID;
    const wallet = await walletService.getWallet(userId);
    res.json({ ok: true, data: wallet });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController.me error: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải thông tin ví.", detail: msg });
  }
}

export async function handleGetBalance(req: Request, res: Response): Promise<void> {
  try {
    const userId = REAL_USER_ID;
    const wallet = await walletService.getWallet(userId);
    const balances = [
      { type: "credits",      amount: wallet.credits,      ...BALANCE_META["credits"] },
      { type: "coins",        amount: wallet.coins,        ...BALANCE_META["coins"] },
      { type: "tokens",       amount: wallet.tokens,       ...BALANCE_META["tokens"] },
      { type: "rewardPoints", amount: wallet.rewardPoints, ...BALANCE_META["rewardPoints"] },
    ];
    res.json({ ok: true, data: balances });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController.balance error: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải số dư ví.", detail: msg });
  }
}

export async function handleGetWallet(req: Request, res: Response): Promise<void> {
  try {
    const userId = REAL_USER_ID;
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
    const userId = REAL_USER_ID;
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 50;
    const walletType = req.query["walletType"] as string | undefined;
    const transactions = await walletService.getTransactions(userId, limit, walletType);
    res.json({ ok: true, data: transactions, total: transactions.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController error: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải lịch sử giao dịch.", detail: msg });
  }
}

export async function handleCreateTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = REAL_USER_ID;
    const { walletType, direction, amount, description, status, reference } = req.body as {
      walletType?: string;
      direction?: string;
      amount?: unknown;
      description?: string;
      status?: string;
      reference?: string;
    };

    const VALID_TYPES = ["credits", "coins", "tokens", "rewardPoints"];
    const VALID_DIRS  = ["credit", "debit"];
    const VALID_STATS = ["completed", "pending", "failed"];

    if (!walletType || !VALID_TYPES.includes(walletType)) {
      res.status(400).json({ ok: false, error: `walletType phải là: ${VALID_TYPES.join(", ")}.` });
      return;
    }
    if (!direction || !VALID_DIRS.includes(direction)) {
      res.status(400).json({ ok: false, error: `direction phải là: credit | debit.` });
      return;
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ ok: false, error: "amount phải là số dương." });
      return;
    }
    if (!description?.trim()) {
      res.status(400).json({ ok: false, error: "description là bắt buộc." });
      return;
    }

    const txStatus = (VALID_STATS.includes(status ?? "") ? status : "completed") as EntryStatus;
    const result = await walletService.createEntry(
      userId,
      walletType,
      direction as EntryDirection,
      amount,
      description.trim(),
      txStatus,
      reference,
    );
    res.json({ ok: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController.createTransaction error: ${msg}`);
    res.status(500).json({ ok: false, error: msg });
  }
}

export async function handleTransfer(req: Request, res: Response): Promise<void> {
  try {
    const userId = REAL_USER_ID;
    const { from, to, amount, description } = req.body as {
      from?: string;
      to?: string;
      amount?: unknown;
      description?: string;
    };

    if (!from || !to || !amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ ok: false, error: "Thiếu hoặc sai tham số: from, to, amount (số dương)." });
      return;
    }

    const VALID_TYPES = ["credits", "coins", "tokens", "rewardPoints"];
    if (!VALID_TYPES.includes(from) || !VALID_TYPES.includes(to)) {
      res.status(400).json({ ok: false, error: `Loại ví không hợp lệ. Phải là: ${VALID_TYPES.join(", ")}.` });
      return;
    }

    if (from === to) {
      res.status(400).json({ ok: false, error: "Không thể chuyển cùng loại ví." });
      return;
    }

    const result = await walletService.transfer(userId, from, to, amount, description ?? `Chuyển ${amount} ${from} → ${to}`);
    res.json({ ok: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController.transfer error: ${msg}`);
    res.status(err instanceof Error && msg.includes("Số dư") ? 400 : 500).json({
      ok: false, error: msg,
    });
  }
}
