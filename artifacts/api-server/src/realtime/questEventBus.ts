// ─────────────────────────────────────────────────────────────────────────────
// QuestEventBus — HUB-12.5
//
// Lightweight in-process pub/sub bus for quest-related ecosystem events.
// Publishers call publish(); QuestProgressEngine subscribes via subscribe().
//
// Rules:
//   • Services ONLY call publish() — never QuestService directly.
//   • QuestProgressEngine is the sole subscriber.
//   • This module has ZERO dependencies on any service or repository.
// ─────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "node:events";

// ─── Event type catalogue ────────────────────────────────────────────────────

export type QuestEventType =
  | "USER_LOGIN"
  | "OPEN_APP"
  | "WALLET_TRANSFER"
  | "MARKETPLACE_LISTING"
  | "MARKETPLACE_PURCHASE"
  | "MARKETPLACE_SALE"
  | "INVENTORY_ACQUIRED"
  | "INVENTORY_COLLECTED"
  | "ADD_FRIEND"
  | "FOLLOW_USER"
  | "JOIN_GUILD"
  | "CREATE_GUILD"
  | "GUILD_CONTRIBUTION"
  | "REPUTATION_GAINED"
  | "QUEST_COMPLETED"
  | "ACHIEVEMENT_UNLOCKED"
  | "MAIL_CLAIMED";

// ─── Event envelope ──────────────────────────────────────────────────────────

export interface QuestEvent {
  userId:    string;
  type:      QuestEventType;
  amount?:   number;
  metadata?: Record<string, unknown>;
}

// ─── Bus ─────────────────────────────────────────────────────────────────────

class QuestEventBus extends EventEmitter {
  private static readonly CHANNEL = "quest:event";

  publish(event: QuestEvent): void {
    this.emit(QuestEventBus.CHANNEL, event);
  }

  subscribe(handler: (event: QuestEvent) => void): () => void {
    this.on(QuestEventBus.CHANNEL, handler);
    return () => this.off(QuestEventBus.CHANNEL, handler);
  }
}

export const questEventBus = new QuestEventBus();
