---
name: HUB-19 Combat System
description: Combat Engine & Battle System — DB tables, service patterns, type fixes, API routes
---

## DB Schema (lib/db/src/schema/combat.ts)
15 tables + 4 enums: `battleTypeEnum`, `battleStatusEnum`, `participantStatusEnum`, `skillTargetEnum`.
Tables: combatBattles, combatParticipants, combatTurns, combatDamageLogs, combatEffects, combatBosses, combatBossRaids, combatBossRaidParticipants, combatSkills, combatHistory, combatPvpRank, combatStatistics, combatRewards, combatEvents, combatSpectators.

## API Routes
Prefix: `/api/combat` (routes/combat.ts).
Key endpoints: POST /create, POST /join/:id, POST /turn/:id/attack, POST /turn/:id/skill, POST /turn/:id/flee, DELETE /leave/:id, GET / (list), GET /:id, GET /history, GET /bosses, GET /boss/:id/raid, GET /leaderboard, GET /skills, GET /statistics, GET /dashboard.

## Service Patterns
- `notifService.fire(userId, "system" as never, title, message)` — 4 positional args (NOT `.send()`)
- `reputationRepo.upsert(userId, deltaPoints)` — NOT `.addReputation()`
- CombatReward passed to eventBus as `reward as unknown as Record<string, unknown>`
- CombatStatistics cast: `(existing as unknown as Record<string, unknown>)` (double cast)

## DrizzleCombatRepository Type Fixes
- TS6305 from lib/db not compiled makes drizzle rows return `any[]` → all map/filter callbacks need explicit type params
- `inArray(combatBattles.id, ids)` from drizzle-orm (NOT raw sql join) for listBattlesByUser
- Split `.map().filter()` into two steps with intermediate `as (string | null)[]` cast to fix implicit-any in filter callback
- `rows.map((r: (typeof rows)[number]) => ...)` pattern for leaderboard and getSkills
- `recordDamage` options type does NOT include `netDamage` — method computes it internally

## Container Registration
- `combatRepo → DrizzleCombatRepository`
- `combatService → CombatService(combatRepo, characterService, reputationRepo, notifService, actService)`
- Seeding: `combatRepo.seedBosses()` + `combatRepo.seedSkills()` on startup
- App registered via SEED_APPS in appRegistryService.ts with slug "combat", category "OTHER"

## Frontend
- Pages in `src/pages/combat/`: CombatDashboard, BattleArena, BattleRoom, BattleHistory, BossBattle, ArenaRanking, CombatStatistics
- `useCombat` hook wraps all API calls
- AuthUser has `.id` (not `.userId`) — use `user?.id` directly

**Why:** The TS6305 implicit-any cascade requires defensive typing in all Drizzle callback params when lib/db dist is not compiled. Using `inArray` from drizzle-orm avoids sql template literal typing issues entirely.
