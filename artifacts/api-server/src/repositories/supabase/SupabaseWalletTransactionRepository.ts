import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type { IWalletTransactionRepository } from "../walletTransactionRepository";
import type { Transaction, Currency, TransactionDirection, TransactionStatus } from "../../data/walletData";

function toTransaction(row: Record<string, unknown>): Transaction {
  return {
    id:          String(row["id"] ?? ""),
    walletType:  (row["wallet_type"] as Currency) ?? "credits",
    amount:      Number(row["amount"] ?? 0),
    direction:   (row["direction"] as TransactionDirection) ?? "credit",
    description: String(row["description"] ?? ""),
    status:      (row["status"] as TransactionStatus) ?? "completed",
    createdAt:   String(row["created_at"] ?? ""),
    reference:   row["reference"] != null ? String(row["reference"]) : undefined,
  };
}

export class SupabaseWalletTransactionRepository implements IWalletTransactionRepository {
  private get db() { return getSupabaseClient(); }

  async getByUserId(userId: string, limit = 50, walletType?: string): Promise<Transaction[]> {
    if (!isValidUuid(userId)) {
      console.log("[SupabaseWalletTransactionRepository] invalid UUID, skipping:", userId);
      return [];
    }
    let query = this.db
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (walletType) {
      query = query.eq("wallet_type", walletType);
    }

    const { data, error } = await query;
    if (error) throw new Error(`SupabaseWalletTransactionRepository.getByUserId: ${error.message}`);
    console.log("[SupabaseWalletTransactionRepository] Supabase result:", data?.length ?? 0, "rows for user", userId);
    return (data ?? []).map(toTransaction);
  }

  async create(tx: Transaction, _userId: string): Promise<Transaction> {
    return tx;
  }
}
