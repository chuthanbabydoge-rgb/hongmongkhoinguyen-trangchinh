import { useState, useEffect, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/apiClient";

export type Rarity   = "common" | "rare" | "epic" | "legendary" | "mythic";
export type ItemStatus = "active" | "inactive" | "locked" | "trading" | "equipped" | "used" | "expired";
export type InventoryCategory = "pets" | "football" | "world-assets" | "tickets" | "items";

export interface InventoryItem {
  id:         string;
  category:   InventoryCategory;
  name:       string;
  rarity:     Rarity;
  status:     ItemStatus;
  acquiredAt: string;
}

export interface InventorySummary {
  pets:            number;
  footballPlayers: number;
  tickets:         number;
  worldAssets:     number;
  items:           number;
  total:           number;
}

interface ApiInventoryResponse {
  ok:    boolean;
  data:  { items: InventoryItem[]; summary: InventorySummary };
}

interface ApiItemsResponse {
  ok:    boolean;
  data:  InventoryItem[];
  total: number;
}

export const RARITY_META: Record<Rarity, { label: string; color: string; bg: string; border: string; glow: string }> = {
  common:    { label: "Phổ thông",  color: "text-gray-400",    bg: "bg-gray-400/10",    border: "border-gray-400/20",    glow: "" },
  rare:      { label: "Hiếm",       color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    glow: "shadow-[0_0_12px_rgba(96,165,250,0.15)]" },
  epic:      { label: "Sử thi",     color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20",  glow: "shadow-[0_0_12px_rgba(192,132,252,0.2)]" },
  legendary: { label: "Huyền thoại",color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   glow: "shadow-[0_0_12px_rgba(251,191,36,0.2)]" },
  mythic:    { label: "Thần thoại", color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20",    glow: "shadow-[0_0_16px_rgba(251,113,133,0.25)]" },
};

export const STATUS_META: Record<ItemStatus, { label: string; color: string; dot: string }> = {
  active:   { label: "Hoạt động",  color: "text-emerald-400", dot: "bg-emerald-400" },
  equipped: { label: "Đang trang bị", color: "text-blue-400", dot: "bg-blue-400" },
  inactive: { label: "Không hoạt động", color: "text-gray-400", dot: "bg-gray-400" },
  locked:   { label: "Bị khóa",    color: "text-red-400",     dot: "bg-red-400" },
  trading:  { label: "Đang giao dịch", color: "text-amber-400", dot: "bg-amber-400" },
  used:     { label: "Đã dùng",    color: "text-gray-500",    dot: "bg-gray-500" },
  expired:  { label: "Hết hạn",    color: "text-red-600",     dot: "bg-red-600" },
};

export const CATEGORY_ICON: Record<InventoryCategory, string> = {
  pets:           "🐾",
  football:       "⚽",
  "world-assets": "🌍",
  tickets:        "🎫",
  items:          "🎒",
};

export function useInventoryItems(category?: InventoryCategory, limit = 100) {
  const [items,     setItems]     = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ limit: String(limit) });
      if (category) qs.set("category", category);
      const res = await apiFetch<ApiItemsResponse["data"]>(`/inventory/items?${qs.toString()}`);
      setItems(res as unknown as InventoryItem[]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Vui lòng đăng nhập để xem kho đồ.");
      } else {
        setError(err instanceof Error ? err.message : "Không thể tải danh sách vật phẩm.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [category, limit]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { items, isLoading, error, refresh: fetch };
}

export function useInventorySummary() {
  const [summary,   setSummary]   = useState<InventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiInventoryResponse["data"]>("/inventory");
      setSummary((res as { summary: InventorySummary }).summary ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Vui lòng đăng nhập để xem kho đồ.");
      } else {
        setError(err instanceof Error ? err.message : "Không thể tải thông tin kho.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  return { summary, isLoading, error, refresh: fetch };
}
