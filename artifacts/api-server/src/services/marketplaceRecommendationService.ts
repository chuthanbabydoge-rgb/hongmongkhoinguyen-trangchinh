// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceRecommendationService (V2.7)
//
// Generates personalised listing recommendations from five signal sources:
//
//   Source              Max weight   Signal
//   ──────────────────  ──────────   ──────────────────────────────────────────
//   Purchase history        30       Category frequency from past buys
//   Watchlist               25       Rarity match with watched items
//   Saved searches          20       Filter overlap (category/rarity/price/q)
//   Trending                15       Bid count + listing recency
//   Seller reputation       10       Normalised seller score 0-100 → 0-10
//
// Total possible score: 100
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IMarketplaceRecommendationRepository,
  RecommendationItem,
  UserPurchase,
  UserSavedSearch,
} from "../repositories/marketplaceRecommendationRepository";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface Recommendation {
  listingId: string;
  itemName:  string;
  score:     number;
  reason:    string;
  category:  string;
  rarity:    string;
  price:     number;
  currency:  string;
  sellerId:  string;
}

export interface TrendingResult {
  topListings:    RecommendationItem[];
  topAuctions:    RecommendationItem[];
  topCategories:  { category: string; count: number }[];
  topKeywords:    { keyword: string; count: number }[];
}

export interface RecommendationParams {
  limit?:  number;
  offset?: number;
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function categoryFrequency(purchases: UserPurchase[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of purchases) {
    map.set(p.category, (map.get(p.category) ?? 0) + 1);
  }
  return map;
}

function matchesSavedSearch(
  item:    RecommendationItem,
  search:  UserSavedSearch,
): boolean {
  if (search.category && item.category !== search.category) return false;
  if (search.rarity   && item.rarity   !== search.rarity)   return false;
  if (search.minPrice != null && item.price < search.minPrice) return false;
  if (search.maxPrice != null && item.price > search.maxPrice) return false;
  if (search.query) {
    const q = search.query.toLowerCase();
    if (!item.itemName.toLowerCase().includes(q)) return false;
  }
  return true;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketplaceRecommendationService {
  constructor(
    private readonly repo: IMarketplaceRecommendationRepository,
  ) {}

  // ─── Personalised recommendations ─────────────────────────────────────────

  async getRecommendations(
    userId:  string,
    params?: RecommendationParams,
  ): Promise<Recommendation[]> {
    const limit  = Math.max(1, Math.min(params?.limit  ?? 20, 100));
    const offset = Math.max(0, params?.offset ?? 0);

    // Fetch context + candidates in parallel
    const [purchases, watchlistEntries, savedSearches, candidates] =
      await Promise.all([
        this.repo.getUserPurchases(userId),
        this.repo.getUserWatchlist(userId),
        this.repo.getUserSavedSearches(userId),
        this.repo.getActiveListings(),
      ]);

    const catFreq   = categoryFrequency(purchases);
    const maxCat    = Math.max(...Array.from(catFreq.values()), 0) || 1;

    const watchedRarities = new Set(
      watchlistEntries.map(w => w.rarity).filter((r): r is string => r !== null),
    );

    // Score each candidate
    const scored: Recommendation[] = [];
    const seen    = new Set<string>();

    for (const item of candidates) {
      if (seen.has(item.listingId)) continue;
      seen.add(item.listingId);

      let score  = 0;
      const reasons: string[] = [];

      // 1. Purchase history (max 30)
      const freq = catFreq.get(item.category) ?? 0;
      if (freq > 0) {
        const w = Math.round((freq / maxCat) * 30 * 10) / 10;
        score += w;
        reasons.push("Dựa trên lịch sử mua hàng của bạn");
      }

      // 2. Watchlist — rarity match (25)
      if (watchedRarities.has(item.rarity)) {
        score += 25;
        reasons.push("Tương tự với các mặt hàng trong danh sách theo dõi của bạn");
      }

      // 3. Saved searches — filter match (20)
      const matchesSaved = savedSearches.some(s => matchesSavedSearch(item, s));
      if (matchesSaved) {
        score += 20;
        reasons.push("Phù hợp với tìm kiếm đã lưu của bạn");
      }

      // 4. Trending — bid count proxy (max 15)
      const trendW = Math.min(15, item.bidCount * 3);
      score += trendW;
      if (trendW > 5) reasons.push("Đang có xu hướng trên thị trường");

      // 5. Seller reputation (max 10)
      const sellerScore = await this.repo.getSellerScore(item.sellerId);
      const repW        = Math.round((sellerScore / 100) * 10 * 10) / 10;
      score += repW;
      if (repW > 5) reasons.push("Người bán được tin cậy cao");

      scored.push({
        listingId: item.listingId,
        itemName:  item.itemName,
        score:     Math.round(score * 10) / 10,
        reason:    reasons[0] ?? "Đề xuất dựa trên xu hướng thị trường",
        category:  item.category,
        rarity:    item.rarity,
        price:     item.price,
        currency:  item.currency,
        sellerId:  item.sellerId,
      });
    }

    // Sort by score desc, then paginate
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(offset, offset + limit);
  }

  // ─── Trending ──────────────────────────────────────────────────────────────

  async getTrending(limit = 10): Promise<TrendingResult> {
    const [listings, auctions] = await Promise.all([
      this.repo.getActiveListings(),
      this.repo.getActiveAuctions(limit),
    ]);

    // Top listings by recency (newest first)
    const topListings = [...listings]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);

    // Top auctions already sorted by bid count from repo
    const topAuctions = auctions.slice(0, limit);

    // Top categories by listing count
    const catMap = new Map<string, number>();
    for (const l of listings) {
      catMap.set(l.category, (catMap.get(l.category) ?? 0) + 1);
    }
    const topCategories = [...catMap.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    // Top keywords from item names (simple word frequency, ignore short words)
    const wordMap = new Map<string, number>();
    const stopWords = new Set(["the", "a", "an", "of", "in", "và", "với", "cho"]);
    for (const l of listings) {
      for (const raw of l.itemName.toLowerCase().split(/\s+/)) {
        const word = raw.replace(/[^a-z0-9àáâãèéêìíòóôõùúýăđơư]/g, "");
        if (word.length > 2 && !stopWords.has(word)) {
          wordMap.set(word, (wordMap.get(word) ?? 0) + 1);
        }
      }
    }
    const topKeywords = [...wordMap.entries()]
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { topListings, topAuctions, topCategories, topKeywords };
  }

  // ─── Similar listings ──────────────────────────────────────────────────────

  async getSimilar(
    listingId: string,
    userId?:   string,
    params?:   RecommendationParams,
  ): Promise<Recommendation[]> {
    const limit  = Math.max(1, Math.min(params?.limit  ?? 10, 50));
    const offset = Math.max(0, params?.offset ?? 0);

    // Find the target listing
    const allListings = await this.repo.getActiveListings();
    const target = allListings.find(l => l.listingId === listingId);
    if (!target) return [];

    const priceMin = target.price * 0.5;
    const priceMax = target.price * 1.5;

    // Filter candidates: same category + rarity, price range, exclude self
    const candidates = await this.repo.getActiveListings({
      category:   target.category,
      rarity:     target.rarity,
      minPrice:   priceMin,
      maxPrice:   priceMax,
      excludeIds: [listingId],
    });

    // Score and sort
    const scored: Recommendation[] = [];
    const seen = new Set<string>();

    for (const item of candidates) {
      if (seen.has(item.listingId)) continue;
      seen.add(item.listingId);

      let score = 50; // base score for same category + rarity
      const reasons: string[] = ["Cùng danh mục và độ hiếm"];

      // Price proximity bonus (max 20)
      const priceDelta  = Math.abs(item.price - target.price) / (target.price || 1);
      const priceBonus  = Math.round((1 - priceDelta) * 20 * 10) / 10;
      score += priceBonus;

      // Trending bonus (max 15)
      const trendW = Math.min(15, item.bidCount * 3);
      score += trendW;
      if (trendW > 5) reasons.push("Đang có xu hướng trên thị trường");

      // Seller reputation (max 10)
      const sellerScore = await this.repo.getSellerScore(item.sellerId);
      const repW        = Math.round((sellerScore / 100) * 10 * 10) / 10;
      score += repW;
      if (repW > 5) reasons.push("Người bán được tin cậy cao");

      scored.push({
        listingId: item.listingId,
        itemName:  item.itemName,
        score:     Math.round(score * 10) / 10,
        reason:    reasons[0] ?? "Mặt hàng tương tự",
        category:  item.category,
        rarity:    item.rarity,
        price:     item.price,
        currency:  item.currency,
        sellerId:  item.sellerId,
      });
    }

    // userId context: boost if matches purchase/watchlist history
    if (userId) {
      const [purchases, watchlistEntries] = await Promise.all([
        this.repo.getUserPurchases(userId),
        this.repo.getUserWatchlist(userId),
      ]);
      const boughtCategories = new Set(purchases.map(p => p.category));
      const watchedRarities  = new Set(
        watchlistEntries.map(w => w.rarity).filter((r): r is string => r !== null),
      );

      for (const rec of scored) {
        if (boughtCategories.has(rec.category)) rec.score += 5;
        if (watchedRarities.has(rec.rarity))    rec.score += 3;
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(offset, offset + limit);
  }
}
