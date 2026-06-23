// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: Marketplace Real-time System (V2.6)
//
// Covers: event bus, WebSocket subscriptions, all event types, metrics, cleanup.
// No Supabase or network required — uses in-process mocks.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { WebSocket } from "ws";

import { marketplaceEventBus }   from "../../realtime/marketplaceEventBus.js";
import { attachWebSocketServer, getRealtimeStats } from "../../realtime/marketplaceWebSocketServer.js";
import { MarketplaceRealtimeService }              from "../marketplaceRealtimeService.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createServer() {
  const server = http.createServer();
  const wss    = attachWebSocketServer(server);
  return { server, wss };
}

function waitMessage(ws: WebSocket): Promise<unknown> {
  return new Promise((resolve, reject) => {
    ws.once("message", (raw) => {
      try { resolve(JSON.parse(raw.toString())); }
      catch (e) { reject(e); }
    });
    setTimeout(() => reject(new Error("timeout waiting for message")), 1000);
  });
}

function openConnection(port: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}/ws/marketplace`);
    ws.once("open",  () => resolve(ws));
    ws.once("error", reject);
    setTimeout(() => reject(new Error("connection timeout")), 2000);
  });
}

function listenOnRandomPort(server: http.Server): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve(addr.port);
    });
  });
}

function closeServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplaceEventBus", () => {
  test("publish and subscribe", () => {
    const received: unknown[] = [];
    const unsub = marketplaceEventBus.subscribe((e) => received.push(e));

    marketplaceEventBus.publish({
      type:      "LISTING_CREATED",
      timestamp: new Date().toISOString(),
      data:      { listingId: "l-1" },
    });

    unsub();
    assert.equal(received.length, 1);
    assert.deepEqual((received[0] as { type: string }).type, "LISTING_CREATED");
  });

  test("unsubscribe stops delivery", () => {
    const received: unknown[] = [];
    const unsub = marketplaceEventBus.subscribe((e) => received.push(e));
    unsub();

    marketplaceEventBus.publish({
      type:      "LISTING_REMOVED",
      timestamp: new Date().toISOString(),
      data:      {},
    });

    assert.equal(received.length, 0);
  });
});

describe("MarketplaceRealtimeService", () => {
  test("emit publishes to bus", () => {
    const svc      = new MarketplaceRealtimeService();
    const captured: unknown[] = [];
    const unsub    = marketplaceEventBus.subscribe((e) => captured.push(e));

    svc.emit("BID_PLACED", { auctionId: "a-1", amount: 500 }, "user-1");

    unsub();
    assert.equal(captured.length, 1);
    const ev = captured[0] as { type: string; userId: string; data: { amount: number } };
    assert.equal(ev.type, "BID_PLACED");
    assert.equal(ev.userId, "user-1");
    assert.equal(ev.data.amount, 500);
  });
});

describe("WebSocket connection", () => {
  let server: http.Server;
  let port:   number;

  beforeEach(async () => {
    ({ server } = createServer());
    port = await listenOnRandomPort(server);
  });

  afterEach(async () => {
    await closeServer(server);
  });

  test("client connects successfully", async () => {
    const ws = await openConnection(port);
    assert.equal(ws.readyState, WebSocket.OPEN);
    ws.close();
  });

  test("metrics increment on connect", async () => {
    const before = getRealtimeStats().connectedClients;
    const ws     = await openConnection(port);
    const after  = getRealtimeStats().connectedClients;
    assert.ok(after >= before + 1);
    ws.close();
  });
});

describe("WebSocket subscription — userId", () => {
  let server: http.Server;
  let port:   number;

  beforeEach(async () => {
    ({ server } = createServer());
    port = await listenOnRandomPort(server);
  });

  afterEach(async () => {
    await closeServer(server);
  });

  test("client receives events for subscribed userId", async () => {
    const ws = await openConnection(port);

    ws.send(JSON.stringify({ action: "subscribe", userId: "user-42" }));
    await new Promise((r) => setTimeout(r, 50));

    const msgPromise = waitMessage(ws);
    marketplaceEventBus.publish({
      type:      "NOTIFICATION_CREATED",
      timestamp: new Date().toISOString(),
      data:      { message: "hello" },
      userId:    "user-42",
    });

    const msg = await msgPromise as { type: string };
    ws.close();
    assert.equal(msg.type, "NOTIFICATION_CREATED");
  });

  test("client does not receive events for other userId", async () => {
    const ws = await openConnection(port);
    ws.send(JSON.stringify({ action: "subscribe", userId: "user-42" }));
    await new Promise((r) => setTimeout(r, 50));

    let received = false;
    ws.on("message", () => { received = true; });

    marketplaceEventBus.publish({
      type:      "LISTING_SOLD",
      timestamp: new Date().toISOString(),
      data:      {},
      userId:    "user-99",
    });

    await new Promise((r) => setTimeout(r, 100));
    ws.close();
    assert.equal(received, false);
  });
});

describe("WebSocket subscription — event types", () => {
  let server: http.Server;
  let port:   number;

  beforeEach(async () => {
    ({ server } = createServer());
    port = await listenOnRandomPort(server);
  });

  afterEach(async () => {
    await closeServer(server);
  });

  test("client receives subscribed event type", async () => {
    const ws = await openConnection(port);
    ws.send(JSON.stringify({ action: "subscribe", events: ["PRICE_DROP"] }));
    await new Promise((r) => setTimeout(r, 50));

    const msgPromise = waitMessage(ws);
    marketplaceEventBus.publish({
      type:      "PRICE_DROP",
      timestamp: new Date().toISOString(),
      data:      { itemName: "Rồng", oldPrice: 1000, newPrice: 800, dropPct: 20 },
    });

    const msg = await msgPromise as { type: string };
    ws.close();
    assert.equal(msg.type, "PRICE_DROP");
  });

  test("client does not receive unsubscribed event type", async () => {
    const ws = await openConnection(port);
    ws.send(JSON.stringify({ action: "subscribe", events: ["PRICE_DROP"] }));
    await new Promise((r) => setTimeout(r, 50));

    let received = false;
    ws.on("message", () => { received = true; });

    marketplaceEventBus.publish({
      type:      "LISTING_CREATED",
      timestamp: new Date().toISOString(),
      data:      {},
    });

    await new Promise((r) => setTimeout(r, 100));
    ws.close();
    assert.equal(received, false);
  });
});

describe("Real-time event types", () => {
  let server: http.Server;
  let port:   number;

  beforeEach(async () => {
    ({ server } = createServer());
    port = await listenOnRandomPort(server);
  });

  afterEach(async () => {
    await closeServer(server);
  });

  const EVENT_TYPES = [
    "LISTING_CREATED",
    "AUCTION_CREATED",
    "BID_PLACED",
    "PRICE_DROP",
    "NOTIFICATION_CREATED",
    "SELLER_LEVEL_UP",
  ] as const;

  for (const evType of EVENT_TYPES) {
    test(`broadcasts ${evType}`, async () => {
      const ws = await openConnection(port);
      ws.send(JSON.stringify({ action: "subscribe", events: [evType] }));
      await new Promise((r) => setTimeout(r, 50));

      const msgPromise = waitMessage(ws);
      marketplaceEventBus.publish({
        type:      evType,
        timestamp: new Date().toISOString(),
        data:      { test: true },
      });

      const msg = await msgPromise as { type: string };
      ws.close();
      assert.equal(msg.type, evType);
    });
  }
});

describe("Moderation events", () => {
  let server: http.Server;
  let port:   number;

  beforeEach(async () => {
    ({ server } = createServer());
    port = await listenOnRandomPort(server);
  });

  afterEach(async () => {
    await closeServer(server);
  });

  test("SELLER_SUSPENDED broadcast", async () => {
    const ws = await openConnection(port);
    ws.send(JSON.stringify({ action: "subscribe", events: ["SELLER_SUSPENDED"] }));
    await new Promise((r) => setTimeout(r, 50));

    const msgPromise = waitMessage(ws);
    marketplaceEventBus.publish({
      type:      "SELLER_SUSPENDED",
      timestamp: new Date().toISOString(),
      data:      { sellerId: "s-1", reason: "Spam" },
    });

    const msg = await msgPromise as { type: string };
    ws.close();
    assert.equal(msg.type, "SELLER_SUSPENDED");
  });

  test("SELLER_BANNED broadcast", async () => {
    const ws = await openConnection(port);
    ws.send(JSON.stringify({ action: "subscribe", events: ["SELLER_BANNED"] }));
    await new Promise((r) => setTimeout(r, 50));

    const msgPromise = waitMessage(ws);
    marketplaceEventBus.publish({
      type:      "SELLER_BANNED",
      timestamp: new Date().toISOString(),
      data:      { sellerId: "s-2", reason: "Fraud" },
    });

    const msg = await msgPromise as { type: string };
    ws.close();
    assert.equal(msg.type, "SELLER_BANNED");
  });
});

describe("Disconnect cleanup", () => {
  let server: http.Server;
  let port:   number;

  beforeEach(async () => {
    ({ server } = createServer());
    port = await listenOnRandomPort(server);
  });

  afterEach(async () => {
    await closeServer(server);
  });

  test("subscription count decreases after disconnect", async () => {
    const ws = await openConnection(port);
    ws.send(JSON.stringify({ action: "subscribe", events: ["BID_PLACED", "PRICE_DROP"] }));
    await new Promise((r) => setTimeout(r, 50));

    const before = getRealtimeStats().subscriptions;
    ws.close();
    await new Promise((r) => setTimeout(r, 100));

    const after = getRealtimeStats().subscriptions;
    assert.ok(after <= before);
  });
});

describe("Metrics counter", () => {
  let server: http.Server;
  let port:   number;

  beforeEach(async () => {
    ({ server } = createServer());
    port = await listenOnRandomPort(server);
  });

  afterEach(async () => {
    await closeServer(server);
  });

  test("messagesSent increments on delivery", async () => {
    const ws = await openConnection(port);
    ws.send(JSON.stringify({ action: "subscribe", events: ["LISTING_SOLD"] }));
    await new Promise((r) => setTimeout(r, 50));

    const before = getRealtimeStats().messagesSent;
    const msgPromise = waitMessage(ws);
    marketplaceEventBus.publish({
      type:      "LISTING_SOLD",
      timestamp: new Date().toISOString(),
      data:      { listingId: "l-1", price: 500 },
    });

    await msgPromise;
    ws.close();

    const after = getRealtimeStats().messagesSent;
    assert.ok(after > before);
  });
});
