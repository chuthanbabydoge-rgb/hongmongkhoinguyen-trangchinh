---
name: HUB-15 Universe World Service
description: World management system — DB schema, backend service, REST API, realtime bus, and frontend pages.
---

# HUB-15 — Universe World Service (Metaverse Foundation)

## DB Schema
- `lib/db/src/schema/worlds.ts` — 11 tables + enums (worlds, world_regions, world_zones, world_instances, world_members, world_presence, world_bookmarks, world_travel_history, world_portals, world_assets, world_events)
- Exported from `lib/db/src/schema/index.ts`

## Backend
- `artifacts/api-server/src/realtime/worldEventBus.ts` — WorldEvent types + bus
- `artifacts/api-server/src/repositories/worldRepository.ts` — IWorldRepository interface + InMemoryWorldRepository
- `artifacts/api-server/src/repositories/drizzle/DrizzleWorldRepository.ts` — DrizzleWorldRepository (use `sql\`...\`` for enum eq comparisons, NOT `eq(col, enumVal)` — causes overload error)
- `artifacts/api-server/src/services/worldService.ts` — WorldService (notifService.fire takes 4 positional args; reputationService uses "GUILD_CREATED" for world creation)
- `artifacts/api-server/src/controllers/worldController.ts` — all handlers
- `artifacts/api-server/src/routes/worlds.ts` — registered in routes/index.ts
- `artifacts/api-server/src/container.ts` — wires worldRepo + worldService, seeds "worlds" app
- `artifacts/api-server/src/realtime/marketplaceWebSocketServer.ts` — broadcasts worldEventBus events

## Quest Event Types Added
- WORLD_TRAVEL, VISIT_WORLD, JOIN_WORLD added to questEventBus.ts

## Frontend
- `artifacts/universe-hub/src/services/worldService.ts`
- Pages in `artifacts/universe-hub/src/pages/worlds/`: WorldDashboard, WorldExplorer, WorldDetail, WorldCreate, WorldEdit, FeaturedWorlds, PopularWorlds, WorldBookmarks, WorldTravelHistory
- `artifacts/universe-hub/src/components/dashboard/WorldWidget.tsx`
- Routes registered in App.tsx, sidebar entry under "Mạng xã hội" using `Earth` icon from lucide-react

## API Routes (prefix /api)
- GET /worlds, /worlds/featured, /worlds/popular, /worlds/recent, /worlds/search
- POST /worlds (auth), GET/PUT/DELETE /worlds/:id
- POST/DELETE /worlds/:id/bookmark, GET /worlds/bookmarks (auth)
- POST /worlds/:id/join, /worlds/:id/leave, /worlds/:id/travel (auth)
- GET /worlds/:id/members, /worlds/:id/presence
- GET/POST /worlds/:id/events
- GET /worlds/dashboard, /worlds/travel-history (auth)

**Why:** Drizzle enum columns must use `sql` template for equality checks — `eq()` overloads don't resolve for pgEnum columns.
