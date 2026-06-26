import { EventEmitter } from "node:events";

// ─── Event Types ──────────────────────────────────────────────────────────────

export type EconomyEvent =
  | { type: "CREDITS_SPENT";    userId: string; amount: number; reason: string }
  | { type: "CREDITS_EARNED";   userId: string; amount: number; reason: string }
  | { type: "MARKET_UPDATED";   resourceType: string; price: number; change: number }
  | { type: "STATS_UPDATED";    date: string; field: string; delta: number };

class EconomyEventBusImpl extends EventEmitter {
  publish(data: EconomyEvent): void {
    super.emit("economy", data);
  }

  onEconomy(listener: (data: EconomyEvent) => void): this {
    return super.on("economy", listener as (...args: unknown[]) => void);
  }
}

export const economyEventBus = new EconomyEventBusImpl();
