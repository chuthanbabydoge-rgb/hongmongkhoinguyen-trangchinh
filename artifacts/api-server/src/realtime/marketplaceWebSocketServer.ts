// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceWebSocketServer (V2.6)
//
// Mounts a WebSocket server at /ws/marketplace on the existing HTTP server.
// Clients subscribe by userId or event type:
//   { action: "subscribe", userId: "abc" }
//   { action: "subscribe", events: ["PRICE_DROP", "NOTIFICATION_CREATED"] }
// ─────────────────────────────────────────────────────────────────────────────

import { WebSocketServer, WebSocket } from "ws";
import type { Server }                from "node:http";
import { logger }                     from "../lib/logger";
import {
  marketplaceEventBus,
  type MarketplaceEvent,
  type MarketplaceEventType,
} from "./marketplaceEventBus";
import { mailEventBus, type MailEvent }   from "./mailEventBus";
import { chatEventBus, type ChatEvent }   from "./chatEventBus";

// ─── Metrics ──────────────────────────────────────────────────────────────────

let _connectedClients = 0;
let _subscriptions    = 0;
let _messagesSent     = 0;

export function getRealtimeStats() {
  return {
    connectedClients: _connectedClients,
    subscriptions:    _subscriptions,
    messagesSent:     _messagesSent,
  };
}

// ─── Per-client state ─────────────────────────────────────────────────────────

interface ClientState {
  ws:          WebSocket;
  userIds:     Set<string>;
  eventTypes:  Set<MarketplaceEventType>;
  subscribeAll: boolean;
}

// ─── Attach ───────────────────────────────────────────────────────────────────

export function attachWebSocketServer(server: Server): WebSocketServer {
  const wss     = new WebSocketServer({ server, path: "/ws/marketplace" });
  const clients = new Map<WebSocket, ClientState>();

  function broadcast(event: MarketplaceEvent | MailEvent | ChatEvent): void {
    for (const [, state] of clients) {
      if (state.ws.readyState !== WebSocket.OPEN) continue;
      const userId = "userId" in event ? event.userId : undefined;
      const matchesUser = !!(userId && state.userIds.has(userId));
      const matchesType = state.eventTypes.has(event.type as MarketplaceEventType);
      const matchesAll  = state.subscribeAll;
      if (!matchesUser && !matchesType && !matchesAll) continue;
      try {
        state.ws.send(JSON.stringify(event));
        _messagesSent++;
      } catch (err) {
        logger.warn({ err }, "[WS:marketplace] send failed");
      }
    }
  }

  // Broadcast marketplace bus events to matching clients
  marketplaceEventBus.subscribe((event: MarketplaceEvent) => broadcast(event));

  // Broadcast mail bus events — routed by userId
  mailEventBus.subscribe((event: MailEvent) => broadcast(event));

  // Broadcast chat bus events — routed by roomId/userId
  chatEventBus.subscribe((event: ChatEvent) => broadcast(event));

  wss.on("connection", (ws) => {
    _connectedClients++;
    const state: ClientState = {
      ws,
      userIds:      new Set(),
      eventTypes:   new Set(),
      subscribeAll: false,
    };
    clients.set(ws, state);
    logger.info("[WS:marketplace] client connected");

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as Record<string, unknown>;

        if (msg["action"] === "subscribe") {
          if (typeof msg["userId"] === "string") {
            if (!state.userIds.has(msg["userId"])) {
              state.userIds.add(msg["userId"]);
              _subscriptions++;
            }
          }
          if (Array.isArray(msg["events"])) {
            for (const ev of msg["events"]) {
              if (typeof ev === "string" && !state.eventTypes.has(ev as MarketplaceEventType)) {
                state.eventTypes.add(ev as MarketplaceEventType);
                _subscriptions++;
              }
            }
          }
          // No filters → subscribe to everything
          if (!msg["userId"] && !msg["events"]) {
            if (!state.subscribeAll) {
              state.subscribeAll = true;
              _subscriptions++;
            }
          }
        } else if (msg["action"] === "unsubscribe") {
          if (typeof msg["userId"] === "string" && state.userIds.has(msg["userId"])) {
            state.userIds.delete(msg["userId"]);
            _subscriptions = Math.max(0, _subscriptions - 1);
          }
          if (Array.isArray(msg["events"])) {
            for (const ev of msg["events"]) {
              if (typeof ev === "string" && state.eventTypes.has(ev as MarketplaceEventType)) {
                state.eventTypes.delete(ev as MarketplaceEventType);
                _subscriptions = Math.max(0, _subscriptions - 1);
              }
            }
          }
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      _connectedClients = Math.max(0, _connectedClients - 1);
      const s = clients.get(ws);
      if (s) {
        const owned =
          s.userIds.size +
          s.eventTypes.size +
          (s.subscribeAll ? 1 : 0);
        _subscriptions = Math.max(0, _subscriptions - owned);
        clients.delete(ws);
      }
      logger.info("[WS:marketplace] client disconnected");
    });

    ws.on("error", (err) => {
      logger.warn({ err }, "[WS:marketplace] client error");
    });
  });

  logger.info("[WS:marketplace] server attached at /ws/marketplace");
  return wss;
}
