// ─────────────────────────────────────────────────────────────────────────────
// useMarketplaceFeed (V2.9)
//
// React hook that connects to the singleton MarketplaceRealtimeService and
// exposes a filtered, paginated view of the live event feed.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  marketplaceRealtimeService,
  type FeedPost,
  type FeedStats,
  type MarketplaceEventType,
} from "@/services/realtimeService";

// ─── Filter types ──────────────────────────────────────────────────────────────

export type FeedFilter =
  | "all"
  | "listings"
  | "auctions"
  | "pricing"
  | "notifications"
  | "moderation"
  | "reputation";

const FILTER_EVENTS: Record<FeedFilter, MarketplaceEventType[]> = {
  all:           [],
  listings:      ["LISTING_CREATED", "LISTING_REMOVED", "LISTING_SOLD"],
  auctions:      ["AUCTION_CREATED", "AUCTION_CANCELLED", "AUCTION_COMPLETED", "BID_PLACED"],
  pricing:       ["PRICE_DROP"],
  notifications: ["NOTIFICATION_CREATED"],
  moderation:    ["SELLER_SUSPENDED", "SELLER_BANNED"],
  reputation:    ["SELLER_LEVEL_UP"],
};

function applyFilter(posts: FeedPost[], filter: FeedFilter): FeedPost[] {
  const allowed = FILTER_EVENTS[filter];
  if (allowed.length === 0) return posts;
  const set = new Set<MarketplaceEventType>(allowed);
  return posts.filter(p => set.has(p.type));
}

// ─── Return shape ──────────────────────────────────────────────────────────────

export interface UseFeedResult {
  posts:          FeedPost[];       // filtered, newest first
  allPosts:       FeedPost[];       // unfiltered
  stats:          FeedStats;
  filter:         FeedFilter;
  setFilter:      (f: FeedFilter) => void;
  togglePause:    () => void;
  clear:          () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMarketplaceFeed(): UseFeedResult {
  const initial = marketplaceRealtimeService.getState();
  const [allPosts, setAllPosts] = useState<FeedPost[]>(initial.posts);
  const [stats,    setStats]    = useState<FeedStats>(initial.stats);
  const [filter,   setFilter]   = useState<FeedFilter>("all");

  useEffect(() => {
    marketplaceRealtimeService.connect();
    const unsub = marketplaceRealtimeService.subscribe((posts, newStats) => {
      setAllPosts(posts);
      setStats(newStats);
    });
    return unsub;
    // Intentionally NOT disconnecting on unmount — the feed is persistent
  }, []);

  const posts = useMemo(() => applyFilter(allPosts, filter), [allPosts, filter]);

  const togglePause = useCallback(() => {
    marketplaceRealtimeService.togglePause();
  }, []);

  const clear = useCallback(() => {
    marketplaceRealtimeService.clear();
  }, []);

  return { posts, allPosts, stats, filter, setFilter, togglePause, clear };
}
