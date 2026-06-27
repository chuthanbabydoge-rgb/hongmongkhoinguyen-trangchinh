---
name: HUB-26 Sports Framework
description: Universe Sports Framework — key decisions, gotchas, and patterns.
---

## Critical: Route Ordering
All specific sub-routes (`/sports/leagues`, `/sports/teams`, `/sports/matches`, etc.) **MUST** be registered **before** `/sports/:id` in Express. If `:id` comes first, it catches every sub-route and returns "sport not found".

**How to apply:** Always put the param route (`/:id`) last in each sports resource section.

## DB Enum Partial State Fix
If `drizzle-kit push` fails with `type "sports_match_status" does not exist`, it means enums were partially created. Fix with:
```sql
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sports_match_status') 
THEN CREATE TYPE sports_match_status AS ENUM (...); END IF; END $$
```
Note: `CREATE TYPE IF NOT EXISTS` syntax is NOT supported in PostgreSQL for enums — must use DO block.

## App.tsx Import Collision
`TournamentDetail` name conflicts with HUB-23's pvp tournaments page. Import sports version as:
```typescript
import SportsTournamentList   from "@/pages/sports/TournamentList";
import SportsTournamentDetail from "@/pages/sports/TournamentDetail";
```

## App Registry Category
Use `"SPORT"` (not `"SPORTS"`) — this is what APP_CATEGORIES already defines in `models/appRegistry.ts`.

## Architecture
- **20 DB tables**: sports, leagues, seasons, clubs, teams, players, coaches, stadiums, matches, match_events, match_statistics, tournaments, tournament_rounds, fixtures, rankings, awards, player_statistics, team_statistics, transfers, contracts
- **7 enums**: sport_type, sports_match_status, sports_tournament_status, sports_league_type, sports_season_status, sports_venue_type, sports_award_type
- **42 API routes** at `/api/sports/*`
- **16 frontend pages** in `pages/sports/`: SportsDashboard, SportsDirectory, LeagueList, LeagueDetail, TeamList, TeamDetail, PlayerList, PlayerDetail, MatchList, MatchDetail, TournamentList, TournamentDetail, RankingsPage, StadiumList, AwardsList, StatisticsPage
- **Sidebar icons**: Trophy, Globe, Dumbbell, Users, Star, CalendarDays, GitBranch, BarChartHorizontal, MapPin, Medal, BarChart2

## Seed Data
Seeds on startup: 5 sports, 5 leagues, 5 seasons, 20 clubs, 20 teams, 200 players, 30 coaches, 15 stadiums, 20 matches (4 LIVE), 5 tournaments
