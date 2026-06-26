import { EventEmitter } from "node:events";

// ─── Event Types ──────────────────────────────────────────────────────────────

export type CraftingEvent =
  | { type: "CRAFT_STARTED";    userId: string; jobId: string; recipeId: string; recipeName: string }
  | { type: "CRAFT_COMPLETED";  userId: string; jobId: string; recipeId: string; recipeName: string; outputItemId?: string }
  | { type: "CRAFT_FAILED";     userId: string; jobId: string; recipeId: string; reason: string }
  | { type: "ITEM_UPGRADED";    userId: string; itemId: string; upgradeType: string; level: number }
  | { type: "ITEM_ENCHANTED";   userId: string; itemId: string; enchantType: string; value: number }
  | { type: "RESOURCE_GATHERED";userId: string; nodeId: string; resourceType: string; amount: number }
  | { type: "RESOURCE_RESPAWNED"; nodeId: string; resourceType: string; amount: number }
  | { type: "NPC_PURCHASE";     userId: string; shopId: string; itemId: string; quantity: number; cost: number }
  | { type: "NPC_SALE";         userId: string; shopId: string; itemId: string; quantity: number; earned: number }
  | { type: "MARKET_PRICE_CHANGED"; resourceType: string; price: number; change: number }
  | { type: "BLUEPRINT_UNLOCKED"; userId: string; recipeId: string; recipeName: string };

class CraftingEventBusImpl extends EventEmitter {
  publish(data: CraftingEvent): void {
    super.emit("crafting", data);
  }

  onCrafting(listener: (data: CraftingEvent) => void): this {
    return super.on("crafting", listener as (...args: unknown[]) => void);
  }
}

export const craftingEventBus = new CraftingEventBusImpl();
