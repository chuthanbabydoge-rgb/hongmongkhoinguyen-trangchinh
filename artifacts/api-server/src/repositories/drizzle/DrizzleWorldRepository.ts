import { randomUUID } from "node:crypto";
import { eq, and, ilike, sql, desc, asc, isNull } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  worldsTable,
  worldMembersTable,
  worldBookmarksTable,
  worldTravelHistoryTable,
  worldPresenceTable,
  worldInstancesTable,
  worldEventsTable,
  worldRegionsTable,
  worldZonesTable,
} from "@workspace/db";
import type {
  IWorldRepository,
  World,
  WorldRegion,
  WorldZone,
  WorldInstance,
  WorldMember,
  WorldBookmark,
  WorldTravelHistory,
  WorldPresence,
  WorldEvent,
  CreateWorldInput,
  UpdateWorldInput,
  ListWorldsOptions,
  WorldMemberRole,
  InstanceType,
} from "../worldRepository.js";

function now(): string { return new Date().toISOString(); }
function uid(): string { return randomUUID(); }

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toWorld(row: typeof worldsTable.$inferSelect): World {
  return {
    id:          row.id,
    name:        row.name,
    slug:        row.slug,
    description: row.description,
    thumbnail:   row.thumbnail,
    banner:      row.banner,
    ownerId:     row.ownerId,
    type:        row.type as World["type"],
    status:      row.status as World["status"],
    capacity:    row.capacity,
    playerCount: row.playerCount,
    visitCount:  row.visitCount,
    isFeatured:  row.isFeatured,
    tags:        row.tags ?? [],
    metadata:    (row.metadata as Record<string, unknown>) ?? null,
    guildId:     row.guildId,
    createdAt:   row.createdAt.toISOString(),
    updatedAt:   row.updatedAt.toISOString(),
  };
}

function toMember(row: typeof worldMembersTable.$inferSelect): WorldMember {
  return {
    id:         row.id,
    worldId:    row.worldId,
    userId:     row.userId,
    role:       row.role as WorldMemberRole,
    joinedAt:   row.joinedAt.toISOString(),
    lastVisit:  row.lastVisit?.toISOString() ?? null,
    visitCount: row.visitCount,
  };
}

function toBookmark(row: typeof worldBookmarksTable.$inferSelect): WorldBookmark {
  return { id: row.id, worldId: row.worldId, userId: row.userId, createdAt: row.createdAt.toISOString() };
}

function toTravelHistory(row: typeof worldTravelHistoryTable.$inferSelect): WorldTravelHistory {
  return {
    id:           row.id,
    userId:       row.userId,
    worldId:      row.worldId,
    instanceId:   row.instanceId,
    enteredAt:    row.enteredAt.toISOString(),
    leftAt:       row.leftAt?.toISOString() ?? null,
    durationSecs: row.durationSecs,
  };
}

function toPresence(row: typeof worldPresenceTable.$inferSelect): WorldPresence {
  return {
    id:         row.id,
    userId:     row.userId,
    worldId:    row.worldId,
    regionId:   row.regionId,
    zoneId:     row.zoneId,
    instanceId: row.instanceId,
    joinedAt:   row.joinedAt?.toISOString() ?? null,
    lastSeen:   row.lastSeen.toISOString(),
    isOnline:   row.isOnline,
  };
}

function toInstance(row: typeof worldInstancesTable.$inferSelect): WorldInstance {
  return {
    id:          row.id,
    zoneId:      row.zoneId,
    worldId:     row.worldId,
    type:        row.type as WorldInstance["type"],
    status:      row.status as WorldInstance["status"],
    capacity:    row.capacity,
    playerCount: row.playerCount,
    ownerId:     row.ownerId,
    expiresAt:   row.expiresAt?.toISOString() ?? null,
    createdAt:   row.createdAt.toISOString(),
    closedAt:    row.closedAt?.toISOString() ?? null,
  };
}

function toEvent(row: typeof worldEventsTable.$inferSelect): WorldEvent {
  return {
    id:              row.id,
    worldId:         row.worldId,
    creatorId:       row.creatorId,
    name:            row.name,
    description:     row.description,
    status:          row.status as WorldEvent["status"],
    maxParticipants: row.maxParticipants,
    startAt:         row.startAt.toISOString(),
    endAt:           row.endAt?.toISOString() ?? null,
    metadata:        (row.metadata as Record<string, unknown>) ?? null,
    createdAt:       row.createdAt.toISOString(),
  };
}

function toRegion(row: typeof worldRegionsTable.$inferSelect): WorldRegion {
  return {
    id:          row.id,
    worldId:     row.worldId,
    name:        row.name,
    description: row.description,
    capacity:    row.capacity,
    playerCount: row.playerCount,
    isDefault:   row.isDefault,
    metadata:    (row.metadata as Record<string, unknown>) ?? null,
    createdAt:   row.createdAt.toISOString(),
  };
}

function toZone(row: typeof worldZonesTable.$inferSelect): WorldZone {
  return {
    id:          row.id,
    regionId:    row.regionId,
    worldId:     row.worldId,
    name:        row.name,
    description: row.description,
    capacity:    row.capacity,
    playerCount: row.playerCount,
    isDefault:   row.isDefault,
    metadata:    (row.metadata as Record<string, unknown>) ?? null,
    createdAt:   row.createdAt.toISOString(),
  };
}

export class DrizzleWorldRepository implements IWorldRepository {
  async createWorld(input: CreateWorldInput): Promise<World> {
    const row = await db.insert(worldsTable).values({
      id:          uid(),
      name:        input.name,
      slug:        input.slug ?? slugify(input.name) + "-" + Date.now().toString(36),
      description: input.description ?? null,
      thumbnail:   input.thumbnail ?? null,
      banner:      input.banner ?? null,
      ownerId:     input.ownerId,
      type:        (input.type ?? "PUBLIC") as typeof worldsTable.$inferInsert["type"],
      status:      "ACTIVE",
      capacity:    input.capacity ?? 100,
      playerCount: 0,
      visitCount:  0,
      isFeatured:  false,
      tags:        input.tags ?? [],
      metadata:    (input.metadata ?? null) as typeof worldsTable.$inferInsert["metadata"],
      guildId:     input.guildId ?? null,
    }).returning();
    return toWorld(row[0]!);
  }

  async getWorldById(id: string): Promise<World | null> {
    const rows = await db.select().from(worldsTable).where(eq(worldsTable.id, id)).limit(1);
    return rows[0] ? toWorld(rows[0]) : null;
  }

  async getWorldBySlug(slug: string): Promise<World | null> {
    const rows = await db.select().from(worldsTable).where(eq(worldsTable.slug, slug)).limit(1);
    return rows[0] ? toWorld(rows[0]) : null;
  }

  async updateWorld(id: string, input: UpdateWorldInput): Promise<World | null> {
    const rows = await db.update(worldsTable).set({ ...input, updatedAt: new Date() }).where(eq(worldsTable.id, id)).returning();
    return rows[0] ? toWorld(rows[0]) : null;
  }

  async deleteWorld(id: string): Promise<boolean> {
    const rows = await db.delete(worldsTable).where(eq(worldsTable.id, id)).returning();
    return rows.length > 0;
  }

  async listWorlds(options?: ListWorldsOptions): Promise<World[]> {
    const conditions = [sql`${worldsTable.status} != 'ARCHIVED'`];
    if (options?.search)     conditions.push(ilike(worldsTable.name, `%${options.search}%`));
    if (options?.type)       conditions.push(sql`${worldsTable.type} = ${options.type}`);
    if (options?.ownerId)    conditions.push(eq(worldsTable.ownerId, options.ownerId));
    if (options?.isFeatured !== undefined) conditions.push(eq(worldsTable.isFeatured, options.isFeatured));

    const sortDir = options?.sortDir ?? "desc";
    const sortBy  = options?.sortBy  ?? "createdAt";
    const orderCol = sortBy === "playerCount" ? worldsTable.playerCount
                   : sortBy === "visitCount"  ? worldsTable.visitCount
                   : worldsTable.createdAt;
    const orderFn = sortDir === "asc" ? asc(orderCol) : desc(orderCol);

    const rows = await db.select().from(worldsTable)
      .where(and(...conditions))
      .orderBy(orderFn)
      .limit(options?.limit ?? 20)
      .offset(options?.offset ?? 0);
    return rows.map(toWorld);
  }

  async countWorlds(options?: ListWorldsOptions): Promise<number> {
    const conditions = [sql`${worldsTable.status} != 'ARCHIVED'`];
    if (options?.search)  conditions.push(ilike(worldsTable.name, `%${options.search}%`));
    if (options?.type)    conditions.push(sql`${worldsTable.type} = ${options.type}`);
    if (options?.ownerId) conditions.push(eq(worldsTable.ownerId, options.ownerId));
    if (options?.isFeatured !== undefined) conditions.push(eq(worldsTable.isFeatured, options.isFeatured));
    const [res] = await db.select({ count: sql<number>`count(*)` }).from(worldsTable).where(and(...conditions));
    return Number(res?.count ?? 0);
  }

  async incrementPlayerCount(worldId: string, delta: number): Promise<void> {
    await db.update(worldsTable).set({
      playerCount: sql`greatest(0, ${worldsTable.playerCount} + ${delta})`,
      updatedAt:   new Date(),
    }).where(eq(worldsTable.id, worldId));
  }

  async incrementVisitCount(worldId: string): Promise<void> {
    await db.update(worldsTable).set({
      visitCount: sql`${worldsTable.visitCount} + 1`,
      updatedAt:  new Date(),
    }).where(eq(worldsTable.id, worldId));
  }

  async addMember(worldId: string, userId: string, role: WorldMemberRole = "MEMBER"): Promise<WorldMember> {
    const existing = await this.getMember(worldId, userId);
    if (existing) return existing;
    const rows = await db.insert(worldMembersTable).values({
      id: uid(), worldId, userId, role: role as typeof worldMembersTable.$inferInsert["role"],
      joinedAt: new Date(), visitCount: 0,
    }).returning();
    return toMember(rows[0]!);
  }

  async getMember(worldId: string, userId: string): Promise<WorldMember | null> {
    const rows = await db.select().from(worldMembersTable).where(and(eq(worldMembersTable.worldId, worldId), eq(worldMembersTable.userId, userId))).limit(1);
    return rows[0] ? toMember(rows[0]) : null;
  }

  async listMembers(worldId: string): Promise<WorldMember[]> {
    const rows = await db.select().from(worldMembersTable).where(eq(worldMembersTable.worldId, worldId));
    return rows.map(toMember);
  }

  async removeMember(worldId: string, userId: string): Promise<boolean> {
    const rows = await db.delete(worldMembersTable).where(and(eq(worldMembersTable.worldId, worldId), eq(worldMembersTable.userId, userId))).returning();
    return rows.length > 0;
  }

  async updateMemberVisit(worldId: string, userId: string): Promise<void> {
    await db.update(worldMembersTable).set({
      lastVisit:  new Date(),
      visitCount: sql`${worldMembersTable.visitCount} + 1`,
    }).where(and(eq(worldMembersTable.worldId, worldId), eq(worldMembersTable.userId, userId)));
  }

  async addBookmark(worldId: string, userId: string): Promise<WorldBookmark> {
    const existing = await this.getBookmark(worldId, userId);
    if (existing) return existing;
    const rows = await db.insert(worldBookmarksTable).values({ id: uid(), worldId, userId, createdAt: new Date() }).returning();
    return toBookmark(rows[0]!);
  }

  async removeBookmark(worldId: string, userId: string): Promise<boolean> {
    const rows = await db.delete(worldBookmarksTable).where(and(eq(worldBookmarksTable.worldId, worldId), eq(worldBookmarksTable.userId, userId))).returning();
    return rows.length > 0;
  }

  async getBookmark(worldId: string, userId: string): Promise<WorldBookmark | null> {
    const rows = await db.select().from(worldBookmarksTable).where(and(eq(worldBookmarksTable.worldId, worldId), eq(worldBookmarksTable.userId, userId))).limit(1);
    return rows[0] ? toBookmark(rows[0]) : null;
  }

  async listBookmarks(userId: string): Promise<(WorldBookmark & { world: World })[]> {
    const bms = await db.select().from(worldBookmarksTable).where(eq(worldBookmarksTable.userId, userId)).orderBy(desc(worldBookmarksTable.createdAt));
    const result: (WorldBookmark & { world: World })[] = [];
    for (const bm of bms) {
      const world = await this.getWorldById(bm.worldId);
      if (world) result.push({ ...toBookmark(bm), world });
    }
    return result;
  }

  async addTravelHistory(input: { userId: string; worldId: string; instanceId?: string }): Promise<WorldTravelHistory> {
    const rows = await db.insert(worldTravelHistoryTable).values({
      id: uid(), userId: input.userId, worldId: input.worldId,
      instanceId: input.instanceId ?? null, enteredAt: new Date(),
    }).returning();
    return toTravelHistory(rows[0]!);
  }

  async closeTravelHistory(id: string): Promise<WorldTravelHistory | null> {
    const existing = await db.select().from(worldTravelHistoryTable).where(eq(worldTravelHistoryTable.id, id)).limit(1);
    if (!existing[0]) return null;
    const durationSecs = Math.floor((Date.now() - existing[0].enteredAt.getTime()) / 1000);
    const rows = await db.update(worldTravelHistoryTable).set({ leftAt: new Date(), durationSecs }).where(eq(worldTravelHistoryTable.id, id)).returning();
    return rows[0] ? toTravelHistory(rows[0]) : null;
  }

  async getActiveTravelHistory(userId: string): Promise<WorldTravelHistory | null> {
    const rows = await db.select().from(worldTravelHistoryTable).where(and(eq(worldTravelHistoryTable.userId, userId), isNull(worldTravelHistoryTable.leftAt))).limit(1);
    return rows[0] ? toTravelHistory(rows[0]) : null;
  }

  async listTravelHistory(userId: string, limit = 20): Promise<(WorldTravelHistory & { world: World })[]> {
    const rows = await db.select().from(worldTravelHistoryTable).where(eq(worldTravelHistoryTable.userId, userId)).orderBy(desc(worldTravelHistoryTable.enteredAt)).limit(limit);
    const result: (WorldTravelHistory & { world: World })[] = [];
    for (const row of rows) {
      const world = await this.getWorldById(row.worldId);
      if (world) result.push({ ...toTravelHistory(row), world });
    }
    return result;
  }

  async upsertPresence(userId: string, data: Partial<Omit<WorldPresence, "id" | "userId" | "lastSeen">>): Promise<WorldPresence> {
    const existing = await db.select().from(worldPresenceTable).where(eq(worldPresenceTable.userId, userId)).limit(1);
    if (existing[0]) {
      const rows = await db.update(worldPresenceTable).set({
        worldId:    data.worldId    !== undefined ? data.worldId    : existing[0].worldId,
        regionId:   data.regionId   !== undefined ? data.regionId   : existing[0].regionId,
        zoneId:     data.zoneId     !== undefined ? data.zoneId     : existing[0].zoneId,
        instanceId: data.instanceId !== undefined ? data.instanceId : existing[0].instanceId,
        joinedAt:   data.joinedAt   !== undefined ? (data.joinedAt ? new Date(data.joinedAt) : null) : existing[0].joinedAt,
        isOnline:   data.isOnline   !== undefined ? data.isOnline   : existing[0].isOnline,
        lastSeen:   new Date(),
      }).where(eq(worldPresenceTable.userId, userId)).returning();
      return toPresence(rows[0]!);
    }
    const rows = await db.insert(worldPresenceTable).values({
      id: uid(), userId,
      worldId:    data.worldId    ?? null,
      regionId:   data.regionId   ?? null,
      zoneId:     data.zoneId     ?? null,
      instanceId: data.instanceId ?? null,
      joinedAt:   data.joinedAt ? new Date(data.joinedAt) : null,
      isOnline:   data.isOnline ?? false,
      lastSeen:   new Date(),
    }).returning();
    return toPresence(rows[0]!);
  }

  async getPresence(userId: string): Promise<WorldPresence | null> {
    const rows = await db.select().from(worldPresenceTable).where(eq(worldPresenceTable.userId, userId)).limit(1);
    return rows[0] ? toPresence(rows[0]) : null;
  }

  async listWorldPresence(worldId: string): Promise<WorldPresence[]> {
    const rows = await db.select().from(worldPresenceTable).where(and(eq(worldPresenceTable.worldId, worldId), eq(worldPresenceTable.isOnline, true)));
    return rows.map(toPresence);
  }

  async clearPresence(userId: string): Promise<void> {
    await db.update(worldPresenceTable).set({ worldId: null, regionId: null, zoneId: null, instanceId: null, isOnline: false, joinedAt: null, lastSeen: new Date() }).where(eq(worldPresenceTable.userId, userId));
  }

  async createInstance(input: { zoneId: string; worldId: string; type?: InstanceType; capacity?: number; ownerId?: string }): Promise<WorldInstance> {
    const rows = await db.insert(worldInstancesTable).values({
      id: uid(), zoneId: input.zoneId, worldId: input.worldId,
      type:        (input.type ?? "SHARED") as typeof worldInstancesTable.$inferInsert["type"],
      status:      "OPEN",
      capacity:    input.capacity ?? 20,
      playerCount: 0,
      ownerId:     input.ownerId ?? null,
    }).returning();
    return toInstance(rows[0]!);
  }

  async getInstance(id: string): Promise<WorldInstance | null> {
    const rows = await db.select().from(worldInstancesTable).where(eq(worldInstancesTable.id, id)).limit(1);
    return rows[0] ? toInstance(rows[0]) : null;
  }

  async listInstances(worldId: string, zoneId?: string): Promise<WorldInstance[]> {
    const conditions = [eq(worldInstancesTable.worldId, worldId), sql`${worldInstancesTable.status} != 'CLOSED'`];
    if (zoneId) conditions.push(eq(worldInstancesTable.zoneId, zoneId));
    const rows = await db.select().from(worldInstancesTable).where(and(...conditions));
    return rows.map(toInstance);
  }

  async getOpenInstance(worldId: string): Promise<WorldInstance | null> {
    const rows = await db.select().from(worldInstancesTable)
      .where(and(eq(worldInstancesTable.worldId, worldId), eq(worldInstancesTable.status, "OPEN"), sql`${worldInstancesTable.playerCount} < ${worldInstancesTable.capacity}`))
      .limit(1);
    return rows[0] ? toInstance(rows[0]) : null;
  }

  async updateInstancePlayerCount(id: string, delta: number): Promise<WorldInstance | null> {
    const rows = await db.update(worldInstancesTable).set({
      playerCount: sql`greatest(0, ${worldInstancesTable.playerCount} + ${delta})`,
    }).where(eq(worldInstancesTable.id, id)).returning();
    if (!rows[0]) return null;
    if (rows[0].playerCount >= rows[0].capacity) {
      await db.update(worldInstancesTable).set({ status: "FULL" }).where(eq(worldInstancesTable.id, id));
    } else if (rows[0].playerCount === 0) {
      await this.closeInstance(id);
    }
    return toInstance(rows[0]);
  }

  async closeInstance(id: string): Promise<boolean> {
    const rows = await db.update(worldInstancesTable).set({ status: "CLOSED", closedAt: new Date() }).where(eq(worldInstancesTable.id, id)).returning();
    return rows.length > 0;
  }

  async createEvent(input: { worldId: string; creatorId: string; name: string; description?: string; startAt: string; endAt?: string; maxParticipants?: number; metadata?: Record<string, unknown> }): Promise<WorldEvent> {
    const rows = await db.insert(worldEventsTable).values({
      id:              uid(),
      worldId:         input.worldId,
      creatorId:       input.creatorId,
      name:            input.name,
      description:     input.description ?? null,
      status:          "UPCOMING",
      maxParticipants: input.maxParticipants ?? null,
      startAt:         new Date(input.startAt),
      endAt:           input.endAt ? new Date(input.endAt) : null,
      metadata:        (input.metadata ?? null) as typeof worldEventsTable.$inferInsert["metadata"],
    }).returning();
    return toEvent(rows[0]!);
  }

  async listEvents(worldId: string): Promise<WorldEvent[]> {
    const rows = await db.select().from(worldEventsTable).where(eq(worldEventsTable.worldId, worldId)).orderBy(desc(worldEventsTable.startAt));
    return rows.map(toEvent);
  }

  async getEvent(id: string): Promise<WorldEvent | null> {
    const rows = await db.select().from(worldEventsTable).where(eq(worldEventsTable.id, id)).limit(1);
    return rows[0] ? toEvent(rows[0]) : null;
  }

  async listRegions(worldId: string): Promise<WorldRegion[]> {
    const rows = await db.select().from(worldRegionsTable).where(eq(worldRegionsTable.worldId, worldId));
    return rows.map(toRegion);
  }

  async getDefaultRegion(worldId: string): Promise<WorldRegion | null> {
    const rows = await db.select().from(worldRegionsTable).where(and(eq(worldRegionsTable.worldId, worldId), eq(worldRegionsTable.isDefault, true))).limit(1);
    return rows[0] ? toRegion(rows[0]) : null;
  }

  async listZones(regionId: string): Promise<WorldZone[]> {
    const rows = await db.select().from(worldZonesTable).where(eq(worldZonesTable.regionId, regionId));
    return rows.map(toZone);
  }

  async getDefaultZone(regionId: string): Promise<WorldZone | null> {
    const rows = await db.select().from(worldZonesTable).where(and(eq(worldZonesTable.regionId, regionId), eq(worldZonesTable.isDefault, true))).limit(1);
    return rows[0] ? toZone(rows[0]) : null;
  }
}
