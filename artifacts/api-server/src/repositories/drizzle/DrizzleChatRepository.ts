import { and, eq, desc, lt, gt, ilike, or, ne, sql, inArray } from "drizzle-orm";
import {
  db,
  chatRoomsTable,
  chatMembersTable,
  chatMessagesTable,
  chatMessageReadsTable,
  chatAttachmentsTable,
  chatPinsTable,
  chatReactionsTable,
  chatSettingsTable,
  chatBlocksTable,
  chatReportsTable,
} from "@workspace/db";
import type { IChatRepository } from "../chatRepository.js";
import type {
  ChatRoom,
  ChatMember,
  ChatMessage,
  ChatPin,
  ChatReaction,
  ChatAttachment,
  ChatSettings,
  ChatBlock,
  ChatReport,
  CreateRoomInput,
  SendMessageInput,
  MessageFilter,
  RoomFilter,
} from "../../models/chat.js";

// ─── Row → Model helpers ──────────────────────────────────────────────────────

function rowToRoom(
  row: typeof chatRoomsTable.$inferSelect,
  extra?: { memberCount?: number; unreadCount?: number },
): ChatRoom {
  return {
    id:            row.id,
    type:          row.type as ChatRoom["type"],
    name:          row.name,
    slug:          row.slug ?? undefined,
    description:   row.description ?? undefined,
    icon:          row.icon ?? undefined,
    ownerId:       row.ownerId ?? undefined,
    metadata:      row.metadata as Record<string, unknown> | undefined,
    maxMembers:    row.maxMembers ?? 500,
    isPublic:      row.isPublic,
    isArchived:    row.isArchived,
    lastMessageAt: row.lastMessageAt?.toISOString() ?? undefined,
    memberCount:   extra?.memberCount,
    unreadCount:   extra?.unreadCount,
    createdAt:     row.createdAt.toISOString(),
    updatedAt:     row.updatedAt.toISOString(),
  };
}

function rowToMember(row: typeof chatMembersTable.$inferSelect): ChatMember {
  return {
    id:                   row.id,
    roomId:               row.roomId,
    userId:               row.userId,
    role:                 row.role as ChatMember["role"],
    joinedAt:             row.joinedAt.toISOString(),
    lastReadAt:           row.lastReadAt?.toISOString() ?? undefined,
    lastReadMessageId:    row.lastReadMessageId ?? undefined,
    notificationsEnabled: row.notificationsEnabled,
    leftAt:               row.leftAt?.toISOString() ?? undefined,
    unreadCount:          row.unreadCount,
  };
}

function rowToReaction(row: typeof chatReactionsTable.$inferSelect): ChatReaction {
  return {
    id:        row.id,
    messageId: row.messageId,
    userId:    row.userId,
    emoji:     row.emoji,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToAttachment(row: typeof chatAttachmentsTable.$inferSelect): ChatAttachment {
  return {
    id:        row.id,
    messageId: row.messageId,
    type:      row.type,
    url:       row.url,
    filename:  row.filename ?? undefined,
    size:      row.size ?? undefined,
    mimeType:  row.mimeType ?? undefined,
    metadata:  row.metadata as Record<string, unknown> | undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToMessage(
  row: typeof chatMessagesTable.$inferSelect,
  extra?: { reactions?: ChatReaction[]; attachments?: ChatAttachment[]; readCount?: number },
): ChatMessage {
  return {
    id:          row.id,
    roomId:      row.roomId,
    senderId:    row.senderId,
    senderName:  row.senderName,
    type:        row.type as ChatMessage["type"],
    content:     row.content,
    replyToId:   row.replyToId ?? undefined,
    editedAt:    row.editedAt?.toISOString() ?? undefined,
    deletedAt:   row.deletedAt?.toISOString() ?? undefined,
    isPinned:    row.isPinned,
    metadata:    row.metadata as Record<string, unknown> | undefined,
    reactions:   extra?.reactions ?? [],
    attachments: extra?.attachments ?? [],
    readCount:   extra?.readCount,
    createdAt:   row.createdAt.toISOString(),
    updatedAt:   row.updatedAt.toISOString(),
  };
}

async function hydrateMessages(rows: (typeof chatMessagesTable.$inferSelect)[]): Promise<ChatMessage[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);

  const [allReactions, allAttachments] = await Promise.all([
    ids.length === 1
      ? db.select().from(chatReactionsTable).where(eq(chatReactionsTable.messageId, ids[0]!))
      : db.select().from(chatReactionsTable).where(inArray(chatReactionsTable.messageId, ids)),
    ids.length === 1
      ? db.select().from(chatAttachmentsTable).where(eq(chatAttachmentsTable.messageId, ids[0]!))
      : db.select().from(chatAttachmentsTable).where(inArray(chatAttachmentsTable.messageId, ids)),
  ]);

  const rxByMsg = new Map<string, ChatReaction[]>();
  for (const r of allReactions) {
    const list = rxByMsg.get(r.messageId) ?? [];
    list.push(rowToReaction(r));
    rxByMsg.set(r.messageId, list);
  }

  const attByMsg = new Map<string, ChatAttachment[]>();
  for (const a of allAttachments) {
    const list = attByMsg.get(a.messageId) ?? [];
    list.push(rowToAttachment(a));
    attByMsg.set(a.messageId, list);
  }

  return rows.map((r) =>
    rowToMessage(r, {
      reactions:   rxByMsg.get(r.id) ?? [],
      attachments: attByMsg.get(r.id) ?? [],
    })
  );
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class DrizzleChatRepository implements IChatRepository {

  // ── Rooms ──────────────────────────────────────────────────────────────────

  async createRoom(input: CreateRoomInput): Promise<ChatRoom> {
    const id  = crypto.randomUUID();
    const now = new Date();
    const [row] = await db
      .insert(chatRoomsTable)
      .values({
        id,
        type:        input.type,
        name:        input.name,
        slug:        input.slug ?? null,
        description: input.description ?? null,
        icon:        input.icon ?? null,
        ownerId:     input.ownerId ?? null,
        metadata:    input.metadata ?? null,
        isPublic:    input.isPublic ?? false,
        maxMembers:  input.maxMembers ?? 500,
        createdAt:   now,
        updatedAt:   now,
      })
      .returning();
    if (!row) throw new Error("Failed to create chat room");
    if (input.ownerId) {
      await this.addMember(id, input.ownerId, "OWNER");
    }
    if (input.memberIds) {
      for (const uid of input.memberIds) {
        if (uid !== input.ownerId) await this.addMember(id, uid, "MEMBER");
      }
    }
    return rowToRoom(row);
  }

  async getRoomById(id: string): Promise<ChatRoom | null> {
    const [row] = await db.select().from(chatRoomsTable).where(eq(chatRoomsTable.id, id));
    if (!row) return null;
    const count = await this.getMemberCount(id);
    return rowToRoom(row, { memberCount: count });
  }

  async getRoomBySlug(slug: string): Promise<ChatRoom | null> {
    const [row] = await db.select().from(chatRoomsTable).where(eq(chatRoomsTable.slug, slug));
    return row ? rowToRoom(row) : null;
  }

  async getRooms(filter?: RoomFilter): Promise<ChatRoom[]> {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filter?.type) conditions.push(eq(chatRoomsTable.type, filter.type));
    const rows = conditions.length
      ? await db.select().from(chatRoomsTable).where(and(...conditions)).orderBy(desc(chatRoomsTable.lastMessageAt)).limit(filter?.limit ?? 50)
      : await db.select().from(chatRoomsTable).where(eq(chatRoomsTable.isPublic, true)).orderBy(desc(chatRoomsTable.lastMessageAt)).limit(filter?.limit ?? 50);
    return rows.map((r) => rowToRoom(r));
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    const members = await db
      .select()
      .from(chatMembersTable)
      .where(and(eq(chatMembersTable.userId, userId), sql`${chatMembersTable.leftAt} IS NULL`));
    if (members.length === 0) return [];
    const roomIds = members.map((m) => m.roomId);
    const rooms = await db
      .select()
      .from(chatRoomsTable)
      .where(inArray(chatRoomsTable.id, roomIds))
      .orderBy(desc(chatRoomsTable.lastMessageAt));
    const memberMap = new Map(members.map((m) => [m.roomId, m]));
    return rooms.map((r) => rowToRoom(r, { unreadCount: memberMap.get(r.id)?.unreadCount ?? 0 }));
  }

  async updateLastMessageAt(roomId: string, at: Date): Promise<void> {
    await db.update(chatRoomsTable).set({ lastMessageAt: at, updatedAt: at }).where(eq(chatRoomsTable.id, roomId));
  }

  async deleteRoom(id: string): Promise<boolean> {
    const [row] = await db.delete(chatRoomsTable).where(eq(chatRoomsTable.id, id)).returning();
    return !!row;
  }

  // ── Members ────────────────────────────────────────────────────────────────

  async addMember(roomId: string, userId: string, role: "OWNER" | "ADMIN" | "MEMBER" = "MEMBER"): Promise<ChatMember> {
    const existing = await db.select().from(chatMembersTable)
      .where(and(eq(chatMembersTable.roomId, roomId), eq(chatMembersTable.userId, userId)));
    if (existing[0]) {
      if (existing[0].leftAt) {
        const [updated] = await db.update(chatMembersTable)
          .set({ leftAt: null, joinedAt: new Date(), unreadCount: 0 })
          .where(eq(chatMembersTable.id, existing[0].id))
          .returning();
        return rowToMember(updated!);
      }
      return rowToMember(existing[0]);
    }
    const [row] = await db.insert(chatMembersTable).values({
      id:      crypto.randomUUID(),
      roomId,
      userId,
      role,
      joinedAt: new Date(),
      unreadCount: 0,
    }).returning();
    return rowToMember(row!);
  }

  async getMember(roomId: string, userId: string): Promise<ChatMember | null> {
    const [row] = await db.select().from(chatMembersTable)
      .where(and(eq(chatMembersTable.roomId, roomId), eq(chatMembersTable.userId, userId)));
    return row ? rowToMember(row) : null;
  }

  async getMembers(roomId: string): Promise<ChatMember[]> {
    const rows = await db.select().from(chatMembersTable)
      .where(and(eq(chatMembersTable.roomId, roomId), sql`${chatMembersTable.leftAt} IS NULL`));
    return rows.map(rowToMember);
  }

  async updateLastRead(roomId: string, userId: string, messageId: string): Promise<void> {
    await db.update(chatMembersTable)
      .set({ lastReadAt: new Date(), lastReadMessageId: messageId, unreadCount: 0 })
      .where(and(eq(chatMembersTable.roomId, roomId), eq(chatMembersTable.userId, userId)));
  }

  async incrementUnread(roomId: string, excludeUserId: string): Promise<void> {
    await db.update(chatMembersTable)
      .set({ unreadCount: sql`${chatMembersTable.unreadCount} + 1` })
      .where(and(
        eq(chatMembersTable.roomId, roomId),
        ne(chatMembersTable.userId, excludeUserId),
        sql`${chatMembersTable.leftAt} IS NULL`,
      ));
  }

  async resetUnread(roomId: string, userId: string): Promise<void> {
    await db.update(chatMembersTable)
      .set({ unreadCount: 0, lastReadAt: new Date() })
      .where(and(eq(chatMembersTable.roomId, roomId), eq(chatMembersTable.userId, userId)));
  }

  async removeMember(roomId: string, userId: string): Promise<boolean> {
    const [row] = await db.update(chatMembersTable)
      .set({ leftAt: new Date() })
      .where(and(eq(chatMembersTable.roomId, roomId), eq(chatMembersTable.userId, userId)))
      .returning();
    return !!row;
  }

  async getMemberCount(roomId: string): Promise<number> {
    const [res] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(chatMembersTable)
      .where(and(eq(chatMembersTable.roomId, roomId), sql`${chatMembersTable.leftAt} IS NULL`));
    return res?.count ?? 0;
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  async createMessage(input: SendMessageInput): Promise<ChatMessage> {
    const id  = crypto.randomUUID();
    const now = new Date();
    const [row] = await db.insert(chatMessagesTable).values({
      id,
      roomId:     input.roomId,
      senderId:   input.senderId,
      senderName: input.senderName,
      type:       input.type ?? "TEXT",
      content:    input.content,
      replyToId:  input.replyToId ?? null,
      metadata:   input.metadata ?? null,
      createdAt:  now,
      updatedAt:  now,
    }).returning();
    if (!row) throw new Error("Failed to create message");
    return rowToMessage(row);
  }

  async getMessageById(id: string): Promise<ChatMessage | null> {
    const [row] = await db.select().from(chatMessagesTable).where(eq(chatMessagesTable.id, id));
    if (!row) return null;
    const [msgs] = await hydrateMessages([row]);
    return msgs ?? null;
  }

  async getMessages(roomId: string, filter?: MessageFilter): Promise<ChatMessage[]> {
    const conditions = [eq(chatMessagesTable.roomId, roomId)];
    if (filter?.cursor) conditions.push(lt(chatMessagesTable.createdAt, new Date(filter.cursor)));
    if (filter?.type)   conditions.push(eq(chatMessagesTable.type, filter.type));
    const rows = await db.select().from(chatMessagesTable)
      .where(and(...conditions))
      .orderBy(desc(chatMessagesTable.createdAt))
      .limit(filter?.limit ?? 50);
    const msgs = await hydrateMessages(rows);
    return msgs.reverse();
  }

  async searchMessages(roomId: string, query: string, limit = 20): Promise<ChatMessage[]> {
    const rows = await db.select().from(chatMessagesTable)
      .where(and(eq(chatMessagesTable.roomId, roomId), ilike(chatMessagesTable.content, `%${query}%`)))
      .orderBy(desc(chatMessagesTable.createdAt))
      .limit(limit);
    return hydrateMessages(rows);
  }

  async editMessage(id: string, content: string): Promise<ChatMessage | null> {
    const [row] = await db.update(chatMessagesTable)
      .set({ content, editedAt: new Date(), updatedAt: new Date() })
      .where(eq(chatMessagesTable.id, id))
      .returning();
    if (!row) return null;
    const [msg] = await hydrateMessages([row]);
    return msg ?? null;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const [row] = await db.update(chatMessagesTable)
      .set({ deletedAt: new Date(), content: "[Tin nhắn đã bị xoá]", updatedAt: new Date() })
      .where(eq(chatMessagesTable.id, id))
      .returning();
    return !!row;
  }

  // ── Reactions ──────────────────────────────────────────────────────────────

  async addReaction(messageId: string, userId: string, emoji: string): Promise<ChatReaction> {
    const existing = await db.select().from(chatReactionsTable)
      .where(and(eq(chatReactionsTable.messageId, messageId), eq(chatReactionsTable.userId, userId), eq(chatReactionsTable.emoji, emoji)));
    if (existing[0]) return rowToReaction(existing[0]);
    const [row] = await db.insert(chatReactionsTable).values({
      id: crypto.randomUUID(), messageId, userId, emoji, createdAt: new Date(),
    }).returning();
    return rowToReaction(row!);
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    const [row] = await db.delete(chatReactionsTable)
      .where(and(eq(chatReactionsTable.messageId, messageId), eq(chatReactionsTable.userId, userId), eq(chatReactionsTable.emoji, emoji)))
      .returning();
    return !!row;
  }

  async getReactions(messageId: string): Promise<ChatReaction[]> {
    const rows = await db.select().from(chatReactionsTable).where(eq(chatReactionsTable.messageId, messageId));
    return rows.map(rowToReaction);
  }

  // ── Read receipts ──────────────────────────────────────────────────────────

  async markRead(messageId: string, roomId: string, userId: string): Promise<void> {
    const exists = await db.select().from(chatMessageReadsTable)
      .where(and(eq(chatMessageReadsTable.messageId, messageId), eq(chatMessageReadsTable.userId, userId)));
    if (!exists[0]) {
      await db.insert(chatMessageReadsTable).values({
        id: crypto.randomUUID(), messageId, roomId, userId, readAt: new Date(),
      }).onConflictDoNothing();
    }
  }

  async getReadCount(messageId: string): Promise<number> {
    const [res] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(chatMessageReadsTable)
      .where(eq(chatMessageReadsTable.messageId, messageId));
    return res?.count ?? 0;
  }

  // ── Pins ───────────────────────────────────────────────────────────────────

  async pinMessage(roomId: string, messageId: string, pinnedBy: string, note?: string): Promise<ChatPin> {
    const existing = await db.select().from(chatPinsTable).where(eq(chatPinsTable.messageId, messageId));
    if (existing[0]) {
      return {
        id: existing[0].id, roomId: existing[0].roomId, messageId: existing[0].messageId,
        pinnedBy: existing[0].pinnedBy, note: existing[0].note ?? undefined,
        createdAt: existing[0].createdAt.toISOString(),
      };
    }
    const [row] = await db.insert(chatPinsTable).values({
      id: crypto.randomUUID(), roomId, messageId, pinnedBy, note: note ?? null, createdAt: new Date(),
    }).returning();
    await db.update(chatMessagesTable).set({ isPinned: true }).where(eq(chatMessagesTable.id, messageId));
    return {
      id: row!.id, roomId: row!.roomId, messageId: row!.messageId,
      pinnedBy: row!.pinnedBy, note: row!.note ?? undefined, createdAt: row!.createdAt.toISOString(),
    };
  }

  async unpinMessage(messageId: string): Promise<boolean> {
    const [row] = await db.delete(chatPinsTable).where(eq(chatPinsTable.messageId, messageId)).returning();
    if (row) {
      await db.update(chatMessagesTable).set({ isPinned: false }).where(eq(chatMessagesTable.id, messageId));
    }
    return !!row;
  }

  async getPins(roomId: string): Promise<ChatPin[]> {
    const rows = await db.select().from(chatPinsTable)
      .where(eq(chatPinsTable.roomId, roomId))
      .orderBy(desc(chatPinsTable.createdAt));
    return rows.map((r) => ({
      id: r.id, roomId: r.roomId, messageId: r.messageId,
      pinnedBy: r.pinnedBy, note: r.note ?? undefined, createdAt: r.createdAt.toISOString(),
    }));
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  async getSettings(userId: string): Promise<ChatSettings> {
    const existing = await db.select().from(chatSettingsTable).where(eq(chatSettingsTable.userId, userId));
    if (existing[0]) {
      return {
        id: existing[0].id, userId: existing[0].userId,
        notificationsEnabled: existing[0].notificationsEnabled,
        soundEnabled:         existing[0].soundEnabled,
        showOnlineStatus:     existing[0].showOnlineStatus,
        theme:                existing[0].theme ?? "dark",
        metadata:             existing[0].metadata as Record<string, unknown> | undefined,
        createdAt:            existing[0].createdAt.toISOString(),
        updatedAt:            existing[0].updatedAt.toISOString(),
      };
    }
    const now = new Date();
    const [row] = await db.insert(chatSettingsTable).values({
      id: crypto.randomUUID(), userId, createdAt: now, updatedAt: now,
    }).returning();
    return {
      id: row!.id, userId: row!.userId,
      notificationsEnabled: row!.notificationsEnabled,
      soundEnabled:         row!.soundEnabled,
      showOnlineStatus:     row!.showOnlineStatus,
      theme:                row!.theme ?? "dark",
      createdAt:            row!.createdAt.toISOString(),
      updatedAt:            row!.updatedAt.toISOString(),
    };
  }

  async updateSettings(userId: string, patch: Partial<ChatSettings>): Promise<ChatSettings> {
    await this.getSettings(userId); // ensure exists
    const [row] = await db.update(chatSettingsTable)
      .set({
        notificationsEnabled: patch.notificationsEnabled,
        soundEnabled:         patch.soundEnabled,
        showOnlineStatus:     patch.showOnlineStatus,
        theme:                patch.theme,
        metadata:             patch.metadata,
        updatedAt:            new Date(),
      })
      .where(eq(chatSettingsTable.userId, userId))
      .returning();
    return {
      id: row!.id, userId: row!.userId,
      notificationsEnabled: row!.notificationsEnabled,
      soundEnabled:         row!.soundEnabled,
      showOnlineStatus:     row!.showOnlineStatus,
      theme:                row!.theme ?? "dark",
      metadata:             row!.metadata as Record<string, unknown> | undefined,
      createdAt:            row!.createdAt.toISOString(),
      updatedAt:            row!.updatedAt.toISOString(),
    };
  }

  // ── Blocks ─────────────────────────────────────────────────────────────────

  async blockUser(userId: string, blockedUserId: string, reason?: string): Promise<ChatBlock> {
    const [row] = await db.insert(chatBlocksTable)
      .values({ id: crypto.randomUUID(), userId, blockedUserId, reason: reason ?? null, createdAt: new Date() })
      .onConflictDoNothing()
      .returning();
    return {
      id: row!.id, userId: row!.userId, blockedUserId: row!.blockedUserId,
      reason: row!.reason ?? undefined, createdAt: row!.createdAt.toISOString(),
    };
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<boolean> {
    const [row] = await db.delete(chatBlocksTable)
      .where(and(eq(chatBlocksTable.userId, userId), eq(chatBlocksTable.blockedUserId, blockedUserId)))
      .returning();
    return !!row;
  }

  async isBlocked(userId: string, blockedUserId: string): Promise<boolean> {
    const [row] = await db.select().from(chatBlocksTable)
      .where(or(
        and(eq(chatBlocksTable.userId, userId), eq(chatBlocksTable.blockedUserId, blockedUserId)),
        and(eq(chatBlocksTable.userId, blockedUserId), eq(chatBlocksTable.blockedUserId, userId)),
      ));
    return !!row;
  }

  async getBlocks(userId: string): Promise<ChatBlock[]> {
    const rows = await db.select().from(chatBlocksTable).where(eq(chatBlocksTable.userId, userId));
    return rows.map((r) => ({
      id: r.id, userId: r.userId, blockedUserId: r.blockedUserId,
      reason: r.reason ?? undefined, createdAt: r.createdAt.toISOString(),
    }));
  }

  // ── Reports ────────────────────────────────────────────────────────────────

  async reportMessage(messageId: string, reportedBy: string, reason: string): Promise<ChatReport> {
    const [row] = await db.insert(chatReportsTable).values({
      id: crypto.randomUUID(), messageId, reportedBy, reason, status: "PENDING", createdAt: new Date(),
    }).returning();
    return {
      id: row!.id, messageId: row!.messageId, reportedBy: row!.reportedBy,
      reason: row!.reason, status: row!.status as ChatReport["status"],
      createdAt: row!.createdAt.toISOString(),
    };
  }

  async getReports(status?: string): Promise<ChatReport[]> {
    const rows = status
      ? await db.select().from(chatReportsTable).where(eq(chatReportsTable.status, status as "PENDING")).orderBy(desc(chatReportsTable.createdAt))
      : await db.select().from(chatReportsTable).orderBy(desc(chatReportsTable.createdAt));
    return rows.map((r) => ({
      id: r.id, messageId: r.messageId, reportedBy: r.reportedBy,
      reason: r.reason, status: r.status as ChatReport["status"],
      resolvedBy: r.resolvedBy ?? undefined, resolvedAt: r.resolvedAt?.toISOString() ?? undefined,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
