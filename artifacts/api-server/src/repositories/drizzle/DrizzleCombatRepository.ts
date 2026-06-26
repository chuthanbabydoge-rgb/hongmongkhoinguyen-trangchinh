// ─────────────────────────────────────────────────────────────────────────────
// DrizzleCombatRepository — HUB-19
// ─────────────────────────────────────────────────────────────────────────────

import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  combatBattles, combatParticipants, combatTurns, combatSkills,
  combatEffects, combatDamageLogs, combatRewards, combatHistory,
  combatPvpRank, combatBosses, combatStatistics,
} from "@workspace/db";
import type {
  ICombatRepository, Battle, BattleFull, Participant, CombatTurn,
  CombatSkill, CombatEffect, DamageLog, CombatReward, CombatHistoryEntry,
  Boss, ArenaRank, CombatStatistics, BattleType, BattleStatus,
  CreateBattleInput, AttackResult, SkillResult,
} from "../combatRepository.js";

// ── Mappers ───────────────────────────────────────────────────────────────────

function toBattle(r: typeof combatBattles.$inferSelect): Battle {
  return {
    id: r.id, type: r.type as BattleType, status: r.status as Battle["status"],
    creatorId: r.creatorId, winnerId: r.winnerId,
    currentTurn: r.currentTurn, maxTurns: r.maxTurns,
    isRealtime: r.isRealtime, bossId: r.bossId,
    metadata: r.metadata as Record<string, unknown> | null,
    startedAt: r.startedAt?.toISOString() ?? null,
    finishedAt: r.finishedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
  };
}

function toParticipant(r: typeof combatParticipants.$inferSelect): Participant {
  return {
    id: r.id, battleId: r.battleId, userId: r.userId, characterId: r.characterId,
    team: r.team, status: r.status as Participant["status"],
    currentHp: r.currentHp, maxHp: r.maxHp, currentMp: r.currentMp, maxMp: r.maxMp,
    attack: r.attack, defense: r.defense, speed: r.speed,
    critRate: Number(r.critRate), critDamage: Number(r.critDamage),
    aggro: r.aggro, comboCount: r.comboCount, isNpc: r.isNpc, npcName: r.npcName,
    joinedAt: r.joinedAt.toISOString(),
  };
}

function toTurn(r: typeof combatTurns.$inferSelect): CombatTurn {
  return {
    id: r.id, battleId: r.battleId, turnNumber: r.turnNumber,
    actorId: r.actorId, targetId: r.targetId, actionType: r.actionType,
    skillId: r.skillId, damage: r.damage, healing: r.healing,
    isCritical: r.isCritical, isMiss: r.isMiss, isDodge: r.isDodge, isBlocked: r.isBlocked,
    effectsApplied: r.effectsApplied as unknown[] | null,
    metadata: r.metadata as Record<string, unknown> | null,
    createdAt: r.createdAt.toISOString(),
  };
}

function toEffect(r: typeof combatEffects.$inferSelect): CombatEffect {
  return {
    id: r.id, battleId: r.battleId, participantId: r.participantId,
    effectType: r.effectType, value: Number(r.value), turnsLeft: r.turnsLeft,
    sourceId: r.sourceId, createdAt: r.createdAt.toISOString(),
  };
}

function toDamageLog(r: typeof combatDamageLogs.$inferSelect): DamageLog {
  return {
    id: r.id, battleId: r.battleId, turnId: r.turnId, sourceId: r.sourceId,
    targetId: r.targetId, damage: r.damage, damageType: r.damageType,
    isCritical: r.isCritical, isMiss: r.isMiss, isDodge: r.isDodge,
    shieldAbsorbed: r.shieldAbsorbed, netDamage: r.netDamage,
    createdAt: r.createdAt.toISOString(),
  };
}

function toReward(r: typeof combatRewards.$inferSelect): CombatReward {
  return {
    id: r.id, battleId: r.battleId, userId: r.userId, xp: r.xp, gold: r.gold,
    items: r.items as unknown[] | null, reputation: r.reputation,
    isVictory: r.isVictory, createdAt: r.createdAt.toISOString(),
  };
}

function toHistory(r: typeof combatHistory.$inferSelect): CombatHistoryEntry {
  return {
    id: r.id, battleId: r.battleId, userId: r.userId, type: r.type as BattleType,
    result: r.result, opponentName: r.opponentName, turnsCount: r.turnsCount,
    xpGained: r.xpGained, goldGained: r.goldGained, createdAt: r.createdAt.toISOString(),
  };
}

function toBoss(r: typeof combatBosses.$inferSelect): Boss {
  return {
    id: r.id, name: r.name, description: r.description, icon: r.icon,
    level: r.level, hp: r.hp, attack: r.attack, defense: r.defense, speed: r.speed,
    skills: r.skills as unknown[] | null, lootTable: r.lootTable as unknown[] | null,
    xpReward: r.xpReward, goldReward: r.goldReward,
    isWorldBoss: r.isWorldBoss, isActive: r.isActive, createdAt: r.createdAt.toISOString(),
  };
}

function toRank(r: typeof combatPvpRank.$inferSelect): ArenaRank {
  return {
    id: r.id, userId: r.userId, season: r.season, rating: r.rating,
    wins: r.wins, losses: r.losses, draws: r.draws,
    winStreak: r.winStreak, rank: r.rank, updatedAt: r.updatedAt.toISOString(),
  };
}

function toStats(r: typeof combatStatistics.$inferSelect): CombatStatistics {
  return {
    id: r.id, userId: r.userId, totalBattles: r.totalBattles, totalWins: r.totalWins,
    totalLosses: r.totalLosses, totalKills: r.totalKills, totalDamage: r.totalDamage,
    totalHealing: r.totalHealing, criticalHits: r.criticalHits,
    bossesDefeated: r.bossesDefeated, arenaWins: r.arenaWins,
    longestWinStreak: r.longestWinStreak, favoriteSkill: r.favoriteSkill,
    updatedAt: r.updatedAt.toISOString(),
  };
}

// ── Damage calculation helpers ─────────────────────────────────────────────────

function calcDamage(attacker: Participant, defender: Participant, skillDamage = 0): {
  damage: number; isCritical: boolean; isMiss: boolean; isDodge: boolean; netDamage: number;
} {
  const missChance = 0.05;
  const dodgeChance = Math.min(0.25, defender.speed / (attacker.speed + defender.speed) * 0.4);

  const roll = Math.random();
  if (roll < missChance) return { damage: 0, isCritical: false, isMiss: true, isDodge: false, netDamage: 0 };
  if (roll < missChance + dodgeChance) return { damage: 0, isCritical: false, isMiss: false, isDodge: true, netDamage: 0 };

  const baseDmg = attacker.attack + skillDamage;
  const variance = 0.85 + Math.random() * 0.3;
  let dmg = Math.max(1, Math.floor(baseDmg * variance));

  const isCritical = Math.random() < attacker.critRate;
  if (isCritical) dmg = Math.floor(dmg * attacker.critDamage);

  const reduction = defender.defense / (defender.defense + 50);
  const netDamage = Math.max(1, Math.floor(dmg * (1 - reduction)));

  return { damage: dmg, isCritical, isMiss: false, isDodge: false, netDamage };
}

// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleCombatRepository implements ICombatRepository {

  // ── Battles ────────────────────────────────────────────────────────────────

  async createBattle(input: CreateBattleInput): Promise<Battle> {
    const [row] = await db.insert(combatBattles).values({
      type: input.type, creatorId: input.creatorId,
      isRealtime: input.isRealtime ?? false,
      bossId: input.bossId,
      metadata: input.metadata ?? null,
    }).returning();
    return toBattle(row!);
  }

  async getBattle(id: string): Promise<Battle | null> {
    const [row] = await db.select().from(combatBattles).where(eq(combatBattles.id, id));
    return row ? toBattle(row) : null;
  }

  async getBattleFull(id: string): Promise<BattleFull | null> {
    const [battleRow] = await db.select().from(combatBattles).where(eq(combatBattles.id, id));
    if (!battleRow) return null;
    const [parts, turns, effects] = await Promise.all([
      db.select().from(combatParticipants).where(eq(combatParticipants.battleId, id)),
      db.select().from(combatTurns).where(eq(combatTurns.battleId, id)).orderBy(asc(combatTurns.turnNumber)),
      db.select().from(combatEffects).where(eq(combatEffects.battleId, id)),
    ]);
    return {
      ...toBattle(battleRow),
      participants: parts.map(toParticipant),
      turns: turns.map(toTurn),
      effects: effects.map(toEffect),
    };
  }

  async listBattles(status?: BattleStatus, type?: BattleType, limit = 20): Promise<Battle[]> {
    let q = db.select().from(combatBattles).orderBy(desc(combatBattles.createdAt)).limit(limit).$dynamic();
    if (status) q = q.where(eq(combatBattles.status, status));
    const rows = await q;
    return rows.map(toBattle);
  }

  async listBattlesByUser(userId: string, limit = 20): Promise<Battle[]> {
    const subParticipants = await db.select({ battleId: combatParticipants.battleId })
      .from(combatParticipants).where(eq(combatParticipants.userId, userId));
    const rawIds = subParticipants.map((p: { battleId: string | null }) => p.battleId) as (string | null)[];
    const ids = rawIds.filter((id): id is string => id !== null);
    if (!ids.length) return [];
    const rows = await db.select().from(combatBattles)
      .where(inArray(combatBattles.id, ids))
      .orderBy(desc(combatBattles.createdAt)).limit(limit);
    return rows.map(toBattle);
  }

  // ── Participants ────────────────────────────────────────────────────────────

  async joinBattle(battleId: string, userId: string, characterId?: string, team = 1): Promise<Participant> {
    const existing = await this.getParticipant(battleId, userId);
    if (existing) return existing;
    const [row] = await db.insert(combatParticipants).values({
      battleId, userId, characterId, team,
    }).returning();
    return toParticipant(row!);
  }

  async leaveBattle(battleId: string, userId: string): Promise<void> {
    await db.update(combatParticipants)
      .set({ status: "DISCONNECTED" })
      .where(and(eq(combatParticipants.battleId, battleId), eq(combatParticipants.userId, userId)));
  }

  async getParticipant(battleId: string, userId: string): Promise<Participant | null> {
    const [row] = await db.select().from(combatParticipants)
      .where(and(eq(combatParticipants.battleId, battleId), eq(combatParticipants.userId, userId)));
    return row ? toParticipant(row) : null;
  }

  async getParticipantById(participantId: string): Promise<Participant | null> {
    const [row] = await db.select().from(combatParticipants).where(eq(combatParticipants.id, participantId));
    return row ? toParticipant(row) : null;
  }

  async updateParticipantHp(participantId: string, newHp: number): Promise<Participant> {
    const hp = Math.max(0, newHp);
    const [row] = await db.update(combatParticipants)
      .set({ currentHp: hp, status: hp <= 0 ? "DEAD" : "ALIVE" })
      .where(eq(combatParticipants.id, participantId)).returning();
    return toParticipant(row!);
  }

  async updateParticipantMp(participantId: string, newMp: number): Promise<Participant> {
    const mp = Math.max(0, newMp);
    const [row] = await db.update(combatParticipants)
      .set({ currentMp: mp })
      .where(eq(combatParticipants.id, participantId)).returning();
    return toParticipant(row!);
  }

  // ── Battle lifecycle ────────────────────────────────────────────────────────

  async startBattle(battleId: string): Promise<Battle> {
    const [row] = await db.update(combatBattles)
      .set({ status: "ACTIVE", startedAt: new Date(), updatedAt: new Date() })
      .where(eq(combatBattles.id, battleId)).returning();
    return toBattle(row!);
  }

  async finishBattle(battleId: string, winnerId?: string): Promise<Battle> {
    const [row] = await db.update(combatBattles)
      .set({ status: "FINISHED", winnerId: winnerId ?? null, finishedAt: new Date(), updatedAt: new Date() })
      .where(eq(combatBattles.id, battleId)).returning();
    return toBattle(row!);
  }

  // ── Combat actions ──────────────────────────────────────────────────────────

  async attack(battleId: string, actorId: string, targetId: string): Promise<AttackResult> {
    const battle = await this.getBattle(battleId);
    if (!battle || battle.status !== "ACTIVE") throw new Error("Trận chiến không hợp lệ hoặc chưa bắt đầu");

    const actorRows = await db.select().from(combatParticipants)
      .where(and(eq(combatParticipants.battleId, battleId), eq(combatParticipants.userId, actorId)));
    const targetRows = await db.select().from(combatParticipants)
      .where(and(eq(combatParticipants.battleId, battleId), eq(combatParticipants.userId, targetId)));
    if (!actorRows[0] || !targetRows[0]) throw new Error("Người chơi không tham gia trận chiến này");

    const actor  = toParticipant(actorRows[0]!);
    const target = toParticipant(targetRows[0]!);
    if (target.status !== "ALIVE") throw new Error("Mục tiêu đã bị loại khỏi trận");

    const { damage, isCritical, isMiss, isDodge, netDamage } = calcDamage(actor, target);

    const turnNumber = battle.currentTurn + 1;
    const [turnRow] = await db.insert(combatTurns).values({
      battleId, turnNumber, actorId: actor.id, targetId: target.id,
      actionType: "attack", damage, isCritical, isMiss, isDodge,
    }).returning();
    const turn = toTurn(turnRow!);

    const damageLog = await this.recordDamage(battleId, turn.id, actor.id, target.id, damage, {
      isCritical, isMiss, isDodge,
    });

    await db.update(combatBattles).set({ currentTurn: turnNumber, updatedAt: new Date() })
      .where(eq(combatBattles.id, battleId));

    let targetDied = false;
    let battleFinished = false;
    let winnerId: string | undefined;

    if (!isMiss && !isDodge && netDamage > 0) {
      const newHp = target.currentHp - netDamage;
      await this.updateParticipantHp(target.id, newHp);
      if (newHp <= 0) {
        targetDied = true;
        const aliveTeam1 = await db.select().from(combatParticipants)
          .where(and(eq(combatParticipants.battleId, battleId), eq(combatParticipants.status, "ALIVE"), eq(combatParticipants.team, 1)));
        const aliveTeam2 = await db.select().from(combatParticipants)
          .where(and(eq(combatParticipants.battleId, battleId), eq(combatParticipants.status, "ALIVE"), eq(combatParticipants.team, 2)));
        if (!aliveTeam1.length || !aliveTeam2.length) {
          battleFinished = true;
          winnerId = aliveTeam1.length ? actorId : targetId;
          await this.finishBattle(battleId, winnerId);
        }
      }
    }

    if (turnNumber >= battle.maxTurns && !battleFinished) {
      battleFinished = true;
      await this.finishBattle(battleId);
    }

    return { turn, damageLog, targetDied, battleFinished, winnerId, isCritical, isMiss, isDodge };
  }

  async castSkill(battleId: string, actorId: string, targetId: string, skillId: string): Promise<SkillResult> {
    const [skillRow] = await db.select().from(combatSkills).where(eq(combatSkills.id, skillId));
    if (!skillRow) throw new Error("Kỹ năng không tồn tại");
    const skill: CombatSkill = {
      id: skillRow.id, name: skillRow.name, description: skillRow.description,
      icon: skillRow.icon, target: skillRow.target as CombatSkill["target"],
      mpCost: skillRow.mpCost, cooldown: skillRow.cooldown,
      baseDamage: skillRow.baseDamage, baseHealing: skillRow.baseHealing,
      effectType: skillRow.effectType, effectValue: skillRow.effectValue !== null ? Number(skillRow.effectValue) : null,
      effectTurns: skillRow.effectTurns, comboMultiplier: Number(skillRow.comboMultiplier),
    };

    const battle = await this.getBattle(battleId);
    if (!battle || battle.status !== "ACTIVE") throw new Error("Trận chiến không hợp lệ");

    const actorRows = await db.select().from(combatParticipants)
      .where(and(eq(combatParticipants.battleId, battleId), eq(combatParticipants.userId, actorId)));
    const actor = actorRows[0] ? toParticipant(actorRows[0]) : null;
    if (!actor) throw new Error("Người dùng không tham gia trận chiến");
    if (actor.currentMp < skill.mpCost) throw new Error("Không đủ MP để sử dụng kỹ năng");

    await this.updateParticipantMp(actor.id, actor.currentMp - skill.mpCost);

    const targetRows = await db.select().from(combatParticipants)
      .where(and(eq(combatParticipants.battleId, battleId), eq(combatParticipants.userId, targetId)));
    const target = targetRows[0] ? toParticipant(targetRows[0]) : null;
    if (!target) throw new Error("Mục tiêu không hợp lệ");

    let healingDone = 0;
    const effectsApplied: string[] = [];

    // Heal self if skill is healing type
    if (skill.baseHealing > 0) {
      const newHp = Math.min(actor.maxHp, actor.currentHp + skill.baseHealing);
      await this.updateParticipantHp(actor.id, newHp);
      healingDone = newHp - actor.currentHp;
    }

    // Apply status effect
    if (skill.effectType && skill.effectValue !== null && skill.effectTurns) {
      const effect = await this.applyEffect(battleId, target.id, skill.effectType, skill.effectValue, skill.effectTurns, actor.id);
      effectsApplied.push(effect.effectType);
    }

    const { damage, isCritical, isMiss, isDodge, netDamage } = calcDamage(
      { ...actor, attack: actor.attack + skill.baseDamage }, target
    );

    const turnNumber = battle.currentTurn + 1;
    const [turnRow] = await db.insert(combatTurns).values({
      battleId, turnNumber, actorId: actor.id, targetId: target.id,
      actionType: "skill", skillId, damage, healing: healingDone || null,
      isCritical, isMiss, isDodge, effectsApplied,
    }).returning();
    const turn = toTurn(turnRow!);

    const damageLog = await this.recordDamage(battleId, turn.id, actor.id, target.id, damage, {
      isCritical, isMiss, isDodge,
    });

    await db.update(combatBattles).set({ currentTurn: turnNumber, updatedAt: new Date() })
      .where(eq(combatBattles.id, battleId));

    let targetDied = false;
    let battleFinished = false;
    let winnerId: string | undefined;

    if (!isMiss && !isDodge && netDamage > 0 && skill.baseDamage > 0) {
      const newHp = target.currentHp - netDamage;
      await this.updateParticipantHp(target.id, newHp);
      if (newHp <= 0) {
        targetDied = true;
        const aliveTeam1 = await db.select().from(combatParticipants)
          .where(and(eq(combatParticipants.battleId, battleId), eq(combatParticipants.status, "ALIVE"), eq(combatParticipants.team, 1)));
        const aliveTeam2 = await db.select().from(combatParticipants)
          .where(and(eq(combatParticipants.battleId, battleId), eq(combatParticipants.status, "ALIVE"), eq(combatParticipants.team, 2)));
        if (!aliveTeam1.length || !aliveTeam2.length) {
          battleFinished = true;
          winnerId = aliveTeam1.length ? actorId : targetId;
          await this.finishBattle(battleId, winnerId);
        }
      }
    }

    return { turn, damageLog, targetDied, battleFinished, winnerId, isCritical, isMiss, isDodge, healingDone, effectsApplied };
  }

  // ── Effects ─────────────────────────────────────────────────────────────────

  async applyEffect(battleId: string, participantId: string, effectType: string, value: number, turns: number, sourceId?: string): Promise<CombatEffect> {
    const [row] = await db.insert(combatEffects).values({
      battleId, participantId, effectType, value, turnsLeft: turns, sourceId,
    }).returning();
    return toEffect(row!);
  }

  async removeEffect(effectId: string): Promise<void> {
    await db.delete(combatEffects).where(eq(combatEffects.id, effectId));
  }

  async tickEffects(battleId: string): Promise<{ damaged: Record<string, number>; expired: string[] }> {
    const effects = await db.select().from(combatEffects).where(eq(combatEffects.battleId, battleId));
    const damaged: Record<string, number> = {};
    const expired: string[] = [];

    for (const e of effects) {
      const newTurns = e.turnsLeft - 1;
      if (newTurns <= 0) {
        await db.delete(combatEffects).where(eq(combatEffects.id, e.id));
        expired.push(e.id);
      } else {
        await db.update(combatEffects).set({ turnsLeft: newTurns }).where(eq(combatEffects.id, e.id));
      }

      if (["POISON", "BURN"].includes(e.effectType)) {
        const dmg = Math.floor(Number(e.value));
        damaged[e.participantId] = (damaged[e.participantId] ?? 0) + dmg;
        const [participant] = await db.select().from(combatParticipants).where(eq(combatParticipants.id, e.participantId));
        if (participant) {
          const newHp = Math.max(0, participant.currentHp - dmg);
          await this.updateParticipantHp(e.participantId, newHp);
        }
      }
    }
    return { damaged, expired };
  }

  // ── Logging ─────────────────────────────────────────────────────────────────

  async recordDamage(
    battleId: string, turnId: string | null, sourceId: string, targetId: string, damage: number,
    options?: { damageType?: string; isCritical?: boolean; isMiss?: boolean; isDodge?: boolean; shieldAbsorbed?: number }
  ): Promise<DamageLog> {
    const netDamage = options?.isMiss || options?.isDodge ? 0 : Math.max(0, damage - (options?.shieldAbsorbed ?? 0));
    const [row] = await db.insert(combatDamageLogs).values({
      battleId, turnId, sourceId, targetId, damage,
      damageType: options?.damageType ?? "physical",
      isCritical: options?.isCritical ?? false,
      isMiss: options?.isMiss ?? false,
      isDodge: options?.isDodge ?? false,
      shieldAbsorbed: options?.shieldAbsorbed ?? 0,
      netDamage,
    }).returning();
    return toDamageLog(row!);
  }

  async recordReward(battleId: string, userId: string, xp: number, gold: number, reputation = 0, isVictory = false, items?: unknown[]): Promise<CombatReward> {
    const [row] = await db.insert(combatRewards).values({
      battleId, userId, xp, gold, reputation, isVictory, items: items ?? null,
    }).returning();

    const result = toReward(row!);
    const type = (await this.getBattle(battleId))?.type ?? "PVE";

    await db.insert(combatHistory).values({
      battleId, userId, type: type as BattleType,
      result: isVictory ? "VICTORY" : "DEFEAT",
      xpGained: xp, goldGained: gold,
    });

    return result;
  }

  // ── History & leaderboard ───────────────────────────────────────────────────

  async history(userId: string, limit = 20, offset = 0): Promise<CombatHistoryEntry[]> {
    const rows = await db.select().from(combatHistory)
      .where(eq(combatHistory.userId, userId))
      .orderBy(desc(combatHistory.createdAt)).limit(limit).offset(offset);
    return rows.map(toHistory);
  }

  async leaderboard(season = 1, limit = 50): Promise<(ArenaRank & { username?: string })[]> {
    const rows = await db.select().from(combatPvpRank)
      .where(eq(combatPvpRank.season, season))
      .orderBy(desc(combatPvpRank.rating)).limit(limit);
    return rows.map((r: (typeof rows)[number]) => ({ ...toRank(r) }));
  }

  async getArenaRank(userId: string, season = 1): Promise<ArenaRank | null> {
    const [row] = await db.select().from(combatPvpRank)
      .where(and(eq(combatPvpRank.userId, userId), eq(combatPvpRank.season, season)));
    return row ? toRank(row) : null;
  }

  async updateArenaRank(userId: string, isWin: boolean, season = 1): Promise<ArenaRank> {
    const existing = await this.getArenaRank(userId, season);
    const ratingDelta = isWin ? 25 : -20;
    const newRating   = Math.max(0, (existing?.rating ?? 1000) + ratingDelta);

    const rankTier = newRating >= 2000 ? "GRANDMASTER"
      : newRating >= 1800 ? "MASTER"
      : newRating >= 1600 ? "DIAMOND"
      : newRating >= 1400 ? "PLATINUM"
      : newRating >= 1200 ? "GOLD"
      : newRating >= 1000 ? "SILVER"
      : "BRONZE";

    if (!existing) {
      const [row] = await db.insert(combatPvpRank).values({
        userId, season, rating: newRating,
        wins: isWin ? 1 : 0, losses: isWin ? 0 : 1,
        winStreak: isWin ? 1 : 0, rank: rankTier,
      }).returning();
      return toRank(row!);
    }

    const newWinStreak = isWin ? (existing.winStreak + 1) : 0;
    const [row] = await db.update(combatPvpRank)
      .set({
        rating: newRating, rank: rankTier,
        wins: isWin ? existing.wins + 1 : existing.wins,
        losses: isWin ? existing.losses : existing.losses + 1,
        winStreak: newWinStreak,
        updatedAt: new Date(),
      })
      .where(eq(combatPvpRank.id, existing.id)).returning();
    return toRank(row!);
  }

  // ── Statistics ──────────────────────────────────────────────────────────────

  async getStatistics(userId: string): Promise<CombatStatistics | null> {
    const [row] = await db.select().from(combatStatistics).where(eq(combatStatistics.userId, userId));
    return row ? toStats(row) : null;
  }

  async updateStatistics(userId: string, delta: Partial<Omit<CombatStatistics, "id" | "userId" | "updatedAt">>): Promise<CombatStatistics> {
    const existing = await this.getStatistics(userId);
    if (!existing) {
      const [row] = await db.insert(combatStatistics).values({ userId, ...delta }).returning();
      return toStats(row!);
    }
    const update: Record<string, unknown> = { updatedAt: new Date() };
    for (const [k, v] of Object.entries(delta)) {
      if (typeof v === "number") {
        const cur = (existing as unknown as Record<string, unknown>)[k];
        update[k] = typeof cur === "number" ? cur + v : v;
      } else {
        update[k] = v;
      }
    }
    const [row] = await db.update(combatStatistics).set(update).where(eq(combatStatistics.id, existing.id)).returning();
    return toStats(row!);
  }

  // ── Bosses ──────────────────────────────────────────────────────────────────

  async listBosses(active = true): Promise<Boss[]> {
    const rows = active
      ? await db.select().from(combatBosses).where(eq(combatBosses.isActive, true)).orderBy(asc(combatBosses.level))
      : await db.select().from(combatBosses).orderBy(asc(combatBosses.level));
    return rows.map(toBoss);
  }

  async getBoss(id: string): Promise<Boss | null> {
    const [row] = await db.select().from(combatBosses).where(eq(combatBosses.id, id));
    return row ? toBoss(row) : null;
  }

  async seedBosses(): Promise<void> {
    const count = await db.select({ n: sql<number>`count(*)` }).from(combatBosses);
    if (Number(count[0]?.n ?? 0) > 0) return;
    await db.insert(combatBosses).values([
      { name: "Rồng Bóng Tối", description: "Boss thế giới cấp 50 — Ác long cổ đại", icon: "🐉", level: 50, hp: 50000, attack: 300, defense: 150, speed: 8, xpReward: 5000, goldReward: 2000, isWorldBoss: true },
      { name: "Ác Quỷ Vực Thẳm", description: "Boss ngục tối cấp 30", icon: "👹", level: 30, hp: 20000, attack: 180, defense: 90, speed: 12, xpReward: 2000, goldReward: 800 },
      { name: "Phù Thủy Hắc Ám", description: "Boss ngục tối cấp 15", icon: "🧙‍♂️", level: 15, hp: 8000, attack: 100, defense: 50, speed: 15, xpReward: 800, goldReward: 300 },
      { name: "Golem Đá", description: "Boss khởi đầu cấp 5", icon: "🗿", level: 5, hp: 2000, attack: 40, defense: 30, speed: 5, xpReward: 200, goldReward: 80 },
    ]);
  }

  async seedArena(): Promise<void> {
    // Arena setup — pvp_rank is user-driven, no seed needed
  }

  async seedSkills(): Promise<CombatSkill[]> {
    const count = await db.select({ n: sql<number>`count(*)` }).from(combatSkills);
    if (Number(count[0]?.n ?? 0) > 0) return this.getSkills();
    await db.insert(combatSkills).values([
      { name: "Chém Mạnh", description: "Đòn chém gây 150% sát thương vật lý", icon: "⚔️", target: "ENEMY", mpCost: 10, cooldown: 1, baseDamage: 20, effectType: null, comboMultiplier: 1.5 },
      { name: "Cầu Khiên", description: "Tạo khiên giảm 30% sát thương", icon: "🛡️", target: "SELF", mpCost: 15, cooldown: 2, baseDamage: 0, baseHealing: 0, effectType: "SHIELD", effectValue: 0.3, effectTurns: 2 },
      { name: "Nổ Lửa", description: "Phun lửa gây thiệt hại và hiệu ứng BURN", icon: "🔥", target: "ENEMY", mpCost: 20, cooldown: 2, baseDamage: 35, effectType: "BURN", effectValue: 10, effectTurns: 3 },
      { name: "Độc Cổ", description: "Tiêm độc gây POISON qua 4 lượt", icon: "☠️", target: "ENEMY", mpCost: 15, cooldown: 2, baseDamage: 10, effectType: "POISON", effectValue: 15, effectTurns: 4 },
      { name: "Chữa Thương", description: "Hồi phục 80 HP", icon: "💚", target: "SELF", mpCost: 25, cooldown: 3, baseDamage: 0, baseHealing: 80, effectType: null },
      { name: "Tăng Tốc", description: "Tăng tốc độ 30% trong 2 lượt", icon: "⚡", target: "SELF", mpCost: 12, cooldown: 2, baseDamage: 0, effectType: "HASTE", effectValue: 0.3, effectTurns: 2 },
      { name: "Giải Băng", description: "Đòn đá băng — có thể FREEZE mục tiêu", icon: "❄️", target: "ENEMY", mpCost: 18, cooldown: 2, baseDamage: 25, effectType: "FREEZE", effectValue: 1, effectTurns: 1 },
      { name: "Sét Đánh", description: "Sét đánh gây sát thương ma thuật cao", icon: "⚡", target: "ENEMY", mpCost: 30, cooldown: 3, baseDamage: 60, effectType: "STUN", effectValue: 1, effectTurns: 1 },
    ]);
    return this.getSkills();
  }

  async getSkills(): Promise<CombatSkill[]> {
    const rows = await db.select().from(combatSkills).orderBy(asc(combatSkills.mpCost));
    return rows.map((r: (typeof rows)[number]) => ({
      id: r.id, name: r.name, description: r.description, icon: r.icon,
      target: r.target as CombatSkill["target"], mpCost: r.mpCost, cooldown: r.cooldown,
      baseDamage: r.baseDamage, baseHealing: r.baseHealing,
      effectType: r.effectType, effectValue: r.effectValue !== null ? Number(r.effectValue) : null,
      effectTurns: r.effectTurns, comboMultiplier: Number(r.comboMultiplier),
    }));
  }
}
