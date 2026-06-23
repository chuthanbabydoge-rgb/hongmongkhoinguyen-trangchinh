// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceWatchlistRepository
//
// Interface, types, and mock for the marketplace_watchlist table.
//
// Table: marketplace_watchlist
//   id                    UUID        PK
//   user_id               UUID        NOT NULL
//   target_type           TEXT        NOT NULL  ('listing' | 'auction')
//   target_id             UUID        NOT NULL
//   item_name             TEXT
//   price                 NUMERIC     (snapshot at watch-time)
//   rarity                TEXT
//   status                TEXT
//   watch_price           NUMERIC     (price at watch-time, for % drop calc)
//   last_seen_price       NUMERIC     (most recent checked price)
//   price_drop_count      INTEGER     DEFAULT 0
//   last_price_change_at  TIMESTAMPTZ
//   created_at            TIMESTAMPTZ DEFAULT now()
//   UNIQUE (user_id, target_type, target_id)
// ─────────────────────────────────────────────────────────────────────────────

export type WatchlistTargetType = "listing" | "auction";

export interface WatchlistEntry {
  id:                 string;
  userId:             string;
  targetType:         WatchlistTargetType;
  targetId:           string;
  /** Snapshot fields — populated at watch-time. */
  itemName:           string | null;
  price:              number | null;
  rarity:             string | null;
  status:             string | null;
  /** Price-alert fields (V2.1). */
  watchPrice:         number | null;   // original watched price
  lastSeenPrice:      number | null;   // most recently checked price
  priceDropCount:     number;          // total drops detected
  lastPriceChangeAt:  string | null;   // ISO timestamp
  createdAt:          string;
}

export type CreateWatchlistInput = Pick<WatchlistEntry, "userId" | "targetType" | "targetId"> &
  Partial<Pick<WatchlistEntry, "itemName" | "price" | "rarity" | "status">>;

export interface PriceCheckResult {
  entry:    WatchlistEntry;
  dropped:  boolean;
  oldPrice: number;
  newPrice: number;
  dropPct:  number;
}

// ─── Repository interface ─────────────────────────────────────────────────────

export interface IMarketplaceWatchlistRepository {
  /** Add a new entry. Resolves to the existing entry when already watched. */
  create(input: CreateWatchlistInput): Promise<{ entry: WatchlistEntry; created: boolean }>;
  /** Remove by watchlist entry id. Returns true if deleted. */
  delete(id: string): Promise<boolean>;
  /** List all entries for a user, newest first. */
  getByUserId(userId: string): Promise<WatchlistEntry[]>;
  /** All entries across every user — used by the price poller. */
  getAll(): Promise<WatchlistEntry[]>;
  /** Total count of entries for a user. */
  countByUserId(userId: string): Promise<number>;
  /** Lookup by composite key — used to check duplicates. */
  findEntry(userId: string, targetType: WatchlistTargetType, targetId: string): Promise<WatchlistEntry | null>;
  /** Compare current price against lastSeenPrice. Persists drop if detected. */
  checkPrice(id: string, currentPrice: number): Promise<PriceCheckResult | null>;
  /** Return entries where priceDropCount > 0 for a user. */
  getPriceDropsByUserId(userId: string): Promise<WatchlistEntry[]>;
}

// ─── Mock implementation (in-memory) ─────────────────────────────────────────

export class MockMarketplaceWatchlistRepository implements IMarketplaceWatchlistRepository {
  private store: WatchlistEntry[] = [];

  async create(input: CreateWatchlistInput): Promise<{ entry: WatchlistEntry; created: boolean }> {
    const existing = await this.findEntry(input.userId, input.targetType, input.targetId);
    if (existing) return { entry: existing, created: false };

    const price = input.price ?? null;
    const entry: WatchlistEntry = {
      id:                crypto.randomUUID(),
      userId:            input.userId,
      targetType:        input.targetType,
      targetId:          input.targetId,
      itemName:          input.itemName       ?? null,
      price,
      rarity:            input.rarity         ?? null,
      status:            input.status         ?? null,
      watchPrice:        price,
      lastSeenPrice:     price,
      priceDropCount:    0,
      lastPriceChangeAt: null,
      createdAt:         new Date().toISOString(),
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

  async getAll(): Promise<WatchlistEntry[]> {
    return [...this.store].reverse();
  }

  async countByUserId(userId: string): Promise<number> {
    return this.store.filter(e => e.userId === userId).length;
  }

  async findEntry(userId: string, targetType: WatchlistTargetType, targetId: string): Promise<WatchlistEntry | null> {
    return this.store.find(
      e => e.userId === userId && e.targetType === targetType && e.targetId === targetId,
    ) ?? null;
  }

  async checkPrice(id: string, currentPrice: number): Promise<PriceCheckResult | null> {
    const entry = this.store.find(e => e.id === id);
    if (!entry) return null;

    const baseline = entry.lastSeenPrice ?? entry.watchPrice ?? currentPrice;
    const dropped  = currentPrice < baseline;
    const oldPrice = baseline;
    const newPrice = currentPrice;
    const dropPct  = baseline > 0 ? Math.round(((baseline - currentPrice) / baseline) * 10000) / 100 : 0;

    // Always update lastSeenPrice
    entry.lastSeenPrice = currentPrice;

    if (dropped) {
      entry.priceDropCount    += 1;
      entry.lastPriceChangeAt  = new Date().toISOString();
      // Also update the snapshot price to reflect current
      entry.price = currentPrice;
    }

    return { entry: { ...entry }, dropped, oldPrice, newPrice, dropPct };
  }

  async getPriceDropsByUserId(userId: string): Promise<WatchlistEntry[]> {
    return [...this.store]
      .filter(e => e.userId === userId && e.priceDropCount > 0)
      .reverse();
  }
}
