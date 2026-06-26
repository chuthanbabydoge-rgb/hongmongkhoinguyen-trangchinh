// ─────────────────────────────────────────────────────────────────────────────
// DungeonEventBus — HUB-21
// ─────────────────────────────────────────────────────────────────────────────

export type DungeonEventType =
  | "DUNGEON_CREATED"
  | "DUNGEON_STARTED"
  | "DUNGEON_COMPLETED"
  | "DUNGEON_FAILED"
  | "ROOM_COMPLETED"
  | "MONSTER_KILLED"
  | "BOSS_SPAWNED"
  | "BOSS_KILLED"
  | "PLAYER_REVIVED"
  | "LOOT_GRANTED"
  | "RAID_CREATED"
  | "RAID_STARTED"
  | "RAID_COMPLETED"
  | "RAID_FAILED"
  | "RAID_BOSS_PHASE"
  | "RAID_DAMAGE";

export interface DungeonEvent {
  type:      DungeonEventType;
  userId:    string;
  entityId:  string;
  payload?:  Record<string, unknown>;
  timestamp: string;
}

type Handler = (event: DungeonEvent) => void | Promise<void>;

class DungeonEventBus {
  private handlers = new Map<DungeonEventType | "*", Handler[]>();

  publish(event: Omit<DungeonEvent, "timestamp">): void {
    const full: DungeonEvent = { ...event, timestamp: new Date().toISOString() };
    const specific = this.handlers.get(event.type) ?? [];
    const wildcard = this.handlers.get("*") ?? [];
    for (const h of [...specific, ...wildcard]) {
      Promise.resolve(h(full)).catch(() => {});
    }
  }

  on(type: DungeonEventType | "*", handler: Handler): void {
    const list = this.handlers.get(type) ?? [];
    list.push(handler);
    this.handlers.set(type, list);
  }

  off(type: DungeonEventType | "*", handler: Handler): void {
    const list = this.handlers.get(type) ?? [];
    this.handlers.set(type, list.filter(h => h !== handler));
  }
}

export const dungeonEventBus = new DungeonEventBus();
