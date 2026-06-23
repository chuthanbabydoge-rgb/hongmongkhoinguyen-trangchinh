// ─────────────────────────────────────────────────────────────────────────────
// useWatchlist — global watchlist state hook (V2.1)
//
// Provides:
//   watchlist       — full list of entries (with price-drop fields)
//   count           — total entry count
//   priceDropCount  — entries that have dropped in price
//   isWatched()     — O(1) lookup by targetType+targetId
//   watchedId()     — watchlist entry id for a given target (for DELETE)
//   toggle()        — add or remove (optimistic)
//   checkPrice()    — trigger price-drop detection for an entry
//   refresh()       — re-fetch from server
//   isLoading       — initial load indicator
//   error           — last error string or null
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import type { WatchlistEntry, WatchlistTargetType, AddWatchlistPayload, PriceCheckResult } from "@/services/watchlistService";
import {
  fetchWatchlist,
  addWatchlistEntry,
  removeWatchlistEntry,
  checkWatchlistPrice,
} from "@/services/watchlistService";

const MOCK_USER_ID = "user-001";

export interface WatchlistSnapshot {
  itemName?: string;
  price?:    number;
  rarity?:   string;
  status?:   string;
}

export function useWatchlist() {
  const [entries,   setEntries]   = useState<WatchlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const { data } = await fetchWatchlist(MOCK_USER_ID);
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const keyMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of entries) m.set(`${e.targetType}:${e.targetId}`, e.id);
    return m;
  }, [entries]);

  const watchKey = (type: WatchlistTargetType, id: string) => `${type}:${id}`;

  const isWatched = useCallback(
    (type: WatchlistTargetType, targetId: string) => keyMap.has(watchKey(type, targetId)),
    [keyMap],
  );

  const watchedId = useCallback(
    (type: WatchlistTargetType, targetId: string) => keyMap.get(watchKey(type, targetId)) ?? null,
    [keyMap],
  );

  const toggle = useCallback(async (
    type:     WatchlistTargetType,
    targetId: string,
    snapshot: WatchlistSnapshot = {},
  ) => {
    const existingId = keyMap.get(watchKey(type, targetId));

    if (existingId) {
      setEntries(prev => prev.filter(e => e.id !== existingId));
      try {
        await removeWatchlistEntry(existingId);
      } catch {
        await refresh();
      }
    } else {
      const tempEntry: WatchlistEntry = {
        id:                `temp-${Date.now()}`,
        userId:            MOCK_USER_ID,
        targetType:        type,
        targetId,
        itemName:          snapshot.itemName ?? null,
        price:             snapshot.price    ?? null,
        rarity:            snapshot.rarity   ?? null,
        status:            snapshot.status   ?? null,
        watchPrice:        snapshot.price    ?? null,
        lastSeenPrice:     snapshot.price    ?? null,
        priceDropCount:    0,
        lastPriceChangeAt: null,
        createdAt:         new Date().toISOString(),
      };
      setEntries(prev => [tempEntry, ...prev]);

      const payload: AddWatchlistPayload = {
        userId:     MOCK_USER_ID,
        targetType: type,
        targetId,
        ...snapshot,
      };
      try {
        const { data } = await addWatchlistEntry(payload);
        setEntries(prev => prev.map(e => e.id === tempEntry.id ? data : e));
      } catch {
        await refresh();
      }
    }
  }, [keyMap, refresh]);

  const checkPrice = useCallback(async (
    id:           string,
    currentPrice: number,
  ): Promise<PriceCheckResult | null> => {
    try {
      const result = await checkWatchlistPrice(id, currentPrice);
      // Sync updated entry into local state
      setEntries(prev => prev.map(e => e.id === result.entry.id ? result.entry : e));
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi kiểm tra giá.";
      setError(msg);
      return null;
    }
  }, []);

  const priceDropCount = useMemo(
    () => entries.filter(e => e.priceDropCount > 0).length,
    [entries],
  );

  return {
    watchlist:      entries,
    count:          entries.length,
    priceDropCount,
    isLoading,
    error,
    isWatched,
    watchedId,
    toggle,
    checkPrice,
    refresh,
  };
}
