// ─────────────────────────────────────────────────────────────────────────────
// Wallet data types
// ─────────────────────────────────────────────────────────────────────────────

export type Currency = "credits" | "coins" | "tokens" | "rewardPoints";
export type TransactionDirection = "credit" | "debit";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  walletType: Currency;
  amount: number;
  direction: TransactionDirection;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  reference?: string;
}

export interface WalletData {
  userId: string;
  credits: number;
  coins: number;
  tokens: number;
  rewardPoints: number;
  weeklyChangePercent: number;
}

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-001",
    walletType: "coins",
    amount: 500,
    direction: "credit",
    description: "Phần thưởng đăng nhập hàng ngày",
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    reference: "REF-LOGIN-001",
  },
  {
    id: "tx-002",
    walletType: "credits",
    amount: 12000,
    direction: "credit",
    description: "Bán Rồng Lửa trên Chợ",
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    reference: "REF-MARKET-002",
  },
  {
    id: "tx-003",
    walletType: "tokens",
    amount: 250,
    direction: "debit",
    description: "Nâng cấp Module Phòng thủ",
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    reference: "REF-UPGRADE-003",
  },
  {
    id: "tx-004",
    walletType: "credits",
    amount: 8500,
    direction: "debit",
    description: "Mua Cầu thủ Huyền thoại",
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    reference: "REF-TRADE-004",
  },
  {
    id: "tx-005",
    walletType: "coins",
    amount: 1200,
    direction: "debit",
    description: "Đặt giá thầu Phiên đấu giá #A-077",
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    reference: "REF-BID-005",
  },
  {
    id: "tx-006",
    walletType: "rewardPoints",
    amount: 2500,
    direction: "credit",
    description: "Thưởng tháng - Cấp Silver",
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    reference: "REF-REWARD-006",
  },
  {
    id: "tx-007",
    walletType: "tokens",
    amount: 100,
    direction: "credit",
    description: "Hoàn thành khảo sát hệ sinh thái",
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    reference: "REF-SURVEY-007",
  },
];
