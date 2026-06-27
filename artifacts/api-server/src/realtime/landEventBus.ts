// ─────────────────────────────────────────────────────────────────────────────
// LandEventBus — HUB-28
// ─────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "events";

export type LandEventType =
  | "LAND_CREATED"
  | "LAND_TRANSFERRED"
  | "LAND_SOLD"
  | "LAND_PURCHASED"
  | "BUILDING_CREATED"
  | "BUILDING_UPGRADED"
  | "BUILDING_DESTROYED"
  | "CONSTRUCTION_STARTED"
  | "CONSTRUCTION_COMPLETED"
  | "CITY_CREATED"
  | "DISTRICT_CREATED"
  | "ROAD_CREATED"
  | "UTILITY_CONNECTED"
  | "TELEPORT_USED"
  | "LAND_RENTED";

export interface LandEvent {
  type:    LandEventType;
  payload: Record<string, unknown>;
  ts:      number;
}

class LandEventBus extends EventEmitter {
  emit(type: LandEventType, payload: Record<string, unknown> = {}): boolean {
    return super.emit(type, { type, payload, ts: Date.now() } satisfies LandEvent);
  }

  on(type: LandEventType, listener: (e: LandEvent) => void): this {
    return super.on(type, listener);
  }
}

export const landEventBus = new LandEventBus();
