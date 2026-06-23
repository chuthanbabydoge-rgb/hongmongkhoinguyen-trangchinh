// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceEventBus (V2.6)
//
// Lightweight in-process pub/sub bus for marketplace real-time events.
// Publishers call publish(); the WebSocket server subscribes via subscribe().
// ─────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "node:events";

// ─── Event type catalogue ─────────────────────────────────────────────────────

export type MarketplaceEventType =
  | "LISTING_CREATED"
  | "LISTING_REMOVED"
  | "LISTING_SOLD"
  | "AUCTION_CREATED"
  | "AUCTION_CANCELLED"
  | "AUCTION_COMPLETED"
  | "BID_PLACED"
  | "PRICE_DROP"
  | "NOTIFICATION_CREATED"
  | "SELLER_LEVEL_UP"
  | "SELLER_SUSPENDED"
  | "SELLER_BANNED";

// ─── Event envelope ───────────────────────────────────────────────────────────

export interface MarketplaceEvent {
  type:      MarketplaceEventType;
  timestamp: string;
  data:      Record<string, unknown>;
  /** When set the WebSocket server routes the event to subscribers of this userId. */
  userId?:   string;
}

// ─── Bus ──────────────────────────────────────────────────────────────────────

class MarketplaceEventBus extends EventEmitter {
  private static readonly CHANNEL = "mp:event";

  publish(event: MarketplaceEvent): void {
    this.emit(MarketplaceEventBus.CHANNEL, event);
  }

  subscribe(handler: (event: MarketplaceEvent) => void): () => void {
    this.on(MarketplaceEventBus.CHANNEL, handler);
    return () => this.off(MarketplaceEventBus.CHANNEL, handler);
  }
}

export const marketplaceEventBus = new MarketplaceEventBus();
