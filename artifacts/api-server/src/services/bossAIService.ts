// ─────────────────────────────────────────────────────────────────────────────
// BossAIService — HUB-22
// Threat/Aggro, Phase Engine, Skill Rotation, Loot Engine, Spawn Scheduler
// ─────────────────────────────────────────────────────────────────────────────

import type { IBossRepository, WorldBoss, BossLootItem, BossType } from "../repositories/bossRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { bossEventBus } from "./bossEventBus.js";

export class BossAIError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
    this.name = "BossAIError";
  }
}

export class BossAIService {
  // In-memory threat tables: bossId → { userId → threat }
  private threatTables = new Map<string, Map<string, number>>();
  // Spawn scheduler intervals
  private schedulers = new Map<string, NodeJS.Timeout>();

  constructor(
    private repo: IBossRepository,
    private notifService: NotificationsService,
    private activitiesService: ActivitiesService,
    private reputationRepo: IUserReputationRepository,
  ) {}

  // ─── Listing ────────────────────────────────────────────────────────────────

  async listBosses(type?: string): Promise<WorldBoss[]> {
    return this.repo.listBosses(type as BossType | undefined);
  }

  async getActiveBosses(): Promise<WorldBoss[]> {
    return this.repo.getActiveBosses();
  }

  async getBoss(id: string): Promise<WorldBoss> {
    const boss = await this.repo.getBoss(id);
    if (!boss) throw new BossAIError("NOT_FOUND", "Boss không tồn tại", 404);
    return boss;
  }

  // ─── Spawn / Despawn ─────────────────────────────────────────────────────────

  async spawnBoss(bossId: string, spawnedByUserId?: string): Promise<WorldBoss> {
    const boss = await this.repo.spawnBoss(bossId);
    this.threatTables.set(bossId, new Map());
    bossEventBus.publish({ type: "BOSS_SPAWNED", bossId, userId: spawnedByUserId, payload: { bossId, bossName: boss.name, region: boss.region, type: boss.type } });
    // Notify all — broadcast-style notification (no specific userId = global)
    await this.activitiesService.createActivity({
      userId: spawnedByUserId ?? "system",
      type: "system",
      title: `Boss "${boss.name}" đã xuất hiện!`,
      description: `Boss "${boss.name}" đã xuất hiện tại ${boss.region ?? "Vũ trụ"}!`,
      metadata: { bossId, bossName: boss.name },
    });
    return boss;
  }

  async despawnBoss(bossId: string): Promise<WorldBoss> {
    return this.repo.despawnBoss(bossId);
  }

  // ─── Combat ──────────────────────────────────────────────────────────────────

  async joinBattle(bossId: string, userId: string): Promise<WorldBoss> {
    const boss = await this.getBoss(bossId);
    if (boss.state === "DEAD") throw new BossAIError("DEAD", "Boss đã chết");
    await this.repo.joinBoss(bossId, userId);
    // Init threat
    const table = this.threatTables.get(bossId) ?? new Map<string, number>();
    if (!table.has(userId)) table.set(userId, 0);
    this.threatTables.set(bossId, table);
    bossEventBus.publish({ type: "BOSS_JOINED", bossId, userId, payload: { bossId, userId } });
    await this.activitiesService.createActivity({ userId, type: "system", title: `Tham gia boss battle`, description: `Tham gia chiến đấu với boss "${boss.name}"`, metadata: { bossId } });
    return boss;
  }

  async attackBoss(bossId: string, userId: string, damage: number, healing = 0, skillName?: string): Promise<{
    boss: WorldBoss; logId: string; phaseChanged: boolean; enraged: boolean; defeated: boolean;
  }> {
    let boss = await this.getBoss(bossId);
    if (boss.state === "DEAD") throw new BossAIError("DEAD", "Boss đã chết", 400);
    if (boss.state !== "ACTIVE" && boss.state !== "ENRAGED") throw new BossAIError("NOT_ACTIVE", "Boss không đang chiến đấu", 400);

    // Add threat
    this._addThreat(bossId, userId, damage + healing * 0.5);

    const isCrit = Math.random() < 0.1;
    const finalDamage = Math.floor(damage * (isCrit ? 1.5 : 1.0));
    const result = await this.repo.recordDamage(bossId, userId, finalDamage, healing, skillName, isCrit);
    boss = result.boss;

    bossEventBus.publish({ type: "BOSS_HP_UPDATED", bossId, userId, payload: { hp: boss.hp, maxHp: boss.maxHp, damage: finalDamage, isCrit } });
    bossEventBus.publish({ type: "BOSS_DAMAGE", bossId, userId, payload: { damage: finalDamage, healing, isCrit, skillName } });

    // Update ranking
    await this.repo.upsertRanking(bossId, userId, finalDamage, healing);
    await this.repo.upsertStatistics(userId, bossId, { totalDamage: finalDamage, totalHealing: healing, participations: 1, bestDamage: finalDamage });

    let phaseChanged = false;
    let enraged = false;
    let defeated = false;

    // Check defeat
    if (boss.hp <= 0) {
      boss = await this._onBossDefeated(bossId, userId);
      defeated = true;
      return { boss, logId: result.logId, phaseChanged, enraged, defeated };
    }

    // Check enrage
    const hpPercent = boss.hp / boss.maxHp;
    if (!boss.isEnraged && hpPercent <= boss.enrageThreshold) {
      boss = await this.repo.enrageBoss(bossId);
      enraged = true;
      bossEventBus.publish({ type: "BOSS_ENRAGED", bossId, userId, payload: { bossName: boss.name, hp: boss.hp } });
      const participants = await this.repo.getParticipants(bossId);
      for (const p of participants) {
        await this.notifService.fire(p.userId, "BOSS_ENRAGED" as never, "⚠️ Boss điên cuồng!", `${boss.name} đã vào trạng thái điên cuồng! Sát thương tăng mạnh!`);
      }
    }

    // Check phase change
    const expectedPhase = hpPercent > 0.66 ? 1 : hpPercent > 0.33 ? 2 : Math.min(boss.totalPhases, 3);
    if (expectedPhase > boss.currentPhase && expectedPhase <= boss.totalPhases) {
      boss = await this.repo.changeBossPhase(bossId, expectedPhase);
      phaseChanged = true;
      bossEventBus.publish({ type: "BOSS_PHASE_CHANGED", bossId, userId, payload: { phase: expectedPhase, bossName: boss.name } });
      const participants = await this.repo.getParticipants(bossId);
      for (const p of participants) {
        await this.notifService.fire(p.userId, "BOSS_PHASE_CHANGED" as never, `Boss chuyển giai đoạn ${expectedPhase}!`, `${boss.name} đã bước vào giai đoạn ${expectedPhase}. Cẩn thận hơn!`);
      }
    }

    return { boss, logId: result.logId, phaseChanged, enraged, defeated };
  }

  async castSkill(bossId: string, skillId: string, casterId: string): Promise<{ skillName: string; damage: number; isCrit: boolean }> {
    const boss = await this.getBoss(bossId);
    if (boss.state === "DEAD") throw new BossAIError("DEAD", "Boss đã chết");
    const result = await this.repo.castBossSkill(bossId, skillId, casterId);
    bossEventBus.publish({ type: "BOSS_SKILL_CAST", bossId, userId: casterId, payload: { skillName: result.skill.name, damage: result.damage, isCrit: result.isCrit } });
    await this.notifService.fire(casterId, "BOSS_SKILL_CAST" as never, `Boss dùng "${result.skill.name}"!`, `Hãy né tránh! Boss tấn công với ${result.damage} sát thương.`);
    return { skillName: result.skill.name, damage: result.damage, isCrit: result.isCrit };
  }

  // ─── AI Rotation — boss auto-attacks highest threat ──────────────────────────

  async triggerAIAttack(bossId: string): Promise<{ target: string; skillName: string; damage: number } | null> {
    const boss = await this.repo.getBoss(bossId);
    if (!boss || boss.state !== "ACTIVE" && boss.state !== "ENRAGED") return null;
    const table = this.threatTables.get(bossId);
    if (!table || table.size === 0) return null;
    // Pick highest threat target
    let target = "";
    let maxThreat = 0;
    for (const [uid, threat] of table) {
      if (threat > maxThreat) { maxThreat = threat; target = uid; }
    }
    if (!target) return null;
    // Pick a random skill
    const skills = await this.repo.getSkills(bossId, boss.currentPhase);
    if (skills.length === 0) return null;
    const skill = skills[Math.floor(Math.random() * skills.length)]!;
    const isCrit = Math.random() < 0.1;
    const damage = Math.floor(boss.attack * (skill.isEnrageSkill ? 2 : 1) * (isCrit ? 1.5 : 1.0));
    bossEventBus.publish({ type: "BOSS_SKILL_CAST", bossId, userId: target, payload: { skillName: skill.name, damage, isCrit, target } });
    return { target, skillName: skill.name, damage };
  }

  // ─── Threat ──────────────────────────────────────────────────────────────────

  private _addThreat(bossId: string, userId: string, amount: number): void {
    const table = this.threatTables.get(bossId) ?? new Map<string, number>();
    table.set(userId, (table.get(userId) ?? 0) + amount);
    this.threatTables.set(bossId, table);
  }

  getThreatTable(bossId: string): Record<string, number> {
    const table = this.threatTables.get(bossId) ?? new Map();
    return Object.fromEntries(table);
  }

  // ─── Defeat ──────────────────────────────────────────────────────────────────

  private async _onBossDefeated(bossId: string, killerUserId: string): Promise<WorldBoss> {
    const boss = await this.repo.defeatBoss(bossId);
    bossEventBus.publish({ type: "BOSS_DEFEATED", bossId, userId: killerUserId, payload: { bossName: boss.name, nextSpawnAt: boss.nextSpawnAt } });
    const participants = await this.repo.getParticipants(bossId);
    // Distribute loot
    const lootItems: BossLootItem[] = [
      { name: `${boss.name} — Tinh Hoa`, type: "MATERIAL", rarity: "LEGENDARY", quantity: 1 },
      { name: "Mảnh Vỡ Boss", type: "MATERIAL", rarity: "RARE", quantity: Math.floor(Math.random() * 3) + 1 },
    ];
    for (const p of participants) {
      await this.repo.recordLoot(bossId, p.userId, boss.rewardCredits, boss.rewardXp, lootItems);
      await this.repo.upsertStatistics(p.userId, bossId, { kills: 1 });
      await this.notifService.fire(p.userId, "BOSS_DEFEATED" as never, `🏆 ${boss.name} đã bị đánh bại!`, `Chúc mừng! Bạn nhận được ${boss.rewardCredits} credits và ${boss.rewardXp} XP.`);
      await this.activitiesService.createActivity({ userId: p.userId, type: "system", title: `Đánh bại boss`, description: `Đánh bại boss "${boss.name}"`, metadata: { bossId, credits: boss.rewardCredits, xp: boss.rewardXp } });
      await this.reputationRepo.upsert(p.userId, 20);
    }
    this.threatTables.delete(bossId);
    return boss;
  }

  // ─── Loot / Stats ────────────────────────────────────────────────────────────

  async leaderboard(bossId: string, limit?: number) {
    return this.repo.leaderboard(bossId, limit);
  }

  async getHistory(userId: string) {
    return this.repo.getHistory(userId);
  }

  async getStatistics(userId: string) {
    return this.repo.getStatistics(userId);
  }

  async getSkills(bossId: string) {
    return this.repo.getSkills(bossId);
  }

  async getParticipants(bossId: string) {
    return this.repo.getParticipants(bossId);
  }
}
