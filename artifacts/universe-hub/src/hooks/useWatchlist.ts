// ─────────────────────────────────────────────────────────────────────────────
// useWatchlist — global watchlist state hook (V2.0)
//
// Provides:
//   watchlist     — full list of entries
//   count         — total entry count
//   isWatched()   — quick O(1) lookup by targetType+targetId
//   watchedId()   — returns the watchlist entry id for a given target (for DELETE)
//   toggle()      — add or remove a watch (optimistic)
//   refresh()     — re-fetch from server
//   isLoading     — initial load indicator
//   error         — last error string or null
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import type { WatchlistEntry, WatchlistTargetType, AddWatchlistPayload } from "@/services/watchlistService";
import {
  fetchWatchlist,
  addWatchlistEntry,
  removeWatchlistEntry,
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

  // Build a lookup key → entry id map for O(1) checks
  const keyMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of entries) {
      m.set(`${e.targetType}:${e.targetId}`, e.id);
    }
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
      // Optimistic remove
      setEntries(prev => prev.filter(e => e.id !== existingId));
      try {
        await removeWatchlistEntry(existingId);
      } catch {
        await refresh(); // revert on failure
      }
    } else {
      // Optimistic add
      const tempEntry: WatchlistEntry = {
        id:         `temp-${Date.now()}`,
        userId:     MOCK_USER_ID,
        targetType: type,
        targetId,
        itemName:   snapshot.itemName ?? null,
        price:      snapshot.price    ?? null,
        rarity:     snapshot.rarity   ?? null,
        status:     snapshot.status   ?? null,
        createdAt:  new Date().toISOString(),
      };
      setEntries(prev => [tempEntry, ...prev]);

      const payload: AddWatchlistPayload = {
        userId:    MOCK_USER_ID,
        targetType: type,
        targetId,
        ...snapshot,
      };
      try {
        const { data } = await addWatchlistEntry(payload);
        // Replace temp entry with real one
        setEntries(prev => prev.map(e => e.id === tempEntry.id ? data : e));
      } catch {
        await refresh(); // revert on failure
      }
    }
  }, [keyMap, refresh]);

  return {
    watchlist: entries,
    count:     entries.length,
    isLoading,
    error,
    isWatched,
    watchedId,
    toggle,
    refresh,
  };
}
