import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import {
  db,
  guildsTable,
  guildMembersTable,
  guildJoinRequestsTable,
  guildInvitesTable,
  guildAnnouncementsTable,
  guildLogsTable,
  guildContributionsTable,
  guildEventsTable,
  guildEventParticipantsTable,
  guildWarehouseItemsTable,
  guildTreasuryTransactionsTable,
} from "@workspace/db";
import type {
  IGuildRepository,
  Guild,
  GuildMember,
  GuildJoinRequest,
  GuildInvite,
  GuildAnnouncement,
  GuildLog,
  GuildContribution,
  GuildEvent,
  GuildEventParticipant,
  GuildWarehouseItem,
  GuildTreasuryTransaction,
  GuildRole,
  GuildVisibility,
  JoinRequestStatus,
  GuildInviteStatus,
  CreateGuildInput,
  UpdateGuildInput,
} from "../guildRepository.js";

function ts(v: Date | string | null | undefined): string {
  if (!v) return new Date().toISOString();
  return v instanceof Date ? v.toISOString() : String(v);
}

function toGuild(r: typeof guildsTable.$inferSelect): Guild {
  return {
    id:              r.id,
    name:            r.name,
    tag:             r.tag,
    description:     r.description ?? null,
    avatar:          r.avatar ?? null,
    banner:          r.banner ?? null,
    ownerId:         r.ownerId,
    memberLimit:     r.memberLimit,
    level:           r.level,
    xp:              r.xp,
    treasuryCredits: r.treasuryCredits,
    treasuryCoins:   r.treasuryCoins,
    reputation:      r.reputation,
    visibility:      r.visibility as GuildVisibility,
    createdAt:       ts(r.createdAt),
    updatedAt:       ts(r.updatedAt),
  };
}

function toMember(r: typeof guildMembersTable.$inferSelect): GuildMember {
  return {
    guildId:      r.guildId,
    userId:       r.userId,
    role:         r.role as GuildRole,
    joinedAt:     ts(r.joinedAt),
    contribution: r.contribution,
    lastActive:   ts(r.lastActive),
  };
}

function toJoinRequest(r: typeof guildJoinRequestsTable.$inferSelect): GuildJoinRequest {
  return {
    id:        r.id,
    guildId:   r.guildId,
    userId:    r.userId,
    message:   r.message ?? null,
    status:    r.status as JoinRequestStatus,
    createdAt: ts(r.createdAt),
    updatedAt: ts(r.updatedAt),
  };
}

function toInvite(r: typeof guildInvitesTable.$inferSelect): GuildInvite {
  return {
    id:        r.id,
    guildId:   r.guildId,
    inviterId: r.inviterId,
    inviteeId: r.inviteeId,
    status:    r.status as GuildInviteStatus,
    createdAt: ts(r.createdAt),
    expiresAt: r.expiresAt ? ts(r.expiresAt) : null,
  };
}

function toAnnouncement(r: typeof guildAnnouncementsTable.$inferSelect): GuildAnnouncement {
  return {
    id:        r.id,
    guildId:   r.guildId,
    authorId:  r.authorId,
    title:     r.title,
    content:   r.content,
    isPinned:  r.isPinned,
    createdAt: ts(r.createdAt),
  };
}

function toLog(r: typeof guildLogsTable.$inferSelect): GuildLog {
  return {
    id:        r.id,
    guildId:   r.guildId,
    actorId:   r.actorId,
    action:    r.action as GuildLog["action"],
    targetId:  r.targetId ?? null,
    metadata:  r.metadata ?? null,
    createdAt: ts(r.createdAt),
  };
}

function toContribution(r: typeof guildContributionsTable.$inferSelect): GuildContribution {
  return {
    id:        r.id,
    guildId:   r.guildId,
    userId:    r.userId,
    type:      r.type as GuildContribution["type"],
    amount:    r.amount,
    itemId:    r.itemId ?? null,
    note:      r.note ?? null,
    createdAt: ts(r.createdAt),
  };
}

function toEvent(r: typeof guildEventsTable.$inferSelect): GuildEvent {
  return {
    id:              r.id,
    guildId:         r.guildId,
    creatorId:       r.creatorId,
    title:           r.title,
    description:     r.description ?? null,
    startAt:         ts(r.startAt),
    endAt:           r.endAt ? ts(r.endAt) : null,
    maxParticipants: r.maxParticipants ?? null,
    status:          r.status as GuildEvent["status"],
    rewardPoints:    r.rewardPoints,
    createdAt:       ts(r.createdAt),
  };
}

function toParticipant(r: typeof guildEventParticipantsTable.$inferSelect): GuildEventParticipant {
  return { eventId: r.eventId, userId: r.userId, joinedAt: ts(r.joinedAt) };
}

function toWarehouseItem(r: typeof guildWarehouseItemsTable.$inferSelect): GuildWarehouseItem {
  return {
    id:          r.id,
    guildId:     r.guildId,
    itemId:      r.itemId,
    itemName:    r.itemName,
    quantity:    r.quantity,
    depositedBy: r.depositedBy,
    depositedAt: ts(r.depositedAt),
  };
}

function toTreasuryTx(r: typeof guildTreasuryTransactionsTable.$inferSelect): GuildTreasuryTransaction {
  return {
    id:        r.id,
    guildId:   r.guildId,
    userId:    r.userId,
    type:      r.type,
    currency:  r.currency,
    amount:    r.amount,
    note:      r.note ?? null,
    createdAt: ts(r.createdAt),
  };
}

export class DrizzleGuildRepository implements IGuildRepository {

  // ── Guild CRUD ───────────────────────────────────────────────────────────────

  async createGuild(input: CreateGuildInput): Promise<Guild> {
    const now = new Date();
    const [row] = await db.insert(guildsTable).values({
      id:          crypto.randomUUID(),
      name:        input.name,
      tag:         input.tag.toUpperCase(),
      description: input.description ?? null,
      avatar:      input.avatar ?? null,
      banner:      input.banner ?? null,
      ownerId:     input.ownerId,
      memberLimit: input.memberLimit ?? 50,
      visibility:  (input.visibility ?? "PUBLIC") as any,
      createdAt:   now,
      updatedAt:   now,
    }).returning();
    return toGuild(row!);
  }

  async getGuildById(id: string): Promise<Guild | null> {
    const [row] = await db.select().from(guildsTable).where(eq(guildsTable.id, id));
    return row ? toGuild(row) : null;
  }

  async getGuildByTag(tag: string): Promise<Guild | null> {
    const [row] = await db.select().from(guildsTable).where(eq(guildsTable.tag, tag.toUpperCase()));
    return row ? toGuild(row) : null;
  }

  async listGuilds(options?: { search?: string; limit?: number; offset?: number }): Promise<Guild[]> {
    const limit  = options?.limit  ?? 50;
    const offset = options?.offset ?? 0;
    let q = db.select().from(guildsTable);
    if (options?.search) {
      const s = `%${options.search}%`;
      q = q.where(or(ilike(guildsTable.name, s), ilike(guildsTable.tag, s))) as typeof q;
    }
    const rows = await q.orderBy(desc(guildsTable.level)).limit(limit).offset(offset);
    return rows.map(toGuild);
  }

  async updateGuild(id: string, input: UpdateGuildInput): Promise<Guild | null> {
    const [row] = await db.update(guildsTable).set({ ...input, updatedAt: new Date() })
      .where(eq(guildsTable.id, id)).returning();
    return row ? toGuild(row) : null;
  }

  async deleteGuild(id: string): Promise<void> {
    await db.delete(guildsTable).where(eq(guildsTable.id, id));
  }

  async addXp(guildId: string, xp: number): Promise<Guild | null> {
    const [row] = await db.update(guildsTable)
      .set({ xp: sql`${guildsTable.xp} + ${xp}`, updatedAt: new Date() })
      .where(eq(guildsTable.id, guildId)).returning();
    return row ? toGuild(row) : null;
  }

  // ── Members ──────────────────────────────────────────────────────────────────

  async addMember(guildId: string, userId: string, role: GuildRole = "RECRUIT"): Promise<GuildMember> {
    const now = new Date();
    const [row] = await db.insert(guildMembersTable).values({
      guildId, userId, role: role as any, joinedAt: now, lastActive: now,
    }).onConflictDoUpdate({
      target: [guildMembersTable.guildId, guildMembersTable.userId],
      set: { role: role as any, lastActive: now },
    }).returning();
    return toMember(row!);
  }

  async getMember(guildId: string, userId: string): Promise<GuildMember | null> {
    const [row] = await db.select().from(guildMembersTable)
      .where(and(eq(guildMembersTable.guildId, guildId), eq(guildMembersTable.userId, userId)));
    return row ? toMember(row) : null;
  }

  async getMembers(guildId: string): Promise<GuildMember[]> {
    const rows = await db.select().from(guildMembersTable).where(eq(guildMembersTable.guildId, guildId));
    return rows.map(toMember);
  }

  async updateMemberRole(guildId: string, userId: string, role: GuildRole): Promise<GuildMember | null> {
    const [row] = await db.update(guildMembersTable)
      .set({ role: role as any })
      .where(and(eq(guildMembersTable.guildId, guildId), eq(guildMembersTable.userId, userId)))
      .returning();
    return row ? toMember(row) : null;
  }

  async removeMember(guildId: string, userId: string): Promise<void> {
    await db.delete(guildMembersTable)
      .where(and(eq(guildMembersTable.guildId, guildId), eq(guildMembersTable.userId, userId)));
  }

  async getMemberCount(guildId: string): Promise<number> {
    const [row] = await db.select({ count: sql<number>`count(*)` })
      .from(guildMembersTable).where(eq(guildMembersTable.guildId, guildId));
    return Number(row?.count ?? 0);
  }

  async addContributionPoints(guildId: string, userId: string, points: number): Promise<void> {
    await db.update(guildMembersTable)
      .set({ contribution: sql`${guildMembersTable.contribution} + ${points}`, lastActive: new Date() })
      .where(and(eq(guildMembersTable.guildId, guildId), eq(guildMembersTable.userId, userId)));
  }

  async updateLastActive(guildId: string, userId: string): Promise<void> {
    await db.update(guildMembersTable)
      .set({ lastActive: new Date() })
      .where(and(eq(guildMembersTable.guildId, guildId), eq(guildMembersTable.userId, userId)));
  }

  async getUserGuild(userId: string): Promise<{ guild: Guild; member: GuildMember } | null> {
    const [memberRow] = await db.select().from(guildMembersTable).where(eq(guildMembersTable.userId, userId));
    if (!memberRow) return null;
    const [guildRow] = await db.select().from(guildsTable).where(eq(guildsTable.id, memberRow.guildId));
    if (!guildRow) return null;
    return { guild: toGuild(guildRow), member: toMember(memberRow) };
  }

  // ── Join Requests ────────────────────────────────────────────────────────────

  async createJoinRequest(guildId: string, userId: string, message?: string): Promise<GuildJoinRequest> {
    const now = new Date();
    const [row] = await db.insert(guildJoinRequestsTable).values({
      id: crypto.randomUUID(), guildId, userId, message: message ?? null, createdAt: now, updatedAt: now,
    }).returning();
    return toJoinRequest(row!);
  }

  async getJoinRequest(id: string): Promise<GuildJoinRequest | null> {
    const [row] = await db.select().from(guildJoinRequestsTable).where(eq(guildJoinRequestsTable.id, id));
    return row ? toJoinRequest(row) : null;
  }

  async getPendingJoinRequests(guildId: string): Promise<GuildJoinRequest[]> {
    const rows = await db.select().from(guildJoinRequestsTable)
      .where(and(eq(guildJoinRequestsTable.guildId, guildId), eq(guildJoinRequestsTable.status, "PENDING")))
      .orderBy(desc(guildJoinRequestsTable.createdAt));
    return rows.map(toJoinRequest);
  }

  async hasActiveJoinRequest(guildId: string, userId: string): Promise<boolean> {
    const [row] = await db.select().from(guildJoinRequestsTable)
      .where(and(
        eq(guildJoinRequestsTable.guildId, guildId),
        eq(guildJoinRequestsTable.userId, userId),
        eq(guildJoinRequestsTable.status, "PENDING"),
      ));
    return !!row;
  }

  async updateJoinRequestStatus(id: string, status: JoinRequestStatus): Promise<GuildJoinRequest | null> {
    const [row] = await db.update(guildJoinRequestsTable)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(guildJoinRequestsTable.id, id)).returning();
    return row ? toJoinRequest(row) : null;
  }

  // ── Invites ──────────────────────────────────────────────────────────────────

  async createInvite(guildId: string, inviterId: string, inviteeId: string): Promise<GuildInvite> {
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [row] = await db.insert(guildInvitesTable).values({
      id: crypto.randomUUID(), guildId, inviterId, inviteeId, createdAt: now, expiresAt: expires,
    }).returning();
    return toInvite(row!);
  }

  async getInvite(id: string): Promise<GuildInvite | null> {
    const [row] = await db.select().from(guildInvitesTable).where(eq(guildInvitesTable.id, id));
    return row ? toInvite(row) : null;
  }

  async getPendingInvitesForUser(inviteeId: string): Promise<GuildInvite[]> {
    const rows = await db.select().from(guildInvitesTable)
      .where(and(eq(guildInvitesTable.inviteeId, inviteeId), eq(guildInvitesTable.status, "PENDING")))
      .orderBy(desc(guildInvitesTable.createdAt));
    return rows.map(toInvite);
  }

  async hasActiveInvite(guildId: string, inviteeId: string): Promise<boolean> {
    const [row] = await db.select().from(guildInvitesTable)
      .where(and(
        eq(guildInvitesTable.guildId, guildId),
        eq(guildInvitesTable.inviteeId, inviteeId),
        eq(guildInvitesTable.status, "PENDING"),
      ));
    return !!row;
  }

  async updateInviteStatus(id: string, status: GuildInviteStatus): Promise<GuildInvite | null> {
    const [row] = await db.update(guildInvitesTable)
      .set({ status: status as any })
      .where(eq(guildInvitesTable.id, id)).returning();
    return row ? toInvite(row) : null;
  }

  // ── Announcements ────────────────────────────────────────────────────────────

  async createAnnouncement(input: Omit<GuildAnnouncement, "id" | "createdAt">): Promise<GuildAnnouncement> {
    const [row] = await db.insert(guildAnnouncementsTable).values({
      id: crypto.randomUUID(), ...input, createdAt: new Date(),
    }).returning();
    return toAnnouncement(row!);
  }

  async getAnnouncements(guildId: string): Promise<GuildAnnouncement[]> {
    const rows = await db.select().from(guildAnnouncementsTable)
      .where(eq(guildAnnouncementsTable.guildId, guildId))
      .orderBy(desc(guildAnnouncementsTable.isPinned), desc(guildAnnouncementsTable.createdAt));
    return rows.map(toAnnouncement);
  }

  // ── Logs ─────────────────────────────────────────────────────────────────────

  async addLog(input: Omit<GuildLog, "id" | "createdAt">): Promise<GuildLog> {
    const [row] = await db.insert(guildLogsTable).values({
      id: crypto.randomUUID(), ...input, metadata: input.metadata as any, createdAt: new Date(),
    }).returning();
    return toLog(row!);
  }

  async getLogs(guildId: string, limit = 100): Promise<GuildLog[]> {
    const rows = await db.select().from(guildLogsTable)
      .where(eq(guildLogsTable.guildId, guildId))
      .orderBy(desc(guildLogsTable.createdAt)).limit(limit);
    return rows.map(toLog);
  }

  // ── Contributions ────────────────────────────────────────────────────────────

  async addContribution(input: Omit<GuildContribution, "id" | "createdAt">): Promise<GuildContribution> {
    const [row] = await db.insert(guildContributionsTable).values({
      id: crypto.randomUUID(), ...input, createdAt: new Date(),
    }).returning();
    return toContribution(row!);
  }

  async getContributions(guildId: string, limit = 50): Promise<GuildContribution[]> {
    const rows = await db.select().from(guildContributionsTable)
      .where(eq(guildContributionsTable.guildId, guildId))
      .orderBy(desc(guildContributionsTable.createdAt)).limit(limit);
    return rows.map(toContribution);
  }

  // ── Events ───────────────────────────────────────────────────────────────────

  async createEvent(input: Omit<GuildEvent, "id" | "createdAt">): Promise<GuildEvent> {
    const [row] = await db.insert(guildEventsTable).values({
      id: crypto.randomUUID(),
      guildId:         input.guildId,
      creatorId:       input.creatorId,
      title:           input.title,
      description:     input.description ?? null,
      startAt:         new Date(input.startAt),
      endAt:           input.endAt ? new Date(input.endAt) : null,
      maxParticipants: input.maxParticipants ?? null,
      status:          (input.status ?? "UPCOMING") as any,
      rewardPoints:    input.rewardPoints ?? 0,
      createdAt:       new Date(),
    }).returning();
    return toEvent(row!);
  }

  async getEvents(guildId: string): Promise<GuildEvent[]> {
    const rows = await db.select().from(guildEventsTable)
      .where(eq(guildEventsTable.guildId, guildId))
      .orderBy(desc(guildEventsTable.startAt));
    return rows.map(toEvent);
  }

  async getEventById(id: string): Promise<GuildEvent | null> {
    const [row] = await db.select().from(guildEventsTable).where(eq(guildEventsTable.id, id));
    return row ? toEvent(row) : null;
  }

  async joinEvent(eventId: string, userId: string): Promise<GuildEventParticipant> {
    const [row] = await db.insert(guildEventParticipantsTable).values({
      eventId, userId, joinedAt: new Date(),
    }).onConflictDoNothing().returning();
    if (!row) {
      const [existing] = await db.select().from(guildEventParticipantsTable)
        .where(and(eq(guildEventParticipantsTable.eventId, eventId), eq(guildEventParticipantsTable.userId, userId)));
      return toParticipant(existing!);
    }
    return toParticipant(row);
  }

  async getEventParticipants(eventId: string): Promise<GuildEventParticipant[]> {
    const rows = await db.select().from(guildEventParticipantsTable)
      .where(eq(guildEventParticipantsTable.eventId, eventId));
    return rows.map(toParticipant);
  }

  async hasJoinedEvent(eventId: string, userId: string): Promise<boolean> {
    const [row] = await db.select().from(guildEventParticipantsTable)
      .where(and(eq(guildEventParticipantsTable.eventId, eventId), eq(guildEventParticipantsTable.userId, userId)));
    return !!row;
  }

  // ── Treasury ─────────────────────────────────────────────────────────────────

  async updateTreasury(guildId: string, deltaCredits: number, deltaCoins: number): Promise<Guild | null> {
    const [row] = await db.update(guildsTable).set({
      treasuryCredits: sql`${guildsTable.treasuryCredits} + ${deltaCredits}`,
      treasuryCoins:   sql`${guildsTable.treasuryCoins}   + ${deltaCoins}`,
      updatedAt:       new Date(),
    }).where(eq(guildsTable.id, guildId)).returning();
    return row ? toGuild(row) : null;
  }

  async addTreasuryTransaction(input: Omit<GuildTreasuryTransaction, "id" | "createdAt">): Promise<GuildTreasuryTransaction> {
    const [row] = await db.insert(guildTreasuryTransactionsTable).values({
      id: crypto.randomUUID(), ...input, createdAt: new Date(),
    }).returning();
    return toTreasuryTx(row!);
  }

  async getTreasuryTransactions(guildId: string, limit = 50): Promise<GuildTreasuryTransaction[]> {
    const rows = await db.select().from(guildTreasuryTransactionsTable)
      .where(eq(guildTreasuryTransactionsTable.guildId, guildId))
      .orderBy(desc(guildTreasuryTransactionsTable.createdAt)).limit(limit);
    return rows.map(toTreasuryTx);
  }

  // ── Warehouse ────────────────────────────────────────────────────────────────

  async depositItem(input: Omit<GuildWarehouseItem, "id" | "depositedAt">): Promise<GuildWarehouseItem> {
    const existing = await db.select().from(guildWarehouseItemsTable)
      .where(and(eq(guildWarehouseItemsTable.guildId, input.guildId), eq(guildWarehouseItemsTable.itemId, input.itemId)));

    if (existing[0]) {
      const [row] = await db.update(guildWarehouseItemsTable)
        .set({ quantity: sql`${guildWarehouseItemsTable.quantity} + ${input.quantity}` })
        .where(eq(guildWarehouseItemsTable.id, existing[0].id)).returning();
      return toWarehouseItem(row!);
    }

    const [row] = await db.insert(guildWarehouseItemsTable).values({
      id: crypto.randomUUID(), ...input, depositedAt: new Date(),
    }).returning();
    return toWarehouseItem(row!);
  }

  async withdrawItem(guildId: string, itemId: string, quantity: number): Promise<void> {
    const [existing] = await db.select().from(guildWarehouseItemsTable)
      .where(and(eq(guildWarehouseItemsTable.guildId, guildId), eq(guildWarehouseItemsTable.itemId, itemId)));
    if (!existing || existing.quantity < quantity) {
      throw new Error("Kho không đủ số lượng vật phẩm để rút.");
    }
    if (existing.quantity === quantity) {
      await db.delete(guildWarehouseItemsTable).where(eq(guildWarehouseItemsTable.id, existing.id));
    } else {
      await db.update(guildWarehouseItemsTable)
        .set({ quantity: sql`${guildWarehouseItemsTable.quantity} - ${quantity}` })
        .where(eq(guildWarehouseItemsTable.id, existing.id));
    }
  }

  async getWarehouseItems(guildId: string): Promise<GuildWarehouseItem[]> {
    const rows = await db.select().from(guildWarehouseItemsTable)
      .where(eq(guildWarehouseItemsTable.guildId, guildId));
    return rows.map(toWarehouseItem);
  }

  // ── Rankings ─────────────────────────────────────────────────────────────────

  async getLeaderboard(limit = 20): Promise<Guild[]> {
    const rows = await db.select().from(guildsTable)
      .orderBy(desc(guildsTable.level), desc(guildsTable.xp), desc(guildsTable.reputation))
      .limit(limit);
    return rows.map(toGuild);
  }
}
