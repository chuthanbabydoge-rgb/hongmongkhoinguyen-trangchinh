// ─────────────────────────────────────────────────────────────────────────────
// RaidService — HUB-21
// ─────────────────────────────────────────────────────────────────────────────

import type { IRaidRepository, RaidBoss, RaidGroup, RaidMember, RaidInstance, RaidRanking, RaidHistoryEntry, CreateRaidInput, RaidRole, DungeonStatus } from "../repositories/dungeonRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/reputationRepository.js";
import { dungeonEventBus } from "./dungeonEventBus.js";

export class RaidError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
    this.name = "RaidError";
  }
}

export class RaidService {
  constructor(
    private repo: IRaidRepository,
    private notifService: NotificationsService,
    private activitiesService: ActivitiesService,
    private reputationRepo: IUserReputationRepository,
  ) {}

  async listBosses(difficulty?: string): Promise<RaidBoss[]> {
    return this.repo.listBosses(difficulty as RaidRole | undefined);
  }

  async getBoss(id: string): Promise<RaidBoss> {
    const boss = await this.repo.getBoss(id);
    if (!boss) throw new RaidError("NOT_FOUND", "Raid boss không tồn tại", 404);
    return boss;
  }

  async createGroup(userId: string, name: string, maxMembers?: number): Promise<RaidGroup> {
    return this.repo.createGroup(name, userId, maxMembers);
  }

  async getGroup(id: string): Promise<RaidGroup> {
    const group = await this.repo.getGroup(id);
    if (!group) throw new RaidError("NOT_FOUND", "Raid group không tồn tại", 404);
    return group;
  }

  async listGroups(): Promise<RaidGroup[]> {
    return this.repo.listGroups();
  }

  async joinGroup(groupId: string, userId: string, role?: RaidRole): Promise<RaidMember> {
    const group = await this.getGroup(groupId);
    const members = await this.repo.getGroupMembers(groupId);
    if (members.length >= group.maxMembers) throw new RaidError("FULL", "Raid group đã đầy");
    return this.repo.joinGroup(groupId, userId, role);
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    return this.repo.leaveGroup(groupId, userId);
  }

  async getGroupMembers(groupId: string): Promise<RaidMember[]> {
    return this.repo.getGroupMembers(groupId);
  }

  async createRaid(userId: string, input: Omit<CreateRaidInput, "leaderId">): Promise<RaidInstance> {
    const boss = await this.repo.getBoss(input.raidBossId);
    if (!boss) throw new RaidError("NOT_FOUND", "Raid boss không tồn tại", 404);
    const inst = await this.repo.createRaid({ ...input, leaderId: userId });
    dungeonEventBus.publish({ type: "RAID_CREATED", userId, entityId: inst.id, payload: { bossId: boss.id, bossName: boss.name } });
    await this.activitiesService.recordActivity(userId, "RAID_CREATED" as never, `Tạo raid "${boss.name}"`, { instanceId: inst.id });
    return inst;
  }

  async getRaid(id: string): Promise<RaidInstance> {
    const inst = await this.repo.getRaid(id);
    if (!inst) throw new RaidError("NOT_FOUND", "Raid không tồn tại", 404);
    return inst;
  }

  async listRaids(status?: string): Promise<RaidInstance[]> {
    return this.repo.listRaids(status as DungeonStatus | undefined);
  }

  async joinRaid(instanceId: string, userId: string, role?: RaidRole): Promise<void> {
    await this.repo.joinRaid(instanceId, userId, role);
  }

  async startRaid(instanceId: string, userId: string): Promise<RaidInstance> {
    const inst = await this.getRaid(instanceId);
    if (inst.leaderId !== userId) throw new RaidError("FORBIDDEN", "Chỉ leader mới có thể bắt đầu raid", 403);
    if (inst.status !== "WAITING") throw new RaidError("INVALID_STATUS", "Raid không ở trạng thái chờ");
    const started = await this.repo.startRaid(instanceId);
    dungeonEventBus.publish({ type: "RAID_STARTED", userId, entityId: instanceId, payload: { bossId: inst.raidBossId } });
    return started;
  }

  async recordDamage(instanceId: string, userId: string, damage: number, healing = 0, skill?: string): Promise<{ bossHpRemaining: number; phaseAdvanced: boolean }> {
    const inst = await this.getRaid(instanceId);
    if (inst.status !== "ACTIVE") throw new RaidError("INVALID_STATUS", "Raid không đang hoạt động");
    await this.repo.recordDamage(instanceId, userId, damage, healing, skill);
    const updated = await this.getRaid(instanceId);
    const boss = inst.boss ?? await this.getBoss(inst.raidBossId);
    let phaseAdvanced = false;
    const hpPercent = updated.bossHpRemaining / boss.maxHp;
    const expectedPhase = hpPercent > 0.66 ? 1 : hpPercent > 0.33 ? 2 : 3;
    if (expectedPhase > updated.currentPhase && updated.currentPhase < boss.phases) {
      await this.repo.advancePhase(instanceId);
      phaseAdvanced = true;
      dungeonEventBus.publish({ type: "RAID_BOSS_PHASE", userId, entityId: instanceId, payload: { phase: expectedPhase } });
    }
    dungeonEventBus.publish({ type: "RAID_DAMAGE", userId, entityId: instanceId, payload: { damage, healing, bossHpRemaining: updated.bossHpRemaining } });
    return { bossHpRemaining: updated.bossHpRemaining, phaseAdvanced };
  }

  async finishRaid(instanceId: string, userId: string, success: boolean): Promise<RaidInstance> {
    const inst = await this.getRaid(instanceId);
    if (inst.leaderId !== userId) throw new RaidError("FORBIDDEN", "Chỉ leader mới có thể kết thúc raid", 403);
    if (inst.status !== "ACTIVE") throw new RaidError("INVALID_STATUS", "Raid không đang hoạt động");
    const finished = await this.repo.finishRaid(instanceId, success);
    if (success) {
      const boss = inst.boss ?? await this.getBoss(inst.raidBossId);
      if (inst.groupId) {
        const members = await this.repo.getGroupMembers(inst.groupId);
        const members2 = members.map(m => ({ userId: m.userId, role: m.role, damage: 1000, healing: 0 }));
        await this.repo.distributeRewards(instanceId, members2);
        for (const m of members2) {
          await this.notifService.fire(m.userId, "RAID_COMPLETED" as never, "Raid thành công!", `Đã đánh bại ${boss.name}! Phần thưởng đã được gửi.`);
          await this.activitiesService.recordActivity(m.userId, "RAID_COMPLETED" as never, `Đánh bại raid boss "${boss.name}"`, { bossId: boss.id });
          await this.reputationRepo.upsert(m.userId, 25);
          await this.repo.upsertRanking(m.userId, boss.id, m.role, m.damage, m.healing);
        }
      }
      dungeonEventBus.publish({ type: "RAID_COMPLETED", userId, entityId: instanceId, payload: { bossId: inst.raidBossId, success: true } });
    } else {
      dungeonEventBus.publish({ type: "RAID_FAILED", userId, entityId: instanceId, payload: { success: false } });
    }
    return finished;
  }

  async leaderboard(bossId: string, limit?: number): Promise<RaidRanking[]> {
    return this.repo.leaderboard(bossId, limit);
  }

  async history(userId: string, limit?: number): Promise<RaidHistoryEntry[]> {
    return this.repo.history(userId, limit);
  }
}
