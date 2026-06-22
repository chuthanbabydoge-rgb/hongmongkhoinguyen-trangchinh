// ─────────────────────────────────────────────────────────────────────────────
// Supabase Wallet Repository
//
// Table: wallets
// Columns:
//   user_id, wallet_id, credits, coins, tokens, last_synced_at
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type { IWalletRepository } from "../walletRepository";
import type { WalletReference, WalletCurrency } from "../../models/walletReference";

// ─── Row → Domain mapping ─────────────────────────────────────────────────────

function toWalletRef(row: Record<string, unknown>): WalletReference {
  return {
    userId:       row["user_id"] as string,
    walletId:     row["wallet_id"] as string,
    currency: {
      credits: row["credits"] as number,
      coins:   row["coins"] as number,
      tokens:  row["tokens"] as number,
    },
    lastSyncedAt: row["last_synced_at"] as string,
  };
}

function toRow(ref: WalletReference): Record<string, unknown> {
  return {
    user_id:        ref.userId,
    wallet_id:      ref.walletId,
    credits:        ref.currency.credits,
    coins:          ref.currency.coins,
    tokens:         ref.currency.tokens,
    last_synced_at: new Date().toISOString(),
  };
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class SupabaseWalletRepository implements IWalletRepository {
  private get db() { return getSupabaseClient(); }

  async getByUserId(userId: string): Promise<WalletReference | null> {
    const { data, error } = await this.db
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`SupabaseWalletRepository.getByUserId: ${error.message}`);
    return data ? toWalletRef(data) : null;
  }

  async create(ref: WalletReference): Promise<WalletReference> {
    const { data, error } = await this.db
      .from("wallets")
      .insert(toRow(ref))
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
        credits:        currency.credits,
        coins:          currency.coins,
        tokens:         currency.tokens,
        last_synced_at: new Date().toISOString(),
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
