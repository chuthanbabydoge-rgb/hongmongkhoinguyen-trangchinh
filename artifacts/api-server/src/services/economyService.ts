// ─────────────────────────────────────────────────────────────────────────────
// EconomyService — HUB-17
// ─────────────────────────────────────────────────────────────────────────────

import type { ICraftingRepository, EconomyStatistics, ResourceMarketPrice, ResourceType } from "../repositories/craftingRepository.js";
import { craftingEventBus } from "./craftingEventBus.js";
import { economyEventBus }  from "./economyEventBus.js";

export class EconomyError extends Error {
  constructor(message: string, public code = "ECONOMY_ERROR", public status = 400) {
    super(message);
    this.name = "EconomyError";
  }
}

const RESOURCE_TYPES: ResourceType[] = ["WOOD","STONE","IRON","GOLD","CRYSTAL","MAGIC","FOOD","HERB"];

export class EconomyService {
  constructor(private readonly repo: ICraftingRepository) {}

  async getStats(date?: string): Promise<EconomyStatistics> {
    const d = date ?? new Date().toISOString().split("T")[0]!;
    const stats = await this.repo.getEconomyStats(d);
    if (stats) return stats;
    // Auto-create today's record via increment
    await this.repo.incrementStat(d, "totalCrafted", 0);
    return (await this.repo.getEconomyStats(d))!;
  }

  async getPrices(): Promise<ResourceMarketPrice[]> {
    const prices = await this.repo.getMarketPrices();
    if (prices.length === 0) {
      await this.repo.seedMarketPrices();
      return this.repo.getMarketPrices();
    }
    return prices;
  }

  async updatePrice(resourceType: ResourceType, newPrice: number): Promise<ResourceMarketPrice> {
    const current = await this.repo.getMarketPrice(resourceType);
    const oldPrice = current?.price ?? 10;
    const change = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;

    const updated = await this.repo.updateMarketPrice(resourceType, newPrice, change);

    craftingEventBus.publish({ type: "MARKET_PRICE_CHANGED", resourceType, price: newPrice, change });
    economyEventBus.publish({ type: "MARKET_UPDATED", resourceType, price: newPrice, change });

    return updated;
  }

  async fluctuatePrices(): Promise<ResourceMarketPrice[]> {
    const results: ResourceMarketPrice[] = [];
    for (const rt of RESOURCE_TYPES) {
      const current = await this.repo.getMarketPrice(rt);
      const base = current?.price ?? 10;
      const fluctuation = (Math.random() - 0.5) * 0.2;
      const newPrice = Math.max(1, Math.round(base * (1 + fluctuation)));
      results.push(await this.updatePrice(rt, newPrice));
    }
    return results;
  }

  async getDashboard() {
    const [stats, prices] = await Promise.all([this.getStats(), this.getPrices()]);
    return { stats, prices, resourceTypes: RESOURCE_TYPES };
  }
}
