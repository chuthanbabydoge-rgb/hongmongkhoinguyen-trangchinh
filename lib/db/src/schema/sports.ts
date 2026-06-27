import {
  pgTable, text, integer, boolean, timestamp, pgEnum, jsonb, real, index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const sportTypeEnum = pgEnum("sport_type", [
  "FOOTBALL", "BASEBALL", "BASKETBALL", "VOLLEYBALL", "MARTIAL_ARTS", "TENNIS", "ESPORTS",
]);

export const matchStatusEnum = pgEnum("sports_match_status", [
  "SCHEDULED", "LIVE", "FINISHED", "CANCELLED", "POSTPONED",
]);

export const tournamentStatusEnum = pgEnum("sports_tournament_status", [
  "UPCOMING", "ONGOING", "FINISHED", "CANCELLED",
]);

export const leagueTypeEnum = pgEnum("sports_league_type", [
  "DOMESTIC", "INTERNATIONAL", "REGIONAL", "CUP",
]);

export const seasonStatusEnum = pgEnum("sports_season_status", [
  "UPCOMING", "ACTIVE", "FINISHED",
]);

export const venueTypeEnum = pgEnum("sports_venue_type", [
  "STADIUM", "ARENA", "FIELD", "COURT", "RING", "ONLINE",
]);

export const awardTypeEnum = pgEnum("sports_award_type", [
  "INDIVIDUAL", "TEAM", "SEASON", "TOURNAMENT", "CAREER",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const sportsTable = pgTable("sports", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull().unique(),
  slug:        text("slug").notNull().unique(),
  icon:        text("icon").notNull().default("🏆"),
  description: text("description"),
  type:        sportTypeEnum("type").notNull(),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export type Sport = typeof sportsTable.$inferSelect;
export type NewSport = typeof sportsTable.$inferInsert;

export const leaguesTable = pgTable("sports_leagues", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  sportId:     text("sport_id").notNull(),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  country:     text("country"),
  leagueType:  leagueTypeEnum("league_type").notNull().default("DOMESTIC"),
  description: text("description"),
  logo:        text("logo"),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_leagues_sport_idx").on(t.sportId),
]);

export type League = typeof leaguesTable.$inferSelect;
export type NewLeague = typeof leaguesTable.$inferInsert;

export const seasonsTable = pgTable("sports_seasons", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  leagueId:  text("league_id").notNull(),
  name:      text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate:   timestamp("end_date").notNull(),
  status:    seasonStatusEnum("status").notNull().default("UPCOMING"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_seasons_league_idx").on(t.leagueId),
]);

export type Season = typeof seasonsTable.$inferSelect;
export type NewSeason = typeof seasonsTable.$inferInsert;

export const clubsTable = pgTable("sports_clubs", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  sportId:     text("sport_id").notNull(),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  city:        text("city"),
  country:     text("country"),
  logo:        text("logo"),
  founded:     integer("founded"),
  description: text("description"),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_clubs_sport_idx").on(t.sportId),
]);

export type Club = typeof clubsTable.$inferSelect;
export type NewClub = typeof clubsTable.$inferInsert;

export const teamsTable = pgTable("sports_teams", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  clubId:    text("club_id").notNull(),
  seasonId:  text("season_id"),
  name:      text("name").notNull(),
  shortName: text("short_name"),
  logo:      text("logo"),
  color:     text("color"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_teams_club_idx").on(t.clubId),
  index("sports_teams_season_idx").on(t.seasonId),
]);

export type Team = typeof teamsTable.$inferSelect;
export type NewTeam = typeof teamsTable.$inferInsert;

export const playersTable = pgTable("sports_players", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  teamId:      text("team_id"),
  clubId:      text("club_id"),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  position:    text("position"),
  nationality: text("nationality"),
  dateOfBirth: text("date_of_birth"),
  number:      integer("number"),
  photo:       text("photo"),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_players_team_idx").on(t.teamId),
  index("sports_players_club_idx").on(t.clubId),
]);

export type Player = typeof playersTable.$inferSelect;
export type NewPlayer = typeof playersTable.$inferInsert;

export const coachesTable = pgTable("sports_coaches", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  teamId:      text("team_id"),
  clubId:      text("club_id"),
  name:        text("name").notNull(),
  nationality: text("nationality"),
  dateOfBirth: text("date_of_birth"),
  photo:       text("photo"),
  role:        text("role").notNull().default("HEAD_COACH"),
  isActive:    boolean("is_active").notNull().default(true),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_coaches_team_idx").on(t.teamId),
]);

export type Coach = typeof coachesTable.$inferSelect;
export type NewCoach = typeof coachesTable.$inferInsert;

export const stadiumsTable = pgTable("sports_stadiums", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  clubId:    text("club_id"),
  name:      text("name").notNull(),
  slug:      text("slug").notNull().unique(),
  city:      text("city"),
  country:   text("country"),
  capacity:  integer("capacity"),
  venueType: venueTypeEnum("venue_type").notNull().default("STADIUM"),
  photo:     text("photo"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Stadium = typeof stadiumsTable.$inferSelect;
export type NewStadium = typeof stadiumsTable.$inferInsert;

export const matchesTable = pgTable("sports_matches", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  homeTeamId:  text("home_team_id").notNull(),
  awayTeamId:  text("away_team_id").notNull(),
  stadiumId:   text("stadium_id"),
  seasonId:    text("season_id"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status:      matchStatusEnum("status").notNull().default("SCHEDULED"),
  homeScore:   integer("home_score").notNull().default(0),
  awayScore:   integer("away_score").notNull().default(0),
  minute:      integer("minute"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_matches_home_idx").on(t.homeTeamId),
  index("sports_matches_away_idx").on(t.awayTeamId),
  index("sports_matches_season_idx").on(t.seasonId),
  index("sports_matches_status_idx").on(t.status),
]);

export type Match = typeof matchesTable.$inferSelect;
export type NewMatch = typeof matchesTable.$inferInsert;

export const matchEventsTable = pgTable("sports_match_events", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  matchId:     text("match_id").notNull(),
  playerId:    text("player_id"),
  teamId:      text("team_id").notNull(),
  eventType:   text("event_type").notNull(), // GOAL, YELLOW_CARD, RED_CARD, SUBSTITUTION, etc.
  minute:      integer("minute").notNull(),
  description: text("description"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("sports_match_events_match_idx").on(t.matchId),
]);

export type MatchEvent = typeof matchEventsTable.$inferSelect;
export type NewMatchEvent = typeof matchEventsTable.$inferInsert;

export const matchStatisticsTable = pgTable("sports_match_statistics", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  matchId:        text("match_id").notNull(),
  teamId:         text("team_id").notNull(),
  possession:     real("possession").notNull().default(50),
  shots:          integer("shots").notNull().default(0),
  shotsOnTarget:  integer("shots_on_target").notNull().default(0),
  corners:        integer("corners").notNull().default(0),
  fouls:          integer("fouls").notNull().default(0),
  yellowCards:    integer("yellow_cards").notNull().default(0),
  redCards:       integer("red_cards").notNull().default(0),
  metadata:       jsonb("metadata"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("sports_match_stats_match_idx").on(t.matchId),
]);

export type MatchStatistic = typeof matchStatisticsTable.$inferSelect;
export type NewMatchStatistic = typeof matchStatisticsTable.$inferInsert;

export const tournamentsTable = pgTable("sports_tournaments", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  sportId:     text("sport_id").notNull(),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  startDate:   timestamp("start_date").notNull(),
  endDate:     timestamp("end_date").notNull(),
  status:      tournamentStatusEnum("status").notNull().default("UPCOMING"),
  maxTeams:    integer("max_teams").notNull().default(16),
  prizePool:   integer("prize_pool").notNull().default(0),
  format:      text("format").notNull().default("SINGLE_ELIMINATION"),
  description: text("description"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_tournaments_sport_idx").on(t.sportId),
]);

export type Tournament = typeof tournamentsTable.$inferSelect;
export type NewTournament = typeof tournamentsTable.$inferInsert;

export const tournamentRoundsTable = pgTable("sports_tournament_rounds", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  tournamentId: text("tournament_id").notNull(),
  roundNumber:  integer("round_number").notNull(),
  name:         text("name").notNull(),
  startDate:    timestamp("start_date"),
  endDate:      timestamp("end_date"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("sports_tournament_rounds_tournament_idx").on(t.tournamentId),
]);

export type TournamentRound = typeof tournamentRoundsTable.$inferSelect;
export type NewTournamentRound = typeof tournamentRoundsTable.$inferInsert;

export const fixturesTable = pgTable("sports_fixtures", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  roundId:     text("round_id").notNull(),
  homeTeamId:  text("home_team_id").notNull(),
  awayTeamId:  text("away_team_id").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status:      matchStatusEnum("status").notNull().default("SCHEDULED"),
  homeScore:   integer("home_score").notNull().default(0),
  awayScore:   integer("away_score").notNull().default(0),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_fixtures_round_idx").on(t.roundId),
]);

export type Fixture = typeof fixturesTable.$inferSelect;
export type NewFixture = typeof fixturesTable.$inferInsert;

export const rankingsTable = pgTable("sports_rankings", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  seasonId:       text("season_id").notNull(),
  teamId:         text("team_id").notNull(),
  position:       integer("position").notNull().default(0),
  points:         integer("points").notNull().default(0),
  played:         integer("played").notNull().default(0),
  won:            integer("won").notNull().default(0),
  drawn:          integer("drawn").notNull().default(0),
  lost:           integer("lost").notNull().default(0),
  goalsFor:       integer("goals_for").notNull().default(0),
  goalsAgainst:   integer("goals_against").notNull().default(0),
  goalDifference: integer("goal_difference").notNull().default(0),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_rankings_season_idx").on(t.seasonId),
  index("sports_rankings_team_idx").on(t.teamId),
]);

export type Ranking = typeof rankingsTable.$inferSelect;
export type NewRanking = typeof rankingsTable.$inferInsert;

export const awardsTable = pgTable("sports_awards", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  sportId:     text("sport_id").notNull(),
  seasonId:    text("season_id"),
  name:        text("name").notNull(),
  awardType:   awardTypeEnum("award_type").notNull(),
  description: text("description"),
  winnerId:    text("winner_id"),
  winnerName:  text("winner_name"),
  winnerType:  text("winner_type"), // PLAYER or TEAM
  grantedAt:   timestamp("granted_at").notNull().defaultNow(),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("sports_awards_sport_idx").on(t.sportId),
]);

export type Award = typeof awardsTable.$inferSelect;
export type NewAward = typeof awardsTable.$inferInsert;

export const playerStatisticsTable = pgTable("sports_player_statistics", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  playerId:       text("player_id").notNull(),
  seasonId:       text("season_id"),
  matchesPlayed:  integer("matches_played").notNull().default(0),
  goals:          integer("goals").notNull().default(0),
  assists:        integer("assists").notNull().default(0),
  yellowCards:    integer("yellow_cards").notNull().default(0),
  redCards:       integer("red_cards").notNull().default(0),
  minutesPlayed:  integer("minutes_played").notNull().default(0),
  rating:         real("rating").notNull().default(0),
  metadata:       jsonb("metadata"),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_player_stats_player_idx").on(t.playerId),
]);

export type PlayerStatistic = typeof playerStatisticsTable.$inferSelect;
export type NewPlayerStatistic = typeof playerStatisticsTable.$inferInsert;

export const teamStatisticsTable = pgTable("sports_team_statistics", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  teamId:        text("team_id").notNull(),
  seasonId:      text("season_id"),
  matchesPlayed: integer("matches_played").notNull().default(0),
  wins:          integer("wins").notNull().default(0),
  draws:         integer("draws").notNull().default(0),
  losses:        integer("losses").notNull().default(0),
  goalsFor:      integer("goals_for").notNull().default(0),
  goalsAgainst:  integer("goals_against").notNull().default(0),
  points:        integer("points").notNull().default(0),
  cleanSheets:   integer("clean_sheets").notNull().default(0),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_team_stats_team_idx").on(t.teamId),
]);

export type TeamStatistic = typeof teamStatisticsTable.$inferSelect;
export type NewTeamStatistic = typeof teamStatisticsTable.$inferInsert;

export const transfersTable = pgTable("sports_transfers", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  playerId:     text("player_id").notNull(),
  fromTeamId:   text("from_team_id"),
  toTeamId:     text("to_team_id"),
  fee:          integer("fee").notNull().default(0),
  transferDate: timestamp("transfer_date").notNull(),
  description:  text("description"),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("sports_transfers_player_idx").on(t.playerId),
]);

export type Transfer = typeof transfersTable.$inferSelect;
export type NewTransfer = typeof transfersTable.$inferInsert;

export const contractsTable = pgTable("sports_contracts", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  playerId:  text("player_id").notNull(),
  teamId:    text("team_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate:   timestamp("end_date").notNull(),
  salary:    integer("salary").notNull().default(0),
  status:    text("status").notNull().default("ACTIVE"), // ACTIVE, EXPIRED, TERMINATED
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sports_contracts_player_idx").on(t.playerId),
  index("sports_contracts_team_idx").on(t.teamId),
]);

export type Contract = typeof contractsTable.$inferSelect;
export type NewContract = typeof contractsTable.$inferInsert;
