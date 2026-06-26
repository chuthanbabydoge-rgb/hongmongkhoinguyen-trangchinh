---
name: HUB-23 PvP Arena & Tournament System
description: Implementation notes for the PvP ranked arena, MMR seasons, and tournament bracket system.
---

## Schema
- 18 DB tables + 6 enums in `lib/db/src/schema/pvp.ts`
- Enums: matchTypeEnum, matchStatusEnum, tournamentTypeEnum, tournamentStatusEnum, seasonStatusEnum, rankTierEnum
- Key tables: pvpSeasons, pvpRankings, pvpMatches, pvpMatchPlayers, pvpDamageLogs, pvpMatchmakingQueue, pvpStatistics, pvpLoadouts, pvpRewards, tournaments, tournamentBrackets, tournamentMatches, tournamentRewards, tournamentHistory

## Repository Pattern
- `DrizzlePvpRepository.recordKill`: must read existing kills/deaths counts first then update — Drizzle has no sql increment shorthand like `sql\`kills + 1\``
- `seedSeason()` is called on startup in container.ts — creates "Mùa 1 — Khai Nguyên" if no season exists
- `getOrCreateRanking()` creates ranking on demand — safe to call in match creation flow

## Services
- `PvpService` — match lifecycle (create, readyUp, attack, useSkill, surrender, finishMatch)
- `MatchmakingService` — joins queue + polling loop every 5s per match type, MMR window ±300
- `RankingService` — season CRUD, leaderboard, reward distribution on season end
- `TournamentService` — tournament lifecycle, bracket generation, rewards to winner

## Routes
- `/api/pvp/dashboard` — requires auth
- `/api/pvp/leaderboard` — public
- `/api/pvp/queue` POST/DELETE — requires auth
- `/api/pvp/match/:id` GET/ready/attack/skill/surrender — GET public, rest requires auth
- `/api/seasons` GET, `/api/seasons/current` GET — public
- `/api/tournaments` GET/POST, `/api/tournaments/:id` GET/join/start/finish/bracket

## App Registry
- pvp slug: category "GAME", url `${REPLIT_HUB_URL}/pvp`
- tournaments slug: category "GAME", url `${REPLIT_HUB_URL}/tournaments`
- Both in SEED_APPS (not container.ts registerApp which fails isValidUrl on relative URLs)

## Frontend
- 6 PvP pages: PvpDashboard, RankedQueue, ArenaMatch, Leaderboard, MatchHistory, SeasonRewards
- 3 Tournament pages: TournamentDashboard, TournamentCreate, TournamentDetail
- Sidebar section "PvP Arena" uses Swords+Award+Trophy icons (Award must be imported — not in previous imports)
- Routes: /pvp /pvp/queue /pvp/leaderboard /pvp/history /pvp/season /pvp/match/:id /tournaments /tournaments/create /tournaments/:id

## Container
- Order: pvpRepo → pvpService → rankingService → tournamentService → matchmakingService
- tournamentService takes (tournamentRepo, pvpRepo, pvpService, notif, activities, reputationRepo)
- matchmakingService takes (pvpRepo, pvpService) — starts polling loop in constructor

**Why:** MatchmakingService starts intervals in constructor, so it must be instantiated last after pvpService is ready.
