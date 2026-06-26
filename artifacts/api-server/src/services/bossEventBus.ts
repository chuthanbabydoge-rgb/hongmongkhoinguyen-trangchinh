// ─────────────────────────────────────────────────────────────────────────────
// BossEventBus — HUB-22
// ─────────────────────────────────────────────────────────────────────────────

export type BossEventType =
  | "BOSS_SPAWNED"
  | "BOSS_PHASE_CHANGED"
  | "BOSS_ENRAGED"
  | "BOSS_SKILL_CAST"
  | "BOSS_DEFEATED"
  | "BOSS_HP_UPDATED"
  | "BOSS_DAMAGE"
  | "BOSS_JOINED"
  | "WORLD_EVENT_STARTED"
  | "WORLD_EVENT_UPDATED"
  | "WORLD_EVENT_COMPLETED"
  | "WEATHER_CHANGED"
  | "WORLD_DISASTER_STARTED";

export interface BossEvent {
  type:      BossEventType;
  bossId?:   string;
  eventId?:  string;
  userId?:   string;
  payload:   Record<string, unknown>;
  timestamp: string;
}

type BossHandler = (event: BossEvent) => void | Promise<void>;

class BossEventBusImpl {
  private handlers = new Map<BossEventType | "*", BossHandler[]>();

  publish(event: Omit<BossEvent, "timestamp">): void {
    const full: BossEvent = { ...event, timestamp: new Date().toISOString() };
    const specific = this.handlers.get(event.type) ?? [];
    const wildcard = this.handlers.get("*") ?? [];
    for (const h of [...specific, ...wildcard]) {
      Promise.resolve(h(full)).catch(() => {});
    }
  }

  on(type: BossEventType | "*", handler: BossHandler): void {
    const list = this.handlers.get(type) ?? [];
    list.push(handler);
    this.handlers.set(type, list);
  }

  off(type: BossEventType | "*", handler: BossHandler): void {
    const list = this.handlers.get(type) ?? [];
    this.handlers.set(type, list.filter(h => h !== handler));
  }
}

export const bossEventBus = new BossEventBusImpl();
