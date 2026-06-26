// ─────────────────────────────────────────────────────────────────────────────
// PetEventBus — HUB-20
// ─────────────────────────────────────────────────────────────────────────────

export type PetEventType =
  | "PET_CREATED"
  | "PET_LEVEL_UP"
  | "PET_EVOLVED"
  | "PET_SUMMONED"
  | "PET_DISMISSED"
  | "PET_SKILL_UNLOCKED"
  | "PET_TRAINED"
  | "PET_FED"
  | "PET_EQUIPPED"
  | "MOUNT_CREATED"
  | "MOUNT_LEVEL_UP"
  | "MOUNT_TRAVEL"
  | "MOUNT_ARRIVED"
  | "MOUNT_TRAINED"
  | "MOUNT_EQUIPPED";

export interface PetEvent {
  type:      PetEventType;
  userId:    string;
  entityId:  string;
  payload?:  Record<string, unknown>;
  timestamp: string;
}

type Handler = (event: PetEvent) => void | Promise<void>;

class PetEventBus {
  private handlers = new Map<PetEventType | "*", Handler[]>();

  publish(event: Omit<PetEvent, "timestamp">): void {
    const full: PetEvent = { ...event, timestamp: new Date().toISOString() };
    const specific = this.handlers.get(event.type) ?? [];
    const wildcard = this.handlers.get("*") ?? [];
    for (const h of [...specific, ...wildcard]) {
      Promise.resolve(h(full)).catch(() => {});
    }
  }

  on(type: PetEventType | "*", handler: Handler): void {
    const list = this.handlers.get(type) ?? [];
    list.push(handler);
    this.handlers.set(type, list);
  }

  off(type: PetEventType | "*", handler: Handler): void {
    const list = this.handlers.get(type) ?? [];
    this.handlers.set(type, list.filter(h => h !== handler));
  }
}

export const petEventBus = new PetEventBus();
