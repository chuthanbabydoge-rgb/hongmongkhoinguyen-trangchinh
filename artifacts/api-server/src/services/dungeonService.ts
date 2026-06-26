// ─────────────────────────────────────────────────────────────────────────────
// DungeonService — HUB-21
// ─────────────────────────────────────────────────────────────────────────────

import type { IDungeonRepository, Dungeon, DungeonInstance, DungeonMember, DungeonBoss, DungeonReward, DungeonStatistics, LootItem, CreateDungeonInstanceInput } from "../repositories/dungeonRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/reputationRepository.js";
import { dungeonEventBus } from "./dungeonEventBus.js";

export class DungeonError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
    this.name = "DungeonError";
  }
}

export class DungeonService {
  constructor(
    private repo: IDungeonRepository,
    private notifService: NotificationsService,
    private activitiesService: ActivitiesService,
    private reputationRepo: IUserReputationRepository,
  ) {}

  async listDungeons(): Promise<Dungeon[]> {
    return this.repo.listDungeons();
  }

  async getDungeon(id: string): Promise<Dungeon> {
    const dungeon = await this.repo.getDungeon(id);
    if (!dungeon) throw new DungeonError("NOT_FOUND", "Dungeon không tồn tại", 404);
    return dungeon;
  }

  async createInstance(userId: string, input: CreateDungeonInstanceInput): Promise<DungeonInstance> {
    const dungeon = await this.getDungeon(input.dungeonId);
    const inst = await this.repo.createInstance({ ...input, leaderId: userId });
    dungeonEventBus.publish({ type: "DUNGEON_CREATED", userId, entityId: inst.id, payload: { dungeonId: dungeon.id, difficulty: inst.difficulty } });
    await this.activitiesService.recordActivity(userId, "DUNGEON_CREATED" as never, `Tạo dungeon "${dungeon.name}"`, { instanceId: inst.id });
    return inst;
  }

  async getInstance(id: string): Promise<DungeonInstance> {
    const inst = await this.repo.getInstance(id);
    if (!inst) throw new DungeonError("NOT_FOUND", "Dungeon instance không tồn tại", 404);
    return inst;
  }

  async listInstances(status?: "WAITING" | "ACTIVE" | "COMPLETED" | "FAILED" | "EXPIRED"): Promise<DungeonInstance[]> {
    return this.repo.listInstances(status);
  }

  async joinDungeon(instanceId: string, userId: string): Promise<DungeonMember> {
    const inst = await this.getInstance(instanceId);
    if (inst.status !== "WAITING") throw new DungeonError("INVALID_STATUS", "Dungeon đã bắt đầu hoặc kết thúc");
    const members = await this.repo.listMembers(instanceId);
    const dungeon = inst.dungeon ?? await this.getDungeon(inst.dungeonId);
    if (members.length >= dungeon.maxPlayers) throw new DungeonError("FULL", "Dungeon đã đầy người chơi");
    const existing = members.find(m => m.userId === userId);
    if (existing) return existing;
    return this.repo.joinDungeon(instanceId, userId);
  }

  async leaveDungeon(instanceId: string, userId: string): Promise<void> {
    await this.repo.leaveDungeon(instanceId, userId);
  }

  async startDungeon(instanceId: string, userId: string): Promise<DungeonInstance> {
    const inst = await this.getInstance(instanceId);
    if (inst.leaderId !== userId) throw new DungeonError("FORBIDDEN", "Chỉ leader mới có thể bắt đầu dungeon", 403);
    if (inst.status !== "WAITING") throw new DungeonError("INVALID_STATUS", "Dungeon không ở trạng thái chờ");
    const updated = await this.repo.updateInstanceStatus(instanceId, "ACTIVE", { startedAt: new Date() });
    dungeonEventBus.publish({ type: "DUNGEON_STARTED", userId, entityId: instanceId, payload: { dungeonId: inst.dungeonId } });
    const members = await this.repo.listMembers(instanceId);
    for (const m of members) {
      await this.notifService.fire(m.userId, "DUNGEON_STARTED" as never, "Dungeon đã bắt đầu!", `Dungeon "${inst.dungeon?.name ?? ""}" đã khởi động. Chúc may mắn!`);
    }
    return updated;
  }

  async spawnMonster(instanceId: string, userId: string): Promise<{ monster: ReturnType<IDungeonRepository["spawnMonster"]> extends Promise<infer T> ? T : never }> {
    const inst = await this.getInstance(instanceId);
    if (inst.status !== "ACTIVE") throw new DungeonError("INVALID_STATUS", "Dungeon không đang hoạt động");
    const dungeon = inst.dungeon ?? await this.getDungeon(inst.dungeonId);
    const monster = await this.repo.spawnMonster("room-1", dungeon.id);
    dungeonEventBus.publish({ type: "MONSTER_KILLED", userId, entityId: instanceId, payload: { monsterName: monster.name } });
    return { monster };
  }

  async spawnBoss(instanceId: string, userId: string): Promise<DungeonBoss> {
    const inst = await this.getInstance(instanceId);
    if (inst.status !== "ACTIVE") throw new DungeonError("INVALID_STATUS", "Dungeon không đang hoạt động");
    const dungeon = inst.dungeon ?? await this.getDungeon(inst.dungeonId);
    const boss = await this.repo.spawnBoss(dungeon.id);
    if (!boss) throw new DungeonError("NOT_FOUND", "Không tìm thấy boss cho dungeon này", 404);
    dungeonEventBus.publish({ type: "BOSS_SPAWNED", userId, entityId: instanceId, payload: { bossName: boss.name } });
    const members = await this.repo.listMembers(instanceId);
    for (const m of members) {
      await this.notifService.fire(m.userId, "BOSS_SPAWNED" as never, "Boss xuất hiện!", `${boss.name} đã xuất hiện! Hãy chiến đấu!`);
    }
    return boss;
  }

  async killBoss(instanceId: string, userId: string): Promise<void> {
    const inst = await this.getInstance(instanceId);
    if (inst.status !== "ACTIVE") throw new DungeonError("INVALID_STATUS", "Dungeon không đang hoạt động");
    await this.repo.recordKill(instanceId, userId, "BOSS");
    dungeonEventBus.publish({ type: "BOSS_KILLED", userId, entityId: instanceId });
  }

  async finishDungeon(instanceId: string, userId: string, success: boolean): Promise<{ instance: DungeonInstance; rewards: DungeonReward[] }> {
    const inst = await this.getInstance(instanceId);
    if (inst.leaderId !== userId) throw new DungeonError("FORBIDDEN", "Chỉ leader mới có thể kết thúc dungeon", 403);
    if (inst.status !== "ACTIVE") throw new DungeonError("INVALID_STATUS", "Dungeon không đang hoạt động");
    const status = success ? "COMPLETED" : "FAILED";
    const updated = await this.repo.updateInstanceStatus(instanceId, status, { completedAt: new Date() });
    const dungeon = inst.dungeon ?? await this.getDungeon(inst.dungeonId);
    const members = await this.repo.listMembers(instanceId);
    const rewards: DungeonReward[] = [];
    if (success) {
      const lootItems: LootItem[] = [
        { name: "Mảnh Vỡ Dungeon", type: "MATERIAL", rarity: "COMMON", quantity: Math.floor(Math.random() * 3) + 1 },
        { name: "Tinh Thể Năng Lượng", type: "MATERIAL", rarity: "UNCOMMON", quantity: 1 },
      ];
      for (const m of members) {
        const reward = await this.repo.recordReward(instanceId, m.userId, dungeon.rewardCredits, dungeon.rewardXp, lootItems);
        rewards.push(reward);
        await this.notifService.fire(m.userId, "DUNGEON_COMPLETED" as never, "Dungeon hoàn thành!", `Bạn nhận được ${dungeon.rewardCredits} credits và ${dungeon.rewardXp} XP!`);
        await this.activitiesService.recordActivity(m.userId, "DUNGEON_COMPLETED" as never, `Hoàn thành dungeon "${dungeon.name}"`, { credits: dungeon.rewardCredits, xp: dungeon.rewardXp });
        await this.reputationRepo.upsert(m.userId, 10);
        await this.repo.upsertStatistics(m.userId, dungeon.id, { completions: 1, totalXpEarned: dungeon.rewardXp });
      }
    } else {
      for (const m of members) {
        await this.notifService.fire(m.userId, "DUNGEON_FAILED" as never, "Dungeon thất bại!", `Dungeon "${dungeon.name}" đã thất bại. Hãy thử lại!`);
        await this.repo.upsertStatistics(m.userId, dungeon.id, { failures: 1 });
      }
    }
    dungeonEventBus.publish({ type: success ? "DUNGEON_COMPLETED" : "DUNGEON_FAILED", userId, entityId: instanceId, payload: { success } });
    return { instance: updated, rewards };
  }

  async reviveMember(instanceId: string, userId: string, targetUserId: string): Promise<void> {
    const inst = await this.getInstance(instanceId);
    if (inst.status !== "ACTIVE") throw new DungeonError("INVALID_STATUS", "Dungeon không đang hoạt động");
    await this.repo.reviveMember(instanceId, targetUserId);
    dungeonEventBus.publish({ type: "PLAYER_REVIVED", userId, entityId: instanceId, payload: { targetUserId } });
    await this.notifService.fire(targetUserId, "PLAYER_REVIVED" as never, "Được hồi sinh!", "Đồng đội đã hồi sinh bạn. Tiếp tục chiến đấu!");
  }

  async getHistory(userId: string): Promise<DungeonInstance[]> {
    return this.repo.getHistory(userId);
  }

  async getStatistics(userId: string): Promise<DungeonStatistics[]> {
    return this.repo.getStatistics(userId);
  }
}
