// ─────────────────────────────────────────────────────────────────────────────
// SupabaseMarketplaceWatchlistRepository
//
// Table: marketplace_watchlist
//   id          UUID        PK          DEFAULT gen_random_uuid()
//   user_id     UUID        NOT NULL
//   target_type TEXT        NOT NULL
//   target_id   UUID        NOT NULL
//   item_name   TEXT
//   price       NUMERIC
//   rarity      TEXT
//   status      TEXT
//   created_at  TIMESTAMPTZ DEFAULT now()
//   UNIQUE (user_id, target_type, target_id)
//
// Gracefully returns empty results if the table doesn't exist yet.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type {
  IMarketplaceWatchlistRepository,
  WatchlistEntry,
  WatchlistTargetType,
  CreateWatchlistInput,
  PriceCheckResult,
} from "../marketplaceWatchlistRepository";

type Row = Record<string, unknown>;

function toEntry(row: Row): WatchlistEntry {
  return {
    id:                String(row["id"]          ?? ""),
    userId:            String(row["user_id"]     ?? ""),
    targetType:        String(row["target_type"] ?? "") as WatchlistTargetType,
    targetId:          String(row["target_id"]   ?? ""),
    itemName:          row["item_name"]          != null ? String(row["item_name"])          : null,
    price:             row["price"]              != null ? Number(row["price"])              : null,
    rarity:            row["rarity"]             != null ? String(row["rarity"])             : null,
    status:            row["status"]             != null ? String(row["status"])             : null,
    watchPrice:        row["watch_price"]        != null ? Number(row["watch_price"])        : null,
    lastSeenPrice:     row["last_seen_price"]    != null ? Number(row["last_seen_price"])    : null,
    priceDropCount:    row["price_drop_count"]   != null ? Number(row["price_drop_count"])   : 0,
    lastPriceChangeAt: row["last_price_change_at"] != null ? String(row["last_price_change_at"]) : null,
    createdAt:         String(row["created_at"]  ?? ""),
  };
}

const TABLE = "marketplace_watchlist";

export class SupabaseMarketplaceWatchlistRepository implements IMarketplaceWatchlistRepository {
  private get db() { return getSupabaseClient(); }

  async create(input: CreateWatchlistInput): Promise<{ entry: WatchlistEntry; created: boolean }> {
    const existing = await this.findEntry(input.userId, input.targetType, input.targetId);
    if (existing) return { entry: existing, created: false };

    const { data, error } = await this.db
      .from(TABLE)
      .insert({
        user_id:     input.userId,
        target_type: input.targetType,
        target_id:   input.targetId,
        item_name:   input.itemName ?? null,
        price:       input.price    ?? null,
        rarity:      input.rarity   ?? null,
        status:      input.status   ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`SupabaseWatchlistRepo.create: ${error.message}`);
    return { entry: toEntry(data as Row), created: true };
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.db.from(TABLE).delete().eq("id", id);
    return !error;
  }

  async getByUserId(userId: string): Promise<WatchlistEntry[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []).map(r => toEntry(r as Row));
  }

  async countByUserId(userId: string): Promise<number> {
    const { count, error } = await this.db
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) return 0;
    return count ?? 0;
  }

  async findEntry(userId: string, targetType: WatchlistTargetType, targetId: string): Promise<WatchlistEntry | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .maybeSingle();

    if (error || !data) return null;
    return toEntry(data as Row);
  }

  async getAll(): Promise<WatchlistEntry[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []).map(r => toEntry(r as Row));
  }

  async checkPrice(id: string, currentPrice: number): Promise<PriceCheckResult | null> {
    const { data: row, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !row) return null;

    const entry    = toEntry(row as Row);
    const baseline = entry.lastSeenPrice ?? entry.watchPrice ?? currentPrice;
    const dropped  = currentPrice < baseline;
    const oldPrice = baseline;
    const newPrice = currentPrice;
    const dropPct  = baseline > 0
      ? Math.round(((baseline - currentPrice) / baseline) * 10000) / 100
      : 0;

    const updates: Record<string, unknown> = { last_seen_price: currentPrice };
    if (dropped) {
      updates["price_drop_count"]    = (entry.priceDropCount ?? 0) + 1;
      updates["last_price_change_at"] = new Date().toISOString();
      updates["price"]               = currentPrice;
    }

    const { data: updated } = await this.db
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    const finalEntry = updated ? toEntry(updated as Row) : { ...entry, lastSeenPrice: currentPrice };
    return { entry: finalEntry, dropped, oldPrice, newPrice, dropPct };
  }

  async getPriceDropsByUserId(userId: string): Promise<WatchlistEntry[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .gt("price_drop_count", 0)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []).map(r => toEntry(r as Row));
  }
}
