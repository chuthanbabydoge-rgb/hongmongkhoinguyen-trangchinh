// ─────────────────────────────────────────────────────────────────────────────
// DrizzlePvpRepository — HUB-23
// ─────────────────────────────────────────────────────────────────────────────

import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  pvpSeasons, pvpRankings, pvpMatches, pvpMatchPlayers,
  pvpDamageLogs, pvpMatchmakingQueue, pvpStatistics,
  pvpLoadouts, pvpRewards,
} from "@workspace/db/schema";
import type {
  IPvpRepository, PvpSeason, PvpRanking, PvpMatch, PvpMatchPlayer,
  PvpDamageLog, PvpQueueEntry, PvpStatistics, PvpLoadout, PvpReward,
  MatchType, RankTier, SeasonStatus, TournamentStatus,
} from "../pvpRepository.js";

function toSeason(r: typeof pvpSeasons.$inferSelect): PvpSeason {
  return {
    id: r.id, name: r.name, number: r.number,
    status: r.status as PvpSeason["status"],
    startAt: r.startAt ? r.startAt.toISOString() : null,
    endAt: r.endAt ? r.endAt.toISOString() : null,
    metadata: r.metadata as Record<string, unknown> | null,
    createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
  };
}

function toRanking(r: typeof pvpRankings.$inferSelect): PvpRanking {
  return {
    id: r.id, userId: r.userId, seasonId: r.seasonId,
    mmr: r.mmr, tier: r.tier as RankTier,
    wins: r.wins, losses: r.losses, draws: r.draws,
    winStreak: r.winStreak, bestWinStreak: r.bestWinStreak,
    placementDone: r.placementDone, placementWins: r.placementWins,
    placementGames: r.placementGames,
    peakMmr: r.peakMmr, peakTier: r.peakTier as RankTier,
    updatedAt: r.updatedAt.toISOString(),
  };
}

function toMatch(r: typeof pvpMatches.$inferSelect): PvpMatch {
  return {
    id: r.id, type: r.type as MatchType,
    status: r.status as PvpMatch["status"],
    seasonId: r.seasonId, tournamentId: r.tournamentId, guildWarId: r.guildWarId,
    winnerId: r.winnerId, winTeam: r.winTeam, durationSec: r.durationSec,
    isRanked: r.isRanked,
    metadata: r.metadata as Record<string, unknown> | null,
    startedAt: r.startedAt ? r.startedAt.toISOString() : null,
    finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
  };
}

function toPlayer(r: typeof pvpMatchPlayers.$inferSelect): PvpMatchPlayer {
  return {
    id: r.id, matchId: r.matchId, userId: r.userId,
    team: r.team, isReady: r.isReady, isAlive: r.isAlive,
    hp: r.hp, maxHp: r.maxHp, mana: r.mana, maxMana: r.maxMana,
    damageDealt: r.damageDealt, damageTaken: r.damageTaken, healed: r.healed,
    kills: r.kills, deaths: r.deaths,
    mmrBefore: r.mmrBefore, mmrAfter: r.mmrAfter, mmrDelta: r.mmrDelta,
    isWinner: r.isWinner,
    loadoutId: r.loadoutId, characterId: r.characterId, petId: r.petId,
    metadata: r.metadata as Record<string, unknown> | null,
    joinedAt: r.joinedAt.toISOString(),
    leftAt: r.leftAt ? r.leftAt.toISOString() : null,
  };
}

function toQueue(r: typeof pvpMatchmakingQueue.$inferSelect): PvpQueueEntry {
  return {
    id: r.id, userId: r.userId,
    matchType: r.matchType as MatchType,
    mmr: r.mmr, tier: r.tier as RankTier,
    loadoutId: r.loadoutId, guildId: r.guildId,
    isRanked: r.isRanked,
    joinedAt: r.joinedAt.toISOString(),
  };
}

function toStats(r: typeof pvpStatistics.$inferSelect): PvpStatistics {
  return {
    id: r.id, userId: r.userId,
    totalMatches: r.totalMatches, totalWins: r.totalWins,
    totalLosses: r.totalLosses, totalDraws: r.totalDraws,
    totalKills: r.totalKills, totalDeaths: r.totalDeaths,
    totalDamageDealt: r.totalDamageDealt, totalDamageTaken: r.totalDamageTaken,
    totalHealed: r.totalHealed, highestKillStreak: r.highestKillStreak,
    tournamentWins: r.tournamentWins,
    peakMmr: r.peakMmr, peakTier: r.peakTier as RankTier,
    favoriteMatchType: r.favoriteMatchType as MatchType | null,
    updatedAt: r.updatedAt.toISOString(),
  };
}

function mmrToTier(mmr: number): RankTier {
  if (mmr >= 3000) return "LEGEND";
  if (mmr >= 2500) return "GRANDMASTER";
  if (mmr >= 2000) return "MASTER";
  if (mmr >= 1800) return "DIAMOND";
  if (mmr >= 1500) return "PLATINUM";
  if (mmr >= 1200) return "GOLD";
  if (mmr >= 1000) return "SILVER";
  return "BRONZE";
}

export class DrizzlePvpRepository implements IPvpRepository {

  // ─── Season ──────────────────────────────────────────────────────────────────

  async getCurrentSeason(): Promise<PvpSeason | null> {
    const [row] = await db.select().from(pvpSeasons)
      .where(eq(pvpSeasons.status, "ACTIVE"))
      .orderBy(desc(pvpSeasons.number))
      .limit(1);
    if (!row) {
      // return PRESEASON if no ACTIVE
      const [pre] = await db.select().from(pvpSeasons)
        .orderBy(desc(pvpSeasons.number)).limit(1);
      return pre ? toSeason(pre) : null;
    }
    return toSeason(row);
  }

  async getSeasons(): Promise<PvpSeason[]> {
    const rows = await db.select().from(pvpSeasons).orderBy(desc(pvpSeasons.number));
    return rows.map(toSeason);
  }

  async createSeason(data: Omit<PvpSeason, "id" | "createdAt" | "updatedAt">): Promise<PvpSeason> {
    const [row] = await db.insert(pvpSeasons).values({
      name: data.name, number: data.number,
      status: data.status,
      startAt: data.startAt ? new Date(data.startAt) : null,
      endAt: data.endAt ? new Date(data.endAt) : null,
      metadata: data.metadata,
    }).returning();
    return toSeason(row);
  }

  async updateSeason(id: string, data: Partial<PvpSeason>): Promise<PvpSeason | null> {
    const [row] = await db.update(pvpSeasons).set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.startAt !== undefined && { startAt: data.startAt ? new Date(data.startAt) : null }),
      ...(data.endAt !== undefined && { endAt: data.endAt ? new Date(data.endAt) : null }),
      updatedAt: new Date(),
    }).where(eq(pvpSeasons.id, id)).returning();
    return row ? toSeason(row) : null;
  }

  async seedSeason(): Promise<void> {
    const existing = await db.select().from(pvpSeasons).limit(1);
    if (existing.length) return;
    await db.insert(pvpSeasons).values({
      name: "Mùa 1 — Khai Nguyên",
      number: 1,
      status: "ACTIVE",
      startAt: new Date(),
      endAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
  }

  // ─── Ranking ─────────────────────────────────────────────────────────────────

  async getRanking(userId: string, seasonId: string): Promise<PvpRanking | null> {
    const [row] = await db.select().from(pvpRankings)
      .where(and(eq(pvpRankings.userId, userId), eq(pvpRankings.seasonId, seasonId)));
    return row ? toRanking(row) : null;
  }

  async getOrCreateRanking(userId: string, seasonId: string, mmr = 1000): Promise<PvpRanking> {
    const existing = await this.getRanking(userId, seasonId);
    if (existing) return existing;
    const [row] = await db.insert(pvpRankings).values({
      userId, seasonId, mmr, tier: mmrToTier(mmr),
      peakMmr: mmr, peakTier: mmrToTier(mmr),
    }).returning();
    return toRanking(row);
  }

  async updateRating(userId: string, seasonId: string, delta: number): Promise<PvpRanking> {
    const ranking = await this.getOrCreateRanking(userId, seasonId);
    const newMmr = Math.max(0, ranking.mmr + delta);
    const newTier = mmrToTier(newMmr);
    const [row] = await db.update(pvpRankings).set({
      mmr: newMmr,
      tier: newTier,
      peakMmr: Math.max(ranking.peakMmr, newMmr),
      peakTier: mmrToTier(Math.max(ranking.peakMmr, newMmr)),
      updatedAt: new Date(),
    }).where(and(eq(pvpRankings.userId, userId), eq(pvpRankings.seasonId, seasonId))).returning();
    return toRanking(row);
  }

  async getLeaderboard(seasonId: string, limit = 100): Promise<PvpRanking[]> {
    const rows = await db.select().from(pvpRankings)
      .where(eq(pvpRankings.seasonId, seasonId))
      .orderBy(desc(pvpRankings.mmr))
      .limit(limit);
    return rows.map(toRanking);
  }

  // ─── Match ───────────────────────────────────────────────────────────────────

  async createMatch(data: Omit<PvpMatch, "id" | "createdAt" | "updatedAt">): Promise<PvpMatch> {
    const [row] = await db.insert(pvpMatches).values({
      type: data.type, status: data.status,
      seasonId: data.seasonId, tournamentId: data.tournamentId, guildWarId: data.guildWarId,
      isRanked: data.isRanked, metadata: data.metadata,
    }).returning();
    return toMatch(row);
  }

  async getMatch(id: string): Promise<PvpMatch | null> {
    const [row] = await db.select().from(pvpMatches).where(eq(pvpMatches.id, id));
    return row ? toMatch(row) : null;
  }

  async updateMatch(id: string, data: Partial<PvpMatch>): Promise<PvpMatch | null> {
    const [row] = await db.update(pvpMatches).set({
      ...(data.status !== undefined && { status: data.status }),
      ...(data.winnerId !== undefined && { winnerId: data.winnerId }),
      ...(data.winTeam !== undefined && { winTeam: data.winTeam }),
      ...(data.durationSec !== undefined && { durationSec: data.durationSec }),
      ...(data.startedAt !== undefined && { startedAt: data.startedAt ? new Date(data.startedAt) : null }),
      ...(data.finishedAt !== undefined && { finishedAt: data.finishedAt ? new Date(data.finishedAt) : null }),
      ...(data.metadata !== undefined && { metadata: data.metadata }),
      updatedAt: new Date(),
    }).where(eq(pvpMatches.id, id)).returning();
    return row ? toMatch(row) : null;
  }

  async getMatchHistory(userId: string, limit = 20): Promise<PvpMatch[]> {
    const playerRows = await db.select({ matchId: pvpMatchPlayers.matchId })
      .from(pvpMatchPlayers)
      .where(eq(pvpMatchPlayers.userId, userId))
      .orderBy(desc(pvpMatchPlayers.joinedAt))
      .limit(limit);
    if (!playerRows.length) return [];
    const matchIds = playerRows.map((r) => r.matchId);
    const rows = await db.select().from(pvpMatches)
      .where(eq(pvpMatches.status, "FINISHED"))
      .orderBy(desc(pvpMatches.finishedAt))
      .limit(limit);
    return rows.filter((r) => matchIds.includes(r.id)).map(toMatch);
  }

  // ─── Match Players ────────────────────────────────────────────────────────────

  async addMatchPlayer(data: Omit<PvpMatchPlayer, "id" | "joinedAt">): Promise<PvpMatchPlayer> {
    const [row] = await db.insert(pvpMatchPlayers).values({
      matchId: data.matchId, userId: data.userId, team: data.team,
      isReady: data.isReady, isAlive: data.isAlive,
      hp: data.hp, maxHp: data.maxHp, mana: data.mana, maxMana: data.maxMana,
      mmrBefore: data.mmrBefore,
      loadoutId: data.loadoutId, characterId: data.characterId, petId: data.petId,
    }).returning();
    return toPlayer(row);
  }

  async getMatchPlayers(matchId: string): Promise<PvpMatchPlayer[]> {
    const rows = await db.select().from(pvpMatchPlayers)
      .where(eq(pvpMatchPlayers.matchId, matchId));
    return rows.map(toPlayer);
  }

  async updateMatchPlayer(matchId: string, userId: string, data: Partial<PvpMatchPlayer>): Promise<PvpMatchPlayer | null> {
    const [row] = await db.update(pvpMatchPlayers).set({
      ...(data.isReady !== undefined && { isReady: data.isReady }),
      ...(data.isAlive !== undefined && { isAlive: data.isAlive }),
      ...(data.hp !== undefined && { hp: data.hp }),
      ...(data.mana !== undefined && { mana: data.mana }),
      ...(data.damageDealt !== undefined && { damageDealt: data.damageDealt }),
      ...(data.damageTaken !== undefined && { damageTaken: data.damageTaken }),
      ...(data.healed !== undefined && { healed: data.healed }),
      ...(data.kills !== undefined && { kills: data.kills }),
      ...(data.deaths !== undefined && { deaths: data.deaths }),
      ...(data.mmrAfter !== undefined && { mmrAfter: data.mmrAfter }),
      ...(data.mmrDelta !== undefined && { mmrDelta: data.mmrDelta }),
      ...(data.isWinner !== undefined && { isWinner: data.isWinner }),
      ...(data.leftAt !== undefined && { leftAt: data.leftAt ? new Date(data.leftAt) : null }),
    }).where(and(eq(pvpMatchPlayers.matchId, matchId), eq(pvpMatchPlayers.userId, userId))).returning();
    return row ? toPlayer(row) : null;
  }

  // ─── Combat ──────────────────────────────────────────────────────────────────

  async recordDamage(data: Omit<PvpDamageLog, "id" | "loggedAt">): Promise<PvpDamageLog> {
    const [row] = await db.insert(pvpDamageLogs).values({
      matchId: data.matchId, attackerId: data.attackerId, defenderId: data.defenderId,
      damage: data.damage, healing: data.healing, isCrit: data.isCrit,
      skillName: data.skillName, defenderHpAfter: data.defenderHpAfter,
    }).returning();
    return {
      id: row.id, matchId: row.matchId, attackerId: row.attackerId, defenderId: row.defenderId,
      damage: row.damage, healing: row.healing, isCrit: row.isCrit,
      skillName: row.skillName, defenderHpAfter: row.defenderHpAfter,
      loggedAt: row.loggedAt.toISOString(),
    };
  }

  async recordKill(matchId: string, killerId: string, victimId: string): Promise<void> {
    const killerRow = await db.select({ kills: pvpMatchPlayers.kills })
      .from(pvpMatchPlayers)
      .where(and(eq(pvpMatchPlayers.matchId, matchId), eq(pvpMatchPlayers.userId, killerId)))
      .limit(1);
    const victimRow = await db.select({ deaths: pvpMatchPlayers.deaths })
      .from(pvpMatchPlayers)
      .where(and(eq(pvpMatchPlayers.matchId, matchId), eq(pvpMatchPlayers.userId, victimId)))
      .limit(1);
    const killerKills = killerRow[0]?.kills ?? 0;
    const victimDeaths = victimRow[0]?.deaths ?? 0;
    await db.update(pvpMatchPlayers)
      .set({ kills: killerKills + 1 })
      .where(and(eq(pvpMatchPlayers.matchId, matchId), eq(pvpMatchPlayers.userId, killerId)));
    await db.update(pvpMatchPlayers)
      .set({ isAlive: false, deaths: victimDeaths + 1 })
      .where(and(eq(pvpMatchPlayers.matchId, matchId), eq(pvpMatchPlayers.userId, victimId)));
  }

  // ─── Queue ───────────────────────────────────────────────────────────────────

  async joinQueue(data: Omit<PvpQueueEntry, "id" | "joinedAt">): Promise<PvpQueueEntry> {
    // upsert: remove existing then insert
    await db.delete(pvpMatchmakingQueue).where(eq(pvpMatchmakingQueue.userId, data.userId));
    const [row] = await db.insert(pvpMatchmakingQueue).values({
      userId: data.userId, matchType: data.matchType,
      mmr: data.mmr, tier: data.tier,
      loadoutId: data.loadoutId, guildId: data.guildId,
      isRanked: data.isRanked,
    }).returning();
    return toQueue(row);
  }

  async leaveQueue(userId: string): Promise<void> {
    await db.delete(pvpMatchmakingQueue).where(eq(pvpMatchmakingQueue.userId, userId));
  }

  async getQueue(matchType: MatchType): Promise<PvpQueueEntry[]> {
    const rows = await db.select().from(pvpMatchmakingQueue)
      .where(eq(pvpMatchmakingQueue.matchType, matchType))
      .orderBy(asc(pvpMatchmakingQueue.joinedAt));
    return rows.map(toQueue);
  }

  async getQueueEntry(userId: string): Promise<PvpQueueEntry | null> {
    const [row] = await db.select().from(pvpMatchmakingQueue)
      .where(eq(pvpMatchmakingQueue.userId, userId));
    return row ? toQueue(row) : null;
  }

  // ─── Statistics ───────────────────────────────────────────────────────────────

  async getStatistics(userId: string): Promise<PvpStatistics | null> {
    const [row] = await db.select().from(pvpStatistics).where(eq(pvpStatistics.userId, userId));
    return row ? toStats(row) : null;
  }

  async upsertStatistics(userId: string, delta: Partial<PvpStatistics>): Promise<PvpStatistics> {
    const existing = await this.getStatistics(userId);
    if (!existing) {
      const [row] = await db.insert(pvpStatistics).values({
        userId,
        totalMatches: delta.totalMatches ?? 0,
        totalWins: delta.totalWins ?? 0,
        totalLosses: delta.totalLosses ?? 0,
        totalDraws: delta.totalDraws ?? 0,
        totalKills: delta.totalKills ?? 0,
        totalDeaths: delta.totalDeaths ?? 0,
        totalDamageDealt: delta.totalDamageDealt ?? 0,
        totalDamageTaken: delta.totalDamageTaken ?? 0,
        totalHealed: delta.totalHealed ?? 0,
        highestKillStreak: delta.highestKillStreak ?? 0,
        tournamentWins: delta.tournamentWins ?? 0,
        peakMmr: delta.peakMmr ?? 1000,
        peakTier: (delta.peakTier ?? "BRONZE") as RankTier,
      }).returning();
      return toStats(row);
    }
    const [row] = await db.update(pvpStatistics).set({
      totalMatches: existing.totalMatches + (delta.totalMatches ?? 0),
      totalWins: existing.totalWins + (delta.totalWins ?? 0),
      totalLosses: existing.totalLosses + (delta.totalLosses ?? 0),
      totalDraws: existing.totalDraws + (delta.totalDraws ?? 0),
      totalKills: existing.totalKills + (delta.totalKills ?? 0),
      totalDeaths: existing.totalDeaths + (delta.totalDeaths ?? 0),
      totalDamageDealt: existing.totalDamageDealt + (delta.totalDamageDealt ?? 0),
      totalDamageTaken: existing.totalDamageTaken + (delta.totalDamageTaken ?? 0),
      totalHealed: existing.totalHealed + (delta.totalHealed ?? 0),
      highestKillStreak: Math.max(existing.highestKillStreak, delta.highestKillStreak ?? 0),
      tournamentWins: existing.tournamentWins + (delta.tournamentWins ?? 0),
      peakMmr: Math.max(existing.peakMmr, delta.peakMmr ?? 0),
      updatedAt: new Date(),
    }).where(eq(pvpStatistics.userId, userId)).returning();
    return toStats(row);
  }

  // ─── Loadouts ────────────────────────────────────────────────────────────────

  async getLoadouts(userId: string): Promise<PvpLoadout[]> {
    const rows = await db.select().from(pvpLoadouts).where(eq(pvpLoadouts.userId, userId));
    return rows.map((r) => ({
      id: r.id, userId: r.userId, name: r.name,
      characterId: r.characterId, petId: r.petId, mountId: r.mountId,
      skills: r.skills, equipment: r.equipment,
      isDefault: r.isDefault,
      metadata: r.metadata as Record<string, unknown> | null,
      createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async createLoadout(data: Omit<PvpLoadout, "id" | "createdAt" | "updatedAt">): Promise<PvpLoadout> {
    const [row] = await db.insert(pvpLoadouts).values({
      userId: data.userId, name: data.name,
      characterId: data.characterId, petId: data.petId, mountId: data.mountId,
      skills: data.skills, equipment: data.equipment,
      isDefault: data.isDefault, metadata: data.metadata,
    }).returning();
    return {
      id: row.id, userId: row.userId, name: row.name,
      characterId: row.characterId, petId: row.petId, mountId: row.mountId,
      skills: row.skills, equipment: row.equipment,
      isDefault: row.isDefault,
      metadata: row.metadata as Record<string, unknown> | null,
      createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
    };
  }

  // ─── Rewards ─────────────────────────────────────────────────────────────────

  async createReward(data: Omit<PvpReward, "id" | "createdAt">): Promise<PvpReward> {
    const [row] = await db.insert(pvpRewards).values({
      userId: data.userId, seasonId: data.seasonId,
      tier: data.tier, rewardType: data.rewardType,
      credits: data.credits, xu: data.xu, tokens: data.tokens,
      items: data.items,
    }).returning();
    return {
      id: row.id, userId: row.userId, seasonId: row.seasonId,
      tier: row.tier as RankTier, rewardType: row.rewardType,
      credits: row.credits, xu: row.xu, tokens: row.tokens,
      items: row.items, claimed: row.claimed,
      claimedAt: row.claimedAt ? row.claimedAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async getUserRewards(userId: string): Promise<PvpReward[]> {
    const rows = await db.select().from(pvpRewards)
      .where(eq(pvpRewards.userId, userId))
      .orderBy(desc(pvpRewards.createdAt));
    return rows.map((r) => ({
      id: r.id, userId: r.userId, seasonId: r.seasonId,
      tier: r.tier as RankTier, rewardType: r.rewardType,
      credits: r.credits, xu: r.xu, tokens: r.tokens,
      items: r.items, claimed: r.claimed,
      claimedAt: r.claimedAt ? r.claimedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async claimReward(rewardId: string): Promise<PvpReward | null> {
    const [row] = await db.update(pvpRewards)
      .set({ claimed: true, claimedAt: new Date() })
      .where(eq(pvpRewards.id, rewardId)).returning();
    if (!row) return null;
    return {
      id: row.id, userId: row.userId, seasonId: row.seasonId,
      tier: row.tier as RankTier, rewardType: row.rewardType,
      credits: row.credits, xu: row.xu, tokens: row.tokens,
      items: row.items, claimed: row.claimed,
      claimedAt: row.claimedAt ? row.claimedAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
