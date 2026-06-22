// ─────────────────────────────────────────────────────────────────────────────
// Inventory service — GET /api/inventory, GET /api/inventory/items
// ─────────────────────────────────────────────────────────────────────────────

import { apiFetch } from "@/lib/apiClient";

export type ApiInventoryCategory =
  | "pets"
  | "football"
  | "world-assets"
  | "tickets"
  | "items";

export interface ApiInventorySummary {
  pets: number;
  footballPlayers: number;
  tickets: number;
  worldAssets: number;
  items: number;
  total: number;
}

export interface ApiInventoryItem {
  id: string;
  category: ApiInventoryCategory;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  status: "active" | "inactive" | "locked" | "trading" | "equipped";
  acquiredAt: string;
}

export interface ApiInventory {
  userId: string;
  summary: ApiInventorySummary;
  items: ApiInventoryItem[];
}

export async function fetchInventory(): Promise<ApiInventory> {
  return apiFetch<ApiInventory>("/inventory");
}

export async function fetchInventoryItems(
  category?: ApiInventoryCategory,
  limit = 50,
): Promise<ApiInventoryItem[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category) params.set("category", category);
  return apiFetch<ApiInventoryItem[]>(`/inventory/items?${params}`);
}
