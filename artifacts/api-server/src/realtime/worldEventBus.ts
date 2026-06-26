import { EventEmitter } from "node:events";

export type WorldEventType =
  | "WORLD_CREATED"
  | "WORLD_UPDATED"
  | "WORLD_DELETED"
  | "WORLD_JOINED"
  | "WORLD_LEFT"
  | "WORLD_TRAVEL"
  | "INSTANCE_CREATED"
  | "INSTANCE_CLOSED"
  | "PLAYER_ENTER"
  | "PLAYER_EXIT"
  | "PRESENCE_UPDATED";

export interface WorldEvent {
  type:      WorldEventType;
  userId?:   string;
  worldId?:  string;
  payload:   Record<string, unknown>;
  timestamp: string;
}

class WorldEventBus extends EventEmitter {
  private static readonly CHANNEL = "world:event";

  publish(event: WorldEvent): void {
    this.emit(WorldEventBus.CHANNEL, event);
  }

  subscribe(handler: (event: WorldEvent) => void): () => void {
    this.on(WorldEventBus.CHANNEL, handler);
    return () => this.off(WorldEventBus.CHANNEL, handler);
  }
}

export const worldEventBus = new WorldEventBus();
