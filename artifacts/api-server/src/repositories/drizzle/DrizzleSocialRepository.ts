import { eq, and, inArray, ilike, or } from "drizzle-orm";
import { db, socialRelationshipsTable, friendRequestsTable, userPresenceTable, userProfilesPublicTable } from "@workspace/db";
import type {
  ISocialRepository,
  SocialRelationship,
  FriendRequest,
  UserPresence,
  PublicProfile,
  RelationshipType,
  FriendRequestStatus,
  PresenceStatus,
} from "../socialRepository.js";

// ── row mappers ───────────────────────────────────────────────────────────────

function toRelationship(row: typeof socialRelationshipsTable.$inferSelect): SocialRelationship {
  return {
    userId:    row.userId,
    targetId:  row.targetId,
    type:      row.type as RelationshipType,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

function toFriendRequest(row: typeof friendRequestsTable.$inferSelect): FriendRequest {
  return {
    id:         row.id,
    fromUserId: row.fromUserId,
    toUserId:   row.toUserId,
    status:     row.status as FriendRequestStatus,
    createdAt:  row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt:  row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

function toPresence(row: typeof userPresenceTable.$inferSelect): UserPresence {
  return {
    userId:     row.userId,
    status:     row.status as PresenceStatus,
    lastSeenAt: row.lastSeenAt instanceof Date ? row.lastSeenAt.toISOString() : String(row.lastSeenAt),
    updatedAt:  row.updatedAt  instanceof Date ? row.updatedAt.toISOString()  : String(row.updatedAt),
  };
}

function toProfile(row: typeof userProfilesPublicTable.$inferSelect): PublicProfile {
  return {
    userId:      row.userId,
    displayName: row.displayName,
    avatarUrl:   row.avatarUrl ?? null,
    updatedAt:   row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

// ── Repository ────────────────────────────────────────────────────────────────

export class DrizzleSocialRepository implements ISocialRepository {
  // ── Friend requests ──────────────────────────────────────────────────────────

  async createFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    const now = new Date();
    const [row] = await db
      .insert(friendRequestsTable)
      .values({ id: crypto.randomUUID(), fromUserId, toUserId, status: "PENDING", createdAt: now, updatedAt: now })
      .returning();
    return toFriendRequest(row!);
  }

  async getFriendRequestById(id: string): Promise<FriendRequest | null> {
    const [row] = await db.select().from(friendRequestsTable).where(eq(friendRequestsTable.id, id));
    return row ? toFriendRequest(row) : null;
  }

  async getPendingIncomingRequests(toUserId: string): Promise<FriendRequest[]> {
    const rows = await db
      .select()
      .from(friendRequestsTable)
      .where(and(eq(friendRequestsTable.toUserId, toUserId), eq(friendRequestsTable.status, "PENDING")));
    return rows.map(toFriendRequest);
  }

  async getPendingSentRequests(fromUserId: string): Promise<FriendRequest[]> {
    const rows = await db
      .select()
      .from(friendRequestsTable)
      .where(and(eq(friendRequestsTable.fromUserId, fromUserId), eq(friendRequestsTable.status, "PENDING")));
    return rows.map(toFriendRequest);
  }

  async updateFriendRequestStatus(id: string, status: FriendRequestStatus): Promise<FriendRequest | null> {
    const [row] = await db
      .update(friendRequestsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(friendRequestsTable.id, id))
      .returning();
    return row ? toFriendRequest(row) : null;
  }

  async hasPendingRequest(fromUserId: string, toUserId: string): Promise<boolean> {
    const [row] = await db
      .select()
      .from(friendRequestsTable)
      .where(and(
        eq(friendRequestsTable.fromUserId, fromUserId),
        eq(friendRequestsTable.toUserId, toUserId),
        eq(friendRequestsTable.status, "PENDING"),
      ));
    return Boolean(row);
  }

  // ── Relationships ────────────────────────────────────────────────────────────

  async createRelationship(userId: string, targetId: string, type: RelationshipType): Promise<SocialRelationship> {
    const [row] = await db
      .insert(socialRelationshipsTable)
      .values({ userId, targetId, type })
      .onConflictDoNothing()
      .returning();
    if (row) return toRelationship(row);
    const [existing] = await db
      .select()
      .from(socialRelationshipsTable)
      .where(and(
        eq(socialRelationshipsTable.userId, userId),
        eq(socialRelationshipsTable.targetId, targetId),
        eq(socialRelationshipsTable.type, type),
      ));
    return toRelationship(existing!);
  }

  async deleteRelationship(userId: string, targetId: string, type: RelationshipType): Promise<boolean> {
    const result = await db
      .delete(socialRelationshipsTable)
      .where(and(
        eq(socialRelationshipsTable.userId, userId),
        eq(socialRelationshipsTable.targetId, targetId),
        eq(socialRelationshipsTable.type, type),
      ))
      .returning();
    return result.length > 0;
  }

  async hasRelationship(userId: string, targetId: string, type: RelationshipType): Promise<boolean> {
    const [row] = await db
      .select()
      .from(socialRelationshipsTable)
      .where(and(
        eq(socialRelationshipsTable.userId, userId),
        eq(socialRelationshipsTable.targetId, targetId),
        eq(socialRelationshipsTable.type, type),
      ));
    return Boolean(row);
  }

  async getRelationships(userId: string, type: RelationshipType): Promise<SocialRelationship[]> {
    const rows = await db
      .select()
      .from(socialRelationshipsTable)
      .where(and(eq(socialRelationshipsTable.userId, userId), eq(socialRelationshipsTable.type, type)));
    return rows.map(toRelationship);
  }

  async getIncomingRelationships(targetId: string, type: RelationshipType): Promise<SocialRelationship[]> {
    const rows = await db
      .select()
      .from(socialRelationshipsTable)
      .where(and(eq(socialRelationshipsTable.targetId, targetId), eq(socialRelationshipsTable.type, type)));
    return rows.map(toRelationship);
  }

  async countRelationships(userId: string, type: RelationshipType): Promise<number> {
    const rows = await db
      .select()
      .from(socialRelationshipsTable)
      .where(and(eq(socialRelationshipsTable.userId, userId), eq(socialRelationshipsTable.type, type)));
    return rows.length;
  }

  async countIncomingRelationships(targetId: string, type: RelationshipType): Promise<number> {
    const rows = await db
      .select()
      .from(socialRelationshipsTable)
      .where(and(eq(socialRelationshipsTable.targetId, targetId), eq(socialRelationshipsTable.type, type)));
    return rows.length;
  }

  // ── Presence ─────────────────────────────────────────────────────────────────

  async setPresence(userId: string, status: PresenceStatus): Promise<UserPresence> {
    const now = new Date();
    const [row] = await db
      .insert(userPresenceTable)
      .values({ userId, status, lastSeenAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: userPresenceTable.userId,
        set: { status, lastSeenAt: now, updatedAt: now },
      })
      .returning();
    return toPresence(row!);
  }

  async getPresence(userId: string): Promise<UserPresence | null> {
    const [row] = await db.select().from(userPresenceTable).where(eq(userPresenceTable.userId, userId));
    return row ? toPresence(row) : null;
  }

  async getPresenceForUsers(userIds: string[]): Promise<UserPresence[]> {
    if (!userIds.length) return [];
    const rows = await db.select().from(userPresenceTable).where(inArray(userPresenceTable.userId, userIds));
    return rows.map(toPresence);
  }

  // ── Public profiles ──────────────────────────────────────────────────────────

  async setPublicProfile(userId: string, data: Partial<Pick<PublicProfile, "displayName" | "avatarUrl">>): Promise<PublicProfile> {
    const now = new Date();
    const [row] = await db
      .insert(userProfilesPublicTable)
      .values({
        userId,
        displayName: data.displayName ?? "",
        avatarUrl:   data.avatarUrl   ?? null,
        updatedAt:   now,
      })
      .onConflictDoUpdate({
        target: userProfilesPublicTable.userId,
        set: {
          ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
          ...(data.avatarUrl   !== undefined ? { avatarUrl:   data.avatarUrl   } : {}),
          updatedAt: now,
        },
      })
      .returning();
    return toProfile(row!);
  }

  async getPublicProfile(userId: string): Promise<PublicProfile | null> {
    const [row] = await db.select().from(userProfilesPublicTable).where(eq(userProfilesPublicTable.userId, userId));
    return row ? toProfile(row) : null;
  }

  async searchPublicProfiles(query: string, limit = 20): Promise<PublicProfile[]> {
    const rows = await db
      .select()
      .from(userProfilesPublicTable)
      .where(
        or(
          ilike(userProfilesPublicTable.displayName, `%${query}%`),
          ilike(userProfilesPublicTable.userId, `%${query}%`),
        ),
      )
      .limit(limit);
    return rows.map(toProfile);
  }
}
