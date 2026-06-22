// ─────────────────────────────────────────────────────────────────────────────
// Wallet service — GET /api/wallet, GET /api/wallet/transactions
// ─────────────────────────────────────────────────────────────────────────────

import { apiFetch } from "@/lib/apiClient";

export interface ApiWallet {
  userId: string;
  credits: number;
  coins: number;
  tokens: number;
  weeklyChangePercent: number;
  transactions: ApiTransaction[];
}

export interface ApiTransaction {
  id: string;
  type: "credit" | "debit" | "reward" | "trade" | "purchase";
  currency: "credits" | "coins" | "tokens";
  amount: number;
  description: string;
  counterparty: string | null;
  createdAt: string;
}

export async function fetchWallet(): Promise<ApiWallet> {
  return apiFetch<ApiWallet>("/wallet");
}

export async function fetchTransactions(limit = 20): Promise<ApiTransaction[]> {
  return apiFetch<ApiTransaction[]>(`/wallet/transactions?limit=${limit}`);
}
