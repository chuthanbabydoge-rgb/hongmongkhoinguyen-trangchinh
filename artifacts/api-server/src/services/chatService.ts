// ─── ChatService — HUB-14 ────────────────────────────────────────────────────

import type { IChatRepository } from "../repositories/chatRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { UserReputationService } from "./userReputationService.js";
import type {
  ChatRoom,
  ChatMember,
  ChatMessage,
  ChatPin,
  ChatSettings,
  CreateRoomInput,
  SendMessageInput,
  MessageFilter,
  RoomFilter,
} from "../models/chat.js";
import { chatEventBus } from "../realtime/chatEventBus.js";
import { questEventBus } from "../realtime/questEventBus.js";
import { logger } from "../lib/logger.js";

export class ChatRoomNotFoundError extends Error {
  constructor(id: string) { super(`Phòng chat không tìm thấy: ${id}`); }
}
export class ChatUnauthorizedError extends Error {
  constructor() { super("Bạn không phải thành viên của phòng chat này."); }
}
export class ChatBlockedError extends Error {
  constructor() { super("Bạn đã bị chặn hoặc đã chặn người dùng này."); }
}
export class ChatRoomFullError extends Error {
  constructor() { super("Phòng chat đã đạt giới hạn thành viên."); }
}

export class ChatService {
  constructor(
    private readonly repo: IChatRepository,
    private readonly notificationsService: NotificationsService,
    private readonly activitiesService: ActivitiesService,
    private readonly userReputationService: UserReputationService,
  ) {}

  // ── Rooms ──────────────────────────────────────────────────────────────────

  async createRoom(input: CreateRoomInput, creatorId: string): Promise<ChatRoom> {
    const room = await this.repo.createRoom({ ...input, ownerId: creatorId });

    chatEventBus.publish({
      type:      "CHAT_ROOM_CREATED",
      timestamp: new Date().toISOString(),
      roomId:    room.id,
      userId:    creatorId,
      data:      { room },
    });

    this.activitiesService.fire({
      userId:      creatorId,
      type:        "chat",
      title:       "Tạo phòng chat",
      description: room.name,
      metadata:    { roomId: room.id, roomType: room.type },
      sourceApp:   "universe-hub",
    });

    logger.info({ roomId: room.id, type: room.type }, "ChatService: phòng chat mới được tạo");
    return room;
  }

  async getRooms(filter?: RoomFilter): Promise<ChatRoom[]> {
    return this.repo.getRooms(filter);
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    return this.repo.getUserRooms(userId);
  }

  async getRoom(id: string): Promise<ChatRoom> {
    const room = await this.repo.getRoomById(id);
    if (!room) throw new ChatRoomNotFoundError(id);
    return room;
  }

  async getOrCreatePrivateRoom(userAId: string, userAName: string, userBId: string, userBName: string): Promise<ChatRoom> {
    const existing = await this.repo.getUserRooms(userAId);
    const privateRooms = existing.filter((r) => r.type === "PRIVATE");
    for (const room of privateRooms) {
      const members = await this.repo.getMembers(room.id);
      const userIds = members.map((m) => m.userId);
      if (userIds.includes(userBId)) return room;
    }
    const room = await this.repo.createRoom({
      type:      "PRIVATE",
      name:      `${userAName} & ${userBName}`,
      ownerId:   userAId,
      isPublic:  false,
      memberIds: [userAId, userBId],
    });
    return room;
  }

  async getOrCreateGuildRoom(guildId: string, guildName: string): Promise<ChatRoom> {
    const slug = `guild-${guildId}`;
    const existing = await this.repo.getRoomBySlug(slug);
    if (existing) return existing;
    return this.repo.createRoom({
      type:     "GUILD",
      name:     `${guildName} Chat`,
      slug,
      isPublic: false,
      metadata: { guildId },
    });
  }

  async deleteRoom(id: string, userId: string): Promise<void> {
    const room = await this.repo.getRoomById(id);
    if (!room) throw new ChatRoomNotFoundError(id);
    if (room.ownerId !== userId) throw new ChatUnauthorizedError();
    await this.repo.deleteRoom(id);
  }

  // ── Members ────────────────────────────────────────────────────────────────

  async joinRoom(roomId: string, userId: string): Promise<ChatMember> {
    const room = await this.repo.getRoomById(roomId);
    if (!room) throw new ChatRoomNotFoundError(roomId);
    const count = await this.repo.getMemberCount(roomId);
    if (count >= room.maxMembers) throw new ChatRoomFullError();
    const member = await this.repo.addMember(roomId, userId);
    chatEventBus.publish({
      type: "CHAT_MEMBER_JOINED", timestamp: new Date().toISOString(),
      roomId, userId, data: { member },
    });
    return member;
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    await this.repo.removeMember(roomId, userId);
    chatEventBus.publish({
      type: "CHAT_MEMBER_LEFT", timestamp: new Date().toISOString(),
      roomId, userId, data: {},
    });
  }

  async getMembers(roomId: string): Promise<ChatMember[]> {
    return this.repo.getMembers(roomId);
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  async sendMessage(input: SendMessageInput): Promise<ChatMessage> {
    const room = await this.repo.getRoomById(input.roomId);
    if (!room) throw new ChatRoomNotFoundError(input.roomId);

    const member = await this.repo.getMember(input.roomId, input.senderId);
    if (!member) throw new ChatUnauthorizedError();

    const msg = await this.repo.createMessage(input);
    await this.repo.updateLastMessageAt(input.roomId, new Date(msg.createdAt));
    await this.repo.incrementUnread(input.roomId, input.senderId);

    chatEventBus.publish({
      type:      "CHAT_MESSAGE_SENT",
      timestamp: new Date().toISOString(),
      roomId:    input.roomId,
      userId:    input.senderId,
      data:      { message: msg, room },
    });

    // Quest events
    questEventBus.publish({ userId: input.senderId, type: "SEND_MESSAGE" });
    if (room.type === "GUILD") {
      questEventBus.publish({ userId: input.senderId, type: "SEND_GUILD_MESSAGE" });
    }
    if (room.type === "PRIVATE") {
      questEventBus.publish({ userId: input.senderId, type: "PRIVATE_CHAT" });
    }

    // Activity
    this.activitiesService.fire({
      userId:      input.senderId,
      type:        "chat",
      title:       "Gửi tin nhắn",
      description: `Phòng: ${room.name}`,
      metadata:    { roomId: room.id, messageId: msg.id },
      sourceApp:   "universe-hub",
    });

    // Notification to other members (async, don't block)
    this.repo.getMembers(input.roomId).then((members) => {
      for (const m of members) {
        if (m.userId === input.senderId || !m.notificationsEnabled) continue;
        this.notificationsService.fire(
          m.userId,
          "social",
          `💬 Tin nhắn mới từ ${input.senderName}`,
          `Trong phòng: ${room.name}`,
        );
      }
    }).catch(() => {});

    // Reputation — first messages
    this.userReputationService.addEvent(input.senderId, "FIRST_CHAT").catch(() => {});
    if (room.type === "GUILD") {
      this.userReputationService.addEvent(input.senderId, "FIRST_GUILD_CHAT").catch(() => {});
    }
    if (room.type === "PRIVATE") {
      this.userReputationService.addEvent(input.senderId, "FIRST_PRIVATE_CHAT").catch(() => {});
    }

    return msg;
  }

  async getMessages(roomId: string, userId: string, filter?: MessageFilter): Promise<ChatMessage[]> {
    const member = await this.repo.getMember(roomId, userId);
    if (!member) throw new ChatUnauthorizedError();
    return this.repo.getMessages(roomId, filter);
  }

  async editMessage(messageId: string, userId: string, content: string): Promise<ChatMessage> {
    const msg = await this.repo.getMessageById(messageId);
    if (!msg) throw new Error("Tin nhắn không tìm thấy");
    if (msg.senderId !== userId) throw new ChatUnauthorizedError();
    const updated = await this.repo.editMessage(messageId, content);
    if (!updated) throw new Error("Không thể chỉnh sửa tin nhắn");

    chatEventBus.publish({
      type: "CHAT_MESSAGE_UPDATED", timestamp: new Date().toISOString(),
      roomId: updated.roomId, userId, data: { message: updated },
    });
    return updated;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const msg = await this.repo.getMessageById(messageId);
    if (!msg) throw new Error("Tin nhắn không tìm thấy");
    if (msg.senderId !== userId) throw new ChatUnauthorizedError();
    await this.repo.deleteMessage(messageId);

    chatEventBus.publish({
      type: "CHAT_MESSAGE_DELETED", timestamp: new Date().toISOString(),
      roomId: msg.roomId, userId, data: { messageId },
    });
  }

  async searchMessages(roomId: string, userId: string, query: string): Promise<ChatMessage[]> {
    const member = await this.repo.getMember(roomId, userId);
    if (!member) throw new ChatUnauthorizedError();
    return this.repo.searchMessages(roomId, query);
  }

  // ── Reactions ──────────────────────────────────────────────────────────────

  async reactToMessage(messageId: string, userId: string, emoji: string): Promise<void> {
    const msg = await this.repo.getMessageById(messageId);
    if (!msg) throw new Error("Tin nhắn không tìm thấy");
    const member = await this.repo.getMember(msg.roomId, userId);
    if (!member) throw new ChatUnauthorizedError();
    const reaction = await this.repo.addReaction(messageId, userId, emoji);

    chatEventBus.publish({
      type: "CHAT_REACTION", timestamp: new Date().toISOString(),
      roomId: msg.roomId, userId, data: { reaction, messageId },
    });

    this.activitiesService.fire({
      userId,
      type:        "chat",
      title:       "Thả cảm xúc",
      description: `${emoji} trong tin nhắn`,
      metadata:    { messageId, roomId: msg.roomId },
      sourceApp:   "universe-hub",
    });
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    await this.repo.removeReaction(messageId, userId, emoji);
  }

  // ── Read receipts ──────────────────────────────────────────────────────────

  async markMessageRead(messageId: string, roomId: string, userId: string): Promise<void> {
    await this.repo.markRead(messageId, roomId, userId);
    await this.repo.resetUnread(roomId, userId);
    await this.repo.updateLastRead(roomId, userId, messageId);

    chatEventBus.publish({
      type: "CHAT_MESSAGE_READ", timestamp: new Date().toISOString(),
      roomId, userId, data: { messageId },
    });
  }

  // ── Pins ───────────────────────────────────────────────────────────────────

  async pinMessage(roomId: string, messageId: string, userId: string, note?: string): Promise<ChatPin> {
    const member = await this.repo.getMember(roomId, userId);
    if (!member) throw new ChatUnauthorizedError();
    const pin = await this.repo.pinMessage(roomId, messageId, userId, note);

    chatEventBus.publish({
      type: "CHAT_PIN", timestamp: new Date().toISOString(),
      roomId, userId, data: { pin, action: "pin" },
    });
    return pin;
  }

  async unpinMessage(messageId: string, userId: string): Promise<void> {
    const msg = await this.repo.getMessageById(messageId);
    if (!msg) throw new Error("Tin nhắn không tìm thấy");
    await this.repo.unpinMessage(messageId);

    chatEventBus.publish({
      type: "CHAT_PIN", timestamp: new Date().toISOString(),
      roomId: msg.roomId, userId, data: { messageId, action: "unpin" },
    });
  }

  async getPins(roomId: string): Promise<ChatPin[]> {
    return this.repo.getPins(roomId);
  }

  // ── Settings / Blocks / Reports ────────────────────────────────────────────

  async getSettings(userId: string): Promise<ChatSettings> {
    return this.repo.getSettings(userId);
  }

  async updateSettings(userId: string, patch: Partial<ChatSettings>): Promise<ChatSettings> {
    return this.repo.updateSettings(userId, patch);
  }

  async blockUser(userId: string, blockedUserId: string, reason?: string) {
    return this.repo.blockUser(userId, blockedUserId, reason);
  }

  async unblockUser(userId: string, blockedUserId: string) {
    return this.repo.unblockUser(userId, blockedUserId);
  }

  async getBlocks(userId: string) {
    return this.repo.getBlocks(userId);
  }

  async reportMessage(messageId: string, reportedBy: string, reason: string) {
    return this.repo.reportMessage(messageId, reportedBy, reason);
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard(userId: string) {
    const rooms = await this.repo.getUserRooms(userId);
    const totalUnread = rooms.reduce((sum, r) => sum + (r.unreadCount ?? 0), 0);
    const recentRooms = rooms.slice(0, 5);
    return { totalUnread, roomCount: rooms.length, recentRooms };
  }

  // ── Typing indicator (in-memory, no persistence) ──────────────────────────

  publishTyping(roomId: string, userId: string, senderName: string, isTyping: boolean): void {
    chatEventBus.publish({
      type:      isTyping ? "CHAT_USER_TYPING" : "CHAT_USER_STOPPED_TYPING",
      timestamp: new Date().toISOString(),
      roomId,
      userId,
      data:      { userId, senderName },
    });
  }
}
