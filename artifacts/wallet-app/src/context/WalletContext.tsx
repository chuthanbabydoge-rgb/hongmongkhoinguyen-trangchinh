import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type {
  WalletContextValue,
  WalletState,
  WalletType,
  Transaction,
  Balance,
  RewardProgram,
} from "../types/wallet";
import { MOCK_REWARDS } from "../data/mockWallet";

const API_BASE = "/api/wallet";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  const json = await res.json() as { ok: boolean; data: T };
  return json.data;
}

function buildInitialRewards(currentPoints = 0): RewardProgram {
  const tier =
    currentPoints >= 15000 ? "gold"
    : currentPoints >= 5000 ? "silver"
    : "bronze";
  const nextTier =
    tier === "gold" ? "platinum" : tier === "silver" ? "gold" : "silver";
  const pointsToNextTier =
    tier === "gold" ? 35000 - currentPoints
    : tier === "silver" ? 15000 - currentPoints
    : 5000 - currentPoints;

  return {
    tier,
    currentPoints,
    pointsToNextTier: Math.max(0, pointsToNextTier),
    nextTier,
    lifetimePoints: currentPoints,
    rewards: MOCK_REWARDS,
  };
}

const WalletContext = createContext<WalletContextValue | null>(null);
WalletContext.displayName = "WalletContext";

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [balances,     setBalances]     = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards,      setRewards]      = useState<RewardProgram>(buildInitialRewards(0));
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [balanceData, txData] = await Promise.all([
        apiFetch<Balance[]>("/balance"),
        apiFetch<Transaction[]>("/transactions"),
      ]);
      setBalances(balanceData);
      setTransactions(txData);

      const rpBalance = balanceData.find((b) => b.type === "rewardPoints");
      if (rpBalance) {
        setRewards(buildInitialRewards(rpBalance.amount));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWallet();
  }, [fetchWallet]);

  const getBalance = useCallback(
    (type: WalletType): Balance | undefined => balances.find((b) => b.type === type),
    [balances],
  );

  const getTransactions = useCallback(
    (type?: WalletType): Transaction[] => {
      if (!type) return transactions;
      return transactions.filter((t) => t.walletType === type);
    },
    [transactions],
  );

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, "id" | "createdAt">) => {
      const newTransaction: Transaction = {
        ...transaction,
        id:        `txn_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      if (newTransaction.status === "completed") {
        setBalances((prev) =>
          prev.map((balance) => {
            if (balance.type !== newTransaction.walletType) return balance;
            const delta =
              newTransaction.direction === "credit"
                ? newTransaction.amount
                : -newTransaction.amount;
            return { ...balance, amount: balance.amount + delta };
          }),
        );
      }
    },
    [],
  );

  const transfer = useCallback(
    async (from: WalletType, to: WalletType, amount: number, description?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await apiFetch("/transfer", {
          method: "POST",
          body:   JSON.stringify({ from, to, amount, description }),
        });
        await fetchWallet();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transfer failed";
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchWallet],
  );

  const redeemReward = useCallback(
    (rewardId: string): boolean => {
      const reward = rewards.rewards.find((r) => r.id === rewardId);
      if (!reward || !reward.available) return false;
      if (rewards.currentPoints < reward.pointsCost) return false;

      const newPoints = rewards.currentPoints - reward.pointsCost;
      setRewards(buildInitialRewards(newPoints));
      setRewards((prev) => ({
        ...prev,
        rewards: prev.rewards.map((r) =>
          r.id === rewardId ? { ...r, available: false } : r,
        ),
      }));

      addTransaction({
        walletType:  "rewardPoints",
        amount:      reward.pointsCost,
        direction:   "debit",
        description: `Reward redeemed: ${reward.title}`,
        status:      "completed",
        reference:   `REDEEM-${rewardId.toUpperCase()}`,
      });

      return true;
    },
    [rewards, addTransaction],
  );

  const refreshWallet = useCallback(async (): Promise<void> => {
    await fetchWallet();
  }, [fetchWallet]);

  const state: WalletState = useMemo(
    () => ({ balances, transactions, rewards, isLoading, error }),
    [balances, transactions, rewards, isLoading, error],
  );

  const value: WalletContextValue = useMemo(
    () => ({
      ...state,
      getBalance,
      getTransactions,
      addTransaction,
      transfer,
      redeemReward,
      refreshWallet,
    }),
    [state, getBalance, getTransactions, addTransaction, transfer, redeemReward, refreshWallet],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside <WalletProvider>");
  }
  return context;
}

export { WalletContext };
