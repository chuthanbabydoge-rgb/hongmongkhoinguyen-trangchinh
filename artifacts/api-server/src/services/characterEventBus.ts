// ─────────────────────────────────────────────────────────────────────────────
// CharacterEventBus — HUB-18
// ─────────────────────────────────────────────────────────────────────────────

export type CharacterEventType =
  | "CHARACTER_CREATED"
  | "LEVEL_UP"
  | "EXPERIENCE_GAINED"
  | "ITEM_EQUIPPED"
  | "ITEM_UNEQUIPPED"
  | "SKILL_UNLOCKED"
  | "SKILL_UPGRADED"
  | "TITLE_UNLOCKED"
  | "CLASS_CHANGED"
  | "POWER_CHANGED";

export interface CharacterEvent {
  type:        CharacterEventType;
  characterId: string;
  userId:      string;
  payload?:    Record<string, unknown>;
  timestamp:   string;
}

type Handler = (event: CharacterEvent) => void | Promise<void>;

class CharacterEventBus {
  private handlers = new Map<CharacterEventType | "*", Handler[]>();

  publish(event: Omit<CharacterEvent, "timestamp">): void {
    const full: CharacterEvent = { ...event, timestamp: new Date().toISOString() };
    const specific = this.handlers.get(event.type) ?? [];
    const wildcard = this.handlers.get("*") ?? [];
    for (const h of [...specific, ...wildcard]) {
      Promise.resolve(h(full)).catch(() => {});
    }
  }

  on(type: CharacterEventType | "*", handler: Handler): void {
    const list = this.handlers.get(type) ?? [];
    list.push(handler);
    this.handlers.set(type, list);
  }

  off(type: CharacterEventType | "*", handler: Handler): void {
    const list = this.handlers.get(type) ?? [];
    this.handlers.set(type, list.filter(h => h !== handler));
  }
}

export const characterEventBus = new CharacterEventBus();
