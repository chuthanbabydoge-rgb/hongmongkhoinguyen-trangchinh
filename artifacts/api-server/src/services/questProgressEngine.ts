// ─────────────────────────────────────────────────────────────────────────────
// QuestProgressEngine — HUB-12.5
//
// Subscribes to QuestEventBus and automatically updates quest progress.
// No polling. No cron. No database scanning.
// Pattern: Observer — services emit events, this engine reacts.
//
// Mapping: QuestEventType → ObjectiveType → trackObjectiveEvent()
// After tracking, pushes QUEST_PROGRESS / QUEST_COMPLETED to the
// marketplaceEventBus so the frontend WebSocket receives real-time updates.
// ─────────────────────────────────────────────────────────────────────────────

import { questEventBus, type QuestEvent, type QuestEventType } from "../realtime/questEventBus.js";
import { marketplaceEventBus } from "../realtime/marketplaceEventBus.js";
import type { QuestService } from "./questService.js";
import type { ObjectiveType } from "../repositories/questRepository.js";
import { logger } from "../lib/logger.js";

// ─── Event → Objective mapping ────────────────────────────────────────────────

const EVENT_TO_OBJECTIVE: Partial<Record<QuestEventType, ObjectiveType>> = {
  USER_LOGIN:           "LOGIN",
  WALLET_TRANSFER:      "TRANSFER_WALLET",
  MARKETPLACE_LISTING:  "CREATE_LISTING",
  MARKETPLACE_PURCHASE: "BUY_ITEM",
  MARKETPLACE_SALE:     "SELL_ITEM",
  INVENTORY_ACQUIRED:   "OWN_ITEM",
  INVENTORY_COLLECTED:  "COLLECT_ITEM",
  ADD_FRIEND:           "ADD_FRIEND",
  JOIN_GUILD:           "JOIN_GUILD",
  CREATE_GUILD:         "JOIN_GUILD",
  GUILD_CONTRIBUTION:   "CONTRIBUTE_GUILD",
  REPUTATION_GAINED:    "GAIN_REPUTATION",
};

// ─── Engine ───────────────────────────────────────────────────────────────────

export class QuestProgressEngine {
  private unsubscribe: (() => void) | null = null;

  constructor(private readonly questService: QuestService) {}

  start(): void {
    this.unsubscribe = questEventBus.subscribe(this.handleEvent.bind(this));
    logger.info("[QuestEngine] đã khởi động — lắng nghe quest event bus");
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    logger.info("[QuestEngine] đã dừng");
  }

  private handleEvent(event: QuestEvent): void {
    const objectiveType = EVENT_TO_OBJECTIVE[event.type];
    if (!objectiveType) return;

    const amount = event.amount ?? 1;

    this.questService
      .trackObjectiveEvent(event.userId, objectiveType, amount)
      .then(() => {
        marketplaceEventBus.publish({
          type:      "QUEST_PROGRESS",
          timestamp: new Date().toISOString(),
          userId:    event.userId,
          data: {
            eventType:     event.type,
            objectiveType,
            amount,
            metadata: event.metadata ?? {},
          },
        });
      })
      .catch((err: unknown) => {
        logger.warn(
          { err, userId: event.userId, eventType: event.type },
          "[QuestEngine] trackObjectiveEvent thất bại",
        );
      });
  }
}
