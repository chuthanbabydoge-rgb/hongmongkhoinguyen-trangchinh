// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceRealtimeService (V2.6)
//
// Thin typed wrapper around the event bus. Injected into services that need
// to broadcast real-time events. All emits are synchronous and non-throwing.
// ─────────────────────────────────────────────────────────────────────────────

import {
  marketplaceEventBus,
  type MarketplaceEventType,
} from "../realtime/marketplaceEventBus";

export class MarketplaceRealtimeService {
  /**
   * Publish an event to all connected WebSocket clients that match.
   *
   * @param type    - Event type string.
   * @param data    - Payload (serialised to JSON).
   * @param userId  - When provided, clients subscribed to this userId receive the event.
   */
  emit(
    type:    MarketplaceEventType,
    data:    Record<string, unknown>,
    userId?: string,
  ): void {
    marketplaceEventBus.publish({
      type,
      timestamp: new Date().toISOString(),
      data,
      userId,
    });
  }
}
