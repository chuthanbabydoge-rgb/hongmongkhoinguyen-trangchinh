// ─────────────────────────────────────────────────────────────────────────────
// PvpService — HUB-23
// Match lifecycle, attack, skill, surrender, spectator
// ─────────────────────────────────────────────────────────────────────────────

import type { IPvpRepository, PvpMatch, PvpMatchPlayer, MatchType } from "../repositories/pvpRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { pvpEventBus } from "./pvpEventBus.js";

export class PvpError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message); this.name = "PvpError";
  }
}

export class PvpService {
  constructor(
    private repo: IPvpRepository,
    private notifService: NotificationsService,
    private activitiesService: ActivitiesService,
    private reputationRepo: IUserReputationRepository,
  ) {}

  // ─── Create / Start match ─────────────────────────────────────────────────

  async createMatch(params: {
    type: MatchType;
    playerIds: string[];
    seasonId?: string;
    tournamentId?: string;
    isRanked?: boolean;
  }): Promise<{ match: PvpMatch; players: PvpMatchPlayer[] }> {
    const match = await this.repo.createMatch({
      type: params.type,
      status: "WAITING",
      seasonId: params.seasonId ?? null,
      tournamentId: params.tournamentId ?? null,
      guildWarId: null,
      winnerId: null, winTeam: null, durationSec: null,
      isRanked: params.isRanked ?? true,
      metadata: null,
      startedAt: null, finishedAt: null,
    });

    const players: PvpMatchPlayer[] = [];
    for (let i = 0; i < params.playerIds.length; i++) {
      const userId = params.playerIds[i]!;
      let mmr = 1000;
      if (params.seasonId) {
        const ranking = await this.repo.getRanking(userId, params.seasonId);
        mmr = ranking?.mmr ?? 1000;
      }
      const team = i < Math.ceil(params.playerIds.length / 2) ? 1 : 2;
      const player = await this.repo.addMatchPlayer({
        matchId: match.id, userId, team,
        isReady: false, isAlive: true,
        hp: 100, maxHp: 100, mana: 100, maxMana: 100,
        damageDealt: 0, damageTaken: 0, healed: 0, kills: 0, deaths: 0,
        mmrBefore: mmr, mmrAfter: null, mmrDelta: null, isWinner: null,
        loadoutId: null, characterId: null, petId: null, metadata: null, leftAt: null,
      });
      players.push(player);
    }

    pvpEventBus.publish({ type: "MATCH_FOUND", matchId: match.id, payload: { matchId: match.id, type: params.type, playerIds: params.playerIds } });

    for (const userId of params.playerIds) {
      await this.notifService.fire(userId, "pvp_match_found", "Trận đấu đã tìm thấy!", `Trận PvP ${params.type} sắp bắt đầu!`);
    }

    return { match, players };
  }

  async startMatch(matchId: string): Promise<PvpMatch> {
    const match = await this.repo.getMatch(matchId);
    if (!match) throw new PvpError("NOT_FOUND", "Trận đấu không tồn tại", 404);
    if (match.status !== "WAITING" && match.status !== "READY")
      throw new PvpError("INVALID_STATE", "Trận đấu không ở trạng thái sẵn sàng");

    const updated = await this.repo.updateMatch(matchId, {
      status: "IN_PROGRESS",
      startedAt: new Date().toISOString(),
    });
    pvpEventBus.publish({ type: "MATCH_STARTED", matchId, payload: { matchId } });
    return updated!;
  }

  async readyUp(matchId: string, userId: string): Promise<{ match: PvpMatch; allReady: boolean }> {
    const match = await this.repo.getMatch(matchId);
    if (!match) throw new PvpError("NOT_FOUND", "Trận đấu không tồn tại", 404);

    await this.repo.updateMatchPlayer(matchId, userId, { isReady: true });
    const players = await this.repo.getMatchPlayers(matchId);
    const allReady = players.every((p) => p.isReady);

    if (allReady) {
      return { match: await this.startMatch(matchId), allReady: true };
    }
    return { match, allReady: false };
  }

  // ─── Combat actions ───────────────────────────────────────────────────────

  async attack(matchId: string, attackerId: string, targetId: string, damage?: number): Promise<{
    attackerPlayer: PvpMatchPlayer;
    defenderPlayer: PvpMatchPlayer;
    killed: boolean;
    damageDealt: number;
  }> {
    const match = await this.repo.getMatch(matchId);
    if (!match) throw new PvpError("NOT_FOUND", "Trận đấu không tồn tại", 404);
    if (match.status !== "IN_PROGRESS") throw new PvpError("INVALID_STATE", "Trận đấu chưa bắt đầu");

    const players = await this.repo.getMatchPlayers(matchId);
    const attacker = players.find((p) => p.userId === attackerId);
    const defender = players.find((p) => p.userId === targetId);

    if (!attacker || !defender) throw new PvpError("NOT_FOUND", "Người chơi không tồn tại trong trận");
    if (!attacker.isAlive) throw new PvpError("DEAD", "Bạn đã bị đánh bại");
    if (!defender.isAlive) throw new PvpError("ALREADY_DEAD", "Mục tiêu đã bị đánh bại");

    const isCrit = Math.random() < 0.2;
    const baseDamage = damage ?? Math.floor(Math.random() * 20) + 10;
    const actualDamage = isCrit ? Math.floor(baseDamage * 1.5) : baseDamage;
    const newHp = Math.max(0, defender.hp - actualDamage);
    const killed = newHp === 0;

    await this.repo.recordDamage({
      matchId, attackerId, defenderId: targetId,
      damage: actualDamage, healing: 0, isCrit,
      skillName: null, defenderHpAfter: newHp,
    });

    const updatedDefender = await this.repo.updateMatchPlayer(matchId, targetId, {
      hp: newHp,
      isAlive: !killed,
      damageTaken: defender.damageTaken + actualDamage,
      deaths: killed ? defender.deaths + 1 : defender.deaths,
    });

    const updatedAttacker = await this.repo.updateMatchPlayer(matchId, attackerId, {
      damageDealt: attacker.damageDealt + actualDamage,
      kills: killed ? attacker.kills + 1 : attacker.kills,
    });

    pvpEventBus.publish({ type: "HP_UPDATED", matchId, userId: targetId, payload: { hp: newHp, maxHp: defender.maxHp, killed } });

    if (killed) {
      pvpEventBus.publish({ type: "PLAYER_KILLED", matchId, userId: targetId, payload: { killerId: attackerId, victimId: targetId } });
    }

    return {
      attackerPlayer: updatedAttacker!,
      defenderPlayer: updatedDefender!,
      killed,
      damageDealt: actualDamage,
    };
  }

  async useSkill(matchId: string, userId: string, skillName: string, targetId?: string): Promise<{
    effect: Record<string, unknown>;
    players: PvpMatchPlayer[];
  }> {
    const match = await this.repo.getMatch(matchId);
    if (!match) throw new PvpError("NOT_FOUND", "Trận đấu không tồn tại", 404);
    if (match.status !== "IN_PROGRESS") throw new PvpError("INVALID_STATE", "Trận đấu chưa bắt đầu");

    const players = await this.repo.getMatchPlayers(matchId);
    const caster = players.find((p) => p.userId === userId);
    if (!caster || !caster.isAlive) throw new PvpError("DEAD", "Bạn không thể dùng kỹ năng");

    const manaCost = 20;
    if (caster.mana < manaCost) throw new PvpError("NO_MANA", "Không đủ mana");

    await this.repo.updateMatchPlayer(matchId, userId, { mana: caster.mana - manaCost });

    // Apply skill effect
    const effect: Record<string, unknown> = { skillName, manaCost };
    const finalTarget = targetId ?? (players.find((p) => p.userId !== userId && p.isAlive)?.userId);

    if (finalTarget) {
      const damage = Math.floor(Math.random() * 30) + 20;
      const result = await this.attack(matchId, userId, finalTarget, damage);
      effect["damage"] = result.damageDealt;
      effect["killed"] = result.killed;
      effect["isCrit"] = false;
    }

    const updatedPlayers = await this.repo.getMatchPlayers(matchId);
    pvpEventBus.publish({ type: "HP_UPDATED", matchId, payload: { effect, userId } });

    return { effect, players: updatedPlayers };
  }

  async surrender(matchId: string, userId: string): Promise<PvpMatch> {
    const match = await this.repo.getMatch(matchId);
    if (!match) throw new PvpError("NOT_FOUND", "Trận đấu không tồn tại", 404);

    const players = await this.repo.getMatchPlayers(matchId);
    const surrenderingPlayer = players.find((p) => p.userId === userId);
    if (!surrenderingPlayer) throw new PvpError("NOT_FOUND", "Bạn không trong trận này");

    // Find opponent team
    const opponent = players.find((p) => p.team !== surrenderingPlayer.team && p.isAlive);
    return this.finishMatch(matchId, opponent?.userId ?? null, "SURRENDER");
  }

  async finishMatch(matchId: string, winnerId: string | null, reason = "NORMAL"): Promise<PvpMatch> {
    const match = await this.repo.getMatch(matchId);
    if (!match) throw new PvpError("NOT_FOUND", "Trận đấu không tồn tại", 404);

    const players = await this.repo.getMatchPlayers(matchId);
    const startedAt = match.startedAt ? new Date(match.startedAt) : new Date();
    const durationSec = Math.floor((Date.now() - startedAt.getTime()) / 1000);

    const updated = await this.repo.updateMatch(matchId, {
      status: "FINISHED",
      winnerId,
      finishedAt: new Date().toISOString(),
      durationSec,
    });

    // Update player results and MMR if ranked
    const winnerPlayer = players.find((p) => p.userId === winnerId);
    for (const player of players) {
      const isWinner = player.userId === winnerId;
      await this.repo.updateMatchPlayer(matchId, player.userId, { isWinner });

      if (match.isRanked && match.seasonId) {
        const mmrDelta = isWinner ? 25 : -20;
        const newRanking = await this.repo.updateRating(player.userId, match.seasonId, mmrDelta);
        await this.repo.updateMatchPlayer(matchId, player.userId, {
          mmrAfter: newRanking.mmr,
          mmrDelta,
        });
        pvpEventBus.publish({ type: "RANK_CHANGED", userId: player.userId, payload: { mmrDelta, newMmr: newRanking.mmr, newTier: newRanking.tier } });
        await this.notifService.fire(player.userId, "pvp_rank_changed", "Thứ hạng thay đổi!", `MMR của bạn ${mmrDelta > 0 ? "+" : ""}${mmrDelta} → ${newRanking.mmr} (${newRanking.tier})`);
        await this.reputationRepo.upsert(player.userId, isWinner ? 15 : 5);
      }

      // Update statistics
      await this.repo.upsertStatistics(player.userId, {
        totalMatches: 1,
        totalWins: isWinner ? 1 : 0,
        totalLosses: isWinner ? 0 : 1,
        totalKills: player.kills,
        totalDeaths: player.deaths,
        totalDamageDealt: player.damageDealt,
        totalDamageTaken: player.damageTaken,
        totalHealed: player.healed,
      });

      // Log activity
      await this.activitiesService.createActivity({
        userId: player.userId,
        type: "pvp_match",
        title: isWinner ? "Chiến thắng PvP!" : "Thất bại PvP",
        description: `Trận ${match.type} — ${isWinner ? "Thắng" : "Thua"} — Thời gian: ${durationSec}s`,
        metadata: { matchId, type: match.type, isWinner, durationSec },
      });
    }

    // Achievements
    if (winnerId) {
      const stats = await this.repo.getStatistics(winnerId);
      if (stats?.totalWins === 1) {
        await this.activitiesService.createActivity({
          userId: winnerId,
          type: "achievement",
          title: "Thành tựu: Chiến thắng đầu tiên!",
          description: "Bạn đã giành được chiến thắng PvP đầu tiên",
          metadata: { achievement: "FIRST_VICTORY" },
        });
      }
    }

    pvpEventBus.publish({ type: "MATCH_FINISHED", matchId, payload: { matchId, winnerId, reason, durationSec } });

    return updated!;
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  async getDashboard(userId: string): Promise<{
    stats: unknown;
    currentMatch: PvpMatch | null;
    inQueue: boolean;
    queueEntry: unknown;
    recentMatches: PvpMatch[];
    rewards: unknown[];
  }> {
    const stats = await this.repo.getStatistics(userId);
    const recentMatches = await this.repo.getMatchHistory(userId, 10);
    const queueEntry = await this.repo.getQueueEntry(userId);
    const rewards = await this.repo.getUserRewards(userId);

    return {
      stats,
      currentMatch: null,
      inQueue: !!queueEntry,
      queueEntry,
      recentMatches,
      rewards,
    };
  }

  async getMatch(matchId: string): Promise<{ match: PvpMatch; players: PvpMatchPlayer[] }> {
    const match = await this.repo.getMatch(matchId);
    if (!match) throw new PvpError("NOT_FOUND", "Trận đấu không tồn tại", 404);
    const players = await this.repo.getMatchPlayers(matchId);
    return { match, players };
  }
}
