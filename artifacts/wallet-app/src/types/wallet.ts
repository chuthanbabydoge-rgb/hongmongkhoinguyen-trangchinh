export type WalletType = "credits" | "coins" | "tokens" | "rewardPoints";

export interface Balance {
  type: WalletType;
  amount: number;
  label: string;
  symbol: string;
  color: string;
}

export type TransactionStatus = "completed" | "pending" | "failed";
export type TransactionDirection = "credit" | "debit";

export interface Transaction {
  id: string;
  walletType: WalletType;
  amount: number;
  direction: TransactionDirection;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  reference?: string;
}

export type RewardTier = "bronze" | "silver" | "gold" | "platinum";

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  available: boolean;
  expiresAt?: string;
}

export interface RewardProgram {
  tier: RewardTier;
  currentPoints: number;
  pointsToNextTier: number;
  nextTier: RewardTier | null;
  lifetimePoints: number;
  rewards: Reward[];
}

export interface WalletState {
  balances: Balance[];
  transactions: Transaction[];
  rewards: RewardProgram;
  isLoading: boolean;
  error: string | null;
}

export interface WalletActions {
  getBalance: (type: WalletType) => Balance | undefined;
  getTransactions: (type?: WalletType) => Transaction[];
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => void;
  redeemReward: (rewardId: string) => boolean;
  refreshWallet: () => Promise<void>;
}

export type WalletContextValue = WalletState & WalletActions;
