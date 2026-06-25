import { eq, and, desc, sql } from "drizzle-orm";
import { db, userAppsTable } from "@workspace/db";
import type { IUserAppRepository } from "../applicationRegistryRepository";
import type { UserApplication } from "../../models/application";

function rowToUserApp(row: typeof userAppsTable.$inferSelect): UserApplication {
  return {
    id:             row.id,
    userId:         row.userId,
    applicationId:  row.applicationId,
    installedAt:    typeof row.installedAt === "string" ? row.installedAt : new Date(row.installedAt!).toISOString(),
    lastOpenedAt:   row.lastOpenedAt ? (typeof row.lastOpenedAt === "string" ? row.lastOpenedAt : new Date(row.lastOpenedAt).toISOString()) : undefined,
  };
}

export class DrizzleUserAppRepository implements IUserAppRepository {
  async install(userApp: UserApplication): Promise<UserApplication> {
    const [inserted] = await db
      .insert(userAppsTable)
      .values({
        id:            userApp.id,
        userId:        userApp.userId,
        applicationId: userApp.applicationId,
        installedAt:   userApp.installedAt ?? new Date().toISOString(),
        lastOpenedAt:  userApp.lastOpenedAt ?? null,
      })
      .onConflictDoNothing()
      .returning();
    if (!inserted) {
      const rows = await db.select().from(userAppsTable).where(and(eq(userAppsTable.userId, userApp.userId), eq(userAppsTable.applicationId, userApp.applicationId))).limit(1);
      return rowToUserApp(rows[0]!);
    }
    return rowToUserApp(inserted);
  }

  async uninstall(userId: string, applicationId: string): Promise<boolean> {
    const result = await db
      .delete(userAppsTable)
      .where(and(eq(userAppsTable.userId, userId), eq(userAppsTable.applicationId, applicationId)))
      .returning();
    return result.length > 0;
  }

  async findByUserId(userId: string): Promise<UserApplication[]> {
    const rows = await db.select().from(userAppsTable).where(eq(userAppsTable.userId, userId)).orderBy(desc(userAppsTable.installedAt));
    return rows.map(rowToUserApp);
  }

  async findOne(userId: string, applicationId: string): Promise<UserApplication | null> {
    const rows = await db
      .select()
      .from(userAppsTable)
      .where(and(eq(userAppsTable.userId, userId), eq(userAppsTable.applicationId, applicationId)))
      .limit(1);
    return rows[0] ? rowToUserApp(rows[0]) : null;
  }

  async updateLastOpened(userId: string, applicationId: string, at: string): Promise<UserApplication | null> {
    const [updated] = await db
      .update(userAppsTable)
      .set({ lastOpenedAt: at })
      .where(and(eq(userAppsTable.userId, userId), eq(userAppsTable.applicationId, applicationId)))
      .returning();
    return updated ? rowToUserApp(updated) : null;
  }

  async isInstalled(userId: string, applicationId: string): Promise<boolean> {
    const rows = await db
      .select({ id: userAppsTable.id })
      .from(userAppsTable)
      .where(and(eq(userAppsTable.userId, userId), eq(userAppsTable.applicationId, applicationId)))
      .limit(1);
    return rows.length > 0;
  }

  async countByApplicationId(applicationId: string): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userAppsTable)
      .where(eq(userAppsTable.applicationId, applicationId));
    return row?.count ?? 0;
  }
}
