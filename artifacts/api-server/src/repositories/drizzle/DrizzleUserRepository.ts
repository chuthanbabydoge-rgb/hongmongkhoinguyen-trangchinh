import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import type { IUserRepository } from "../userRepository";
import type { User } from "../../models/user";

function rowToUser(row: typeof usersTable.$inferSelect): User {
  return {
    id:              row.id,
    username:        row.username,
    title:           row.title,
    status:          row.status as User["status"],
    level:           row.level,
    xp:              row.xp,
    maxXp:           row.maxXp,
    progressPercent: row.progressPercent,
    joinedAt:        typeof row.joinedAt === "string" ? row.joinedAt : new Date(row.joinedAt).toISOString(),
    createdAt:       typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
    updatedAt:       typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt).toISOString(),
  };
}

export class DrizzleUserRepository implements IUserRepository {
  async getById(id: string): Promise<User | null> {
    const rows = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return rows[0] ? rowToUser(rows[0]) : null;
  }

  async getAll(): Promise<User[]> {
    const rows = await db.select().from(usersTable);
    return rows.map(rowToUser);
  }

  async create(user: User): Promise<User> {
    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(usersTable)
      .values({
        id:              user.id,
        username:        user.username,
        title:           user.title,
        status:          user.status,
        level:           user.level,
        xp:              user.xp,
        maxXp:           user.maxXp,
        progressPercent: user.progressPercent,
        joinedAt:        user.joinedAt ?? now,
        createdAt:       now,
        updatedAt:       now,
      })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          username:        user.username,
          title:           user.title,
          status:          user.status,
          level:           user.level,
          xp:              user.xp,
          maxXp:           user.maxXp,
          progressPercent: user.progressPercent,
          updatedAt:       now,
        },
      })
      .returning();
    return rowToUser(inserted!);
  }

  async update(user: User): Promise<User | null> {
    const [updated] = await db
      .update(usersTable)
      .set({
        username:        user.username,
        title:           user.title,
        status:          user.status,
        level:           user.level,
        xp:              user.xp,
        maxXp:           user.maxXp,
        progressPercent: user.progressPercent,
        updatedAt:       new Date().toISOString(),
      })
      .where(eq(usersTable.id, user.id))
      .returning();
    return updated ? rowToUser(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
    return result.length > 0;
  }
}
