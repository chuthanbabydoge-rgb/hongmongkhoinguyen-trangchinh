import { useState, useCallback } from "react";

export interface RecentApp {
  slug:     string;
  name:     string;
  icon?:    string;
  category: string;
  openedAt: string;
}

const RECENT_KEY   = "hub_recent_apps";
const FAVORITE_KEY = "hub_favorites";
const MAX_RECENT   = 5;

function readRecent(): RecentApp[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as RecentApp[];
  } catch {
    return [];
  }
}

function readFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function useLauncherStore() {
  const [recentApps, setRecentApps]   = useState<RecentApp[]>(readRecent);
  const [favorites,  setFavorites]    = useState<string[]>(readFavorites);

  const recordLaunch = useCallback((app: RecentApp) => {
    setRecentApps(prev => {
      const next = [
        { ...app, openedAt: new Date().toISOString() },
        ...prev.filter(r => r.slug !== app.slug),
      ].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  );

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites(prev => {
      const next = prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug];
      localStorage.setItem(FAVORITE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recentApps, favorites, recordLaunch, isFavorite, toggleFavorite };
}
