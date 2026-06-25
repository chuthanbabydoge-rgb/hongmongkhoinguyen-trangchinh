// ─────────────────────────────────────────────────────────────────────────────
// ChatEventBus — HUB-14
// Lightweight in-process pub/sub for chat realtime events.
// ─────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "node:events";

export type ChatEventType =
  | "CHAT_ROOM_CREATED"
  | "CHAT_MESSAGE_SENT"
  | "CHAT_MESSAGE_UPDATED"
  | "CHAT_MESSAGE_DELETED"
  | "CHAT_MESSAGE_READ"
  | "CHAT_USER_TYPING"
  | "CHAT_USER_STOPPED_TYPING"
  | "CHAT_REACTION"
  | "CHAT_PIN"
  | "CHAT_MEMBER_JOINED"
  | "CHAT_MEMBER_LEFT"
  | "CHAT_UNREAD_COUNT";

export interface ChatEvent {
  type:      ChatEventType;
  timestamp: string;
  roomId:    string;
  userId?:   string;
  data:      Record<string, unknown>;
}

class ChatEventBus extends EventEmitter {
  private static readonly CHANNEL = "chat:event";

  publish(event: ChatEvent): void {
    this.emit(ChatEventBus.CHANNEL, event);
  }

  subscribe(handler: (event: ChatEvent) => void): () => void {
    this.on(ChatEventBus.CHANNEL, handler);
    return () => this.off(ChatEventBus.CHANNEL, handler);
  }
}

export const chatEventBus = new ChatEventBus();
