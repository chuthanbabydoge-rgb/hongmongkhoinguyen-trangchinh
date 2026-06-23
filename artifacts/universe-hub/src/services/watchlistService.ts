// ─────────────────────────────────────────────────────────────────────────────
// Watchlist service — /api/marketplace/watchlist
// ─────────────────────────────────────────────────────────────────────────────

import { apiFetch } from "@/lib/apiClient";

export type WatchlistTargetType = "listing" | "auction";

export interface WatchlistEntry {
  id:         string;
  userId:     string;
  targetType: WatchlistTargetType;
  targetId:   string;
  itemName:   string | null;
  price:      number | null;
  rarity:     string | null;
  status:     string | null;
  createdAt:  string;
}

export interface AddWatchlistPayload {
  userId:     string;
  targetType: WatchlistTargetType;
  targetId:   string;
  itemName?:  string;
  price?:     number;
  rarity?:    string;
  status?:    string;
}

interface AddResponse {
  created: boolean;
  data:    WatchlistEntry;
}

interface ListResponse {
  total: number;
  data:  WatchlistEntry[];
}

export async function addWatchlistEntry(payload: AddWatchlistPayload): Promise<AddResponse> {
  const res = await fetch("/api/marketplace/watchlist", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  const json = await res.json() as { ok: boolean; created: boolean; data: WatchlistEntry; error?: string };
  if (!json.ok) throw new Error(json.error ?? "Không thể thêm vào danh sách theo dõi.");
  return { created: json.created, data: json.data };
}

export async function removeWatchlistEntry(id: string): Promise<void> {
  const res = await fetch(`/api/marketplace/watchlist/${id}`, { method: "DELETE" });
  const json = await res.json() as { ok: boolean; error?: string };
  if (!json.ok) throw new Error(json.error ?? "Không thể xóa khỏi danh sách theo dõi.");
}

export async function fetchWatchlist(userId: string): Promise<ListResponse> {
  const res = await fetch(`/api/marketplace/watchlist?userId=${encodeURIComponent(userId)}`);
  const json = await res.json() as { ok: boolean; total: number; data: WatchlistEntry[]; error?: string };
  if (!json.ok) throw new Error(json.error ?? "Không thể tải danh sách theo dõi.");
  return { total: json.total, data: json.data };
}

export async function fetchWatchlistCount(userId: string): Promise<number> {
  const res = await fetch(`/api/marketplace/watchlist/count?userId=${encodeURIComponent(userId)}`);
  const json = await res.json() as { ok: boolean; count: number; error?: string };
  if (!json.ok) return 0;
  return json.count;
}
