// ─────────────────────────────────────────────────────────────────────────────
// creatorEventBus — HUB-24
//
// Lightweight in-process pub/sub bus for Universe Creator events.
// Broadcasts to WebSocket clients via marketplaceWebSocketServer.
// ─────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "node:events";

export type CreatorEventType =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_PUBLISHED"
  | "PROJECT_FORKED"
  | "ASSET_UPLOADED"
  | "MEMBER_ADDED"
  | "COMMENT_ADDED";

export interface CreatorEvent {
  type:      CreatorEventType;
  userId:    string;
  projectId: string;
  payload?:  Record<string, unknown>;
}

class CreatorEventBus extends EventEmitter {
  private static readonly CHANNEL = "creator:event";

  publish(event: CreatorEvent): void {
    this.emit(CreatorEventBus.CHANNEL, event);
  }

  subscribe(handler: (event: CreatorEvent) => void): () => void {
    this.on(CreatorEventBus.CHANNEL, handler);
    return () => this.off(CreatorEventBus.CHANNEL, handler);
  }
}

export const creatorEventBus = new CreatorEventBus();
