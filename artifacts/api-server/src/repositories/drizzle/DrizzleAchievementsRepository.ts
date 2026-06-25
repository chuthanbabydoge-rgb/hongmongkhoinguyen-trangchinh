import { eq, and, count } from "drizzle-orm";
import { db, hubAchievementsTable, userAchievementsTable, reputationEventsTable } from "@workspace/db";
import type {
  IAchievementsRepository,
  Achievement,
  UserAchievement,
  AchievementKey,
} from "../achievementsRepository";
import { STARTER_ACHIEVEMENTS } from "../achievementsRepository";

function rowToAch(row: typeof hubAchievementsTable.$inferSelect): Achievement {
  return {
    id:          row.id,
    key:         row.key as AchievementKey,
    title:       row.title,
    description: row.description,
    icon:        row.icon,
    criteria:    row.criteria ?? null,
  };
}

function rowToUserAch(
  row: typeof userAchievementsTable.$inferSelect,
  ach?: Achievement,
): UserAchievement {
  return {
    id:             row.id,
    userId:         row.userId,
    achievementKey: row.achievementKey as AchievementKey,
    unlockedAt:     row.unlockedAt instanceof Date ? row.unlockedAt.toISOString() : String(row.unlockedAt),
    achievement:    ach,
  };
}

export class DrizzleAchievementsRepository implements IAchievementsRepository {
  private seeded = false;

  private async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    this.seeded = true;
    for (const ach of STARTER_ACHIEVEMENTS) {
      await db
        .insert(hubAchievementsTable)
        .values({
          id:          ach.id,
          key:         ach.key,
          title:       ach.title,
          description: ach.description,
          icon:        ach.icon,
          criteria:    (ach.criteria ?? null) as Record<string, unknown> | null,
        })
        .onConflictDoNothing();
    }
  }

  async getAllAchievements(): Promise<Achievement[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(hubAchievementsTable);
    return rows.map(rowToAch);
  }

  async getAchievement(key: AchievementKey): Promise<Achievement | null> {
    await this.ensureSeeded();
    const [row] = await db.select().from(hubAchievementsTable).where(eq(hubAchievementsTable.key, key)).limit(1);
    return row ? rowToAch(row) : null;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(userAchievementsTable).where(eq(userAchievementsTable.userId, userId));
    const allAchs = await this.getAllAchievements();
    const achMap = new Map(allAchs.map(a => [a.key, a]));
    return rows.map(r => rowToUserAch(r, achMap.get(r.achievementKey as AchievementKey)));
  }

  async hasAchievement(userId: string, key: AchievementKey): Promise<boolean> {
    const [row] = await db
      .select()
      .from(userAchievementsTable)
      .where(and(eq(userAchievementsTable.userId, userId), eq(userAchievementsTable.achievementKey, key)))
      .limit(1);
    return !!row;
  }

  async unlock(userId: string, key: AchievementKey): Promise<UserAchievement> {
    const ach = await this.getAchievement(key);
    const [row] = await db
      .insert(userAchievementsTable)
      .values({
        id:             crypto.randomUUID(),
        userId,
        achievementKey: key,
        unlockedAt:     new Date(),
      })
      .onConflictDoNothing()
      .returning();

    if (!row) {
      const [existing] = await db
        .select()
        .from(userAchievementsTable)
        .where(and(eq(userAchievementsTable.userId, userId), eq(userAchievementsTable.achievementKey, key)))
        .limit(1);
      return rowToUserAch(existing!, ach ?? undefined);
    }
    return rowToUserAch(row, ach ?? undefined);
  }

  async countUserEvents(userId: string, eventType: string): Promise<number> {
    const [result] = await db
      .select({ cnt: count() })
      .from(reputationEventsTable)
      .where(
        and(
          eq(reputationEventsTable.userId, userId),
          eq(reputationEventsTable.eventType, eventType as typeof reputationEventsTable.eventType._.data),
        ),
      );
    return result?.cnt ?? 0;
  }
}
