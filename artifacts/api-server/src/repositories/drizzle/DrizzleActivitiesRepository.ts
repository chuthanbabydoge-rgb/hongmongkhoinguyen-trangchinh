import { eq, and, desc } from "drizzle-orm";
import { db, activitiesTable } from "@workspace/db";
import type { IActivitiesRepository, Activity, ActivityType, CreateActivityInput } from "../activitiesRepository";

function rowToActivity(row: typeof activitiesTable.$inferSelect): Activity {
  return {
    id:          row.id,
    userId:      row.userId,
    type:        row.type as ActivityType,
    title:       row.title,
    description: row.description,
    metadata:    row.metadata ?? null,
    sourceApp:   row.sourceApp,
    createdAt:   row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

export class DrizzleActivitiesRepository implements IActivitiesRepository {
  async getByUserId(userId: string, type?: ActivityType, limit = 50): Promise<Activity[]> {
    const conditions = [eq(activitiesTable.userId, userId)];
    if (type) conditions.push(eq(activitiesTable.type, type));

    const rows = await db
      .select()
      .from(activitiesTable)
      .where(and(...conditions))
      .orderBy(desc(activitiesTable.createdAt))
      .limit(limit);

    return rows.map(rowToActivity);
  }

  async create(input: CreateActivityInput): Promise<Activity> {
    const [inserted] = await db
      .insert(activitiesTable)
      .values({
        id:          crypto.randomUUID(),
        userId:      input.userId,
        type:        input.type,
        title:       input.title,
        description: input.description,
        metadata:    (input.metadata ?? null) as Record<string, unknown> | null,
        sourceApp:   input.sourceApp ?? "universe-hub",
      })
      .returning();
    return rowToActivity(inserted!);
  }
}
