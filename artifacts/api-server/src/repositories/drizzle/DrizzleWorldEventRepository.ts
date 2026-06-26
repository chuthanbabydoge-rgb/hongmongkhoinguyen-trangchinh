// ─────────────────────────────────────────────────────────────────────────────
// DrizzleWorldEventRepository — HUB-22
// ─────────────────────────────────────────────────────────────────────────────

import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  worldEvents, worldEventObjectives, worldEventRewards,
  worldEventProgress, worldEventParticipants, worldWeather,
} from "@workspace/db/schema";
import type {
  IWorldEventRepository, WorldEvent, WorldEventObjective,
  WorldEventParticipant, WorldWeather, EventType, WeatherType,
} from "../bossRepository.js";

function toEvent(row: typeof worldEvents.$inferSelect): WorldEvent {
  return {
    id: row.id, name: row.name, description: row.description,
    type: row.type as EventType, status: row.status,
    region: row.region, maxParticipants: row.maxParticipants,
    rewardCredits: row.rewardCredits, rewardXp: row.rewardXp,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    icon: row.icon, metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toObjective(row: typeof worldEventObjectives.$inferSelect): WorldEventObjective {
  return {
    id: row.id, eventId: row.eventId, name: row.name, description: row.description,
    target: row.target, current: row.current, isComplete: row.isComplete, order: row.order,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toParticipant(row: typeof worldEventParticipants.$inferSelect): WorldEventParticipant {
  return {
    id: row.id, eventId: row.eventId, userId: row.userId,
    contribution: row.contribution, joinedAt: row.joinedAt.toISOString(),
    leftAt: row.leftAt ? row.leftAt.toISOString() : null,
  };
}

function toWeather(row: typeof worldWeather.$inferSelect): WorldWeather {
  return {
    id: row.id, region: row.region, weather: row.weather as WeatherType,
    intensity: row.intensity, description: row.description,
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

const SEED_EVENTS = [
  { name: "Xâm Chiếm Sa Mạc",      description: "Quân đội quỷ dữ xâm chiếm sa mạc thiên hà, hãy bảo vệ cư dân", type: "INVASION" as EventType,  status: "UPCOMING", region: "Sa Mạc Thiên Hà",  maxParticipants: 100, rewardCredits: 500,   rewardXp: 2000,  icon: "⚔️", startsAt: null, endsAt: null },
  { name: "Bảo Vệ Thành Trì",       description: "Bảo vệ thành trì trung tâm khỏi làn sóng tấn công không ngừng",  type: "DEFENSE" as EventType,   status: "ACTIVE",   region: "Thành Trì Trung Tâm", maxParticipants: 80,  rewardCredits: 750,   rewardXp: 3000,  icon: "🛡️", startsAt: null, endsAt: null },
  { name: "Hộ Tống Thương Nhân",    description: "Hộ tống đoàn thương nhân qua vùng hiểm nguy đến cảng an toàn",  type: "ESCORT" as EventType,    status: "UPCOMING", region: "Đồng Bằng Sét",    maxParticipants: 50,  rewardCredits: 600,   rewardXp: 2500,  icon: "🚢", startsAt: null, endsAt: null },
  { name: "Kho Báu Cổ Đại",         description: "Bản đồ kho báu cổ đại đã xuất hiện, hãy là người đầu tiên tìm ra", type: "TREASURE" as EventType,  status: "UPCOMING", region: "Vùng Cực Bắc",     maxParticipants: 60,  rewardCredits: 1000,  rewardXp: 5000,  icon: "💎", startsAt: null, endsAt: null },
  { name: "Thảm Họa Thiên Nhiên",   description: "Thiên tai kinh hoàng đang tàn phá thế giới, cần mọi người chung tay", type: "SEASONAL" as EventType,  status: "UPCOMING", region: "Toàn Bộ",         maxParticipants: 200, rewardCredits: 2000,  rewardXp: 10000, icon: "🌪️", startsAt: null, endsAt: null },
];

const SEED_OBJECTIVES = [
  { name: "Tiêu diệt quỷ dữ",     target: 500 },
  { name: "Bảo vệ dân thường",     target: 100 },
  { name: "Thu thập tinh thạch",   target: 200 },
];

export class DrizzleWorldEventRepository implements IWorldEventRepository {

  async listEvents(status?: string): Promise<WorldEvent[]> {
    const rows = status
      ? await db.select().from(worldEvents).where(eq(worldEvents.status, status)).orderBy(desc(worldEvents.createdAt))
      : await db.select().from(worldEvents).orderBy(desc(worldEvents.createdAt));
    const results: WorldEvent[] = [];
    for (const row of rows) {
      const event = toEvent(row);
      const objectives = await db.select().from(worldEventObjectives).where(eq(worldEventObjectives.eventId, row.id));
      const participants = await db.select().from(worldEventParticipants).where(eq(worldEventParticipants.eventId, row.id));
      event.objectives = objectives.map(toObjective);
      event.participantCount = participants.length;
      results.push(event);
    }
    return results;
  }

  async getEvent(id: string): Promise<WorldEvent | null> {
    const [row] = await db.select().from(worldEvents).where(eq(worldEvents.id, id));
    if (!row) return null;
    const event = toEvent(row);
    const objectives = await db.select().from(worldEventObjectives).where(eq(worldEventObjectives.eventId, id)).orderBy(worldEventObjectives.order);
    const participants = await db.select().from(worldEventParticipants).where(eq(worldEventParticipants.eventId, id));
    event.objectives = objectives.map(toObjective);
    event.participantCount = participants.length;
    return event;
  }

  async createWorldEvent(data: Omit<WorldEvent, "id" | "createdAt" | "updatedAt" | "objectives" | "participantCount">): Promise<WorldEvent> {
    const [row] = await db.insert(worldEvents).values({
      name: data.name, description: data.description,
      type: data.type as never, status: data.status,
      region: data.region, maxParticipants: data.maxParticipants,
      rewardCredits: data.rewardCredits, rewardXp: data.rewardXp,
      icon: data.icon,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    }).returning();
    if (!row) throw new Error("Không thể tạo world event");
    return toEvent(row);
  }

  async startWorldEvent(id: string): Promise<WorldEvent> {
    const [row] = await db.update(worldEvents)
      .set({ status: "ACTIVE", startsAt: new Date(), updatedAt: new Date() })
      .where(eq(worldEvents.id, id))
      .returning();
    if (!row) throw new Error("Event không tồn tại");
    return toEvent(row);
  }

  async completeWorldEvent(id: string, success: boolean): Promise<WorldEvent> {
    const [row] = await db.update(worldEvents)
      .set({ status: success ? "COMPLETED" : "FAILED", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(worldEvents.id, id))
      .returning();
    if (!row) throw new Error("Event không tồn tại");
    return toEvent(row);
  }

  async joinWorldEvent(eventId: string, userId: string): Promise<WorldEventParticipant> {
    const [existing] = await db.select().from(worldEventParticipants)
      .where(and(eq(worldEventParticipants.eventId, eventId), eq(worldEventParticipants.userId, userId)));
    if (existing) return toParticipant(existing);
    const [row] = await db.insert(worldEventParticipants).values({ eventId, userId }).returning();
    if (!row) throw new Error("Không thể tham gia event");
    return toParticipant(row);
  }

  async getParticipants(eventId: string): Promise<WorldEventParticipant[]> {
    const rows = await db.select().from(worldEventParticipants).where(eq(worldEventParticipants.eventId, eventId));
    return rows.map(toParticipant);
  }

  async getObjectives(eventId: string): Promise<WorldEventObjective[]> {
    const rows = await db.select().from(worldEventObjectives).where(eq(worldEventObjectives.eventId, eventId)).orderBy(worldEventObjectives.order);
    return rows.map(toObjective);
  }

  async contributeObjective(objectiveId: string, userId: string, amount: number): Promise<WorldEventObjective> {
    const [obj] = await db.select().from(worldEventObjectives).where(eq(worldEventObjectives.id, objectiveId));
    if (!obj) throw new Error("Objective không tồn tại");
    const newCurrent = Math.min(obj.target, obj.current + amount);
    const isComplete = newCurrent >= obj.target;
    const [updated] = await db.update(worldEventObjectives)
      .set({ current: newCurrent, isComplete, updatedAt: new Date() })
      .where(eq(worldEventObjectives.id, objectiveId))
      .returning();
    // Record progress
    const [prog] = await db.select().from(worldEventProgress)
      .where(and(eq(worldEventProgress.objectiveId, objectiveId), eq(worldEventProgress.userId, userId)));
    if (prog) {
      await db.update(worldEventProgress).set({ contribution: prog.contribution + amount, updatedAt: new Date() }).where(eq(worldEventProgress.id, prog.id));
    } else {
      await db.insert(worldEventProgress).values({ eventId: obj.eventId, objectiveId, userId, contribution: amount }).onConflictDoNothing();
    }
    if (!updated) throw new Error("Không thể cập nhật objective");
    return toObjective(updated);
  }

  async distributeRewards(eventId: string, participants: WorldEventParticipant[]): Promise<void> {
    const [event] = await db.select().from(worldEvents).where(eq(worldEvents.id, eventId));
    if (!event) return;
    for (const p of participants) {
      const contribution = p.contribution > 0 ? p.contribution : 1;
      const totalContribution = participants.reduce((sum, x) => sum + Math.max(x.contribution, 1), 0);
      const share = contribution / totalContribution;
      const credits = Math.floor(event.rewardCredits * share);
      const xp = Math.floor(event.rewardXp * share);
      await db.insert(worldEventRewards).values({ eventId, userId: p.userId, credits, xp, items: [] }).onConflictDoNothing();
    }
  }

  async getHistory(userId: string, limit = 20): Promise<WorldEvent[]> {
    const participations = await db.select().from(worldEventParticipants)
      .where(eq(worldEventParticipants.userId, userId))
      .orderBy(desc(worldEventParticipants.joinedAt))
      .limit(limit);
    if (participations.length === 0) return [];
    const eventIds = participations.map(p => p.eventId);
    const rows = await db.select().from(worldEvents).where(inArray(worldEvents.id, eventIds)).orderBy(desc(worldEvents.createdAt));
    return rows.map(toEvent);
  }

  async getCurrentWeather(region = "global"): Promise<WorldWeather | null> {
    const [row] = await db.select().from(worldWeather).where(eq(worldWeather.region, region)).orderBy(desc(worldWeather.updatedAt));
    return row ? toWeather(row) : null;
  }

  async setWeather(region: string, weather: WeatherType, intensity = 1.0, durationSec = 3600): Promise<WorldWeather> {
    const endsAt = new Date(Date.now() + durationSec * 1000);
    const [existing] = await db.select().from(worldWeather).where(eq(worldWeather.region, region));
    if (existing) {
      const [row] = await db.update(worldWeather)
        .set({ weather: weather as never, intensity, endsAt, updatedAt: new Date() })
        .where(eq(worldWeather.id, existing.id))
        .returning();
      if (!row) throw new Error("Lỗi cập nhật thời tiết");
      return toWeather(row);
    }
    const [row] = await db.insert(worldWeather).values({ region, weather: weather as never, intensity, endsAt }).returning();
    if (!row) throw new Error("Không thể tạo weather record");
    return toWeather(row);
  }

  async listWeather(): Promise<WorldWeather[]> {
    const rows = await db.select().from(worldWeather).orderBy(worldWeather.region);
    return rows.map(toWeather);
  }

  async seedEvents(): Promise<void> {
    for (const e of SEED_EVENTS) {
      const existing = await db.select().from(worldEvents).where(eq(worldEvents.name, e.name));
      if (existing.length > 0) continue;
      const [event] = await db.insert(worldEvents).values(e as never).returning();
      if (!event) continue;
      for (let i = 0; i < SEED_OBJECTIVES.length; i++) {
        const obj = SEED_OBJECTIVES[i];
        if (!obj) continue;
        await db.insert(worldEventObjectives).values({
          eventId: event.id, name: obj.name, target: obj.target, order: i + 1,
        }).onConflictDoNothing();
      }
    }
  }

  async seedWeather(): Promise<void> {
    const regions = ["global", "Sa Mạc Thiên Hà", "Vùng Cực Bắc", "Đồng Bằng Sét", "Vùng Hắc Ám"];
    const weathers: WeatherType[] = ["SUNNY", "SNOW", "STORM", "RAIN", "FOG"];
    for (let i = 0; i < regions.length; i++) {
      const region = regions[i]!;
      const weather = weathers[i] ?? "SUNNY";
      const existing = await db.select().from(worldWeather).where(eq(worldWeather.region, region));
      if (existing.length === 0) {
        await db.insert(worldWeather).values({ region, weather: weather as never, intensity: 1.0 }).onConflictDoNothing();
      }
    }
  }
}
