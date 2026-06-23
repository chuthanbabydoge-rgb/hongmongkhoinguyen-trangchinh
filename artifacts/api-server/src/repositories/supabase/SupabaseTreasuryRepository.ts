// ─────────────────────────────────────────────────────────────────────────────
// SupabaseTreasuryRepository
//
// getTreasuryWallet — reads the treasury row from the `wallets` table
//                     (user_id = 'treasury'; not a UUID so no uuid guard).
// getTreasuryStats  — aggregates fee_amount / total_amount per currency from
//                     marketplace_wallet_transactions, newest-to-oldest.
//
// Currency mapping (marketplace → wallet field):
//   "credits" → totalFeesCredits / totalVolumeCredits
//   "stars"   → totalFeesCoins   / totalVolumeCoins
//   "eth"     → totalFeesTokens  / totalVolumeTokens
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient }                       from "../../database/supabase";
import { TREASURY_USER_ID }                        from "../../services/marketplacePaymentService";
import type { ITreasuryRepository, TreasuryWallet, TreasuryStats } from "../marketplaceTreasuryRepository";

export class SupabaseTreasuryRepository implements ITreasuryRepository {
  private get db() { return getSupabaseClient(); }

  async getTreasuryWallet(): Promise<TreasuryWallet> {
    // TREASURY_USER_ID ("treasury") is not a UUID — catch the type error gracefully
    // and return zero balances until a treasury wallet row exists.
    const { data, error } = await this.db
      .from("wallets")
      .select("credits, coins, tokens")
      .eq("user_id", TREASURY_USER_ID)
      .maybeSingle();

    if (error) {
      // UUID type mismatch or missing row → zero balances
      return { userId: TREASURY_USER_ID, credits: 0, coins: 0, tokens: 0 };
    }

    if (!data) {
      return { userId: TREASURY_USER_ID, credits: 0, coins: 0, tokens: 0 };
    }

    return {
      userId:  TREASURY_USER_ID,
      credits: Number((data as Record<string, unknown>)["credits"] ?? 0),
      coins:   Number((data as Record<string, unknown>)["coins"]   ?? 0),
      tokens:  Number((data as Record<string, unknown>)["tokens"]  ?? 0),
    };
  }

  async getTreasuryStats(): Promise<TreasuryStats> {
    const { data, error } = await this.db
      .from("marketplace_wallet_transactions")
      .select("fee_amount, total_amount, currency");

    if (error) {
      // Table may not exist yet (payment repo currently uses in-memory mock) —
      // return zeros rather than surfacing a 500 to the client.
      return {
        totalTransactions:  0,
        totalFeesCredits:   0,
        totalFeesCoins:     0,
        totalFeesTokens:    0,
        totalVolumeCredits: 0,
        totalVolumeCoins:   0,
        totalVolumeTokens:  0,
      };
    }

    const rows = (data ?? []) as Array<Record<string, unknown>>;

    let totalFeesCredits   = 0;
    let totalFeesCoins     = 0;
    let totalFeesTokens    = 0;
    let totalVolumeCredits = 0;
    let totalVolumeCoins   = 0;
    let totalVolumeTokens  = 0;

    for (const row of rows) {
      const fee    = Number(row["fee_amount"]   ?? 0);
      const volume = Number(row["total_amount"] ?? 0);

      switch (row["currency"] as string) {
        case "credits":
          totalFeesCredits   += fee;
          totalVolumeCredits += volume;
          break;
        case "stars":
          totalFeesCoins   += fee;
          totalVolumeCoins += volume;
          break;
        case "eth":
          totalFeesTokens   += fee;
          totalVolumeTokens += volume;
          break;
      }
    }

    return {
      totalTransactions:  rows.length,
      totalFeesCredits,
      totalFeesCoins,
      totalFeesTokens,
      totalVolumeCredits,
      totalVolumeCoins,
      totalVolumeTokens,
    };
  }
}
