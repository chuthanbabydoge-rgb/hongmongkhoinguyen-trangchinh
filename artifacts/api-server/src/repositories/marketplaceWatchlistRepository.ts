// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceWatchlistRepository
//
// Interface, types, and mock for the marketplace_watchlist table.
//
// Table: marketplace_watchlist
//   id          UUID        PK
//   user_id     UUID        NOT NULL
//   target_type TEXT        NOT NULL  ('listing' | 'auction')
//   target_id   UUID        NOT NULL
//   created_at  TIMESTAMPTZ DEFAULT now()
//   UNIQUE (user_id, target_type, target_id)
//
// Enriched snapshot fields (item_name, price, rarity, status) are stored at
// watch-time to support future price-drop / outbid / auction-ending alerts
// without requiring a join on every read.
// ─────────────────────────────────────────────────────────────────────────────

export type WatchlistTargetType = "listing" | "auction";

export interface WatchlistEntry {
  id:         string;
  userId:     string;
  targetType: WatchlistTargetType;
  targetId:   string;
  /** Snapshot fields — populated at watch-time for future alerting. */
  itemName:   string | null;
  price:      number | null;
  rarity:     string | null;
  status:     string | null;
  createdAt:  string;
}

export type CreateWatchlistInput = Pick<WatchlistEntry, "userId" | "targetType" | "targetId"> &
  Partial<Pick<WatchlistEntry, "itemName" | "price" | "rarity" | "status">>;

// ─── Repository interface ─────────────────────────────────────────────────────

export interface IMarketplaceWatchlistRepository {
  /** Add a new entry. Resolves to the existing entry when already watched. */
  create(input: CreateWatchlistInput): Promise<{ entry: WatchlistEntry; created: boolean }>;
  /** Remove by watchlist entry id. Returns true if deleted. */
  delete(id: string): Promise<boolean>;
  /** List all entries for a user, newest first. */
  getByUserId(userId: string): Promise<WatchlistEntry[]>;
  /** Total count of entries for a user. */
  countByUserId(userId: string): Promise<number>;
  /** Lookup by composite key — used to check duplicates. */
  findEntry(userId: string, targetType: WatchlistTargetType, targetId: string): Promise<WatchlistEntry | null>;
}

// ─── Mock implementation (in-memory) ─────────────────────────────────────────

export class MockMarketplaceWatchlistRepository implements IMarketplaceWatchlistRepository {
  private store: WatchlistEntry[] = [];

  async create(input: CreateWatchlistInput): Promise<{ entry: WatchlistEntry; created: boolean }> {
    const existing = await this.findEntry(input.userId, input.targetType, input.targetId);
    if (existing) return { entry: existing, created: false };

    const entry: WatchlistEntry = {
      id:         crypto.randomUUID(),
      userId:     input.userId,
      targetType: input.targetType,
      targetId:   input.targetId,
      itemName:   input.itemName ?? null,
      price:      input.price    ?? null,
      rarity:     input.rarity   ?? null,
      status:     input.status   ?? null,
      createdAt:  new Date().toISOString(),
    };
    this.store.push(entry);
    return { entry, created: true };
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.store.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.store.splice(idx, 1);
    return true;
  }

  async getByUserId(userId: string): Promise<WatchlistEntry[]> {
    return [...this.store]
      .filter(e => e.userId === userId)
      .reverse();
  }

  async countByUserId(userId: string): Promise<number> {
    return this.store.filter(e => e.userId === userId).length;
  }

  async findEntry(userId: string, targetType: WatchlistTargetType, targetId: string): Promise<WatchlistEntry | null> {
    return this.store.find(
      e => e.userId === userId && e.targetType === targetType && e.targetId === targetId,
    ) ?? null;
  }
}
