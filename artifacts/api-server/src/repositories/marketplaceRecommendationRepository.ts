// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceRecommendationRepository (V2.7)
//
// Provides the raw data the recommendation service needs to score candidates.
// All queries read from existing marketplace tables — recommendations are
// computed on-the-fly, not stored.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface RecommendationItem {
  listingId:  string;
  itemName:   string;
  category:   string;
  rarity:     string;
  price:      number;
  currency:   string;
  sellerId:   string;
  bidCount:   number;
  createdAt:  string;
}

export interface UserPurchase {
  listingId:  string;
  category:   string;
  rarity:     string;
}

export interface UserWatchlistEntry {
  listingId:  string;
  category:   string | null;
  rarity:     string | null;
}

export interface UserSavedSearch {
  category:   string | null;
  rarity:     string | null;
  query:      string | null;
  minPrice:   number | null;
  maxPrice:   number | null;
}

export interface ListingFilter {
  category?:   string;
  rarity?:     string;
  currency?:   string;
  minPrice?:   number;
  maxPrice?:   number;
  excludeIds?: string[];
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IMarketplaceRecommendationRepository {
  /** All active listings, optionally filtered. */
  getActiveListings(params?: ListingFilter): Promise<RecommendationItem[]>;
  /** Live auctions sorted by bidCount desc (trending auction candidates). */
  getActiveAuctions(limit?: number): Promise<RecommendationItem[]>;
  /** Category + rarity of all listings the user has purchased as a buyer. */
  getUserPurchases(userId: string): Promise<UserPurchase[]>;
  /** Category + rarity of items on the user's watchlist. */
  getUserWatchlist(userId: string): Promise<UserWatchlistEntry[]>;
  /** Saved search filter criteria for the user. */
  getUserSavedSearches(userId: string): Promise<UserSavedSearch[]>;
  /** Reputation score 0–100 for a seller (0 when unknown). */
  getSellerScore(sellerId: string): Promise<number>;
}

// ─── Mock implementation (in-memory, fully seedable) ─────────────────────────

export interface MockRecommendationStore {
  listings?:      RecommendationItem[];
  auctions?:      RecommendationItem[];
  purchases?:     (UserPurchase & { userId: string })[];
  watchlist?:     (UserWatchlistEntry & { userId: string })[];
  savedSearches?: (UserSavedSearch & { userId: string })[];
  reputations?:   Record<string, number>;
}

export class MockMarketplaceRecommendationRepository
  implements IMarketplaceRecommendationRepository
{
  private listings:      RecommendationItem[]                            = [];
  private auctions:      RecommendationItem[]                            = [];
  private purchases:     (UserPurchase & { userId: string })[]           = [];
  private watchlist:     (UserWatchlistEntry & { userId: string })[]     = [];
  private savedSearches: (UserSavedSearch & { userId: string })[]        = [];
  private reputations:   Map<string, number>                             = new Map();

  constructor(seed?: MockRecommendationStore) {
    if (seed) this.seed(seed);
  }

  seed(store: MockRecommendationStore): void {
    if (store.listings)      this.listings      = [...store.listings];
    if (store.auctions)      this.auctions      = [...store.auctions];
    if (store.purchases)     this.purchases     = [...store.purchases];
    if (store.watchlist)     this.watchlist     = [...store.watchlist];
    if (store.savedSearches) this.savedSearches = [...store.savedSearches];
    if (store.reputations) {
      for (const [k, v] of Object.entries(store.reputations)) {
        this.reputations.set(k, v);
      }
    }
  }

  // ── Data mutation helpers (for tests) ───────────────────────────────────

  addListing(item: RecommendationItem): void { this.listings.push(item); }
  addAuction(item: RecommendationItem): void { this.auctions.push(item); }

  addPurchase(userId: string, item: UserPurchase): void {
    this.purchases.push({ userId, ...item });
  }

  addWatchlistEntry(userId: string, entry: UserWatchlistEntry): void {
    this.watchlist.push({ userId, ...entry });
  }

  addSavedSearch(userId: string, search: UserSavedSearch): void {
    this.savedSearches.push({ userId, ...search });
  }

  setSellerScore(sellerId: string, score: number): void {
    this.reputations.set(sellerId, score);
  }

  // ── Interface ────────────────────────────────────────────────────────────

  async getActiveListings(params?: ListingFilter): Promise<RecommendationItem[]> {
    let results = [...this.listings];
    if (params?.category)   results = results.filter(l => l.category === params.category);
    if (params?.rarity)     results = results.filter(l => l.rarity   === params.rarity);
    if (params?.currency)   results = results.filter(l => l.currency  === params.currency);
    if (params?.minPrice != null) results = results.filter(l => l.price >= params.minPrice!);
    if (params?.maxPrice != null) results = results.filter(l => l.price <= params.maxPrice!);
    if (params?.excludeIds?.length) {
      const excl = new Set(params.excludeIds);
      results = results.filter(l => !excl.has(l.listingId));
    }
    return results;
  }

  async getActiveAuctions(limit = 10): Promise<RecommendationItem[]> {
    return [...this.auctions]
      .sort((a, b) => b.bidCount - a.bidCount)
      .slice(0, limit);
  }

  async getUserPurchases(userId: string): Promise<UserPurchase[]> {
    return this.purchases
      .filter(p => p.userId === userId)
      .map(({ userId: _uid, ...rest }) => rest);
  }

  async getUserWatchlist(userId: string): Promise<UserWatchlistEntry[]> {
    return this.watchlist
      .filter(w => w.userId === userId)
      .map(({ userId: _uid, ...rest }) => rest);
  }

  async getUserSavedSearches(userId: string): Promise<UserSavedSearch[]> {
    return this.savedSearches
      .filter(s => s.userId === userId)
      .map(({ userId: _uid, ...rest }) => rest);
  }

  async getSellerScore(sellerId: string): Promise<number> {
    return this.reputations.get(sellerId) ?? 0;
  }
}
