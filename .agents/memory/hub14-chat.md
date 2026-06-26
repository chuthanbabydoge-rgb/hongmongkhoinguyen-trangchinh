---
name: HUB-14 Chat System
description: Patterns and gotchas from the real-time chat implementation
---

## Express 5 req.params typing
`req.params["id"]!` causes TS2769 in Express 5 — the type is `string | string[]`.
Always use `req.params["id"] as string` pattern (matching marketplaceController).

## ProfileDTO fields
`ProfileDTO` has `displayName: string | null` and `username: string`.
No `firstName` or `lastName`. Use: `profile.displayName || profile.username || "Người dùng"`.

## DB enum synchronization rule
Any new `ReputationEventType`, `NotificationType`, or `ActivityType` value in the TS repo code
must also be added to the corresponding pgEnum in `lib/db/src/schema/*.ts` and pushed via
`pnpm --filter @workspace/db run push`. If out of sync, Drizzle `.values()` throws TS2769.

**Why:** Drizzle generates column types directly from schema enums; inserting an unknown enum value
fails at the TypeScript layer even before hitting the DB.

**How to apply:** When adding a new event type, update BOTH the repo TS union AND the schema file.

## fire() return type
`userReputationService.fire()` returns `void` (not Promise). Do NOT call `.catch()` on it.
Calls in services: `this.userReputationService.fire(userId, "EVENT_TYPE");` — no await, no catch.

## Chat WebSocket bus
9 event types on `chatEventBus` (separate from `marketplaceEventBus`), both share the `/ws/marketplace`
WS endpoint. Subscribe by userId to receive targeted events.

## Chat app seeding
`registerApp({slug:'chat',...})` in container.ts throws `SlugAlreadyExistsError` if the app already exists,
so idempotent seeding needs try/catch or upsert. The `/api/apps` route only has GET (no POST for HUB-14).
Seeded directly to `ecosystem_apps` table via DB or can use `appRegistryService.registerApp()` with
`.catch(() => {})` in container.ts.
