const API = "/api";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `HTTP ${res.status}`);
  }
  const body = await res.json();
  return (body as any).data as T;
}

export interface Recipe {
  id: string; name: string; description: string | null; category: string;
  craftingTime: number; craftingCost: number; requiredLevel: number;
  isEnabled: boolean;
  ingredients: Array<{ id: string; resourceType: string | null; itemType: string | null; quantity: number }>;
  outputs: Array<{ id: string; resourceType: string | null; itemType: string | null; quantity: number; chance: number; isGuaranteed: boolean }>;
}

export interface CraftJob {
  id: string; userId: string; recipeId: string; status: string;
  startedAt: string; finishesAt: string; completedAt: string | null;
}

export interface ResourceNode {
  id: string; name: string; resourceType: string; maxAmount: number;
  currentAmount: number; respawnTime: number; posX: number; posY: number; isActive: boolean;
}

export interface NpcShop {
  id: string; name: string; description: string | null; currency: string;
  items: Array<{
    id: string; name: string; resourceType: string | null; itemType: string | null;
    buyPrice: number; sellPrice: number; stock: number; isInfinite: boolean;
  }>;
}

export interface ResourceMarketPrice {
  id: string; resourceType: string; price: number; change: number; updatedAt: string;
}

export interface EconomyStats {
  totalCrafted: number; totalGathered: number; totalTraded: number;
  totalNpcBuys: number; totalNpcSells: number; creditsSpent: number; creditsEarned: number;
}

export interface Blueprint { id: string; userId: string; recipeId: string; unlockedAt: string; }
export interface ItemUpgrade { id: string; itemId: string; upgradeType: string; level: number; upgradedAt: string; }
export interface ItemEnchantment { id: string; itemId: string; enchantType: string; value: number; enchantedAt: string; }

export const craftingService = {
  getRecipes:       (category?: string)           => req<Recipe[]>(`/crafting/recipes${category ? `?category=${category}` : ""}`),
  getRecipe:        (id: string)                  => req<Recipe>(`/crafting/recipes/${id}`),
  startCraft:       (recipeId: string)            => req<CraftJob>("/crafting/start", { method: "POST", body: JSON.stringify({ recipeId }) }),
  completeCraft:    (jobId: string)               => req<{ job: CraftJob; outputs: unknown[] }>(`/crafting/${jobId}/complete`, { method: "POST" }),
  cancelCraft:      (jobId: string)               => req<CraftJob>(`/crafting/${jobId}/cancel`, { method: "POST" }),
  getJobs:          (status?: string)             => req<CraftJob[]>(`/crafting/jobs${status ? `?status=${status}` : ""}`),
  getHistory:       (limit = 20)                  => req<unknown[]>(`/crafting/history?limit=${limit}`),
  getResources:     (worldId?: string)            => req<ResourceNode[]>(`/resources${worldId ? `?worldId=${worldId}` : ""}`),
  gather:           (nodeId: string, amount = 1)  => req<unknown>("/resources/gather", { method: "POST", body: JSON.stringify({ nodeId, amount }) }),
  getShops:         ()                            => req<NpcShop[]>("/shops"),
  getShop:          (id: string)                  => req<NpcShop>(`/shops/${id}`),
  buyItem:          (shopId: string, itemId: string, quantity = 1) => req<{ cost: number; item: string }>(`/shops/${shopId}/buy`, { method: "POST", body: JSON.stringify({ itemId, quantity }) }),
  sellItem:         (shopId: string, itemId: string, quantity = 1) => req<{ earned: number; item: string }>(`/shops/${shopId}/sell`, { method: "POST", body: JSON.stringify({ itemId, quantity }) }),
  upgradeItem:      (itemId: string, upgradeType = "LEVEL", cost = 50) => req<ItemUpgrade>(`/items/${itemId}/upgrade`, { method: "POST", body: JSON.stringify({ upgradeType, cost }) }),
  enchantItem:      (itemId: string, enchantType = "FIRE", value = 10, cost = 100) => req<ItemEnchantment>(`/items/${itemId}/enchant`, { method: "POST", body: JSON.stringify({ enchantType, value, cost }) }),
  getBlueprints:    ()                            => req<Blueprint[]>("/blueprints"),
  unlockBlueprint:  (recipeId: string)            => req<Blueprint>(`/blueprints/${recipeId}/unlock`, { method: "POST" }),
  getEconomy:       ()                            => req<{ stats: EconomyStats; prices: ResourceMarketPrice[] }>("/economy"),
  getPrices:        ()                            => req<ResourceMarketPrice[]>("/economy/prices"),
  fluctuatePrices:  ()                            => req<ResourceMarketPrice[]>("/economy/prices/fluctuate", { method: "POST" }),
  getStations:      ()                            => req<unknown[]>("/crafting/stations"),
};
