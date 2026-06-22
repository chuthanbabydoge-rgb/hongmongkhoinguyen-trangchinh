// ─────────────────────────────────────────────────────────────────────────────
// Mock wallet data
// Replace with DB queries when integrating a database.
// ─────────────────────────────────────────────────────────────────────────────

export type TransactionType = "credit" | "debit" | "reward" | "trade" | "purchase";
export type Currency = "credits" | "coins" | "tokens";

export interface Transaction {
  id: string;
  type: TransactionType;
  currency: Currency;
  amount: number;
  description: string;
  counterparty: string | null;
  createdAt: string;
}

export interface WalletData {
  userId: string;
  credits: number;
  coins: number;
  tokens: number;
  weeklyChangePercent: number;
  transactions: Transaction[];
}

export const WALLET: WalletData = {
  userId: "user-001",
  credits: 125840,
  coins: 48290,
  tokens: 3750,
  weeklyChangePercent: 12.4,
  transactions: [
    {
      id: "tx-001",
      type: "reward",
      currency: "coins",
      amount: 500,
      description: "Phần thưởng đăng nhập hàng ngày",
      counterparty: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: "tx-002",
      type: "credit",
      currency: "credits",
      amount: 12000,
      description: "Bán Rồng Lửa trên Chợ",
      counterparty: "StarLord99",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "tx-003",
      type: "purchase",
      currency: "tokens",
      amount: -250,
      description: "Nâng cấp Module Phòng thủ",
      counterparty: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: "tx-004",
      type: "trade",
      currency: "credits",
      amount: -8500,
      description: "Mua Cầu thủ Huyền thoại",
      counterparty: "NebulaMaster",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "tx-005",
      type: "debit",
      currency: "coins",
      amount: -1200,
      description: "Đặt giá thầu Phiên đấu giá #A-077",
      counterparty: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
  ],
};
