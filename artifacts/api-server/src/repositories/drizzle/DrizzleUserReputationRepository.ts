import { eq, desc, sql } from "drizzle-orm";
import { db, reputationEventsTable, userReputationTable } from "@workspace/db";
import type {
  IUserReputationRepository,
  UserReputation,
  ReputationEvent,
  ReputationEventType,
  CreateReputationEventInput,
} from "../userReputationRepository";
import { REPUTATION_RULES, resolveLevel } from "../userReputationRepository";

function rowToRep(row: typeof userReputationTable.$inferSelect): UserReputation {
  return {
    userId:      row.userId,
    totalPoints: row.totalPoints,
    level:       row.level,
    updatedAt:   row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

function rowToEvent(row: typeof reputationEventsTable.$inferSelect): ReputationEvent {
  return {
    id:        row.id,
    userId:    row.userId,
    eventType: row.eventType as ReputationEventType,
    points:    row.points,
    metadata:  row.metadata ?? null,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

export class DrizzleUserReputationRepository implements IUserReputationRepository {
  async getByUserId(userId: string): Promise<UserReputation | null> {
    const [row] = await db.select().from(userReputationTable).where(eq(userReputationTable.userId, userId)).limit(1);
    return row ? rowToRep(row) : null;
  }

  async upsert(userId: string, deltaPoints: number): Promise<UserReputation> {
    const existing = await this.getByUserId(userId);
    const totalPoints = (existing?.totalPoints ?? 0) + deltaPoints;
    const level = resolveLevel(totalPoints);

    const [row] = await db
      .insert(userReputationTable)
      .values({ userId, totalPoints, level, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: userReputationTable.userId,
        set: {
          totalPoints: sql`${userReputationTable.totalPoints} + ${deltaPoints}`,
          level:       level,
          updatedAt:   new Date(),
        },
      })
      .returning();

    return rowToRep(row!);
  }

  async getLeaderboard(limit: number): Promise<Array<UserReputation & { rank: number }>> {
    const rows = await db
      .select()
      .from(userReputationTable)
      .orderBy(desc(userReputationTable.totalPoints))
      .limit(limit);

    return rows.map((r, i) => ({ ...rowToRep(r), rank: i + 1 }));
  }

  async addEvent(input: CreateReputationEventInput): Promise<ReputationEvent> {
    const points = REPUTATION_RULES[input.eventType];
    const [row] = await db
      .insert(reputationEventsTable)
      .values({
        id:        crypto.randomUUID(),
        userId:    input.userId,
        eventType: input.eventType,
        points,
        metadata:  (input.metadata ?? null) as Record<string, unknown> | null,
      })
      .returning();
    return rowToEvent(row!);
  }

  async getEvents(userId: string, limit: number): Promise<ReputationEvent[]> {
    const rows = await db
      .select()
      .from(reputationEventsTable)
      .where(eq(reputationEventsTable.userId, userId))
      .orderBy(desc(reputationEventsTable.createdAt))
      .limit(limit);
    return rows.map(rowToEvent);
  }
}
