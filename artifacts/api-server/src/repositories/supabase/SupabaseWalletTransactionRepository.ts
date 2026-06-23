import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type { IWalletTransactionRepository } from "../walletTransactionRepository";
import type { Transaction, TransactionType, Currency } from "../../data/walletData";

function toTransaction(row: Record<string, unknown>): Transaction {
  return {
    id:           String(row["id"] ?? ""),
    type:         (row["type"] as TransactionType) ?? "credit",
    currency:     (row["currency"] as Currency) ?? "credits",
    amount:       Number(row["amount"] ?? 0),
    description:  String(row["description"] ?? ""),
    counterparty: row["counterparty"] != null ? String(row["counterparty"]) : null,
    createdAt:    String(row["created_at"] ?? ""),
  };
}

export class SupabaseWalletTransactionRepository implements IWalletTransactionRepository {
  private get db() { return getSupabaseClient(); }

  async getByUserId(userId: string, limit = 20): Promise<Transaction[]> {
    if (!isValidUuid(userId)) {
      console.log("[SupabaseWalletTransactionRepository] invalid UUID, skipping:", userId);
      return [];
    }
    const { data, error } = await this.db
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`SupabaseWalletTransactionRepository.getByUserId: ${error.message}`);
    console.log("[SupabaseWalletTransactionRepository] Supabase result:", data?.length ?? 0, "rows for user", userId);
    return (data ?? []).map(toTransaction);
  }

  async create(tx: Transaction): Promise<Transaction> {
    return tx;
  }
}
