import { eq } from "drizzle-orm";
import { db, avatarsTable } from "@workspace/db";
import type { IAvatarRepository } from "../avatarRepository";
import type { Avatar } from "../../models/user";

function rowToAvatar(row: typeof avatarsTable.$inferSelect): Avatar {
  return {
    userId:     row.userId,
    initials:   row.initials,
    imageUrl:   row.imageUrl ?? null,
    frameColor: row.frameColor,
    badgeIcon:  row.badgeIcon ?? null,
    updatedAt:  typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt).toISOString(),
  };
}

export class DrizzleAvatarRepository implements IAvatarRepository {
  async getByUserId(userId: string): Promise<Avatar | null> {
    const rows = await db.select().from(avatarsTable).where(eq(avatarsTable.userId, userId)).limit(1);
    return rows[0] ? rowToAvatar(rows[0]) : null;
  }

  async create(avatar: Avatar): Promise<Avatar> {
    const [inserted] = await db
      .insert(avatarsTable)
      .values({
        userId:     avatar.userId,
        initials:   avatar.initials,
        imageUrl:   avatar.imageUrl ?? null,
        frameColor: avatar.frameColor,
        badgeIcon:  avatar.badgeIcon ?? null,
        updatedAt:  new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: avatarsTable.userId,
        set: {
          initials:   avatar.initials,
          imageUrl:   avatar.imageUrl ?? null,
          frameColor: avatar.frameColor,
          badgeIcon:  avatar.badgeIcon ?? null,
          updatedAt:  new Date().toISOString(),
        },
      })
      .returning();
    return rowToAvatar(inserted!);
  }

  async update(avatar: Avatar): Promise<Avatar | null> {
    const [updated] = await db
      .update(avatarsTable)
      .set({
        initials:   avatar.initials,
        imageUrl:   avatar.imageUrl ?? null,
        frameColor: avatar.frameColor,
        badgeIcon:  avatar.badgeIcon ?? null,
        updatedAt:  new Date().toISOString(),
      })
      .where(eq(avatarsTable.userId, avatar.userId))
      .returning();
    return updated ? rowToAvatar(updated) : null;
  }

  async delete(userId: string): Promise<boolean> {
    const result = await db.delete(avatarsTable).where(eq(avatarsTable.userId, userId)).returning();
    return result.length > 0;
  }
}
