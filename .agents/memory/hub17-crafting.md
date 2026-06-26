---
name: HUB-17 Crafting & Economy
description: Architecture decisions and gotchas for the Universe Economy & Crafting system
---

# HUB-17 — Universe Economy & Crafting System

## Key wiring rule
`CraftingService`, `ResourceService`, `NPCShopService` all take `IUserReputationRepository` as their 4th constructor arg.
Pass `userReputationRepo` (the raw repo variable), NOT `userReputationService` (the service wrapper).

**Why:** The services need the repo interface, not the service class — passing the service causes TS2345.

## App registry
`crafting` (slug) and `economy` (slug) are registered in `appRegistryService.ts` `SEED_APPS` array with category `UTILITY`.

## Sidebar icons
- Universe Crafting → `Hammer`, path `/crafting`
- Tài nguyên → `Pickaxe`, path `/resources`
- Cửa hàng NPC → `Store`, path `/shops`
- Universe Economy → `BarChart`, path `/economy`

## DB seeding
Container seeds default data on startup:
- `seedDefaultStations()` — 5 crafting stations
- `seedDefaultRecipes()` — 5 recipes (e.g. "Bánh mì thảo mộc")
- `seedDefaultNodes()` — 8 resource nodes
- `seedDefaultShops()` — 1 NPC shop "Cửa hàng Vật liệu"
- `seedMarketPrices()` — 8 resource market prices

## Frontend pages
- `/crafting` → CraftDashboard
- `/crafting/recipes` → RecipeBrowser
- `/crafting/queue` → CraftQueue
- `/crafting/history` → CraftHistory (uses `useCraftHistory` hook)
- `/crafting/blueprints` → Blueprints
- `/crafting/upgrade` → UpgradeCenter (handles both upgrade + enchant tabs)
- `/crafting/enchant` → EnchantCenter (standalone enchant page)
- `/resources` → ResourceMap
- `/resources/gather` → Gathering (uses `useResourceNodes` hook, not `useResources`)
- `/shops` → NPCShop
- `/economy` → EconomyDashboard
- `/economy/prices` → MarketPrices

## Hook naming
- `useCraftHistory()` — no limit param (hooks/useCrafting.ts)
- `useResourceNodes(worldId?)` — NOT `useResources` (hooks/useResources.ts)
- `useGather()` — mutation: `{ nodeId, amount? }` (hooks/useResources.ts)
