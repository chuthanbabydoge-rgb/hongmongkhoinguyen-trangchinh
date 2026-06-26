// ─────────────────────────────────────────────────────────────────────────────
// CombatService — HUB-19
// ─────────────────────────────────────────────────────────────────────────────

import type { ICombatRepository, Battle, BattleFull, BattleType, Participant, Boss, ArenaRank, CombatStatistics, AttackResult, SkillResult } from "../repositories/combatRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService }    from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import type { CharacterService } from "./characterService.js";
import { combatEventBus } from "./combatEventBus.js";

export class CombatError extends Error {
  constructor(message: string, public code = "COMBAT_ERROR", public status = 400) {
    super(message);
    this.name = "CombatError";
  }
}

export class CombatService {
  constructor(
    private readonly repo:           ICombatRepository,
    private readonly notifService:   NotificationsService,
    private readonly actService:     ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
    private readonly characterService: CharacterService,
  ) {}

  // ── Create battle ──────────────────────────────────────────────────────────

  async createBattle(userId: string, type: BattleType = "PVE", options?: { bossId?: string; dungeonId?: string; isRealtime?: boolean }): Promise<Battle> {
    const battle = await this.repo.createBattle({
      type, creatorId: userId,
      isRealtime: options?.isRealtime ?? false,
      bossId: options?.bossId,
      metadata: options?.dungeonId ? { dungeonId: options.dungeonId } : undefined,
    });

    combatEventBus.publish({ type: "BATTLE_CREATED", battleId: battle.id, userId });

    this.actService.fire({
      userId, type: "system" as never,
      title: `Tạo trận chiến ${type}`,
      description: `Battle ID: ${battle.id}`,
      metadata: { battleId: battle.id, type },
    });

    return battle;
  }

  // ── Join ───────────────────────────────────────────────────────────────────

  async joinBattle(battleId: string, userId: string, characterId?: string): Promise<Participant> {
    const battle = await this.repo.getBattle(battleId);
    if (!battle) throw new CombatError("Trận chiến không tồn tại", "NOT_FOUND", 404);
    if (battle.status !== "WAITING") throw new CombatError("Trận chiến đã bắt đầu hoặc kết thúc", "INVALID_STATUS");

    const parts = await this.repo.getBattleFull(battleId);
    const existing = parts?.participants.find(p => p.userId === userId);
    if (existing) return existing;

    const team = (parts?.participants.length ?? 0) % 2 === 0 ? 1 : 2;
    const participant = await this.repo.joinBattle(battleId, userId, characterId, team);
    return participant;
  }

  // ── Start ──────────────────────────────────────────────────────────────────

  async startBattle(battleId: string, userId: string): Promise<BattleFull> {
    const battle = await this.repo.getBattle(battleId);
    if (!battle) throw new CombatError("Trận chiến không tồn tại", "NOT_FOUND", 404);
    if (battle.creatorId !== userId) throw new CombatError("Chỉ người tạo trận mới có thể bắt đầu", "FORBIDDEN", 403);
    if (battle.status !== "WAITING") throw new CombatError("Trận chiến không ở trạng thái chờ", "INVALID_STATUS");

    await this.repo.startBattle(battleId);

    // Add NPC for PVE if only 1 participant
    const full = await this.repo.getBattleFull(battleId);
    if (battle.type === "PVE" && full && full.participants.filter(p => !p.isNpc).length === 1) {
      await this.repo.joinBattle(battleId, "npc-system", undefined, 2);
    }

    // Boss battle — inject boss as NPC participant
    if (battle.type === "BOSS" && battle.bossId) {
      const boss = await this.repo.getBoss(battle.bossId);
      if (boss) {
        const [bossParticipant] = await Promise.all([
          this.repo.joinBattle(battleId, `boss-${boss.id}`, undefined, 2),
        ]);
        // Set boss stats directly
        const bossUpdate = {
          currentHp: boss.hp, maxHp: boss.hp,
          attack: boss.attack, defense: boss.defense, speed: boss.speed,
          isNpc: true, npcName: boss.name,
        };
        void bossUpdate;
      }
    }

    combatEventBus.publish({ type: "BATTLE_STARTED", battleId, userId });

    const updated = await this.repo.getBattleFull(battleId);
    if (!updated) throw new CombatError("Không lấy được thông tin trận chiến", "SERVER_ERROR", 500);
    return updated;
  }

  // ── Attack ─────────────────────────────────────────────────────────────────

  async attack(battleId: string, userId: string, targetUserId: string): Promise<AttackResult> {
    const result = await this.repo.attack(battleId, userId, targetUserId);

    combatEventBus.publish({
      type: result.isCritical ? "CRITICAL_HIT" : "PLAYER_ATTACKED",
      battleId, userId,
      payload: {
        targetId: targetUserId, damage: result.damageLog.netDamage,
        isCritical: result.isCritical, isMiss: result.isMiss, isDodge: result.isDodge,
      },
    });

    if (result.targetDied) {
      combatEventBus.publish({ type: "PLAYER_DIED", battleId, userId: targetUserId });
    }

    if (result.battleFinished) {
      await this.handleBattleFinished(battleId, result.winnerId, userId);
    }

    return result;
  }

  // ── Skill ──────────────────────────────────────────────────────────────────

  async castSkill(battleId: string, userId: string, targetUserId: string, skillId: string): Promise<SkillResult> {
    const result = await this.repo.castSkill(battleId, userId, targetUserId, skillId);

    combatEventBus.publish({
      type: "SKILL_CAST", battleId, userId,
      payload: { skillId, targetId: targetUserId, damage: result.damageLog.netDamage, effects: result.effectsApplied },
    });

    if (result.targetDied) {
      combatEventBus.publish({ type: "PLAYER_DIED", battleId, userId: targetUserId });
    }

    if (result.battleFinished) {
      await this.handleBattleFinished(battleId, result.winnerId, userId);
    }

    return result;
  }

  // ── Surrender ──────────────────────────────────────────────────────────────

  async surrender(battleId: string, userId: string): Promise<Battle> {
    const battle = await this.repo.getBattle(battleId);
    if (!battle) throw new CombatError("Trận chiến không tồn tại", "NOT_FOUND", 404);
    if (battle.status !== "ACTIVE") throw new CombatError("Trận chiến không đang diễn ra", "INVALID_STATUS");

    await this.repo.leaveBattle(battleId, userId);
    const finished = await this.repo.finishBattle(battleId);

    await this.distributeRewards(battleId, userId, false);

    combatEventBus.publish({ type: "BATTLE_FINISHED", battleId, userId, payload: { result: "SURRENDER" } });
    return finished;
  }

  // ── Finish & rewards ───────────────────────────────────────────────────────

  private async handleBattleFinished(battleId: string, winnerId: string | undefined, triggerUserId: string): Promise<void> {
    const full = await this.repo.getBattleFull(battleId);
    if (!full) return;

    combatEventBus.publish({ type: "BATTLE_FINISHED", battleId, userId: winnerId, payload: { winnerId } });

    for (const participant of full.participants) {
      if (participant.isNpc) continue;
      const isWinner = winnerId === participant.userId || (winnerId === triggerUserId && participant.userId === triggerUserId);
      await this.distributeRewards(battleId, participant.userId, isWinner, full.type);
    }
  }

  private async distributeRewards(battleId: string, userId: string, isVictory: boolean, type: BattleType = "PVE"): Promise<void> {
    const xpBase  = isVictory ? (type === "BOSS" ? 500 : type === "ARENA" ? 200 : 100) : 30;
    const goldBase = isVictory ? (type === "BOSS" ? 200 : type === "ARENA" ? 80 : 40) : 10;
    const rep     = isVictory ? 5 : 0;

    const reward = await this.repo.recordReward(battleId, userId, xpBase, goldBase, rep, isVictory);

    await this.repo.updateStatistics(userId, {
      totalBattles: 1,
      totalWins: isVictory ? 1 : 0,
      totalLosses: isVictory ? 0 : 1,
      arenaWins: (isVictory && type === "ARENA") ? 1 : 0,
      bossesDefeated: (isVictory && type === "BOSS") ? 1 : 0,
    });

    if (type === "ARENA" || type === "PVP") {
      await this.repo.updateArenaRank(userId, isVictory);
    }

    // Grant XP to character
    try {
      await this.characterService.gainExperience(userId, xpBase, "combat", battleId);
    } catch { /* character may not exist */ }

    // Reputation
    if (rep > 0) {
      try {
        await this.reputationRepo.upsert(userId, rep);
      } catch { /* optional */ }
    }

    // Notify
    const notifTitle = isVictory ? "🏆 Chiến thắng!" : "💀 Thất bại";
    const notifMsg   = isVictory
      ? `Bạn đã thắng! +${xpBase} XP, +${goldBase} Gold`
      : `Trận đấu kết thúc. +${xpBase} XP kinh nghiệm`;

    this.notifService.fire(userId, "system" as never, notifTitle, notifMsg);

    this.actService.fire({
      userId, type: "system" as never,
      title: isVictory ? "Chiến thắng trận đấu" : "Thất bại trận đấu",
      description: `${type} — ${isVictory ? `+${xpBase} XP` : "Thua cuộc"}`,
      metadata: { battleId, reward: { xp: xpBase, gold: goldBase } },
    });

    combatEventBus.publish({ type: "REWARD_GRANTED", battleId, userId, payload: reward as unknown as Record<string, unknown> });
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  async getBattle(battleId: string): Promise<BattleFull | null> {
    return this.repo.getBattleFull(battleId);
  }

  async listBattles(status?: "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED", type?: BattleType): Promise<Battle[]> {
    return this.repo.listBattles(status, type);
  }

  async history(userId: string, limit = 20, offset = 0) {
    return this.repo.history(userId, limit, offset);
  }

  async leaderboard(season = 1, limit = 50) {
    return this.repo.leaderboard(season, limit);
  }

  async getStatistics(userId: string): Promise<CombatStatistics | null> {
    return this.repo.getStatistics(userId);
  }

  async getArenaRank(userId: string): Promise<ArenaRank | null> {
    return this.repo.getArenaRank(userId);
  }

  async listBosses(): Promise<Boss[]> {
    return this.repo.listBosses(true);
  }

  async getBoss(id: string): Promise<Boss | null> {
    return this.repo.getBoss(id);
  }

  async startBossBattle(userId: string, bossId: string): Promise<BattleFull> {
    const boss = await this.repo.getBoss(bossId);
    if (!boss) throw new CombatError("Boss không tồn tại", "NOT_FOUND", 404);
    const battle = await this.createBattle(userId, "BOSS", { bossId });
    await this.repo.joinBattle(battle.id, userId, undefined, 1);
    return this.startBattle(battle.id, userId);
  }

  async joinArenaQueue(userId: string): Promise<{ queued: true; battleId?: string }> {
    const waiting = await this.repo.listBattles("WAITING", "ARENA", 5);
    if (waiting.length > 0) {
      const battle = waiting[0]!;
      await this.joinBattle(battle.id, userId);
      const full = await this.startBattle(battle.id, battle.creatorId);
      return { queued: true, battleId: full.id };
    }
    const battle = await this.createBattle(userId, "ARENA");
    await this.repo.joinBattle(battle.id, userId, undefined, 1);
    return { queued: true, battleId: battle.id };
  }

  async getSkills() {
    return this.repo.getSkills();
  }
}
