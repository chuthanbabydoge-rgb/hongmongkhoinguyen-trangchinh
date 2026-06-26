// ─────────────────────────────────────────────────────────────────────────────
// AiEventBus — HUB-16
// ─────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "node:events";

export type AiEventType =
  | "AI_MESSAGE"
  | "AI_TYPING"
  | "AI_SUGGESTION"
  | "AI_MEMORY_UPDATED"
  | "AI_CONTEXT_UPDATED"
  | "AI_ERROR"
  | "AI_STREAM_START"
  | "AI_STREAM_CHUNK"
  | "AI_STREAM_END"
  | "AI_FEEDBACK";

export interface AiEvent {
  type:            AiEventType;
  userId:          string;
  conversationId?: string;
  payload:         unknown;
  timestamp:       string;
}

class AiEventBus extends EventEmitter {
  private static readonly CHANNEL = "ai:event";

  publish(event: AiEvent): void {
    this.emit(AiEventBus.CHANNEL, event);
  }

  subscribe(handler: (event: AiEvent) => void): () => void {
    this.on(AiEventBus.CHANNEL, handler);
    return () => this.off(AiEventBus.CHANNEL, handler);
  }
}

export const aiEventBus = new AiEventBus();
