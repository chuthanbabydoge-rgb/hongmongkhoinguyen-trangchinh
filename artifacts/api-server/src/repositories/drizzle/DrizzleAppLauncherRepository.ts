import { eq, desc, sql } from "drizzle-orm";
import { db, appLaunchesTable } from "@workspace/db";
import type { IAppLauncherRepository } from "../appLauncherRepository";
import type { LaunchRecord } from "../../models/appLauncher";

function rowToRecord(row: typeof appLaunchesTable.$inferSelect): LaunchRecord {
  return {
    id:           row.id,
    userId:       row.userId,
    appSlug:      row.appSlug,
    launchedAt:   typeof row.launchedAt === "string" ? row.launchedAt : new Date(row.launchedAt).toISOString(),
    launchSource: row.launchSource,
    sessionId:    row.sessionId ?? undefined,
    metadata:     (row.metadata as Record<string, unknown>) ?? undefined,
  };
}

export class DrizzleAppLauncherRepository implements IAppLauncherRepository {
  async recordLaunch(record: LaunchRecord): Promise<LaunchRecord> {
    const [inserted] = await db
      .insert(appLaunchesTable)
      .values({
        id:           record.id,
        userId:       record.userId,
        appSlug:      record.appSlug,
        launchedAt:   record.launchedAt,
        launchSource: record.launchSource,
        sessionId:    record.sessionId ?? null,
        metadata:     record.metadata ?? null,
      })
      .returning();
    return rowToRecord(inserted!);
  }

  async getRecentLaunches(userId: string, limit = 10): Promise<LaunchRecord[]> {
    const rows = await db
      .select()
      .from(appLaunchesTable)
      .where(eq(appLaunchesTable.userId, userId))
      .orderBy(desc(appLaunchesTable.launchedAt))
      .limit(limit);
    return rows.map(rowToRecord);
  }

  async countLaunches(userId: string): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(appLaunchesTable)
      .where(eq(appLaunchesTable.userId, userId));
    return row?.count ?? 0;
  }

  async getMostUsedApps(userId: string, limit = 5): Promise<{ appSlug: string; count: number }[]> {
    const rows = await db
      .select({
        appSlug: appLaunchesTable.appSlug,
        count:   sql<number>`count(*)::int`,
      })
      .from(appLaunchesTable)
      .where(eq(appLaunchesTable.userId, userId))
      .groupBy(appLaunchesTable.appSlug)
      .orderBy(sql`count(*) desc`)
      .limit(limit);
    return rows.map(r => ({ appSlug: r.appSlug, count: r.count }));
  }

  async deleteLaunchHistory(userId: string): Promise<boolean> {
    const result = await db.delete(appLaunchesTable).where(eq(appLaunchesTable.userId, userId)).returning();
    return result.length > 0;
  }

  async hasLaunchedApp(userId: string, appSlug: string): Promise<boolean> {
    const rows = await db
      .select({ id: appLaunchesTable.id })
      .from(appLaunchesTable)
      .where(eq(appLaunchesTable.userId, userId))
      .limit(1);
    return rows.some(r => r.id);
  }
}
