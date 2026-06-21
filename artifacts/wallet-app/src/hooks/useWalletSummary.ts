import { useMemo } from "react";
import { useWallet } from "../context/WalletContext";
import type { WalletType, TransactionDirection } from "../types/wallet";

export function useWalletSummary() {
  const { balances, transactions, rewards } = useWallet();

  return useMemo(() => {
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(
      (t) => t.status === "completed"
    ).length;
    const pendingTransactions = transactions.filter(
      (t) => t.status === "pending"
    ).length;
    const failedTransactions = transactions.filter(
      (t) => t.status === "failed"
    ).length;

    const volumeByWalletType = balances.reduce(
      (acc, balance) => {
        const walletTxns = transactions.filter(
          (t) => t.walletType === balance.type
        );
        acc[balance.type] = walletTxns.reduce((sum, t) => {
          return t.direction === "credit" ? sum + t.amount : sum - t.amount;
        }, 0);
        return acc;
      },
      {} as Record<WalletType, number>
    );

    const recentTransactions = [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    return {
      balances,
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      volumeByWalletType,
      recentTransactions,
      rewards: {
        tier: rewards.tier,
        currentPoints: rewards.currentPoints,
        pointsToNextTier: rewards.pointsToNextTier,
        nextTier: rewards.nextTier,
        availableRewards: rewards.rewards.filter((r) => r.available).length,
      },
    };
  }, [balances, transactions, rewards]);
}

export function useWalletTransactions(
  walletType?: WalletType,
  direction?: TransactionDirection
) {
  const { getTransactions } = useWallet();

  return useMemo(() => {
    const txns = getTransactions(walletType);
    if (!direction) return txns;
    return txns.filter((t) => t.direction === direction);
  }, [getTransactions, walletType, direction]);
}
