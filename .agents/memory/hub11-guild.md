---
name: HUB-11 Guild System
description: Guild/Clan system — DB schema, backend service/routes, frontend pages, container wiring.
---

## Key decisions

- **Always Drizzle** — no InMemory fallback needed; DATABASE_URL is always set on Replit.
- **Service constructor** — `GuildService(repo, notificationsService, activitiesService, userReputationService)` all from container.
- **28 REST routes** under `/api/guilds` (no `/api` prefix in route file — Express prepends it).
- **Reputation events** — 6 new types added to REPUTATION_RULES: GUILD_CREATED +50, GUILD_JOINED +20, GUILD_EVENT +30, GUILD_CONTRIBUTION +10, GUILD_ANNOUNCEMENT +5, GUILD_RECRUIT +25.
- **Seed app** — slug `"guild"`, category `"SOCIAL"`, url `${REPLIT_HUB_URL}/guild` in appRegistryService.ts SEED_APPS.

## DB tables (lib/db/src/schema/guilds.ts)
guilds, guild_members, guild_join_requests, guild_invites, guild_announcements, guild_logs, guild_role_permissions, guild_contributions, guild_events, guild_event_participants, guild_warehouse_items, guild_treasury_transactions.

## Frontend pages (artifacts/universe-hub/src/pages/guild/)
GuildDashboard (at /guild), GuildList (/guild/list), GuildCreate (/guild/create), GuildDetail (/guild/:id), GuildMembers (/guild/:id/members), GuildBank (/guild/:id/bank), GuildEvents (/guild/:id/events), GuildLogs (/guild/:id/logs), GuildSettings (/guild/:id/settings), GuildRankings (/guild/rankings).

**Why:** Sidebar entry under "Mạng xã hội" section; /guild route goes to GuildDashboard (shows current guild or CTA to join/create).

## Pre-existing typecheck errors (do NOT fix)
universe-hub: NotificationDropdown.tsx, useReputation.ts, ActivityFeed.tsx — predated HUB-11.
api-server: marketplace test files, notificationSyncService.test.ts — predated HUB-11.
