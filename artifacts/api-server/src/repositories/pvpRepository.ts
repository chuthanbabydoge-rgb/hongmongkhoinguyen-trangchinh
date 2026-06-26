// ─────────────────────────────────────────────────────────────────────────────
// PvP Repository Interfaces — HUB-23
// ─────────────────────────────────────────────────────────────────────────────

export type MatchType = "DUEL" | "ARENA_2V2" | "ARENA_3V3" | "ARENA_5V5" | "GUILD_WAR";
export type MatchStatus = "WAITING" | "READY" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
export type SeasonStatus = "PRESEASON" | "ACTIVE" | "FINISHED";
export type RankTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND" | "MASTER" | "GRANDMASTER" | "LEGEND";
export type TournamentType = "SINGLE" | "DOUBLE" | "ROUND_ROBIN";
export type TournamentStatus = "UPCOMING" | "REGISTRATION" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";

export interface PvpSeason {
  id: string;
  name: string;
  number: number;
  status: SeasonStatus;
  startAt: string | null;
  endAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PvpRanking {
  id: string;
  userId: string;
  seasonId: string;
  mmr: number;
  tier: RankTier;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  bestWinStreak: number;
  placementDone: boolean;
  placementWins: number;
  placementGames: number;
  peakMmr: number;
  peakTier: RankTier;
  updatedAt: string;
}

export interface PvpMatch {
  id: string;
  type: MatchType;
  status: MatchStatus;
  seasonId: string | null;
  tournamentId: string | null;
  guildWarId: string | null;
  winnerId: string | null;
  winTeam: number | null;
  durationSec: number | null;
  isRanked: boolean;
  metadata: Record<string, unknown> | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PvpMatchPlayer {
  id: string;
  matchId: string;
  userId: string;
  team: number;
  isReady: boolean;
  isAlive: boolean;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  damageDealt: number;
  damageTaken: number;
  healed: number;
  kills: number;
  deaths: number;
  mmrBefore: number;
  mmrAfter: number | null;
  mmrDelta: number | null;
  isWinner: boolean | null;
  loadoutId: string | null;
  characterId: string | null;
  petId: string | null;
  metadata: Record<string, unknown> | null;
  joinedAt: string;
  leftAt: string | null;
}

export interface PvpDamageLog {
  id: string;
  matchId: string;
  attackerId: string;
  defenderId: string;
  damage: number;
  healing: number;
  isCrit: boolean;
  skillName: string | null;
  defenderHpAfter: number;
  loggedAt: string;
}

export interface PvpStatistics {
  id: string;
  userId: string;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalKills: number;
  totalDeaths: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealed: number;
  highestKillStreak: number;
  tournamentWins: number;
  peakMmr: number;
  peakTier: RankTier;
  favoriteMatchType: MatchType | null;
  updatedAt: string;
}

export interface PvpQueueEntry {
  id: string;
  userId: string;
  matchType: MatchType;
  mmr: number;
  tier: RankTier;
  loadoutId: string | null;
  guildId: string | null;
  isRanked: boolean;
  joinedAt: string;
}

export interface PvpLoadout {
  id: string;
  userId: string;
  name: string;
  characterId: string | null;
  petId: string | null;
  mountId: string | null;
  skills: unknown;
  equipment: unknown;
  isDefault: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PvpReward {
  id: string;
  userId: string;
  seasonId: string | null;
  tier: RankTier;
  rewardType: string;
  credits: number;
  xu: number;
  tokens: number;
  items: unknown;
  claimed: boolean;
  claimedAt: string | null;
  createdAt: string;
}

// ─── Tournament types ─────────────────────────────────────────────────────────

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  type: TournamentType;
  status: TournamentStatus;
  matchType: MatchType;
  organizerId: string;
  guildId: string | null;
  seasonId: string | null;
  maxParticipants: number;
  minMmr: number | null;
  maxMmr: number | null;
  entryFee: number;
  prizePool: number;
  currentRound: number;
  totalRounds: number;
  winnerId: string | null;
  icon: string | null;
  metadata: Record<string, unknown> | null;
  registrationEndsAt: string | null;
  startAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentBracket {
  id: string;
  tournamentId: string;
  userId: string;
  seed: number;
  round: number;
  isEliminated: boolean;
  wins: number;
  losses: number;
  position: number | null;
  createdAt: string;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  pvpMatchId: string | null;
  round: number;
  position: number;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  status: string;
  scheduledAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface TournamentReward {
  id: string;
  tournamentId: string;
  userId: string;
  position: number;
  credits: number;
  xu: number;
  tokens: number;
  items: unknown;
  claimed: boolean;
  claimedAt: string | null;
  createdAt: string;
}

// ─── Repository Interfaces ────────────────────────────────────────────────────

export interface IPvpRepository {
  // Season
  getCurrentSeason(): Promise<PvpSeason | null>;
  getSeasons(): Promise<PvpSeason[]>;
  createSeason(data: Omit<PvpSeason, "id" | "createdAt" | "updatedAt">): Promise<PvpSeason>;
  updateSeason(id: string, data: Partial<PvpSeason>): Promise<PvpSeason | null>;

  // Ranking
  getRanking(userId: string, seasonId: string): Promise<PvpRanking | null>;
  getOrCreateRanking(userId: string, seasonId: string, mmr?: number): Promise<PvpRanking>;
  updateRating(userId: string, seasonId: string, delta: number): Promise<PvpRanking>;
  getLeaderboard(seasonId: string, limit?: number): Promise<PvpRanking[]>;

  // Match
  createMatch(data: Omit<PvpMatch, "id" | "createdAt" | "updatedAt">): Promise<PvpMatch>;
  getMatch(id: string): Promise<PvpMatch | null>;
  updateMatch(id: string, data: Partial<PvpMatch>): Promise<PvpMatch | null>;
  getMatchHistory(userId: string, limit?: number): Promise<PvpMatch[]>;

  // Match Players
  addMatchPlayer(data: Omit<PvpMatchPlayer, "id" | "joinedAt">): Promise<PvpMatchPlayer>;
  getMatchPlayers(matchId: string): Promise<PvpMatchPlayer[]>;
  updateMatchPlayer(matchId: string, userId: string, data: Partial<PvpMatchPlayer>): Promise<PvpMatchPlayer | null>;

  // Combat
  recordDamage(data: Omit<PvpDamageLog, "id" | "loggedAt">): Promise<PvpDamageLog>;
  recordKill(matchId: string, killerId: string, victimId: string): Promise<void>;

  // Queue
  joinQueue(data: Omit<PvpQueueEntry, "id" | "joinedAt">): Promise<PvpQueueEntry>;
  leaveQueue(userId: string): Promise<void>;
  getQueue(matchType: MatchType): Promise<PvpQueueEntry[]>;
  getQueueEntry(userId: string): Promise<PvpQueueEntry | null>;

  // Statistics
  getStatistics(userId: string): Promise<PvpStatistics | null>;
  upsertStatistics(userId: string, delta: Partial<PvpStatistics>): Promise<PvpStatistics>;

  // Loadouts
  getLoadouts(userId: string): Promise<PvpLoadout[]>;
  createLoadout(data: Omit<PvpLoadout, "id" | "createdAt" | "updatedAt">): Promise<PvpLoadout>;

  // Rewards
  createReward(data: Omit<PvpReward, "id" | "createdAt">): Promise<PvpReward>;
  getUserRewards(userId: string): Promise<PvpReward[]>;
  claimReward(rewardId: string): Promise<PvpReward | null>;
}

export interface ITournamentRepository {
  createTournament(data: Omit<Tournament, "id" | "createdAt" | "updatedAt">): Promise<Tournament>;
  getTournament(id: string): Promise<Tournament | null>;
  listTournaments(status?: TournamentStatus): Promise<Tournament[]>;
  updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament | null>;

  joinTournament(tournamentId: string, userId: string, seed?: number): Promise<TournamentBracket>;
  getBracket(tournamentId: string): Promise<TournamentBracket[]>;
  getParticipantCount(tournamentId: string): Promise<number>;
  isParticipant(tournamentId: string, userId: string): Promise<boolean>;

  generateBracket(tournamentId: string): Promise<TournamentMatch[]>;
  getMatches(tournamentId: string, round?: number): Promise<TournamentMatch[]>;
  updateTournamentMatch(id: string, data: Partial<TournamentMatch>): Promise<TournamentMatch | null>;

  createReward(data: Omit<TournamentReward, "id" | "createdAt">): Promise<TournamentReward>;
  getRewards(tournamentId: string): Promise<TournamentReward[]>;

  getHistory(userId: string): Promise<TournamentBracket[]>;
  finishTournament(id: string, winnerId: string): Promise<Tournament | null>;
}
