import {
  createContext,
  useContext,
  useState,
  useCallback,
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
import {
  MOCK_BALANCES,
  MOCK_TRANSACTIONS,
  MOCK_REWARD_PROGRAM,
} from "../data/mockWallet";

const WalletContext = createContext<WalletContextValue | null>(null);

WalletContext.displayName = "WalletContext";

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [balances, setBalances] = useState<Balance[]>(MOCK_BALANCES);
  const [transactions, setTransactions] =
    useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [rewards, setRewards] = useState<RewardProgram>(MOCK_REWARD_PROGRAM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBalance = useCallback(
    (type: WalletType): Balance | undefined =>
      balances.find((b) => b.type === type),
    [balances]
  );

  const getTransactions = useCallback(
    (type?: WalletType): Transaction[] => {
      if (!type) return transactions;
      return transactions.filter((t) => t.walletType === type);
    },
    [transactions]
  );

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, "id" | "createdAt">) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: `txn_${Date.now()}`,
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
          })
        );
      }
    },
    []
  );

  const redeemReward = useCallback(
    (rewardId: string): boolean => {
      const reward = rewards.rewards.find((r) => r.id === rewardId);

      if (!reward || !reward.available) return false;
      if (rewards.currentPoints < reward.pointsCost) return false;

      setRewards((prev) => ({
        ...prev,
        currentPoints: prev.currentPoints - reward.pointsCost,
        rewards: prev.rewards.map((r) =>
          r.id === rewardId ? { ...r, available: false } : r
        ),
      }));

      addTransaction({
        walletType: "rewardPoints",
        amount: reward.pointsCost,
        direction: "debit",
        description: `Reward redeemed: ${reward.title}`,
        status: "completed",
        reference: `REDEEM-${rewardId.toUpperCase()}`,
      });

      return true;
    },
    [rewards, addTransaction]
  );

  const refreshWallet = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setBalances(MOCK_BALANCES);
      setTransactions(MOCK_TRANSACTIONS);
      setRewards(MOCK_REWARD_PROGRAM);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh wallet"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const state: WalletState = useMemo(
    () => ({ balances, transactions, rewards, isLoading, error }),
    [balances, transactions, rewards, isLoading, error]
  );

  const value: WalletContextValue = useMemo(
    () => ({
      ...state,
      getBalance,
      getTransactions,
      addTransaction,
      redeemReward,
      refreshWallet,
    }),
    [state, getBalance, getTransactions, addTransaction, redeemReward, refreshWallet]
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
