// ─── Chat Domain Models — HUB-14 ─────────────────────────────────────────────

export type ChatRoomType =
  | "GLOBAL"
  | "PRIVATE"
  | "GUILD"
  | "PARTY"
  | "MARKETPLACE"
  | "SYSTEM"
  | "SUPPORT";

export type ChatMemberRole = "OWNER" | "ADMIN" | "MEMBER";

export type ChatMessageType =
  | "TEXT"
  | "IMAGE"
  | "FILE"
  | "SYSTEM"
  | "ITEM_SHARE"
  | "QUEST_SHARE"
  | "ACHIEVEMENT"
  | "LOCATION";

export type ChatReportStatus = "PENDING" | "REVIEWED" | "DISMISSED" | "ACTIONED";

export interface ChatRoom {
  id:            string;
  type:          ChatRoomType;
  name:          string;
  slug?:         string;
  description?:  string;
  icon?:         string;
  ownerId?:      string;
  metadata?:     Record<string, unknown>;
  maxMembers:    number;
  isPublic:      boolean;
  isArchived:    boolean;
  lastMessageAt?: string;
  memberCount?:  number;
  unreadCount?:  number;
  createdAt:     string;
  updatedAt:     string;
}

export interface ChatMember {
  id:                   string;
  roomId:               string;
  userId:               string;
  role:                 ChatMemberRole;
  joinedAt:             string;
  lastReadAt?:          string;
  lastReadMessageId?:   string;
  notificationsEnabled: boolean;
  leftAt?:              string;
  unreadCount:          number;
}

export interface ChatReaction {
  id:        string;
  messageId: string;
  userId:    string;
  emoji:     string;
  createdAt: string;
}

export interface ChatAttachment {
  id:        string;
  messageId: string;
  type:      string;
  url:       string;
  filename?: string;
  size?:     number;
  mimeType?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ChatMessage {
  id:          string;
  roomId:      string;
  senderId:    string;
  senderName:  string;
  type:        ChatMessageType;
  content:     string;
  replyToId?:  string;
  replyTo?:    ChatMessage;
  editedAt?:   string;
  deletedAt?:  string;
  isPinned:    boolean;
  metadata?:   Record<string, unknown>;
  reactions:   ChatReaction[];
  attachments: ChatAttachment[];
  readCount?:  number;
  createdAt:   string;
  updatedAt:   string;
}

export interface ChatPin {
  id:        string;
  roomId:    string;
  messageId: string;
  pinnedBy:  string;
  note?:     string;
  message?:  ChatMessage;
  createdAt: string;
}

export interface ChatSettings {
  id:                   string;
  userId:               string;
  notificationsEnabled: boolean;
  soundEnabled:         boolean;
  showOnlineStatus:     boolean;
  theme:                string;
  metadata?:            Record<string, unknown>;
  createdAt:            string;
  updatedAt:            string;
}

export interface ChatBlock {
  id:            string;
  userId:        string;
  blockedUserId: string;
  reason?:       string;
  createdAt:     string;
}

export interface ChatReport {
  id:          string;
  messageId:   string;
  reportedBy:  string;
  reason:      string;
  status:      ChatReportStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt:   string;
}

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateRoomInput {
  type:        ChatRoomType;
  name:        string;
  slug?:       string;
  description?: string;
  icon?:       string;
  ownerId?:    string;
  metadata?:   Record<string, unknown>;
  isPublic?:   boolean;
  maxMembers?: number;
  memberIds?:  string[];
}

export interface SendMessageInput {
  roomId:      string;
  senderId:    string;
  senderName:  string;
  type?:       ChatMessageType;
  content:     string;
  replyToId?:  string;
  metadata?:   Record<string, unknown>;
}

export interface MessageFilter {
  cursor?:   string;
  limit?:    number;
  before?:   string;
  search?:   string;
  type?:     ChatMessageType;
}

export interface RoomFilter {
  type?:    ChatRoomType;
  userId?:  string;
  search?:  string;
  limit?:   number;
}
