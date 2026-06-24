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
  REWARDS,
  type CurrencyBalance,
  type Transaction,
  type Reward,
  type AnalyticPoint,
  type MonthlyFlow,
} from "@/lib/walletMockData";
import { apiFetch as apiFetchAuth, ApiError } from "@/lib/apiClient";

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

// ─── Analytics helpers ────────────────────────────────────────────────────────

function parseTxDate(dateStr: string): number {
  const m = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return 0;
  return new Date(
    parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]),
    parseInt(m[4]), parseInt(m[5]),
  ).getTime();
}

function buildWeeklyAnalytics(
  balances: CurrencyBalance[],
  transactions: Transaction[],
): AnalyticPoint[] {
  const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const now = new Date();

  let cr = balances.find((b) => b.id === "credits")?.balance ?? 0;
  let co = balances.find((b) => b.id === "coins")?.balance   ?? 0;
  let tk = balances.find((b) => b.id === "tokens")?.balance  ?? 0;
  let pt = balances.find((b) => b.id === "points")?.balance  ?? 0;

  const result: AnalyticPoint[] = [];

  for (let i = 0; i <= 6; i++) {
    const d         = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayStart  = d.getTime();
    const dayEnd    = dayStart + 86_400_000;
    const dayTxs    = transactions.filter((tx) => {
      const t = parseTxDate(tx.date);
      return t >= dayStart && t < dayEnd;
    });
    const vol = dayTxs.reduce((s, t) => s + Math.abs(t.amount), 0);

    result.push({
      label:   DAY_LABELS[d.getDay()],
      credits: Math.max(0, cr),
      coins:   Math.max(0, co),
      tokens:  Math.max(0, tk),
      points:  Math.max(0, pt),
      volume:  vol,
    });

    for (const tx of dayTxs) {
      if (tx.currency === "credits") cr -= tx.amount;
      else if (tx.currency === "coins")   co -= tx.amount;
      else if (tx.currency === "tokens")  tk -= tx.amount;
      else if (tx.currency === "points")  pt -= tx.amount;
    }
  }

  return result.reverse();
}

function buildMonthlyAnalytics(
  balances: CurrencyBalance[],
  transactions: Transaction[],
): AnalyticPoint[] {
  const MONTH_LABELS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
  const now = new Date();

  let cr = balances.find((b) => b.id === "credits")?.balance ?? 0;
  let co = balances.find((b) => b.id === "coins")?.balance   ?? 0;
  let tk = balances.find((b) => b.id === "tokens")?.balance  ?? 0;
  let pt = balances.find((b) => b.id === "points")?.balance  ?? 0;

  const result: AnalyticPoint[] = [];

  for (let i = 0; i <= 5; i++) {
    const d         = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthTxs  = transactions.filter((tx) => {
      const t = parseTxDate(tx.date);
      return t >= d.getTime() && t < nextMonth.getTime();
    });
    const vol = monthTxs.reduce((s, t) => s + Math.abs(t.amount), 0);

    result.push({
      label:   MONTH_LABELS[d.getMonth()],
      credits: Math.max(0, cr),
      coins:   Math.max(0, co),
      tokens:  Math.max(0, tk),
      points:  Math.max(0, pt),
      volume:  vol,
    });

    for (const tx of monthTxs) {
      if (tx.currency === "credits") cr -= tx.amount;
      else if (tx.currency === "coins")   co -= tx.amount;
      else if (tx.currency === "tokens")  tk -= tx.amount;
      else if (tx.currency === "points")  pt -= tx.amount;
    }
  }

  return result.reverse();
}

function buildMonthlyFlow(transactions: Transaction[]): MonthlyFlow[] {
  const MONTH_LABELS      = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
  const MONTH_FULL_LABELS = [
    "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
    "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
  ];

  const map = new Map<string, { income: number; expense: number; txCount: number; mi: number; year: string }>();

  for (const tx of transactions) {
    const m = tx.date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!m) continue;
    const key = `${m[3]}-${m[2]}`;
    const mi  = parseInt(m[2]) - 1;
    if (!map.has(key)) map.set(key, { income: 0, expense: 0, txCount: 0, mi, year: m[3] });
    const entry = map.get(key)!;
    if (tx.amount > 0) entry.income += tx.amount;
    else entry.expense += Math.abs(tx.amount);
    entry.txCount++;
  }

  const now = new Date();
  const result: MonthlyFlow[] = [];
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const mi  = d.getMonth();
    const e   = map.get(key) ?? { income: 0, expense: 0, txCount: 0 };
    result.push({
      label:   MONTH_LABELS[mi],
      month:   `${MONTH_FULL_LABELS[mi]}/${d.getFullYear()}`,
      income:  e.income,
      expense: e.expense,
      net:     e.income - e.expense,
      txCount: e.txCount,
    });
  }
  return result;
}

// ─── Context types ────────────────────────────────────────────────────────────

interface WalletState {
  balances: CurrencyBalance[];
  transactions: Transaction[];
  rewards: Reward[];
  analyticsWeekly: AnalyticPoint[];
  analyticsMonthly: AnalyticPoint[];
  distributionData: { name: string; value: number; color: string }[];
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards]           = useState<Reward[]>(REWARDS);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [apiBalances, apiTransactions] = await Promise.all([
        apiFetchAuth<ApiBalance[]>("/wallet/balance"),
        apiFetchAuth<ApiTransaction[]>("/wallet/transactions"),
      ]);
      setBalances(mergeBalance(apiBalances));
      setTransactions(apiTransactions.map(apiTxToLocal));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Vui lòng đăng nhập để xem ví.");
      } else {
        setError(err instanceof Error ? err.message : "Lỗi khi tải ví");
      }
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

      apiFetchAuth<unknown>("/wallet/transaction", {
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

  const analyticsWeekly  = useMemo(() => buildWeeklyAnalytics(balances, transactions),  [balances, transactions]);
  const analyticsMonthly = useMemo(() => buildMonthlyAnalytics(balances, transactions), [balances, transactions]);
  const distributionData = useMemo(
    () => balances.map((b) => ({ name: b.nameVi, value: b.balance, color: b.chartColor })),
    [balances],
  );
  const monthlyFlow = useMemo(() => buildMonthlyFlow(transactions), [transactions]);

  const value = useMemo<WalletContextValue>(
    () => ({
      balances, transactions, rewards,
      analyticsWeekly,
      analyticsMonthly,
      distributionData,
      monthlyFlow,
      isLoading, error,
      getBalance, getTransactions, addTransaction, claimReward, refreshWallet,
    }),
    [balances, transactions, rewards, analyticsWeekly, analyticsMonthly,
     distributionData, monthlyFlow, isLoading, error,
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
