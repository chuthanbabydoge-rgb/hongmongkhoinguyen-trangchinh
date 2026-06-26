// ─────────────────────────────────────────────────────────────────────────────
// DrizzleMountRepository — HUB-20
// ─────────────────────────────────────────────────────────────────────────────

import { eq, and, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  mounts, mountTypes, mountLevels, mountEquipment,
  mountSkills, mountLearnedSkills, mountTraining,
  mountRoutes, mountTravelLogs, mountStatistics, mountCustomization,
} from "@workspace/db";
import type {
  IMountRepository, Mount, MountTypeRecord, MountEquipmentRecord,
  MountTrainingRecord, MountRoute, MountTravelLog,
  MountStatistics, MountCustomization, CreateMountInput,
} from "../petRepository.js";

function toMount(row: typeof mounts.$inferSelect): Mount {
  return {
    id: row.id, userId: row.userId, typeId: row.typeId,
    name: row.name, type: row.type as Mount["type"], rarity: row.rarity as Mount["rarity"],
    status: row.status as Mount["status"],
    level: row.level, experience: row.experience,
    speed: row.speed, stamina: row.stamina, maxStamina: row.maxStamina,
    isActive: row.isActive, color: row.color, pattern: row.pattern,
    accessories: row.accessories as Record<string, unknown> | null,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toMountType(row: typeof mountTypes.$inferSelect): MountTypeRecord {
  return {
    id: row.id, name: row.name, type: row.type as MountTypeRecord["type"],
    description: row.description, icon: row.icon,
    rarity: row.rarity as MountTypeRecord["rarity"],
    baseSpeed: row.baseSpeed, baseStamina: row.baseStamina,
    maxLevel: row.maxLevel, travelBonus: row.travelBonus,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class DrizzleMountRepository implements IMountRepository {

  // ── Types ──────────────────────────────────────────────────────────────────

  async listMountTypes(): Promise<MountTypeRecord[]> {
    const rows = await db.select().from(mountTypes);
    return rows.map(toMountType);
  }

  async seedMountTypes(): Promise<void> {
    const TYPES = [
      { name: "Stallion",     type: "HORSE",   rarity: "COMMON",    icon: "🐴", baseSpeed: 120, baseStamina: 100, travelBonus: 1.0 },
      { name: "Dire Wolf",    type: "WOLF",    rarity: "UNCOMMON",  icon: "🐺", baseSpeed: 140, baseStamina: 80,  travelBonus: 1.1 },
      { name: "Wyvern",       type: "DRAGON",  rarity: "RARE",      icon: "🐉", baseSpeed: 160, baseStamina: 90,  travelBonus: 1.3 },
      { name: "Blazewing",    type: "PHOENIX", rarity: "EPIC",      icon: "🦅", baseSpeed: 180, baseStamina: 75,  travelBonus: 1.5 },
      { name: "Sabertiger",   type: "TIGER",   rarity: "RARE",      icon: "🐯", baseSpeed: 150, baseStamina: 85,  travelBonus: 1.2 },
      { name: "Ironstrider",  type: "MECH",    rarity: "LEGENDARY", icon: "🤖", baseSpeed: 200, baseStamina: 150, travelBonus: 1.8 },
    ];
    for (const t of TYPES) {
      await db.insert(mountTypes).values({
        name: t.name, type: t.type as never, rarity: t.rarity as never,
        icon: t.icon, baseSpeed: t.baseSpeed, baseStamina: t.baseStamina,
        travelBonus: t.travelBonus, maxLevel: 50,
      }).onConflictDoNothing();
    }
  }

  // ── Mount CRUD ─────────────────────────────────────────────────────────────

  async createMount(input: CreateMountInput): Promise<Mount> {
    const [typeRow] = await db.select().from(mountTypes).where(eq(mountTypes.id, input.typeId));
    const [row] = await db.insert(mounts).values({
      userId: input.userId, typeId: input.typeId,
      name: input.name,
      type: (input.type ?? typeRow?.type ?? "HORSE") as never,
      rarity: (input.rarity ?? typeRow?.rarity ?? "COMMON") as never,
      speed: typeRow?.baseSpeed ?? 100,
      stamina: typeRow?.baseStamina ?? 100,
      maxStamina: typeRow?.baseStamina ?? 100,
    }).returning();
    await db.insert(mountCustomization).values({ mountId: row!.id }).onConflictDoNothing();
    await db.insert(mountStatistics).values({ userId: input.userId, totalMounts: 1 })
      .onConflictDoNothing();
    await db.update(mountStatistics).set({
      totalMounts: (await this.getStatistics(input.userId)).totalMounts + 1,
      updatedAt: new Date(),
    }).where(eq(mountStatistics.userId, input.userId));
    return toMount(row!);
  }

  async getMount(mountId: string): Promise<Mount | null> {
    const [row] = await db.select().from(mounts).where(eq(mounts.id, mountId));
    return row ? toMount(row) : null;
  }

  async listMounts(userId: string): Promise<Mount[]> {
    const rows = await db.select().from(mounts)
      .where(and(eq(mounts.userId, userId), eq(mounts.isActive, true)))
      .orderBy(desc(mounts.level));
    return rows.map(toMount);
  }

  async updateMount(mountId: string, data: Partial<Mount>): Promise<Mount> {
    const [row] = await db.update(mounts).set({ ...data, updatedAt: new Date() } as never)
      .where(eq(mounts.id, mountId)).returning();
    return toMount(row!);
  }

  async getActiveMount(userId: string): Promise<Mount | null> {
    const [row] = await db.select().from(mounts)
      .where(and(eq(mounts.userId, userId), eq(mounts.status, "ACTIVE")));
    return row ? toMount(row) : null;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async levelMount(mountId: string): Promise<Mount> {
    const mount = await this.getMount(mountId);
    if (!mount) throw new Error("Mount not found");
    const newLevel  = mount.level + 1;
    const [levelRow] = await db.select().from(mountLevels).where(eq(mountLevels.level, newLevel));
    const speedBonus   = levelRow?.speedBonus ?? 5;
    const staminaBonus = levelRow?.staminaBonus ?? 10;
    const [row] = await db.update(mounts).set({
      level: newLevel, experience: 0,
      speed: mount.speed + speedBonus,
      maxStamina: mount.maxStamina + staminaBonus,
      stamina: mount.stamina + staminaBonus,
      updatedAt: new Date(),
    }).where(eq(mounts.id, mountId)).returning();
    return toMount(row!);
  }

  async trainMount(mountId: string, userId: string, trainingType: string): Promise<{ mount: Mount; training: MountTrainingRecord }> {
    const mount = await this.getMount(mountId);
    if (!mount) throw new Error("Mount not found");
    const xpGained  = Math.floor(15 + mount.level * 4);
    const statGain   = Math.floor(1 + mount.level * 0.15);
    const statKey    = trainingType === "stamina" ? "stamina" : "speed";
    const [trainingRow] = await db.insert(mountTraining).values({
      mountId, userId, trainingType, xpGained,
      statImproved: statKey, statGain, cost: 40, duration: 60,
      completedAt: new Date(),
    }).returning();
    const update: Record<string, unknown> = {
      experience: mount.experience + xpGained, updatedAt: new Date(),
      [statKey]: (mount[statKey as keyof Mount] as number) + statGain,
    };
    const [updated] = await db.update(mounts).set(update as never).where(eq(mounts.id, mountId)).returning();
    return {
      mount: toMount(updated!),
      training: {
        id: trainingRow!.id, mountId, userId, trainingType, xpGained,
        statImproved: statKey, statGain, cost: 40, duration: 60,
        completedAt: trainingRow!.completedAt?.toISOString() ?? null,
        createdAt: trainingRow!.createdAt.toISOString(),
      },
    };
  }

  async equipMount(mountId: string, slot: string, itemId: string, itemName: string, itemIcon?: string, itemRarity?: string, statBonus?: Record<string, number>): Promise<MountEquipmentRecord> {
    await db.insert(mountEquipment).values({
      mountId, slot, itemId, itemName, itemIcon: itemIcon ?? null,
      itemRarity: itemRarity ?? null, statBonus: statBonus ?? null,
    }).onConflictDoNothing();
    const [row] = await db.update(mountEquipment).set({
      itemId, itemName, itemIcon: itemIcon ?? null,
      itemRarity: itemRarity ?? null, statBonus: statBonus ?? null, updatedAt: new Date(),
    }).where(and(eq(mountEquipment.mountId, mountId), eq(mountEquipment.slot, slot))).returning();
    return {
      id: row!.id, mountId, slot, itemId: row!.itemId,
      itemName: row!.itemName, itemIcon: row!.itemIcon, itemRarity: row!.itemRarity,
      statBonus: row!.statBonus as Record<string, number> | null,
      equippedAt: row!.equippedAt.toISOString(), updatedAt: row!.updatedAt.toISOString(),
    };
  }

  async unequipMount(mountId: string, slot: string): Promise<void> {
    await db.update(mountEquipment).set({
      itemId: null, itemName: null, itemIcon: null,
      itemRarity: null, statBonus: null, updatedAt: new Date(),
    }).where(and(eq(mountEquipment.mountId, mountId), eq(mountEquipment.slot, slot)));
  }

  async getEquipment(mountId: string): Promise<MountEquipmentRecord[]> {
    const rows = await db.select().from(mountEquipment).where(eq(mountEquipment.mountId, mountId));
    return rows.map(r => ({
      id: r.id, mountId: r.mountId, slot: r.slot,
      itemId: r.itemId, itemName: r.itemName, itemIcon: r.itemIcon, itemRarity: r.itemRarity,
      statBonus: r.statBonus as Record<string, number> | null,
      equippedAt: r.equippedAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async travel(mountId: string, userId: string, routeId: string): Promise<MountTravelLog> {
    const [route] = await db.select().from(mountRoutes).where(eq(mountRoutes.id, routeId));
    if (!route) throw new Error("Route not found");
    const mount = await this.getMount(mountId);
    if (!mount) throw new Error("Mount not found");
    const duration    = Math.floor(route.baseDuration * (100 / mount.speed));
    const staminaUsed = Math.min(mount.stamina, Math.floor(route.distance / 10));
    await db.update(mounts).set({
      status: "TRAVELING", stamina: mount.stamina - staminaUsed, updatedAt: new Date(),
    }).where(eq(mounts.id, mountId));
    const [log] = await db.insert(mountTravelLogs).values({
      mountId, userId, routeId,
      origin: route.origin, destination: route.destination,
      distance: route.distance, duration, xpGained: route.xpReward,
      staminaUsed, status: "TRAVELING",
    }).returning();
    return {
      id: log!.id, mountId, userId, routeId,
      origin: route.origin, destination: route.destination,
      distance: route.distance, duration, xpGained: route.xpReward,
      staminaUsed, startedAt: log!.startedAt.toISOString(),
      arrivedAt: null, status: "TRAVELING",
      metadata: null, createdAt: log!.createdAt.toISOString(),
    };
  }

  async arriveTravel(travelLogId: string): Promise<MountTravelLog> {
    const [log] = await db.update(mountTravelLogs).set({
      status: "ARRIVED", arrivedAt: new Date(),
    }).where(eq(mountTravelLogs.id, travelLogId)).returning();
    if (!log) throw new Error("Travel log not found");
    await db.update(mounts).set({ status: "RESTING", updatedAt: new Date() })
      .where(eq(mounts.id, log.mountId));
    const { leveled } = await this.gainXp(log.mountId, log.xpGained);
    const stats = await this.getStatistics(log.userId);
    await db.update(mountStatistics).set({
      totalTravels: stats.totalTravels + 1,
      totalDistance: stats.totalDistance + log.distance,
      totalXpEarned: stats.totalXpEarned + log.xpGained,
      updatedAt: new Date(),
    }).where(eq(mountStatistics.userId, log.userId));
    return {
      id: log.id, mountId: log.mountId, userId: log.userId, routeId: log.routeId,
      origin: log.origin, destination: log.destination,
      distance: log.distance, duration: log.duration, xpGained: log.xpGained,
      staminaUsed: log.staminaUsed, startedAt: log.startedAt.toISOString(),
      arrivedAt: log.arrivedAt?.toISOString() ?? null, status: "ARRIVED",
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt.toISOString(),
    };
  }

  // ── Routes ─────────────────────────────────────────────────────────────────

  async listRoutes(): Promise<MountRoute[]> {
    const rows = await db.select().from(mountRoutes).where(eq(mountRoutes.isActive, true));
    return rows.map(r => ({
      id: r.id, name: r.name, description: r.description,
      origin: r.origin, destination: r.destination,
      distance: r.distance, baseDuration: r.baseDuration,
      xpReward: r.xpReward, isActive: r.isActive,
      metadata: r.metadata as Record<string, unknown> | null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getRoute(routeId: string): Promise<MountRoute | null> {
    const [row] = await db.select().from(mountRoutes).where(eq(mountRoutes.id, routeId));
    if (!row) return null;
    return {
      id: row.id, name: row.name, description: row.description,
      origin: row.origin, destination: row.destination,
      distance: row.distance, baseDuration: row.baseDuration,
      xpReward: row.xpReward, isActive: row.isActive,
      metadata: row.metadata as Record<string, unknown> | null,
      createdAt: row.createdAt.toISOString(),
    };
  }

  // ── XP ─────────────────────────────────────────────────────────────────────

  async gainXp(mountId: string, amount: number): Promise<{ mount: Mount; leveled: boolean; newLevel: number }> {
    const mount = await this.getMount(mountId);
    if (!mount) throw new Error("Mount not found");
    const newXp     = mount.experience + amount;
    const [levelRow] = await db.select().from(mountLevels).where(eq(mountLevels.level, mount.level));
    const xpNeeded  = levelRow?.xpRequired ?? Math.floor(80 * Math.pow(mount.level + 1, 1.5));
    const leveled   = newXp >= xpNeeded;
    const [updated] = await db.update(mounts).set({ experience: newXp, updatedAt: new Date() })
      .where(eq(mounts.id, mountId)).returning();
    if (leveled) {
      const leveled_ = await this.levelMount(mountId);
      return { mount: leveled_, leveled: true, newLevel: leveled_.level };
    }
    return { mount: toMount(updated!), leveled: false, newLevel: mount.level };
  }

  // ── Statistics ─────────────────────────────────────────────────────────────

  async getStatistics(userId: string): Promise<MountStatistics> {
    let [row] = await db.select().from(mountStatistics).where(eq(mountStatistics.userId, userId));
    if (!row) {
      [row] = await db.insert(mountStatistics).values({ userId }).returning();
    }
    return {
      id: row!.id, userId, totalMounts: row!.totalMounts,
      totalTravels: row!.totalTravels, totalDistance: row!.totalDistance,
      totalXpEarned: row!.totalXpEarned, fastestTravel: row!.fastestTravel,
      favoriteMount: row!.favoriteMount, updatedAt: row!.updatedAt.toISOString(),
    };
  }

  async updateStatistics(userId: string, delta: Partial<MountStatistics>): Promise<void> {
    await db.update(mountStatistics).set({ ...delta, updatedAt: new Date() } as never)
      .where(eq(mountStatistics.userId, userId));
  }

  // ── Customization ──────────────────────────────────────────────────────────

  async getCustomization(mountId: string): Promise<MountCustomization | null> {
    const [row] = await db.select().from(mountCustomization).where(eq(mountCustomization.mountId, mountId));
    if (!row) return null;
    return {
      id: row.id, mountId: row.mountId,
      color: row.color, pattern: row.pattern, saddle: row.saddle, armor: row.armor,
      accessories: row.accessories as Record<string, unknown> | null,
      glowEffect: row.glowEffect, trailEffect: row.trailEffect,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateCustomization(mountId: string, data: Partial<MountCustomization>): Promise<MountCustomization> {
    await db.insert(mountCustomization).values({ mountId }).onConflictDoNothing();
    const [row] = await db.update(mountCustomization).set({ ...data, updatedAt: new Date() } as never)
      .where(eq(mountCustomization.mountId, mountId)).returning();
    return {
      id: row!.id, mountId: row!.mountId,
      color: row!.color, pattern: row!.pattern, saddle: row!.saddle, armor: row!.armor,
      accessories: row!.accessories as Record<string, unknown> | null,
      glowEffect: row!.glowEffect, trailEffect: row!.trailEffect,
      updatedAt: row!.updatedAt.toISOString(),
    };
  }

  // ── Travel logs ────────────────────────────────────────────────────────────

  async getTravelLogs(userId: string, limit = 20): Promise<MountTravelLog[]> {
    const rows = await db.select().from(mountTravelLogs)
      .where(eq(mountTravelLogs.userId, userId))
      .orderBy(desc(mountTravelLogs.createdAt)).limit(limit);
    return rows.map(r => ({
      id: r.id, mountId: r.mountId, userId: r.userId, routeId: r.routeId,
      origin: r.origin, destination: r.destination,
      distance: r.distance, duration: r.duration, xpGained: r.xpGained,
      staminaUsed: r.staminaUsed, startedAt: r.startedAt.toISOString(),
      arrivedAt: r.arrivedAt?.toISOString() ?? null, status: r.status,
      metadata: r.metadata as Record<string, unknown> | null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  // ── Skills ─────────────────────────────────────────────────────────────────

  async learnSkill(mountId: string, skillId: string): Promise<void> {
    await db.insert(mountLearnedSkills).values({ mountId, skillId }).onConflictDoNothing();
  }

  async getLearnedSkills(mountId: string): Promise<unknown[]> {
    const rows = await db.select().from(mountLearnedSkills).where(eq(mountLearnedSkills.mountId, mountId));
    return rows;
  }

  // ── Seeds ──────────────────────────────────────────────────────────────────

  async seedLevelTable(): Promise<void> {
    for (let lv = 1; lv <= 50; lv++) {
      await db.insert(mountLevels).values({
        level: lv, xpRequired: Math.floor(80 * Math.pow(lv + 1, 1.5)),
        speedBonus: 5 + Math.floor(lv * 0.5),
        staminaBonus: 10 + lv,
        travelBonus: 0.01 * lv,
        creditReward: lv * 15,
      }).onConflictDoNothing();
    }
  }

  async seedRoutes(): Promise<void> {
    const ROUTES = [
      { name: "Verdant Trail",    origin: "Village",    destination: "Forest",   distance: 100,  baseDuration: 600,  xpReward: 30 },
      { name: "Mountain Pass",    origin: "Village",    destination: "Mountains",distance: 250,  baseDuration: 1800, xpReward: 80 },
      { name: "Desert Crossing",  origin: "Village",    destination: "Desert",   distance: 400,  baseDuration: 3600, xpReward: 150 },
      { name: "Sky Road",         origin: "Mountains",  destination: "Sky City", distance: 500,  baseDuration: 2400, xpReward: 200 },
      { name: "Undersea Tunnel",  origin: "Port",       destination: "Isle",     distance: 300,  baseDuration: 2700, xpReward: 120 },
      { name: "Ancient Highway",  origin: "Capital",    destination: "Ruins",    distance: 600,  baseDuration: 4800, xpReward: 250 },
    ];
    for (const r of ROUTES) {
      await db.insert(mountRoutes).values(r).onConflictDoNothing();
    }
  }
}
