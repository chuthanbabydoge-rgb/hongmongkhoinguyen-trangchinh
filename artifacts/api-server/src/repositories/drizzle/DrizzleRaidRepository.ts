// ─────────────────────────────────────────────────────────────────────────────
// DrizzleRaidRepository — HUB-21
// ─────────────────────────────────────────────────────────────────────────────

import { eq, and, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  raidBosses, raidGroups, raidMembers, raidInstances,
  raidProgress, raidRewards, raidDamageLogs, raidRankings, raidHistory,
} from "@workspace/db/schema";
import type {
  IRaidRepository, RaidBoss, RaidGroup, RaidMember, RaidInstance,
  RaidRanking, RaidHistoryEntry, LootItem,
  CreateRaidInput, RaidDifficulty, RaidRole, DungeonStatus,
} from "../dungeonRepository.js";

function toRaidBoss(row: typeof raidBosses.$inferSelect): RaidBoss {
  return {
    id: row.id, name: row.name, description: row.description,
    difficulty: row.difficulty as RaidDifficulty,
    hp: row.hp, maxHp: row.maxHp, attack: row.attack, defense: row.defense,
    phases: row.phases,
    abilities: row.abilities as Record<string, unknown>[] | null,
    lootTable: row.lootTable as Record<string, unknown>[] | null,
    icon: row.icon, minPlayers: row.minPlayers, maxPlayers: row.maxPlayers,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(),
  };
}

function toRaidGroup(row: typeof raidGroups.$inferSelect): RaidGroup {
  return {
    id: row.id, name: row.name, leaderId: row.leaderId,
    maxMembers: row.maxMembers, status: row.status,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toRaidMember(row: typeof raidMembers.$inferSelect): RaidMember {
  return {
    id: row.id, raidGroupId: row.raidGroupId, userId: row.userId,
    role: row.role as RaidRole, isReady: row.isReady,
    joinedAt: row.joinedAt.toISOString(),
    leftAt: row.leftAt ? row.leftAt.toISOString() : null,
  };
}

function toRaidInstance(row: typeof raidInstances.$inferSelect): RaidInstance {
  return {
    id: row.id, raidBossId: row.raidBossId, groupId: row.groupId,
    leaderId: row.leaderId, status: row.status as DungeonStatus,
    difficulty: row.difficulty as RaidDifficulty,
    currentPhase: row.currentPhase, bossHpRemaining: row.bossHpRemaining,
    startedAt: row.startedAt ? row.startedAt.toISOString() : null,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toRaidRanking(row: typeof raidRankings.$inferSelect): RaidRanking {
  return {
    id: row.id, userId: row.userId, bossId: row.bossId,
    bestTime: row.bestTime, totalDamage: row.totalDamage, totalHealing: row.totalHealing,
    role: row.role as RaidRole, kills: row.kills,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toRaidHistory(row: typeof raidHistory.$inferSelect): RaidHistoryEntry {
  return {
    id: row.id, userId: row.userId, instanceId: row.instanceId, bossId: row.bossId,
    result: row.result, role: row.role as RaidRole,
    damage: row.damage, healing: row.healing, kills: row.kills, duration: row.duration,
    completedAt: row.completedAt.toISOString(),
  };
}

const SEED_RAID_BOSSES = [
  { name: "Lich Vương Thiên Niên",     description: "Vua bất tử cai trị vương quốc bóng tối ngàn năm", difficulty: "NORMAL"    as RaidDifficulty, hp: 100000,  attack: 300,  defense: 150, phases: 2, minPlayers: 10, maxPlayers: 20, icon: "💀" },
  { name: "Rồng Lửa Cổ Đại",          description: "Thần rồng lửa ngủ vùi hàng triệu năm đã thức dậy", difficulty: "HEROIC"    as RaidDifficulty, hp: 300000,  attack: 600,  defense: 280, phases: 3, minPlayers: 10, maxPlayers: 20, icon: "🐉" },
  { name: "Thần Chiến Tranh Hủy Diệt", description: "Hóa thân của chiến tranh và tận diệt của vũ trụ",   difficulty: "MYTHIC"    as RaidDifficulty, hp: 800000,  attack: 1200, defense: 500, phases: 4, minPlayers: 15, maxPlayers: 20, icon: "⚔️" },
  { name: "Kẻ Hủy Diệt Vũ Trụ",       description: "Thực thể nguyên thủy đến từ trước khi vũ trụ ra đời", difficulty: "NIGHTMARE" as RaidDifficulty, hp: 2000000, attack: 2500, defense: 1000, phases: 5, minPlayers: 20, maxPlayers: 20, icon: "🌌" },
];

export class DrizzleRaidRepository implements IRaidRepository {

  async listBosses(difficulty?: RaidDifficulty): Promise<RaidBoss[]> {
    const rows = difficulty
      ? await db.select().from(raidBosses).where(eq(raidBosses.difficulty, difficulty as never))
      : await db.select().from(raidBosses).orderBy(raidBosses.difficulty);
    return rows.map(toRaidBoss);
  }

  async getBoss(id: string): Promise<RaidBoss | null> {
    const [row] = await db.select().from(raidBosses).where(eq(raidBosses.id, id));
    return row ? toRaidBoss(row) : null;
  }

  async createGroup(name: string, leaderId: string, maxMembers = 20): Promise<RaidGroup> {
    const [row] = await db.insert(raidGroups).values({ name, leaderId, maxMembers }).returning();
    if (!row) throw new Error("Không thể tạo raid group");
    await db.insert(raidMembers).values({ raidGroupId: row.id, userId: leaderId, role: "DPS", isReady: false });
    return toRaidGroup(row);
  }

  async getGroup(id: string): Promise<RaidGroup | null> {
    const [row] = await db.select().from(raidGroups).where(eq(raidGroups.id, id));
    return row ? toRaidGroup(row) : null;
  }

  async listGroups(): Promise<RaidGroup[]> {
    const rows = await db.select().from(raidGroups).where(eq(raidGroups.status, "FORMING")).orderBy(desc(raidGroups.createdAt)).limit(20);
    return rows.map(toRaidGroup);
  }

  async joinGroup(groupId: string, userId: string, role: RaidRole = "DPS"): Promise<RaidMember> {
    const existing = await db.select().from(raidMembers)
      .where(and(eq(raidMembers.raidGroupId, groupId), eq(raidMembers.userId, userId)));
    if (existing[0]) return toRaidMember(existing[0]);
    const [row] = await db.insert(raidMembers).values({ raidGroupId: groupId, userId, role: role as never }).returning();
    if (!row) throw new Error("Không thể tham gia raid group");
    return toRaidMember(row);
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    await db.update(raidMembers)
      .set({ leftAt: new Date() })
      .where(and(eq(raidMembers.raidGroupId, groupId), eq(raidMembers.userId, userId)));
  }

  async getGroupMembers(groupId: string): Promise<RaidMember[]> {
    const rows = await db.select().from(raidMembers)
      .where(eq(raidMembers.raidGroupId, groupId));
    return rows.map(toRaidMember);
  }

  async createRaid(input: CreateRaidInput): Promise<RaidInstance> {
    const boss = await this.getBoss(input.raidBossId);
    if (!boss) throw new Error("Raid boss không tồn tại");
    const [row] = await db.insert(raidInstances).values({
      raidBossId: input.raidBossId, leaderId: input.leaderId,
      groupId: input.groupId ?? null,
      difficulty: (input.difficulty ?? boss.difficulty) as never,
      bossHpRemaining: boss.hp,
    }).returning();
    if (!row) throw new Error("Không thể tạo raid");
    const inst = toRaidInstance(row);
    inst.boss = boss;
    return inst;
  }

  async getRaid(id: string): Promise<RaidInstance | null> {
    const [row] = await db.select().from(raidInstances).where(eq(raidInstances.id, id));
    if (!row) return null;
    const inst = toRaidInstance(row);
    const boss = await this.getBoss(row.raidBossId);
    if (boss) inst.boss = boss;
    return inst;
  }

  async listRaids(status?: DungeonStatus): Promise<RaidInstance[]> {
    const rows = status
      ? await db.select().from(raidInstances).where(eq(raidInstances.status, status as never)).orderBy(desc(raidInstances.createdAt)).limit(50)
      : await db.select().from(raidInstances).orderBy(desc(raidInstances.createdAt)).limit(50);
    return rows.map(toRaidInstance);
  }

  async joinRaid(instanceId: string, userId: string, role: RaidRole = "DPS"): Promise<void> {
    const inst = await this.getRaid(instanceId);
    if (!inst) throw new Error("Raid không tồn tại");
    if (inst.status !== "WAITING") throw new Error("Raid đã bắt đầu hoặc kết thúc");
    if (!inst.groupId) return;
    const existing = await db.select().from(raidMembers)
      .where(and(eq(raidMembers.raidGroupId, inst.groupId), eq(raidMembers.userId, userId)));
    if (!existing[0]) {
      await db.insert(raidMembers).values({ raidGroupId: inst.groupId, userId, role: role as never });
    }
  }

  async startRaid(instanceId: string): Promise<RaidInstance> {
    const [row] = await db.update(raidInstances)
      .set({ status: "ACTIVE", startedAt: new Date(), updatedAt: new Date() })
      .where(eq(raidInstances.id, instanceId))
      .returning();
    if (!row) throw new Error("Không tìm thấy raid");
    await db.insert(raidProgress).values({ instanceId, phase: 1 });
    return toRaidInstance(row);
  }

  async finishRaid(instanceId: string, success: boolean): Promise<RaidInstance> {
    const [row] = await db.update(raidInstances)
      .set({ status: success ? "COMPLETED" : "FAILED", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(raidInstances.id, instanceId))
      .returning();
    if (!row) throw new Error("Không tìm thấy raid");
    return toRaidInstance(row);
  }

  async recordDamage(instanceId: string, userId: string, damage: number, healing = 0, skill?: string): Promise<void> {
    await db.insert(raidDamageLogs).values({ instanceId, userId, damage, healing, skill: skill ?? null, target: "BOSS" });
    const inst = await this.getRaid(instanceId);
    if (inst) {
      const newHp = Math.max(0, inst.bossHpRemaining - damage);
      await this.updateBossHp(instanceId, newHp);
    }
  }

  async updateBossHp(instanceId: string, hpRemaining: number): Promise<void> {
    await db.update(raidInstances).set({ bossHpRemaining: hpRemaining, updatedAt: new Date() }).where(eq(raidInstances.id, instanceId));
  }

  async advancePhase(instanceId: string): Promise<void> {
    const [inst] = await db.select().from(raidInstances).where(eq(raidInstances.id, instanceId));
    if (!inst) return;
    const newPhase = inst.currentPhase + 1;
    await db.update(raidInstances).set({ currentPhase: newPhase, updatedAt: new Date() }).where(eq(raidInstances.id, instanceId));
    await db.update(raidProgress).set({ completedAt: new Date() })
      .where(and(eq(raidProgress.instanceId, instanceId), eq(raidProgress.phase, inst.currentPhase)));
    await db.insert(raidProgress).values({ instanceId, phase: newPhase });
  }

  async distributeRewards(instanceId: string, members: Array<{ userId: string; role: RaidRole; damage: number; healing: number }>): Promise<void> {
    const inst = await this.getRaid(instanceId);
    if (!inst?.boss) return;
    for (const m of members) {
      const baseCredits = inst.boss.difficulty === "NIGHTMARE" ? 5000
        : inst.boss.difficulty === "MYTHIC" ? 2500
        : inst.boss.difficulty === "HEROIC" ? 1000 : 500;
      const roleBonus = m.role === "TANK" || m.role === "HEALER" ? 1.2 : 1.0;
      const credits = Math.floor(baseCredits * roleBonus);
      const xp = credits * 3;
      await db.insert(raidRewards).values({
        instanceId, userId: m.userId, role: m.role as never, credits, xp, items: [],
      }).onConflictDoNothing();
    }
  }

  async getRewards(instanceId: string): Promise<Array<{ userId: string; credits: number; xp: number; items: LootItem[] }>> {
    const rows = await db.select().from(raidRewards).where(eq(raidRewards.instanceId, instanceId));
    return rows.map(r => ({
      userId: r.userId, credits: r.credits, xp: r.xp,
      items: (r.items as LootItem[]) ?? [],
    }));
  }

  async leaderboard(bossId: string, limit = 20): Promise<RaidRanking[]> {
    const rows = await db.select().from(raidRankings)
      .where(eq(raidRankings.bossId, bossId))
      .orderBy(desc(raidRankings.totalDamage))
      .limit(limit);
    return rows.map(toRaidRanking);
  }

  async history(userId: string, limit = 20): Promise<RaidHistoryEntry[]> {
    const rows = await db.select().from(raidHistory)
      .where(eq(raidHistory.userId, userId))
      .orderBy(desc(raidHistory.completedAt))
      .limit(limit);
    return rows.map(toRaidHistory);
  }

  async upsertRanking(userId: string, bossId: string, role: RaidRole, damage: number, healing: number, bestTime?: number): Promise<void> {
    const [existing] = await db.select().from(raidRankings)
      .where(and(eq(raidRankings.userId, userId), eq(raidRankings.bossId, bossId)));
    if (existing) {
      await db.update(raidRankings).set({
        totalDamage: existing.totalDamage + damage,
        totalHealing: existing.totalHealing + healing,
        bestTime: bestTime !== undefined && (existing.bestTime === null || bestTime < existing.bestTime) ? bestTime : existing.bestTime,
        updatedAt: new Date(),
      }).where(eq(raidRankings.id, existing.id));
    } else {
      await db.insert(raidRankings).values({
        userId, bossId, role: role as never, totalDamage: damage, totalHealing: healing, bestTime: bestTime ?? null,
      }).onConflictDoNothing();
    }
  }

  async seedBosses(): Promise<void> {
    for (const b of SEED_RAID_BOSSES) {
      await db.insert(raidBosses).values(b as never).onConflictDoNothing();
    }
  }
}
