import {
  createContext,
  useContext,
  useState,
  useCallback,
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

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balances, setBalances] = useState<CurrencyBalance[]>(CURRENCY_BALANCES);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);
  const [rewards, setRewards] = useState<Reward[]>(REWARDS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBalance = useCallback(
    (id: string) => balances.find((b) => b.id === id),
    [balances]
  );

  const getTransactions = useCallback(
    (currency?: Transaction["currency"]) =>
      currency ? transactions.filter((t) => t.currency === currency) : transactions,
    [transactions]
  );

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id" | "date">) => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const newTx: Transaction = {
        ...tx,
        id: `TX-${Date.now()}`,
        date: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      if (newTx.status === "completed") {
        setBalances((prev) =>
          prev.map((b) =>
            b.id === newTx.currency
              ? { ...b, balance: b.balance + newTx.amount }
              : b
          )
        );
      }
    },
    []
  );

  const claimReward = useCallback((rewardId: string) => {
    setRewards((prev) =>
      prev.map((r) =>
        r.id === rewardId ? { ...r, claimed: true, points: r.maxPoints } : r
      )
    );
  }, []);

  const refreshWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setBalances(CURRENCY_BALANCES);
      setTransactions(TRANSACTIONS);
      setRewards(REWARDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi làm mới ví");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      balances,
      transactions,
      rewards,
      analyticsWeekly: ANALYTICS_WEEKLY,
      analyticsMonthly: ANALYTICS_MONTHLY,
      distributionData: DISTRIBUTION_DATA,
      monthlyFlow: MONTHLY_FLOW,
      isLoading,
      error,
      getBalance,
      getTransactions,
      addTransaction,
      claimReward,
      refreshWallet,
    }),
    [
      balances, transactions, rewards, isLoading, error,
      getBalance, getTransactions, addTransaction, claimReward, refreshWallet,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet phải được dùng trong <WalletProvider>");
  return ctx;
}

export { WalletContext };
