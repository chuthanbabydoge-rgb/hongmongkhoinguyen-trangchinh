// ─────────────────────────────────────────────────────────────────────────────
// DrizzleBossRepository — HUB-22
// ─────────────────────────────────────────────────────────────────────────────

import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  worldBosses, bossSpawnPoints, bossSkills, bossPhases,
  bossDamageLogs, bossParticipants, bossLootTables,
  bossRankings, bossStatistics, bossAiStates, bossSkillRotation,
} from "@workspace/db/schema";
import type {
  IBossRepository, WorldBoss, BossSkill, BossPhase, BossParticipant,
  BossDamageLog, BossRanking, BossStatistics, BossLootItem,
  BossType, BossState, SkillCastResult,
} from "../bossRepository.js";

function toBoss(row: typeof worldBosses.$inferSelect): WorldBoss {
  return {
    id: row.id, name: row.name, description: row.description,
    type: row.type as BossType, state: row.state as BossState,
    level: row.level, hp: row.hp, maxHp: row.maxHp,
    attack: row.attack, defense: row.defense, speed: row.speed,
    currentPhase: row.currentPhase, totalPhases: row.totalPhases,
    enrageThreshold: row.enrageThreshold, isEnraged: row.isEnraged,
    minPlayers: row.minPlayers, maxPlayers: row.maxPlayers,
    rewardCredits: row.rewardCredits, rewardXp: row.rewardXp,
    respawnSeconds: row.respawnSeconds, icon: row.icon,
    region: row.region, lore: row.lore,
    metadata: row.metadata as Record<string, unknown> | null,
    lastSpawnAt: row.lastSpawnAt ? row.lastSpawnAt.toISOString() : null,
    nextSpawnAt: row.nextSpawnAt ? row.nextSpawnAt.toISOString() : null,
    defeatedAt: row.defeatedAt ? row.defeatedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toSkill(row: typeof bossSkills.$inferSelect): BossSkill {
  return {
    id: row.id, bossId: row.bossId, name: row.name, description: row.description,
    type: row.type, damage: row.damage, healing: row.healing,
    cooldownSec: row.cooldownSec, aoeRadius: row.aoeRadius,
    phase: row.phase, isEnrageSkill: row.isEnrageSkill, icon: row.icon,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(),
  };
}

function toPhase(row: typeof bossPhases.$inferSelect): BossPhase {
  return {
    id: row.id, bossId: row.bossId, phase: row.phase, name: row.name,
    description: row.description, hpThreshold: row.hpThreshold,
    damageMulti: row.damageMulti, speedMulti: row.speedMulti,
    isEnragePhase: row.isEnragePhase,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(),
  };
}

function toParticipant(row: typeof bossParticipants.$inferSelect): BossParticipant {
  return {
    id: row.id, bossId: row.bossId, userId: row.userId,
    totalDamage: row.totalDamage, totalHealing: row.totalHealing,
    joinedAt: row.joinedAt.toISOString(),
    leftAt: row.leftAt ? row.leftAt.toISOString() : null,
    isAlive: row.isAlive, hp: row.hp, maxHp: row.maxHp,
  };
}

function toDamageLog(row: typeof bossDamageLogs.$inferSelect): BossDamageLog {
  return {
    id: row.id, bossId: row.bossId, userId: row.userId,
    skillName: row.skillName, damage: row.damage, healing: row.healing,
    isCrit: row.isCrit, bossHpAfter: row.bossHpAfter, phase: row.phase,
    loggedAt: row.loggedAt.toISOString(),
  };
}

function toRanking(row: typeof bossRankings.$inferSelect): BossRanking {
  return {
    id: row.id, bossId: row.bossId, userId: row.userId,
    totalDamage: row.totalDamage, totalHealing: row.totalHealing,
    kills: row.kills, rank: row.rank, updatedAt: row.updatedAt.toISOString(),
  };
}

function toStatistics(row: typeof bossStatistics.$inferSelect): BossStatistics {
  return {
    id: row.id, userId: row.userId, bossId: row.bossId,
    kills: row.kills, totalDamage: row.totalDamage, totalHealing: row.totalHealing,
    bestDamage: row.bestDamage, participations: row.participations,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const SEED_WORLD_BOSSES = [
  { name: "Vĩ Thú Sa Mạc",       description: "Sinh vật khổng lồ ngủ vùi trong lòng sa mạc hàng thế kỷ", type: "WORLD" as BossType, level: 10,  hp: 50000,   maxHp: 50000,   attack: 200,  defense: 80,  speed: 80,  totalPhases: 2, rewardCredits: 500,   rewardXp: 2500,  minPlayers: 5,  maxPlayers: 30, icon: "🦎", region: "Sa Mạc Thiên Hà", enrageThreshold: 0.3, respawnSeconds: 1800 },
  { name: "Băng Long Cổ Đại",     description: "Rồng băng từ kỷ băng hà, giữ lạnh cả vùng cực Bắc",       type: "WORLD" as BossType, level: 25,  hp: 150000,  maxHp: 150000,  attack: 400,  defense: 150, speed: 90,  totalPhases: 3, rewardCredits: 1000,  rewardXp: 5000,  minPlayers: 10, maxPlayers: 40, icon: "🐉", region: "Vùng Cực Bắc",   enrageThreshold: 0.25, respawnSeconds: 3600 },
  { name: "Thần Ma Sấm Sét",      description: "Vị thần chiến tranh bị phong ấn, giờ thoát khỏi xiềng xích", type: "WORLD" as BossType, level: 50,  hp: 400000,  maxHp: 400000,  attack: 800,  defense: 300, speed: 120, totalPhases: 3, rewardCredits: 2500,  rewardXp: 12000, minPlayers: 15, maxPlayers: 50, icon: "⚡", region: "Đồng Bằng Sét",  enrageThreshold: 0.25, respawnSeconds: 7200 },
  { name: "Hắc Long Vũ Trụ",      description: "Chúa tể bóng tối, kẻ nuốt ánh sáng và phun ra hắc ám",     type: "LEGENDARY" as BossType, level: 75,  hp: 1000000, maxHp: 1000000, attack: 1500, defense: 600, speed: 150, totalPhases: 4, rewardCredits: 8000,  rewardXp: 40000, minPlayers: 20, maxPlayers: 50, icon: "🌑", region: "Vùng Hắc Ám",   enrageThreshold: 0.2, respawnSeconds: 14400 },
  { name: "Kẻ Hủy Diệt Vũ Trụ",  description: "Thực thể tối thượng, hiện thân của sự tận diệt vũ trụ",    type: "LEGENDARY" as BossType, level: 100, hp: 5000000, maxHp: 5000000, attack: 5000, defense: 2000, speed: 200, totalPhases: 5, rewardCredits: 50000, rewardXp: 200000, minPlayers: 30, maxPlayers: 50, icon: "🌌", region: "Vùng Vô Tận",   enrageThreshold: 0.15, respawnSeconds: 86400 },
];

const SEED_SKILLS = [
  { name: "Cú Đấm Địa Chấn",    type: "DAMAGE",  damage: 2000,  healing: 0,    cooldownSec: 8,  phase: 1, isEnrageSkill: false, icon: "👊" },
  { name: "Làn Sóng Năng Lượng", type: "AOE",     damage: 1500,  healing: 0,    cooldownSec: 15, phase: 1, isEnrageSkill: false, icon: "💥" },
  { name: "Tự Phục Hồi",         type: "HEAL",    damage: 0,     healing: 5000, cooldownSec: 30, phase: 2, isEnrageSkill: false, icon: "💚" },
  { name: "Thịnh Nộ Điên Cuồng", type: "ENRAGE",  damage: 5000,  healing: 0,    cooldownSec: 20, phase: 3, isEnrageSkill: true,  icon: "😡" },
];

export class DrizzleBossRepository implements IBossRepository {

  async listBosses(type?: BossType): Promise<WorldBoss[]> {
    const rows = type
      ? await db.select().from(worldBosses).where(eq(worldBosses.type, type as never)).orderBy(worldBosses.level)
      : await db.select().from(worldBosses).orderBy(worldBosses.level);
    const counts = await this._getParticipantCounts(rows.map(r => r.id));
    return rows.map(r => { const b = toBoss(r); b.participantCount = counts.get(r.id) ?? 0; return b; });
  }

  async getActiveBosses(): Promise<WorldBoss[]> {
    const rows = await db.select().from(worldBosses).where(eq(worldBosses.state, "ACTIVE")).orderBy(worldBosses.level);
    return rows.map(toBoss);
  }

  async getBoss(id: string): Promise<WorldBoss | null> {
    const [row] = await db.select().from(worldBosses).where(eq(worldBosses.id, id));
    if (!row) return null;
    const boss = toBoss(row);
    const participants = await db.select().from(bossParticipants).where(eq(bossParticipants.bossId, id));
    boss.participantCount = participants.length;
    return boss;
  }

  private async _getParticipantCounts(bossIds: string[]): Promise<Map<string, number>> {
    if (bossIds.length === 0) return new Map();
    const rows = await db.select().from(bossParticipants).where(inArray(bossParticipants.bossId, bossIds));
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.bossId, (map.get(r.bossId) ?? 0) + 1);
    return map;
  }

  async spawnBoss(id: string): Promise<WorldBoss> {
    const nextSpawnAt = new Date();
    const [row] = await db.update(worldBosses)
      .set({ state: "ACTIVE", hp: undefined, lastSpawnAt: new Date(), nextSpawnAt, defeatedAt: null, updatedAt: new Date() })
      .where(eq(worldBosses.id, id))
      .returning();
    if (!row) throw new Error("Boss không tồn tại");
    // Reset HP
    await db.update(worldBosses).set({ hp: row.maxHp }).where(eq(worldBosses.id, id));
    return toBoss({ ...row, state: "ACTIVE", hp: row.maxHp });
  }

  async despawnBoss(id: string): Promise<WorldBoss> {
    const [row] = await db.update(worldBosses)
      .set({ state: "IDLE", updatedAt: new Date() })
      .where(eq(worldBosses.id, id))
      .returning();
    if (!row) throw new Error("Boss không tồn tại");
    return toBoss(row);
  }

  async updateBossAI(bossId: string, state: Partial<{ currentTarget: string; lastSkillUsed: string; aiMode: string; threatTable: Record<string, number> }>): Promise<void> {
    const [existing] = await db.select().from(bossAiStates).where(eq(bossAiStates.bossId, bossId));
    if (existing) {
      await db.update(bossAiStates).set({ ...(state as object), updatedAt: new Date() }).where(eq(bossAiStates.bossId, bossId));
    } else {
      await db.insert(bossAiStates).values({ bossId, ...(state as object) }).onConflictDoNothing();
    }
  }

  async castBossSkill(bossId: string, skillId: string, targetId: string): Promise<SkillCastResult> {
    const [skillRow] = await db.select().from(bossSkills).where(and(eq(bossSkills.id, skillId), eq(bossSkills.bossId, bossId)));
    if (!skillRow) throw new Error("Skill không tồn tại");
    const skill = toSkill(skillRow);
    const isCrit = Math.random() < 0.15;
    const damage = Math.floor(skill.damage * (isCrit ? 1.5 : 1.0));
    await db.insert(bossSkillRotation).values({ bossId, skillId, targetId, damage });
    await this.updateBossAI(bossId, { lastSkillUsed: skill.name });
    return { skill, damage, targets: [targetId], isCrit };
  }

  async changeBossPhase(bossId: string, phase: number): Promise<WorldBoss> {
    const [row] = await db.update(worldBosses)
      .set({ currentPhase: phase, updatedAt: new Date() })
      .where(eq(worldBosses.id, bossId))
      .returning();
    if (!row) throw new Error("Boss không tồn tại");
    return toBoss(row);
  }

  async joinBoss(bossId: string, userId: string): Promise<BossParticipant> {
    const [existing] = await db.select().from(bossParticipants)
      .where(and(eq(bossParticipants.bossId, bossId), eq(bossParticipants.userId, userId)));
    if (existing) return toParticipant(existing);
    const [row] = await db.insert(bossParticipants).values({ bossId, userId }).returning();
    if (!row) throw new Error("Không thể tham gia boss battle");
    return toParticipant(row);
  }

  async getParticipants(bossId: string): Promise<BossParticipant[]> {
    const rows = await db.select().from(bossParticipants).where(eq(bossParticipants.bossId, bossId));
    return rows.map(toParticipant);
  }

  async recordDamage(bossId: string, userId: string, damage: number, healing = 0, skillName?: string, isCrit = false): Promise<{ boss: WorldBoss; logId: string }> {
    const boss = await this.dealDamageToBoss(bossId, damage);
    const [logRow] = await db.insert(bossDamageLogs).values({
      bossId, userId, skillName: skillName ?? null, damage, healing, isCrit,
      bossHpAfter: boss.hp, phase: boss.currentPhase,
    }).returning();
    // Update participant stats
    const [p] = await db.select().from(bossParticipants).where(and(eq(bossParticipants.bossId, bossId), eq(bossParticipants.userId, userId)));
    if (p) {
      await db.update(bossParticipants).set({ totalDamage: p.totalDamage + damage, totalHealing: p.totalHealing + healing }).where(eq(bossParticipants.id, p.id));
    }
    return { boss, logId: logRow?.id ?? "" };
  }

  async dealDamageToBoss(bossId: string, damage: number): Promise<WorldBoss> {
    const [current] = await db.select().from(worldBosses).where(eq(worldBosses.id, bossId));
    if (!current) throw new Error("Boss không tồn tại");
    const newHp = Math.max(0, current.hp - damage);
    const [row] = await db.update(worldBosses).set({ hp: newHp, updatedAt: new Date() }).where(eq(worldBosses.id, bossId)).returning();
    if (!row) throw new Error("Boss không tồn tại");
    return toBoss(row);
  }

  async enrageBoss(bossId: string): Promise<WorldBoss> {
    const [row] = await db.update(worldBosses)
      .set({ state: "ENRAGED", isEnraged: true, updatedAt: new Date() })
      .where(eq(worldBosses.id, bossId))
      .returning();
    if (!row) throw new Error("Boss không tồn tại");
    return toBoss(row);
  }

  async defeatBoss(bossId: string): Promise<WorldBoss> {
    const [current] = await db.select().from(worldBosses).where(eq(worldBosses.id, bossId));
    if (!current) throw new Error("Boss không tồn tại");
    const nextSpawnAt = new Date(Date.now() + current.respawnSeconds * 1000);
    const [row] = await db.update(worldBosses)
      .set({ state: "DEAD", hp: 0, defeatedAt: new Date(), nextSpawnAt, isEnraged: false, updatedAt: new Date() })
      .where(eq(worldBosses.id, bossId))
      .returning();
    if (!row) throw new Error("Boss không tồn tại");
    return toBoss(row);
  }

  async recordLoot(bossId: string, userId: string, credits: number, xp: number, items: BossLootItem[]): Promise<void> {
    await this.upsertStatistics(userId, bossId, { kills: 1 });
  }

  async getSkills(bossId: string, phase?: number): Promise<BossSkill[]> {
    const rows = phase
      ? await db.select().from(bossSkills).where(and(eq(bossSkills.bossId, bossId), eq(bossSkills.phase, phase)))
      : await db.select().from(bossSkills).where(eq(bossSkills.bossId, bossId));
    return rows.map(toSkill);
  }

  async leaderboard(bossId: string, limit = 20): Promise<BossRanking[]> {
    const rows = await db.select().from(bossRankings)
      .where(eq(bossRankings.bossId, bossId))
      .orderBy(desc(bossRankings.totalDamage))
      .limit(limit);
    return rows.map(toRanking);
  }

  async upsertRanking(bossId: string, userId: string, damage: number, healing: number): Promise<void> {
    const [existing] = await db.select().from(bossRankings).where(and(eq(bossRankings.bossId, bossId), eq(bossRankings.userId, userId)));
    if (existing) {
      await db.update(bossRankings).set({
        totalDamage: existing.totalDamage + damage,
        totalHealing: existing.totalHealing + healing,
        updatedAt: new Date(),
      }).where(eq(bossRankings.id, existing.id));
    } else {
      await db.insert(bossRankings).values({ bossId, userId, totalDamage: damage, totalHealing: healing }).onConflictDoNothing();
    }
  }

  async upsertStatistics(userId: string, bossId: string, patch: Partial<Omit<BossStatistics, "id" | "userId" | "bossId" | "updatedAt">>): Promise<void> {
    const [existing] = await db.select().from(bossStatistics).where(and(eq(bossStatistics.userId, userId), eq(bossStatistics.bossId, bossId)));
    if (existing) {
      const update: Record<string, unknown> = { updatedAt: new Date() };
      if (patch.kills) update.kills = existing.kills + patch.kills;
      if (patch.totalDamage) update.totalDamage = existing.totalDamage + patch.totalDamage;
      if (patch.totalHealing) update.totalHealing = existing.totalHealing + patch.totalHealing;
      if (patch.bestDamage && patch.bestDamage > existing.bestDamage) update.bestDamage = patch.bestDamage;
      if (patch.participations) update.participations = existing.participations + patch.participations;
      await db.update(bossStatistics).set(update as never).where(eq(bossStatistics.id, existing.id));
    } else {
      await db.insert(bossStatistics).values({ userId, bossId, ...patch }).onConflictDoNothing();
    }
  }

  async getStatistics(userId: string): Promise<BossStatistics[]> {
    const rows = await db.select().from(bossStatistics).where(eq(bossStatistics.userId, userId));
    return rows.map(toStatistics);
  }

  async getHistory(userId: string, limit = 20): Promise<BossDamageLog[]> {
    const rows = await db.select().from(bossDamageLogs)
      .where(eq(bossDamageLogs.userId, userId))
      .orderBy(desc(bossDamageLogs.loggedAt))
      .limit(limit);
    return rows.map(toDamageLog);
  }

  async seedBosses(): Promise<void> {
    for (const b of SEED_WORLD_BOSSES) {
      await db.insert(worldBosses).values(b as never).onConflictDoNothing();
    }
  }

  async seedSkills(): Promise<void> {
    const bosses = await db.select().from(worldBosses).orderBy(worldBosses.level);
    for (const boss of bosses) {
      for (const s of SEED_SKILLS) {
        const existing = await db.select().from(bossSkills).where(and(eq(bossSkills.bossId, boss.id), eq(bossSkills.name, s.name)));
        if (existing.length === 0) {
          await db.insert(bossSkills).values({ bossId: boss.id, ...s, aoeRadius: 0, description: null, metadata: null }).onConflictDoNothing();
        }
      }
    }
  }

  async seedPhases(): Promise<void> {
    const bosses = await db.select().from(worldBosses).orderBy(worldBosses.level);
    const phaseTemplates = [
      { phase: 1, name: "Bình thường",     hpThreshold: 1.0,  damageMulti: 1.0, speedMulti: 1.0, isEnragePhase: false },
      { phase: 2, name: "Tức giận",        hpThreshold: 0.6,  damageMulti: 1.5, speedMulti: 1.2, isEnragePhase: false },
      { phase: 3, name: "Điên cuồng",      hpThreshold: 0.3,  damageMulti: 2.0, speedMulti: 1.5, isEnragePhase: false },
      { phase: 4, name: "Tuyệt vọng",      hpThreshold: 0.15, damageMulti: 3.0, speedMulti: 2.0, isEnragePhase: true  },
      { phase: 5, name: "Hủy diệt tối thượng", hpThreshold: 0.05, damageMulti: 5.0, speedMulti: 3.0, isEnragePhase: true  },
    ];
    for (const boss of bosses) {
      for (let p = 1; p <= boss.totalPhases; p++) {
        const template = phaseTemplates[p - 1];
        if (!template) continue;
        const existing = await db.select().from(bossPhases).where(and(eq(bossPhases.bossId, boss.id), eq(bossPhases.phase, p)));
        if (existing.length === 0) {
          await db.insert(bossPhases).values({ bossId: boss.id, ...template, description: null, metadata: null }).onConflictDoNothing();
        }
      }
    }
  }
}
