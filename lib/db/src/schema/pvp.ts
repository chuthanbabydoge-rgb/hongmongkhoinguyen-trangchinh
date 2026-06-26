import { pgTable, pgEnum, text, integer, real, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const matchTypeEnum = pgEnum("pvp_match_type", [
  "DUEL", "ARENA_2V2", "ARENA_3V3", "ARENA_5V5", "GUILD_WAR",
]);

export const matchStatusEnum = pgEnum("pvp_match_status", [
  "WAITING", "READY", "IN_PROGRESS", "FINISHED", "CANCELLED",
]);

export const tournamentTypeEnum = pgEnum("pvp_tournament_type", [
  "SINGLE", "DOUBLE", "ROUND_ROBIN",
]);

export const tournamentStatusEnum = pgEnum("pvp_tournament_status", [
  "UPCOMING", "REGISTRATION", "IN_PROGRESS", "FINISHED", "CANCELLED",
]);

export const seasonStatusEnum = pgEnum("pvp_season_status", [
  "PRESEASON", "ACTIVE", "FINISHED",
]);

export const rankTierEnum = pgEnum("pvp_rank_tier", [
  "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER", "GRANDMASTER", "LEGEND",
]);

// ─── PvP Seasons ──────────────────────────────────────────────────────────────

export const pvpSeasons = pgTable("pvp_seasons", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  number:      integer("number").notNull().default(1),
  status:      seasonStatusEnum("status").notNull().default("PRESEASON"),
  startAt:     timestamp("start_at"),
  endAt:       timestamp("end_at"),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_seasons_status_idx").on(t.status),
]);

// ─── PvP Rankings ─────────────────────────────────────────────────────────────

export const pvpRankings = pgTable("pvp_rankings", {
  id:               text("id").primaryKey().$defaultFn(() => createId()),
  userId:           text("user_id").notNull(),
  seasonId:         text("season_id").notNull(),
  mmr:              integer("mmr").notNull().default(1000),
  tier:             rankTierEnum("tier").notNull().default("BRONZE"),
  wins:             integer("wins").notNull().default(0),
  losses:           integer("losses").notNull().default(0),
  draws:            integer("draws").notNull().default(0),
  winStreak:        integer("win_streak").notNull().default(0),
  bestWinStreak:    integer("best_win_streak").notNull().default(0),
  placementDone:    boolean("placement_done").notNull().default(false),
  placementWins:    integer("placement_wins").notNull().default(0),
  placementGames:   integer("placement_games").notNull().default(0),
  peakMmr:          integer("peak_mmr").notNull().default(1000),
  peakTier:         rankTierEnum("peak_tier").notNull().default("BRONZE"),
  updatedAt:        timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_rankings_user_season_idx").on(t.userId, t.seasonId),
  index("pvp_rankings_mmr_idx").on(t.mmr),
  index("pvp_rankings_tier_idx").on(t.tier),
]);

// ─── PvP Matches ──────────────────────────────────────────────────────────────

export const pvpMatches = pgTable("pvp_matches", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  type:        matchTypeEnum("type").notNull().default("DUEL"),
  status:      matchStatusEnum("status").notNull().default("WAITING"),
  seasonId:    text("season_id"),
  guildWarId:  text("guild_war_id"),
  tournamentId: text("tournament_id"),
  winnerId:    text("winner_id"),
  winTeam:     integer("win_team"),
  durationSec: integer("duration_sec"),
  isRanked:    boolean("is_ranked").notNull().default(true),
  metadata:    jsonb("metadata"),
  startedAt:   timestamp("started_at"),
  finishedAt:  timestamp("finished_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_matches_status_idx").on(t.status),
  index("pvp_matches_season_idx").on(t.seasonId),
]);

// ─── PvP Match Players ────────────────────────────────────────────────────────

export const pvpMatchPlayers = pgTable("pvp_match_players", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  matchId:      text("match_id").notNull(),
  userId:       text("user_id").notNull(),
  team:         integer("team").notNull().default(1),
  isReady:      boolean("is_ready").notNull().default(false),
  isAlive:      boolean("is_alive").notNull().default(true),
  hp:           integer("hp").notNull().default(100),
  maxHp:        integer("max_hp").notNull().default(100),
  mana:         integer("mana").notNull().default(100),
  maxMana:      integer("max_mana").notNull().default(100),
  damageDealt:  integer("damage_dealt").notNull().default(0),
  damageTaken:  integer("damage_taken").notNull().default(0),
  healed:       integer("healed").notNull().default(0),
  kills:        integer("kills").notNull().default(0),
  deaths:       integer("deaths").notNull().default(0),
  mmrBefore:    integer("mmr_before").notNull().default(1000),
  mmrAfter:     integer("mmr_after"),
  mmrDelta:     integer("mmr_delta"),
  isWinner:     boolean("is_winner"),
  loadoutId:    text("loadout_id"),
  characterId:  text("character_id"),
  petId:        text("pet_id"),
  metadata:     jsonb("metadata"),
  joinedAt:     timestamp("joined_at").notNull().defaultNow(),
  leftAt:       timestamp("left_at"),
}, (t) => [
  index("pvp_match_players_match_idx").on(t.matchId),
  index("pvp_match_players_user_idx").on(t.userId),
]);

// ─── PvP Match Logs ───────────────────────────────────────────────────────────

export const pvpMatchLogs = pgTable("pvp_match_logs", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  matchId:   text("match_id").notNull(),
  round:     integer("round").notNull().default(1),
  message:   text("message").notNull(),
  metadata:  jsonb("metadata"),
  loggedAt:  timestamp("logged_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_match_logs_match_idx").on(t.matchId),
]);

// ─── PvP Match Events ─────────────────────────────────────────────────────────

export const pvpMatchEvents = pgTable("pvp_match_events", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  matchId:   text("match_id").notNull(),
  eventType: text("event_type").notNull(),
  userId:    text("user_id"),
  targetId:  text("target_id"),
  payload:   jsonb("payload"),
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_match_events_match_idx").on(t.matchId),
]);

// ─── PvP Damage Logs ──────────────────────────────────────────────────────────

export const pvpDamageLogs = pgTable("pvp_damage_logs", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  matchId:      text("match_id").notNull(),
  attackerId:   text("attacker_id").notNull(),
  defenderId:   text("defender_id").notNull(),
  damage:       integer("damage").notNull().default(0),
  healing:      integer("healing").notNull().default(0),
  isCrit:       boolean("is_crit").notNull().default(false),
  skillName:    text("skill_name"),
  defenderHpAfter: integer("defender_hp_after").notNull().default(0),
  loggedAt:     timestamp("logged_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_damage_logs_match_idx").on(t.matchId),
  index("pvp_damage_logs_attacker_idx").on(t.attackerId),
]);

// ─── PvP Skill Logs ───────────────────────────────────────────────────────────

export const pvpSkillLogs = pgTable("pvp_skill_logs", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  matchId:   text("match_id").notNull(),
  userId:    text("user_id").notNull(),
  skillId:   text("skill_id"),
  skillName: text("skill_name").notNull(),
  targetId:  text("target_id"),
  effect:    jsonb("effect"),
  usedAt:    timestamp("used_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_skill_logs_match_idx").on(t.matchId),
]);

// ─── PvP Statistics ───────────────────────────────────────────────────────────

export const pvpStatistics = pgTable("pvp_statistics", {
  id:                text("id").primaryKey().$defaultFn(() => createId()),
  userId:            text("user_id").notNull().unique(),
  totalMatches:      integer("total_matches").notNull().default(0),
  totalWins:         integer("total_wins").notNull().default(0),
  totalLosses:       integer("total_losses").notNull().default(0),
  totalDraws:        integer("total_draws").notNull().default(0),
  totalKills:        integer("total_kills").notNull().default(0),
  totalDeaths:       integer("total_deaths").notNull().default(0),
  totalDamageDealt:  integer("total_damage_dealt").notNull().default(0),
  totalDamageTaken:  integer("total_damage_taken").notNull().default(0),
  totalHealed:       integer("total_healed").notNull().default(0),
  highestKillStreak: integer("highest_kill_streak").notNull().default(0),
  tournamentWins:    integer("tournament_wins").notNull().default(0),
  peakMmr:           integer("peak_mmr").notNull().default(1000),
  peakTier:          rankTierEnum("peak_tier").notNull().default("BRONZE"),
  favoriteMatchType: matchTypeEnum("favorite_match_type"),
  updatedAt:         timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_statistics_user_idx").on(t.userId),
]);

// ─── PvP Rewards ──────────────────────────────────────────────────────────────

export const pvpRewards = pgTable("pvp_rewards", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  seasonId:    text("season_id"),
  tier:        rankTierEnum("tier").notNull(),
  rewardType:  text("reward_type").notNull().default("SEASON"),
  credits:     integer("credits").notNull().default(0),
  xu:          integer("xu").notNull().default(0),
  tokens:      integer("tokens").notNull().default(0),
  items:       jsonb("items"),
  claimed:     boolean("claimed").notNull().default(false),
  claimedAt:   timestamp("claimed_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_rewards_user_idx").on(t.userId),
  index("pvp_rewards_season_idx").on(t.seasonId),
]);

// ─── PvP Loadouts ─────────────────────────────────────────────────────────────

export const pvpLoadouts = pgTable("pvp_loadouts", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  name:        text("name").notNull(),
  characterId: text("character_id"),
  petId:       text("pet_id"),
  mountId:     text("mount_id"),
  skills:      jsonb("skills"),
  equipment:   jsonb("equipment"),
  isDefault:   boolean("is_default").notNull().default(false),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_loadouts_user_idx").on(t.userId),
]);

// ─── PvP Matchmaking Queue ────────────────────────────────────────────────────

export const pvpMatchmakingQueue = pgTable("pvp_matchmaking_queue", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull().unique(),
  matchType:   matchTypeEnum("match_type").notNull().default("DUEL"),
  mmr:         integer("mmr").notNull().default(1000),
  tier:        rankTierEnum("tier").notNull().default("BRONZE"),
  loadoutId:   text("loadout_id"),
  guildId:     text("guild_id"),
  isRanked:    boolean("is_ranked").notNull().default(true),
  joinedAt:    timestamp("joined_at").notNull().defaultNow(),
}, (t) => [
  index("pvp_queue_match_type_idx").on(t.matchType),
  index("pvp_queue_mmr_idx").on(t.mmr),
]);

// ─── PvP Spectators ───────────────────────────────────────────────────────────

export const pvpSpectators = pgTable("pvp_spectators", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  matchId:   text("match_id").notNull(),
  userId:    text("user_id").notNull(),
  joinedAt:  timestamp("joined_at").notNull().defaultNow(),
  leftAt:    timestamp("left_at"),
}, (t) => [
  index("pvp_spectators_match_idx").on(t.matchId),
]);

// ─── Tournaments ──────────────────────────────────────────────────────────────

export const tournaments = pgTable("tournaments", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  name:           text("name").notNull(),
  description:    text("description"),
  type:           tournamentTypeEnum("type").notNull().default("SINGLE"),
  status:         tournamentStatusEnum("status").notNull().default("UPCOMING"),
  matchType:      matchTypeEnum("match_type").notNull().default("DUEL"),
  organizerId:    text("organizer_id").notNull(),
  guildId:        text("guild_id"),
  seasonId:       text("season_id"),
  maxParticipants: integer("max_participants").notNull().default(8),
  minMmr:         integer("min_mmr"),
  maxMmr:         integer("max_mmr"),
  entryFee:       integer("entry_fee").notNull().default(0),
  prizePool:      integer("prize_pool").notNull().default(0),
  currentRound:   integer("current_round").notNull().default(0),
  totalRounds:    integer("total_rounds").notNull().default(0),
  winnerId:       text("winner_id"),
  icon:           text("icon").default("🏆"),
  metadata:       jsonb("metadata"),
  registrationEndsAt: timestamp("registration_ends_at"),
  startAt:        timestamp("start_at"),
  finishedAt:     timestamp("finished_at"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("tournaments_status_idx").on(t.status),
  index("tournaments_organizer_idx").on(t.organizerId),
]);

// ─── Tournament Brackets ─────────────────────────────────────────────────────

export const tournamentBrackets = pgTable("tournament_brackets", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  tournamentId:   text("tournament_id").notNull(),
  userId:         text("user_id").notNull(),
  seed:           integer("seed").notNull().default(1),
  round:          integer("round").notNull().default(1),
  isEliminated:   boolean("is_eliminated").notNull().default(false),
  wins:           integer("wins").notNull().default(0),
  losses:         integer("losses").notNull().default(0),
  position:       integer("position"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("tournament_brackets_tournament_idx").on(t.tournamentId),
  index("tournament_brackets_user_idx").on(t.userId),
]);

// ─── Tournament Matches ───────────────────────────────────────────────────────

export const tournamentMatches = pgTable("tournament_matches", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  tournamentId: text("tournament_id").notNull(),
  pvpMatchId:   text("pvp_match_id"),
  round:        integer("round").notNull().default(1),
  position:     integer("position").notNull().default(1),
  player1Id:    text("player1_id"),
  player2Id:    text("player2_id"),
  winnerId:     text("winner_id"),
  status:       text("status").notNull().default("PENDING"),
  scheduledAt:  timestamp("scheduled_at"),
  finishedAt:   timestamp("finished_at"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("tournament_matches_tournament_idx").on(t.tournamentId),
  index("tournament_matches_round_idx").on(t.round),
]);

// ─── Tournament Rewards ───────────────────────────────────────────────────────

export const tournamentRewards = pgTable("tournament_rewards", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  tournamentId:  text("tournament_id").notNull(),
  userId:        text("user_id").notNull(),
  position:      integer("position").notNull().default(1),
  credits:       integer("credits").notNull().default(0),
  xu:            integer("xu").notNull().default(0),
  tokens:        integer("tokens").notNull().default(0),
  items:         jsonb("items"),
  claimed:       boolean("claimed").notNull().default(false),
  claimedAt:     timestamp("claimed_at"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("tournament_rewards_tournament_idx").on(t.tournamentId),
  index("tournament_rewards_user_idx").on(t.userId),
]);

// ─── Tournament History ───────────────────────────────────────────────────────

export const tournamentHistory = pgTable("tournament_history", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  tournamentId:  text("tournament_id").notNull(),
  userId:        text("user_id").notNull(),
  finalPosition: integer("final_position").notNull().default(1),
  wins:          integer("wins").notNull().default(0),
  losses:        integer("losses").notNull().default(0),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("tournament_history_tournament_idx").on(t.tournamentId),
  index("tournament_history_user_idx").on(t.userId),
]);
