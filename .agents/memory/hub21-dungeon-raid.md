---
name: HUB-21 Dungeon & Raid System
description: Patterns and gotchas for the Dungeon & Raid system (HUB-21), including DB schema, repo structure, and seeding.
---

## DB Schema (lib/db/src/schema/dungeons.ts)
- 4 enums: dungeonDifficultyEnum (NORMAL/HARD/ELITE/LEGENDARY/MYTHIC), dungeonStatusEnum (WAITING/ACTIVE/COMPLETED/FAILED/EXPIRED), raidDifficultyEnum (NORMAL/HEROIC/MYTHIC/NIGHTMARE), raidRoleEnum (TANK/HEALER/DPS/SUPPORT)
- 11 dungeon tables: dungeons, dungeonRegions, dungeonRooms, dungeonInstances, dungeonMembers, dungeonMonsters, dungeonBosses, dungeonLootTables, dungeonRewards, dungeonProgress, dungeonStatistics
- 8 raid tables: raidGroups, raidMembers, raidBosses, raidInstances, raidProgress, raidRewards, raidDamageLogs, raidRankings, raidHistory
- Total: 19 tables

## Repository interfaces
- Single file: `artifacts/api-server/src/repositories/dungeonRepository.ts` holds both IDungeonRepository and IRaidRepository (plus all domain types)
- Implementations: DrizzleDungeonRepository.ts and DrizzleRaidRepository.ts in `drizzle/` subdir

## Seeding
- `dungeonRepo.seedDungeons()` — seeds 5 dungeons (NORMAL→MYTHIC)
- `dungeonRepo.seedBosses()` — seeds 5 bosses (1 per dungeon, matched by minLevel order)
- `raidRepo.seedBosses()` — seeds 4 raid bosses (NORMAL/HEROIC/MYTHIC/NIGHTMARE)
- All seeds use onConflictDoNothing

## App Registration
- category: "OTHER" for both dungeons and raids (not "GAME" — not a valid APP_CATEGORY)
- slug "dungeons" → url "/dungeons", slug "raids" → url "/raids"

## Sidebar icons
- `Sword as DungeonSword` (aliased to avoid collision with existing `Sword` import), `Castle`, `Skull`, `Trophy`
- Section label: "Dungeon & Raid"

## Routes
- GET/POST /api/dungeons, /api/dungeons/:id (instances), /api/dungeons/history, /api/dungeons/statistics
- POST /api/dungeons/:id/join|leave|start|spawn-monster|spawn-boss|kill-boss|finish|revive
- GET/POST /api/raids/bosses, /api/raids/leaderboard, /api/raids/history, /api/raids, /api/raids/:id
- POST /api/raids/:id/join|start|damage|finish
- GET/POST /api/raid-groups, /api/raid-groups/:id/members|join|leave

## Key gotcha
- Write tool sometimes silently fails to create files in `drizzle/` subdir — always verify file exists with `ls` before restarting the workflow.

**Why:** During implementation, DrizzleRaidRepository.ts write reported success but the file was not created, causing the build to fail on first restart.

**How to apply:** After writing any new Drizzle repo file, run `ls artifacts/api-server/src/repositories/drizzle/ | grep <name>` before restarting the API server.
