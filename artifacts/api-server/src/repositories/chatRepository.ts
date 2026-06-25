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
} from "../models/chat.js";

export type {
  ChatRoom, ChatMember, ChatMessage, ChatPin, ChatReaction,
  ChatAttachment, ChatSettings, ChatBlock, ChatReport,
  CreateRoomInput, SendMessageInput, MessageFilter, RoomFilter,
};

export interface IChatRepository {
  // Rooms
  createRoom(input: CreateRoomInput): Promise<ChatRoom>;
  getRoomById(id: string): Promise<ChatRoom | null>;
  getRoomBySlug(slug: string): Promise<ChatRoom | null>;
  getRooms(filter?: RoomFilter): Promise<ChatRoom[]>;
  getUserRooms(userId: string): Promise<ChatRoom[]>;
  updateLastMessageAt(roomId: string, at: Date): Promise<void>;
  deleteRoom(id: string): Promise<boolean>;

  // Members
  addMember(roomId: string, userId: string, role?: "OWNER" | "ADMIN" | "MEMBER"): Promise<ChatMember>;
  getMember(roomId: string, userId: string): Promise<ChatMember | null>;
  getMembers(roomId: string): Promise<ChatMember[]>;
  updateLastRead(roomId: string, userId: string, messageId: string): Promise<void>;
  incrementUnread(roomId: string, excludeUserId: string): Promise<void>;
  resetUnread(roomId: string, userId: string): Promise<void>;
  removeMember(roomId: string, userId: string): Promise<boolean>;
  getMemberCount(roomId: string): Promise<number>;

  // Messages
  createMessage(input: SendMessageInput): Promise<ChatMessage>;
  getMessageById(id: string): Promise<ChatMessage | null>;
  getMessages(roomId: string, filter?: MessageFilter): Promise<ChatMessage[]>;
  searchMessages(roomId: string, query: string, limit?: number): Promise<ChatMessage[]>;
  editMessage(id: string, content: string): Promise<ChatMessage | null>;
  deleteMessage(id: string): Promise<boolean>;

  // Reactions
  addReaction(messageId: string, userId: string, emoji: string): Promise<ChatReaction>;
  removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean>;
  getReactions(messageId: string): Promise<ChatReaction[]>;

  // Read receipts
  markRead(messageId: string, roomId: string, userId: string): Promise<void>;
  getReadCount(messageId: string): Promise<number>;

  // Pins
  pinMessage(roomId: string, messageId: string, pinnedBy: string, note?: string): Promise<ChatPin>;
  unpinMessage(messageId: string): Promise<boolean>;
  getPins(roomId: string): Promise<ChatPin[]>;

  // Settings
  getSettings(userId: string): Promise<ChatSettings>;
  updateSettings(userId: string, patch: Partial<ChatSettings>): Promise<ChatSettings>;

  // Blocks
  blockUser(userId: string, blockedUserId: string, reason?: string): Promise<ChatBlock>;
  unblockUser(userId: string, blockedUserId: string): Promise<boolean>;
  isBlocked(userId: string, blockedUserId: string): Promise<boolean>;
  getBlocks(userId: string): Promise<ChatBlock[]>;

  // Reports
  reportMessage(messageId: string, reportedBy: string, reason: string): Promise<ChatReport>;
  getReports(status?: string): Promise<ChatReport[]>;
}
