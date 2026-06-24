import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  CURRENCY_BALANCES,
  TRANSACTIONS,
  REWARDS,
  ANALYTICS_WEEKLY,
  ANALYTICS_MONTHLY,
  DISTRIBUTION_DATA,
  MONTHLY_FLOW,
  type CurrencyBalance,
  type Transaction,
  type Reward,
  type AnalyticPoint,
  type MonthlyFlow,
} from "@/lib/walletMockData";

// ─── API helpers ─────────────────────────────────────────────────────────────

const API = "/api/wallet";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json() as { ok: boolean; data: T; error?: string };
  if (!json.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.data;
}

// ─── Mapping from API → local types ──────────────────────────────────────────

interface ApiBalance {
  type: string;
  amount: number;
}

interface ApiTransaction {
  id: string;
  walletType: string;
  amount: number;
  direction: "credit" | "debit";
  description: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  reference?: string;
}

const toApiWalletType = (c: Transaction["currency"]): string =>
  c === "points" ? "rewardPoints" : c;

const fromApiWalletType = (t: string): Transaction["currency"] =>
  (t === "rewardPoints" ? "points" : t) as Transaction["currency"];

const CURRENCY_LABEL_VI: Record<string, string> = {
  credits:      "Tín dụng",
  coins:        "Xu",
  tokens:       "Token",
  rewardPoints: "Điểm thưởng",
};

function mergeBalance(apiBalances: ApiBalance[]): CurrencyBalance[] {
  return CURRENCY_BALANCES.map((mock) => {
    const apiType = toApiWalletType(mock.id as Transaction["currency"]);
    const api = apiBalances.find((b) => b.type === apiType);
    return api ? { ...mock, balance: api.amount } : mock;
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function apiTxToLocal(tx: ApiTransaction): Transaction {
  const isCredit  = tx.direction === "credit";
  const currency  = fromApiWalletType(tx.walletType);
  return {
    id:            tx.id,
    date:          formatDate(tx.createdAt),
    type:          isCredit ? "receive" : "send",
    typeLabel:     isCredit ? "Nhận" : "Gửi",
    amount:        isCredit ? tx.amount : -tx.amount,
    currency,
    currencyLabel: CURRENCY_LABEL_VI[tx.walletType] ?? tx.walletType,
    status:        tx.status,
    note:          tx.description,
    ...(tx.reference ? { from: tx.reference } : {}),
  };
}

// ─── Context types ────────────────────────────────────────────────────────────

interface WalletState {
  balances: CurrencyBalance[];
  transactions: Transaction[];
  rewards: Reward[];
  analyticsWeekly: AnalyticPoint[];
  analyticsMonthly: AnalyticPoint[];
  distributionData: typeof DISTRIBUTION_DATA;
  monthlyFlow: MonthlyFlow[];
  isLoading: boolean;
  error: string | null;
}

interface WalletActions {
  getBalance: (id: string) => CurrencyBalance | undefined;
  getTransactions: (currency?: Transaction["currency"]) => Transaction[];
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => void;
  claimReward: (rewardId: string) => void;
  refreshWallet: () => Promise<void>;
}

export type WalletContextValue = WalletState & WalletActions;

const WalletContext = createContext<WalletContextValue | null>(null);
WalletContext.displayName = "WalletContext";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balances, setBalances]         = useState<CurrencyBalance[]>(CURRENCY_BALANCES);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);
  const [rewards, setRewards]           = useState<Reward[]>(REWARDS);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [apiBalances, apiTransactions] = await Promise.all([
        apiFetch<ApiBalance[]>("/balance"),
        apiFetch<ApiTransaction[]>("/transactions"),
      ]);
      setBalances(mergeBalance(apiBalances));
      setTransactions(apiTransactions.map(apiTxToLocal));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải ví");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchWallet(); }, [fetchWallet]);

  const getBalance = useCallback(
    (id: string) => balances.find((b) => b.id === id),
    [balances],
  );

  const getTransactions = useCallback(
    (currency?: Transaction["currency"]) =>
      currency ? transactions.filter((t) => t.currency === currency) : transactions,
    [transactions],
  );

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id" | "date">) => {
      const isOutgoing = ["send", "purchase", "convert"].includes(tx.type);
      const direction  = isOutgoing ? "debit" : "credit";
      const walletType = toApiWalletType(tx.currency);
      const amount     = Math.abs(tx.amount);

      apiFetch<unknown>("/transaction", {
        method: "POST",
        body: JSON.stringify({ walletType, direction, amount, description: tx.note, status: tx.status }),
      })
        .then(() => fetchWallet())
        .catch((err) => {
          console.error("addTransaction failed:", err);
          setError(err instanceof Error ? err.message : "Tạo giao dịch thất bại");
        });
    },
    [fetchWallet],
  );

  const claimReward = useCallback((rewardId: string) => {
    setRewards((prev) =>
      prev.map((r) => r.id === rewardId ? { ...r, claimed: true, points: r.maxPoints } : r),
    );
  }, []);

  const refreshWallet = useCallback(async () => {
    await fetchWallet();
  }, [fetchWallet]);

  const value = useMemo<WalletContextValue>(
    () => ({
      balances, transactions, rewards,
      analyticsWeekly:  ANALYTICS_WEEKLY,
      analyticsMonthly: ANALYTICS_MONTHLY,
      distributionData: DISTRIBUTION_DATA,
      monthlyFlow:      MONTHLY_FLOW,
      isLoading, error,
      getBalance, getTransactions, addTransaction, claimReward, refreshWallet,
    }),
    [balances, transactions, rewards, isLoading, error,
     getBalance, getTransactions, addTransaction, claimReward, refreshWallet],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet phải được dùng trong <WalletProvider>");
  return ctx;
}

export { WalletContext };
