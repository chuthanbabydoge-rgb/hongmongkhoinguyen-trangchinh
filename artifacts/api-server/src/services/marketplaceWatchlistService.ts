// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceWatchlistService
//
// Business logic for the marketplace watchlist (V1.9).
// Validates inputs, delegates to repository, and enriches entries with
// snapshot data (item name, price, rarity, status) at watch-time so future
// alerting features (price-drop, outbid, auction-ending) can query without
// joining listing/auction tables.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IMarketplaceWatchlistRepository,
  WatchlistEntry,
  WatchlistTargetType,
  CreateWatchlistInput,
} from "../repositories/marketplaceWatchlistRepository";

export const VALID_TARGET_TYPES: ReadonlySet<string> = new Set(["listing", "auction"]);

export interface AddWatchlistInput {
  userId:     string;
  targetType: string;
  targetId:   string;
  /** Optional snapshot — caller should populate from the listing/auction data. */
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
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketplaceWatchlistService implements IMarketplaceWatchlistService {
  constructor(private readonly repo: IMarketplaceWatchlistRepository) {}

  async add(input: AddWatchlistInput): Promise<{ entry: WatchlistEntry; created: boolean }> {
    if (!input.userId?.trim()) {
      throw new Error("userId là bắt buộc.");
    }
    if (!VALID_TARGET_TYPES.has(input.targetType)) {
      throw new Error(`targetType không hợp lệ: "${input.targetType}". Phải là "listing" hoặc "auction".`);
    }
    if (!input.targetId?.trim()) {
      throw new Error("targetId là bắt buộc.");
    }

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
}
