// ─────────────────────────────────────────────────────────────────────────────
// Supabase Wallet Repository
//
// Table: wallets — actual columns observed in production:
//   id (uuid pk), user_id (uuid fk), credits (int), coins (int),
//   tokens (int), created_at (timestamptz), updated_at (timestamptz)
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type { IWalletRepository } from "../walletRepository";
import type { WalletReference, WalletCurrency } from "../../models/walletReference";

function toWalletRef(row: Record<string, unknown>): WalletReference {
  return {
    userId:       String(row["user_id"] ?? ""),
    walletId:     String(row["id"] ?? ""),
    currency: {
      credits:      Number(row["credits"]       ?? 0),
      coins:        Number(row["coins"]         ?? 0),
      tokens:       Number(row["tokens"]        ?? 0),
      rewardPoints: Number(row["reward_points"] ?? 0),
    },
    lastSyncedAt: String(row["updated_at"] ?? row["created_at"] ?? ""),
  };
}

function toRow(ref: WalletReference): Record<string, unknown> {
  return {
    user_id:    ref.userId,
    credits:    ref.currency.credits,
    coins:      ref.currency.coins,
    tokens:     ref.currency.tokens,
    updated_at: new Date().toISOString(),
  };
}

export class SupabaseWalletRepository implements IWalletRepository {
  private get db() { return getSupabaseClient(); }

  async getByUserId(userId: string): Promise<WalletReference | null> {
    if (!isValidUuid(userId)) {
      console.log("[SupabaseWalletRepository] invalid UUID, skipping:", userId);
      return null;
    }
    const { data, error } = await this.db
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`SupabaseWalletRepository.getByUserId: ${error.message}`);
    console.log("[SupabaseWalletRepository] Supabase result for user", userId, ":", data ? "found" : "null");
    return data ? toWalletRef(data) : null;
  }

  async create(ref: WalletReference): Promise<WalletReference> {
    const now = new Date().toISOString();
    const { data, error } = await this.db
      .from("wallets")
      .insert({ ...toRow(ref), created_at: now })
      .select()
      .single();
    if (error) throw new Error(`SupabaseWalletRepository.create: ${error.message}`);
    return toWalletRef(data);
  }

  async update(ref: WalletReference): Promise<WalletReference | null> {
    const { data, error } = await this.db
      .from("wallets")
      .update(toRow(ref))
      .eq("user_id", ref.userId)
      .select()
      .maybeSingle();
    if (error) throw new Error(`SupabaseWalletRepository.update: ${error.message}`);
    return data ? toWalletRef(data) : null;
  }

  async syncBalance(userId: string, currency: WalletCurrency): Promise<WalletReference | null> {
    const { data, error } = await this.db
      .from("wallets")
      .update({
        credits:    currency.credits,
        coins:      currency.coins,
        tokens:     currency.tokens,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (error) throw new Error(`SupabaseWalletRepository.syncBalance: ${error.message}`);
    return data ? toWalletRef(data) : null;
  }

  async delete(userId: string): Promise<boolean> {
    const { error } = await this.db.from("wallets").delete().eq("user_id", userId);
    if (error) throw new Error(`SupabaseWalletRepository.delete: ${error.message}`);
    return true;
  }
}
