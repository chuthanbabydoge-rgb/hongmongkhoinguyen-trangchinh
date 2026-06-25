import { eq, and, inArray, sql } from "drizzle-orm";
import {
  db,
  questsTable,
  questObjectivesTable,
  userQuestsTable,
  userQuestProgressTable,
} from "@workspace/db";
import type {
  IQuestRepository,
  Quest,
  QuestObjective,
  UserQuest,
  UserQuestProgress,
  QuestType,
  QuestStatus,
  ObjectiveType,
  UserQuestStatus,
  CreateQuestInput,
} from "../questRepository.js";

function ts(v: Date | string | null | undefined): string {
  if (!v) return new Date().toISOString();
  return v instanceof Date ? v.toISOString() : String(v);
}

function tsNull(v: Date | string | null | undefined): string | null {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : String(v);
}

function toObjective(r: typeof questObjectivesTable.$inferSelect): QuestObjective {
  return {
    id:          r.id,
    questId:     r.questId,
    type:        r.type as ObjectiveType,
    description: r.description,
    targetCount: r.targetCount,
    metadata:    (r.metadata as Record<string, unknown> | null) ?? null,
    orderIndex:  r.orderIndex,
  };
}

function toQuest(r: typeof questsTable.$inferSelect, objectives: QuestObjective[]): Quest {
  return {
    id:               r.id,
    title:            r.title,
    description:      r.description,
    type:             r.type as QuestType,
    status:           r.status as QuestStatus,
    difficulty:       r.difficulty as Quest["difficulty"],
    requiredLevel:    r.requiredLevel,
    repeatable:       r.repeatable,
    startAt:          tsNull(r.startAt),
    endAt:            tsNull(r.endAt),
    rewardCredits:    r.rewardCredits,
    rewardCoins:      r.rewardCoins,
    rewardTokens:     r.rewardTokens,
    rewardReputation: r.rewardReputation,
    metadata:         (r.metadata as Record<string, unknown> | null) ?? null,
    objectives,
    createdAt:        ts(r.createdAt),
    updatedAt:        ts(r.updatedAt),
  };
}

function toProgress(r: typeof userQuestProgressTable.$inferSelect): UserQuestProgress {
  return {
    id:           r.id,
    userQuestId:  r.userQuestId,
    objectiveId:  r.objectiveId,
    currentCount: r.currentCount,
    completed:    r.completed,
    updatedAt:    ts(r.updatedAt),
  };
}

function toUserQuest(r: typeof userQuestsTable.$inferSelect, progress: UserQuestProgress[]): UserQuest {
  return {
    id:          r.id,
    userId:      r.userId,
    questId:     r.questId,
    status:      r.status as UserQuestStatus,
    startedAt:   ts(r.startedAt),
    completedAt: tsNull(r.completedAt),
    claimedAt:   tsNull(r.claimedAt),
    progress,
    createdAt:   ts(r.createdAt),
    updatedAt:   ts(r.updatedAt),
  };
}

export class DrizzleQuestRepository implements IQuestRepository {

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async fetchObjectivesForQuests(questIds: string[]): Promise<Map<string, QuestObjective[]>> {
    if (questIds.length === 0) return new Map();
    const rows = await db.select().from(questObjectivesTable).where(inArray(questObjectivesTable.questId, questIds));
    const map = new Map<string, QuestObjective[]>();
    for (const r of rows) {
      const obj = toObjective(r);
      const list = map.get(obj.questId) ?? [];
      list.push(obj);
      map.set(obj.questId, list);
    }
    return map;
  }

  private async fetchProgressForUserQuests(userQuestIds: string[]): Promise<Map<string, UserQuestProgress[]>> {
    if (userQuestIds.length === 0) return new Map();
    const rows = await db.select().from(userQuestProgressTable).where(inArray(userQuestProgressTable.userQuestId, userQuestIds));
    const map = new Map<string, UserQuestProgress[]>();
    for (const r of rows) {
      const p = toProgress(r);
      const list = map.get(p.userQuestId) ?? [];
      list.push(p);
      map.set(p.userQuestId, list);
    }
    return map;
  }

  // ── Quest CRUD ────────────────────────────────────────────────────────────────

  async findAll(filter?: { type?: QuestType; status?: QuestStatus }): Promise<Quest[]> {
    let rows = await db.select().from(questsTable);
    if (filter?.type)   rows = rows.filter(r => r.type === filter.type);
    if (filter?.status) rows = rows.filter(r => r.status === filter.status);
    const questIds = rows.map(r => r.id);
    const objMap = await this.fetchObjectivesForQuests(questIds);
    return rows.map(r => toQuest(r, objMap.get(r.id) ?? []));
  }

  async findById(id: string): Promise<Quest | null> {
    const rows = await db.select().from(questsTable).where(eq(questsTable.id, id));
    if (rows.length === 0) return null;
    const objMap = await this.fetchObjectivesForQuests([id]);
    return toQuest(rows[0]!, objMap.get(id) ?? []);
  }

  async create(input: CreateQuestInput): Promise<Quest> {
    const id = crypto.randomUUID();
    const now = new Date();
    await db.insert(questsTable).values({
      id,
      title:            input.title,
      description:      input.description,
      type:             input.type,
      status:           "ACTIVE",
      difficulty:       input.difficulty,
      requiredLevel:    input.requiredLevel ?? 0,
      repeatable:       input.repeatable ?? false,
      startAt:          input.startAt ? new Date(input.startAt) : null,
      endAt:            input.endAt ? new Date(input.endAt) : null,
      rewardCredits:    input.rewardCredits ?? 0,
      rewardCoins:      input.rewardCoins ?? 0,
      rewardTokens:     input.rewardTokens ?? 0,
      rewardReputation: input.rewardReputation ?? 0,
      metadata:         input.metadata ?? null,
      createdAt:        now,
      updatedAt:        now,
    });

    const objectives: QuestObjective[] = [];
    for (const obj of input.objectives) {
      const objId = crypto.randomUUID();
      await db.insert(questObjectivesTable).values({
        id:          objId,
        questId:     id,
        type:        obj.type,
        description: obj.description,
        targetCount: obj.targetCount,
        metadata:    obj.metadata ?? null,
        orderIndex:  obj.orderIndex,
      });
      objectives.push({ id: objId, questId: id, ...obj });
    }

    const quest = await this.findById(id);
    return quest!;
  }

  // ── User Quest ────────────────────────────────────────────────────────────────

  async findUserQuestsByUserId(userId: string): Promise<UserQuest[]> {
    const rows = await db.select().from(userQuestsTable).where(eq(userQuestsTable.userId, userId));
    if (rows.length === 0) return [];
    const ids = rows.map(r => r.id);
    const progressMap = await this.fetchProgressForUserQuests(ids);
    return rows.map(r => toUserQuest(r, progressMap.get(r.id) ?? []));
  }

  async findUserQuestsByUserIdAndStatus(userId: string, statuses: UserQuestStatus[]): Promise<UserQuest[]> {
    const rows = await db.select().from(userQuestsTable).where(
      and(
        eq(userQuestsTable.userId, userId),
        inArray(userQuestsTable.status, statuses),
      )
    );
    if (rows.length === 0) return [];
    const ids = rows.map(r => r.id);
    const progressMap = await this.fetchProgressForUserQuests(ids);
    return rows.map(r => toUserQuest(r, progressMap.get(r.id) ?? []));
  }

  async findUserQuestById(id: string): Promise<UserQuest | null> {
    const rows = await db.select().from(userQuestsTable).where(eq(userQuestsTable.id, id));
    if (rows.length === 0) return null;
    const progressMap = await this.fetchProgressForUserQuests([id]);
    return toUserQuest(rows[0]!, progressMap.get(id) ?? []);
  }

  async findUserQuestByUserAndQuest(userId: string, questId: string): Promise<UserQuest | null> {
    const rows = await db.select().from(userQuestsTable).where(
      and(eq(userQuestsTable.userId, userId), eq(userQuestsTable.questId, questId))
    );
    if (rows.length === 0) return null;
    const id = rows[0]!.id;
    const progressMap = await this.fetchProgressForUserQuests([id]);
    return toUserQuest(rows[0]!, progressMap.get(id) ?? []);
  }

  async createUserQuest(userId: string, questId: string): Promise<UserQuest> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(userQuestsTable).values({
      id,
      userId,
      questId,
      status:    "IN_PROGRESS",
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const objectives = await db.select().from(questObjectivesTable).where(eq(questObjectivesTable.questId, questId));
    for (const obj of objectives) {
      await db.insert(userQuestProgressTable).values({
        id:           crypto.randomUUID(),
        userQuestId:  id,
        objectiveId:  obj.id,
        currentCount: 0,
        completed:    false,
        updatedAt:    now,
      });
    }

    const uq = await this.findUserQuestById(id);
    return uq!;
  }

  async updateUserQuestStatus(
    id: string,
    status: UserQuestStatus,
    extra?: { completedAt?: string; claimedAt?: string },
  ): Promise<UserQuest | null> {
    const now = new Date();
    await db.update(userQuestsTable)
      .set({
        status,
        completedAt: extra?.completedAt ? new Date(extra.completedAt) : undefined,
        claimedAt:   extra?.claimedAt   ? new Date(extra.claimedAt)   : undefined,
        updatedAt:   now,
      })
      .where(eq(userQuestsTable.id, id));
    return this.findUserQuestById(id);
  }

  // ── Progress ──────────────────────────────────────────────────────────────────

  async incrementProgress(userQuestId: string, objectiveId: string, amount = 1): Promise<UserQuestProgress | null> {
    const rows = await db.select().from(userQuestProgressTable).where(
      and(
        eq(userQuestProgressTable.userQuestId, userQuestId),
        eq(userQuestProgressTable.objectiveId, objectiveId),
      )
    );
    if (rows.length === 0) return null;
    const row = rows[0]!;
    if (row.completed) return toProgress(row);

    const objRows = await db.select().from(questObjectivesTable).where(eq(questObjectivesTable.id, objectiveId));
    const target = objRows[0]?.targetCount ?? 1;
    const newCount = Math.min(row.currentCount + amount, target);
    const completed = newCount >= target;

    const now = new Date();
    await db.update(userQuestProgressTable)
      .set({ currentCount: newCount, completed, updatedAt: now })
      .where(eq(userQuestProgressTable.id, row.id));

    return { ...toProgress(row), currentCount: newCount, completed, updatedAt: now.toISOString() };
  }

  async setProgressCompleted(userQuestId: string, objectiveId: string): Promise<UserQuestProgress | null> {
    const rows = await db.select().from(userQuestProgressTable).where(
      and(
        eq(userQuestProgressTable.userQuestId, userQuestId),
        eq(userQuestProgressTable.objectiveId, objectiveId),
      )
    );
    if (rows.length === 0) return null;
    const now = new Date();
    const objRows = await db.select().from(questObjectivesTable).where(eq(questObjectivesTable.id, objectiveId));
    const target = objRows[0]?.targetCount ?? 1;
    await db.update(userQuestProgressTable)
      .set({ currentCount: target, completed: true, updatedAt: now })
      .where(eq(userQuestProgressTable.id, rows[0]!.id));
    return { ...toProgress(rows[0]!), currentCount: target, completed: true, updatedAt: now.toISOString() };
  }
}
