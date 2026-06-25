import { type Request, type Response } from "express";
import { walletService, accountBridgeService } from "../container";
import type { EntryDirection, EntryStatus } from "../services/walletService";
import { AccountUnauthorizedError, AccountServiceUnavailableError } from "../services/accountClient";

function extractUserIdFromJwt(authHeader: string): string | null {
  try {
    const token  = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    const parts  = token.split(".");
    if (parts.length !== 3) return null;
    const raw    = Buffer.from(parts[1]!, "base64url").toString("utf8");
    const payload = JSON.parse(raw) as Record<string, unknown>;
    const id      = payload["sub"] ?? payload["userId"] ?? payload["id"];
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

async function resolveUserId(req: Request): Promise<string> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth || !auth.startsWith("Bearer ")) throw Object.assign(new Error("Chưa xác thực."), { status: 401 });
  const jwtUserId = extractUserIdFromJwt(auth);
  if (jwtUserId) return jwtUserId;
  const profile = await accountBridgeService.getProfileCached(auth);
  return profile.userId || profile.id;
}

function handleAuthError(res: Response, err: unknown): boolean {
  if (err instanceof AccountUnauthorizedError || (err as { status?: number }).status === 401) {
    res.status(401).json({ ok: false, error: "Chưa xác thực. Vui lòng đăng nhập." });
    return true;
  }
  if (err instanceof AccountServiceUnavailableError) {
    res.status(503).json({ ok: false, error: "Không thể kết nối Account service." });
    return true;
  }
  return false;
}

const BALANCE_META: Record<string, { label: string; symbol: string; color: string }> = {
  credits:      { label: "Credits",       symbol: "CR",  color: "#6366f1" },
  coins:        { label: "Coins",         symbol: "C",   color: "#f59e0b" },
  tokens:       { label: "Tokens",        symbol: "TKN", color: "#10b981" },
  rewardPoints: { label: "Reward Points", symbol: "PTS", color: "#ec4899" },
};

export async function handleGetWalletMe(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    const wallet = await walletService.getWallet(userId);
    res.json({ ok: true, data: wallet });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController.me error: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải thông tin ví.", detail: msg });
  }
}

export async function handleGetBalance(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    const wallet = await walletService.getWallet(userId);
    const balances = [
      { type: "credits",      amount: wallet.credits,      ...BALANCE_META["credits"] },
      { type: "coins",        amount: wallet.coins,        ...BALANCE_META["coins"] },
      { type: "tokens",       amount: wallet.tokens,       ...BALANCE_META["tokens"] },
      { type: "rewardPoints", amount: wallet.rewardPoints, ...BALANCE_META["rewardPoints"] },
    ];
    res.json({ ok: true, data: balances });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController.balance error: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải số dư ví.", detail: msg });
  }
}

export async function handleGetWallet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    const wallet = await walletService.getWallet(userId);
    res.json({ ok: true, data: wallet });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController error: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải thông tin ví.", detail: msg });
  }
}

export async function handleGetTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 50;
    const walletType = req.query["walletType"] as string | undefined;
    const transactions = await walletService.getTransactions(userId, limit, walletType);
    res.json({ ok: true, data: transactions, total: transactions.length });
  } catch (err) {
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController error: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải lịch sử giao dịch.", detail: msg });
  }
}

export async function handleCreateTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
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
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController.createTransaction error: ${msg}`);
    res.status(500).json({ ok: false, error: msg });
  }
}

export async function handleTransfer(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
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
    if (handleAuthError(res, err)) return;
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `walletController.transfer error: ${msg}`);
    res.status(err instanceof Error && msg.includes("Số dư") ? 400 : 500).json({
      ok: false, error: msg,
    });
  }
}
