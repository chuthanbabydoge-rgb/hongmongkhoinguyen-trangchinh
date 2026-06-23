// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceWatchlistService (V2.1)
//
// Business logic for marketplace watchlist.
// V2.1 adds price-drop detection: checkPrice() compares a supplied current
// price against lastSeenPrice, persists a drop when detected, fires a
// PRICE_DROP notification, and never throws so callers don't break.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IMarketplaceWatchlistRepository,
  WatchlistEntry,
  WatchlistTargetType,
  CreateWatchlistInput,
  PriceCheckResult,
} from "../repositories/marketplaceWatchlistRepository";
import type { IMarketplaceNotificationService } from "./marketplaceNotificationService";
import type { MarketplaceRealtimeService }      from "./marketplaceRealtimeService";

export const VALID_TARGET_TYPES: ReadonlySet<string> = new Set(["listing", "auction"]);

export interface AddWatchlistInput {
  userId:     string;
  targetType: string;
  targetId:   string;
  itemName?:  string;
  price?:     number;
  rarity?:    string;
  status?:    string;
}

export interface IMarketplaceWatchlistService {
  add(input: AddWatchlistInput): Promise<{ entry: WatchlistEntry; created: boolean }>;
  remove(id: string): Promise<boolean>;
  list(userId: string): Promise<WatchlistEntry[]>;
  count(userId: string): Promise<number>;
  checkPrice(id: string, currentPrice: number): Promise<PriceCheckResult | null>;
  getPriceDrops(userId: string): Promise<WatchlistEntry[]>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCR(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M CR`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K CR`;
  return `${v.toLocaleString("vi-VN")} CR`;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketplaceWatchlistService implements IMarketplaceWatchlistService {
  constructor(
    private readonly repo:          IMarketplaceWatchlistRepository,
    private readonly notifications: IMarketplaceNotificationService | null = null,
    private readonly realtime:      MarketplaceRealtimeService | null = null,
  ) {}

  async add(input: AddWatchlistInput): Promise<{ entry: WatchlistEntry; created: boolean }> {
    if (!input.userId?.trim())     throw new Error("userId là bắt buộc.");
    if (!VALID_TARGET_TYPES.has(input.targetType))
      throw new Error(`targetType không hợp lệ: "${input.targetType}". Phải là "listing" hoặc "auction".`);
    if (!input.targetId?.trim())   throw new Error("targetId là bắt buộc.");

    const payload: CreateWatchlistInput = {
      userId:     input.userId,
      targetType: input.targetType as WatchlistTargetType,
      targetId:   input.targetId,
      itemName:   input.itemName,
      price:      input.price,
      rarity:     input.rarity,
      status:     input.status,
    };

    return this.repo.create(payload);
  }

  remove(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  list(userId: string): Promise<WatchlistEntry[]> {
    return this.repo.getByUserId(userId);
  }

  count(userId: string): Promise<number> {
    return this.repo.countByUserId(userId);
  }

  async checkPrice(id: string, currentPrice: number): Promise<PriceCheckResult | null> {
    if (!Number.isFinite(currentPrice) || currentPrice < 0)
      throw new Error("currentPrice không hợp lệ.");

    const result = await this.repo.checkPrice(id, currentPrice);
    if (!result) return null;

    if (result.dropped) {
      const entry = result.entry;
      if (this.notifications) {
        this.notifications
          .onPriceDrop(
            entry.userId,
            {
              targetId:   entry.targetId,
              targetType: entry.targetType,
              itemName:   entry.itemName ?? "Mặt hàng",
              oldPrice:   result.oldPrice,
              newPrice:   result.newPrice,
              dropPct:    result.dropPct,
            },
          )
          .catch(() => {});
      }
      this.realtime?.emit("PRICE_DROP", {
        targetId:   entry.targetId,
        targetType: entry.targetType,
        itemName:   entry.itemName ?? "Mặt hàng",
        oldPrice:   result.oldPrice,
        newPrice:   result.newPrice,
        dropPct:    result.dropPct,
      }, entry.userId);
    }

    return result;
  }

  getPriceDrops(userId: string): Promise<WatchlistEntry[]> {
    return this.repo.getPriceDropsByUserId(userId);
  }
}
