// ─────────────────────────────────────────────────────────────────────────────
// DrizzleDungeonRepository — HUB-21
// ─────────────────────────────────────────────────────────────────────────────

import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  dungeons, dungeonInstances, dungeonMembers, dungeonBosses,
  dungeonMonsters, dungeonLootTables, dungeonRewards,
  dungeonProgress, dungeonStatistics, dungeonRooms, dungeonRegions,
} from "@workspace/db/schema";
import type {
  IDungeonRepository, Dungeon, DungeonInstance, DungeonMember,
  DungeonBoss, DungeonMonster, DungeonReward, DungeonStatistics,
  LootItem, CreateDungeonInstanceInput, DungeonDifficulty, DungeonStatus,
} from "../dungeonRepository.js";

function toDungeon(row: typeof dungeons.$inferSelect): Dungeon {
  return {
    id: row.id, name: row.name, description: row.description,
    difficulty: row.difficulty as DungeonDifficulty,
    minLevel: row.minLevel, maxPlayers: row.maxPlayers,
    timeLimit: row.timeLimit, rewardCredits: row.rewardCredits, rewardXp: row.rewardXp,
    icon: row.icon, isActive: row.isActive,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toInstance(row: typeof dungeonInstances.$inferSelect): DungeonInstance {
  return {
    id: row.id, dungeonId: row.dungeonId, leaderId: row.leaderId,
    status: row.status as DungeonStatus, difficulty: row.difficulty as DungeonDifficulty,
    currentRoom: row.currentRoom,
    startedAt: row.startedAt ? row.startedAt.toISOString() : null,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toMember(row: typeof dungeonMembers.$inferSelect): DungeonMember {
  return {
    id: row.id, instanceId: row.instanceId, userId: row.userId,
    hp: row.hp, maxHp: row.maxHp, isAlive: row.isAlive, revives: row.revives,
    joinedAt: row.joinedAt.toISOString(),
    leftAt: row.leftAt ? row.leftAt.toISOString() : null,
  };
}

function toBoss(row: typeof dungeonBosses.$inferSelect): DungeonBoss {
  return {
    id: row.id, dungeonId: row.dungeonId, name: row.name, description: row.description,
    hp: row.hp, maxHp: row.maxHp, attack: row.attack, defense: row.defense,
    abilities: row.abilities as Record<string, unknown>[] | null,
    lootTable: row.lootTable as Record<string, unknown>[] | null,
    icon: row.icon, metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(),
  };
}

function toMonster(row: typeof dungeonMonsters.$inferSelect): DungeonMonster {
  return {
    id: row.id, roomId: row.roomId, dungeonId: row.dungeonId,
    name: row.name, type: row.type,
    hp: row.hp, maxHp: row.maxHp, attack: row.attack, defense: row.defense,
    xpReward: row.xpReward, goldReward: row.goldReward,
    icon: row.icon, metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(),
  };
}

function toReward(row: typeof dungeonRewards.$inferSelect): DungeonReward {
  return {
    id: row.id, instanceId: row.instanceId, userId: row.userId,
    credits: row.credits, xp: row.xp,
    items: row.items as LootItem[] | null,
    claimedAt: row.claimedAt.toISOString(),
  };
}

function toStatistics(row: typeof dungeonStatistics.$inferSelect): DungeonStatistics {
  return {
    id: row.id, userId: row.userId, dungeonId: row.dungeonId,
    completions: row.completions, failures: row.failures,
    totalKills: row.totalKills, totalDeaths: row.totalDeaths,
    bestTime: row.bestTime, totalXpEarned: row.totalXpEarned,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const SEED_DUNGEONS = [
  { name: "Mỏ Đá Cổ Đại",     description: "Hang động bí ẩn chứa đầy quái vật khoáng thạch",  difficulty: "NORMAL"    as DungeonDifficulty, minLevel: 1,  maxPlayers: 5,  timeLimit: 1800, rewardCredits: 100,  rewardXp: 500,  icon: "⛏️" },
  { name: "Rừng Ma Quỷ",       description: "Khu rừng tối tăm bị ám bởi linh hồn bóng tối",   difficulty: "HARD"      as DungeonDifficulty, minLevel: 10, maxPlayers: 5,  timeLimit: 2400, rewardCredits: 250,  rewardXp: 1200, icon: "🌲" },
  { name: "Tháp Bão Tố",       description: "Tháp cao ngút trời với bão tố không ngừng",        difficulty: "ELITE"     as DungeonDifficulty, minLevel: 25, maxPlayers: 5,  timeLimit: 3000, rewardCredits: 500,  rewardXp: 2500, icon: "⚡" },
  { name: "Cung Điện Bóng Tối", description: "Cung điện cổ đại bị ma thuật đen phong ấn",       difficulty: "LEGENDARY" as DungeonDifficulty, minLevel: 50, maxPlayers: 5,  timeLimit: 3600, rewardCredits: 1000, rewardXp: 5000, icon: "🏰" },
  { name: "Vực Thẳm Vũ Trụ",   description: "Chiều không gian khác với sinh vật vũ trụ cổ xưa", difficulty: "MYTHIC"    as DungeonDifficulty, minLevel: 80, maxPlayers: 5,  timeLimit: 4800, rewardCredits: 2500, rewardXp: 12000, icon: "🌌" },
];

const SEED_BOSSES = [
  { name: "Vua Khoáng Thạch",   description: "Thủ lĩnh bất khả chiến bại của mỏ đá",   hp: 5000,  attack: 80,  defense: 50,  icon: "👑" },
  { name: "Tinh Linh Rừng Già", description: "Linh hồn bảo vệ khu rừng ma quỷ",         hp: 8000,  attack: 120, defense: 70,  icon: "🌳" },
  { name: "Thần Sấm Sét",       description: "Vị thần kiểm soát sấm sét của tháp bão tố", hp: 15000, attack: 200, defense: 100, icon: "⚡" },
  { name: "Chúa Quỷ Bóng Tối",  description: "Ác chúa thống trị cung điện bóng tối",    hp: 30000, attack: 350, defense: 180, icon: "👹" },
  { name: "Cổ Thần Vũ Trụ",     description: "Thực thể nguyên thủy của vực thẳm vũ trụ", hp: 80000, attack: 600, defense: 350, icon: "🌌" },
];

export class DrizzleDungeonRepository implements IDungeonRepository {

  async listDungeons(): Promise<Dungeon[]> {
    const rows = await db.select().from(dungeons).where(eq(dungeons.isActive, true)).orderBy(dungeons.minLevel);
    return rows.map(toDungeon);
  }

  async getDungeon(id: string): Promise<Dungeon | null> {
    const [row] = await db.select().from(dungeons).where(eq(dungeons.id, id));
    return row ? toDungeon(row) : null;
  }

  async createInstance(input: CreateDungeonInstanceInput): Promise<DungeonInstance> {
    const dungeon = await this.getDungeon(input.dungeonId);
    if (!dungeon) throw new Error("Dungeon không tồn tại");
    const expiresAt = new Date(Date.now() + dungeon.timeLimit * 1000);
    const [row] = await db.insert(dungeonInstances).values({
      dungeonId: input.dungeonId, leaderId: input.leaderId,
      difficulty: (input.difficulty ?? dungeon.difficulty) as never,
      status: "WAITING",
      expiresAt,
    }).returning();
    if (!row) throw new Error("Không thể tạo dungeon instance");
    await this.joinDungeon(row.id, input.leaderId);
    const inst = toInstance(row);
    inst.dungeon = dungeon;
    return inst;
  }

  async getInstance(id: string): Promise<DungeonInstance | null> {
    const [row] = await db.select().from(dungeonInstances).where(eq(dungeonInstances.id, id));
    if (!row) return null;
    const inst = toInstance(row);
    const dungeon = await this.getDungeon(row.dungeonId);
    if (dungeon) inst.dungeon = dungeon;
    const members = await this.listMembers(id);
    inst.memberCount = members.length;
    return inst;
  }

  async listInstances(status?: DungeonStatus): Promise<DungeonInstance[]> {
    const rows = status
      ? await db.select().from(dungeonInstances).where(eq(dungeonInstances.status, status as never)).orderBy(desc(dungeonInstances.createdAt))
      : await db.select().from(dungeonInstances).orderBy(desc(dungeonInstances.createdAt)).limit(50);
    const dungeonIds = [...new Set(rows.map(r => r.dungeonId))];
    const dungeonRows = dungeonIds.length > 0
      ? await db.select().from(dungeons).where(inArray(dungeons.id, dungeonIds))
      : [];
    const dungeonMap = new Map(dungeonRows.map(d => [d.id, toDungeon(d)]));
    return rows.map(r => {
      const inst = toInstance(r);
      inst.dungeon = dungeonMap.get(r.dungeonId);
      return inst;
    });
  }

  async updateInstanceStatus(id: string, status: DungeonStatus, extra?: Partial<{ currentRoom: number; startedAt: Date; completedAt: Date }>): Promise<DungeonInstance> {
    const [row] = await db.update(dungeonInstances)
      .set({ status: status as never, updatedAt: new Date(), ...extra })
      .where(eq(dungeonInstances.id, id))
      .returning();
    if (!row) throw new Error("Không tìm thấy instance");
    return toInstance(row);
  }

  async joinDungeon(instanceId: string, userId: string): Promise<DungeonMember> {
    const existing = await this.getMember(instanceId, userId);
    if (existing) return existing;
    const [row] = await db.insert(dungeonMembers).values({ instanceId, userId }).returning();
    if (!row) throw new Error("Không thể tham gia dungeon");
    return toMember(row);
  }

  async leaveDungeon(instanceId: string, userId: string): Promise<void> {
    await db.update(dungeonMembers)
      .set({ leftAt: new Date() })
      .where(and(eq(dungeonMembers.instanceId, instanceId), eq(dungeonMembers.userId, userId)));
  }

  async listMembers(instanceId: string): Promise<DungeonMember[]> {
    const rows = await db.select().from(dungeonMembers)
      .where(and(eq(dungeonMembers.instanceId, instanceId)));
    return rows.map(toMember);
  }

  async getMember(instanceId: string, userId: string): Promise<DungeonMember | null> {
    const [row] = await db.select().from(dungeonMembers)
      .where(and(eq(dungeonMembers.instanceId, instanceId), eq(dungeonMembers.userId, userId)));
    return row ? toMember(row) : null;
  }

  async updateMemberHp(instanceId: string, userId: string, hp: number): Promise<void> {
    await db.update(dungeonMembers)
      .set({ hp, isAlive: hp > 0 })
      .where(and(eq(dungeonMembers.instanceId, instanceId), eq(dungeonMembers.userId, userId)));
  }

  async reviveMember(instanceId: string, userId: string): Promise<void> {
    await db.update(dungeonMembers)
      .set({ isAlive: true, hp: 50 })
      .where(and(eq(dungeonMembers.instanceId, instanceId), eq(dungeonMembers.userId, userId)));
    const [row] = await db.select().from(dungeonMembers)
      .where(and(eq(dungeonMembers.instanceId, instanceId), eq(dungeonMembers.userId, userId)));
    if (row) {
      await db.update(dungeonMembers)
        .set({ revives: row.revives + 1 })
        .where(eq(dungeonMembers.id, row.id));
    }
  }

  async getBoss(dungeonId: string): Promise<DungeonBoss | null> {
    const [row] = await db.select().from(dungeonBosses).where(eq(dungeonBosses.dungeonId, dungeonId));
    return row ? toBoss(row) : null;
  }

  async spawnBoss(dungeonId: string): Promise<DungeonBoss | null> {
    return this.getBoss(dungeonId);
  }

  async spawnMonster(roomId: string, dungeonId: string): Promise<DungeonMonster> {
    const names = ["Quỷ Đá", "Linh Hồn", "Bóng Tối", "Quái Vật", "Yêu Tinh"];
    const name = names[Math.floor(Math.random() * names.length)] ?? "Quái Vật";
    const [row] = await db.insert(dungeonMonsters).values({
      roomId, dungeonId, name, type: "NORMAL",
      hp: 100, maxHp: 100, attack: 15, defense: 8,
      xpReward: 50, goldReward: 10, icon: "👾",
    }).returning();
    if (!row) throw new Error("Không thể spawn quái vật");
    return toMonster(row);
  }

  async recordKill(instanceId: string, userId: string, target: string): Promise<void> {
    await db.insert(dungeonProgress).values({
      instanceId, checkpointName: `Tiêu diệt ${target}`,
    });
  }

  async recordReward(instanceId: string, userId: string, credits: number, xp: number, items: LootItem[]): Promise<DungeonReward> {
    const [row] = await db.insert(dungeonRewards).values({
      instanceId, userId, credits, xp, items: items as never,
    }).returning();
    if (!row) throw new Error("Không thể ghi nhận phần thưởng");
    return toReward(row);
  }

  async getRewards(instanceId: string): Promise<DungeonReward[]> {
    const rows = await db.select().from(dungeonRewards).where(eq(dungeonRewards.instanceId, instanceId));
    return rows.map(toReward);
  }

  async getHistory(userId: string, limit = 20): Promise<DungeonInstance[]> {
    const memberRows = await db.select().from(dungeonMembers)
      .where(eq(dungeonMembers.userId, userId))
      .orderBy(desc(dungeonMembers.joinedAt))
      .limit(limit);
    if (memberRows.length === 0) return [];
    const instanceIds = memberRows.map(m => m.instanceId);
    const rows = await db.select().from(dungeonInstances)
      .where(inArray(dungeonInstances.id, instanceIds))
      .orderBy(desc(dungeonInstances.createdAt));
    return rows.map(toInstance);
  }

  async getStatistics(userId: string): Promise<DungeonStatistics[]> {
    const rows = await db.select().from(dungeonStatistics).where(eq(dungeonStatistics.userId, userId));
    return rows.map(toStatistics);
  }

  async upsertStatistics(userId: string, dungeonId: string, patch: Partial<Omit<DungeonStatistics, "id" | "userId" | "dungeonId" | "updatedAt">>): Promise<void> {
    const [existing] = await db.select().from(dungeonStatistics)
      .where(and(eq(dungeonStatistics.userId, userId), eq(dungeonStatistics.dungeonId, dungeonId)));
    if (existing) {
      await db.update(dungeonStatistics).set({ ...patch, updatedAt: new Date() }).where(eq(dungeonStatistics.id, existing.id));
    } else {
      await db.insert(dungeonStatistics).values({ userId, dungeonId, ...patch }).onConflictDoNothing();
    }
  }

  async seedDungeons(): Promise<void> {
    for (const d of SEED_DUNGEONS) {
      await db.insert(dungeons).values(d as never).onConflictDoNothing();
    }
  }

  async seedBosses(): Promise<void> {
    const allDungeons = await db.select().from(dungeons).orderBy(dungeons.minLevel);
    for (let i = 0; i < SEED_BOSSES.length && i < allDungeons.length; i++) {
      const dungeon = allDungeons[i];
      const boss = SEED_BOSSES[i];
      if (!dungeon || !boss) continue;
      await db.insert(dungeonBosses).values({
        dungeonId: dungeon.id,
        name: boss.name,
        description: boss.description,
        hp: boss.hp, maxHp: boss.hp,
        attack: boss.attack, defense: boss.defense,
        icon: boss.icon,
      }).onConflictDoNothing();
    }
  }
}
