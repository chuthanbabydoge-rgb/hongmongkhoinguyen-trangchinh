// ─────────────────────────────────────────────────────────────────────────────
// CombatEventBus — HUB-19
// ─────────────────────────────────────────────────────────────────────────────

export type CombatEventType =
  | "BATTLE_CREATED"
  | "BATTLE_STARTED"
  | "TURN_STARTED"
  | "TURN_FINISHED"
  | "PLAYER_ATTACKED"
  | "SKILL_CAST"
  | "CRITICAL_HIT"
  | "PLAYER_DIED"
  | "PLAYER_REVIVED"
  | "BATTLE_FINISHED"
  | "REWARD_GRANTED"
  | "LEVEL_GAINED";

export interface CombatEvent {
  type:      CombatEventType;
  battleId:  string;
  userId?:   string;
  payload?:  Record<string, unknown>;
  timestamp: string;
}

type Handler = (event: CombatEvent) => void | Promise<void>;

class CombatEventBus {
  private handlers = new Map<CombatEventType | "*", Handler[]>();

  publish(event: Omit<CombatEvent, "timestamp">): void {
    const full: CombatEvent = { ...event, timestamp: new Date().toISOString() };
    const specific = this.handlers.get(event.type) ?? [];
    const wildcard = this.handlers.get("*") ?? [];
    for (const h of [...specific, ...wildcard]) {
      Promise.resolve(h(full)).catch(() => {});
    }
  }

  on(type: CombatEventType | "*", handler: Handler): void {
    const list = this.handlers.get(type) ?? [];
    list.push(handler);
    this.handlers.set(type, list);
  }

  off(type: CombatEventType | "*", handler: Handler): void {
    const list = this.handlers.get(type) ?? [];
    this.handlers.set(type, list.filter(h => h !== handler));
  }
}

export const combatEventBus = new CombatEventBus();
