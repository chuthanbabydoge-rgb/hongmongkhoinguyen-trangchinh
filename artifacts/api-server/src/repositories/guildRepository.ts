// ─────────────────────────────────────────────────────────────────────────────
// IGuildRepository — HUB-11
// ─────────────────────────────────────────────────────────────────────────────

export type GuildRole = "OWNER" | "LEADER" | "OFFICER" | "ELDER" | "MEMBER" | "RECRUIT";
export type GuildVisibility = "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
export type JoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type GuildInviteStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
export type GuildEventStatus = "UPCOMING" | "ONGOING" | "ENDED" | "CANCELLED";
export type GuildContributionType = "CREDITS" | "COINS" | "ITEM";
export type GuildLogAction =
  | "GUILD_CREATED" | "MEMBER_JOINED" | "MEMBER_LEFT" | "MEMBER_KICKED"
  | "MEMBER_INVITED" | "INVITE_ACCEPTED" | "INVITE_DECLINED"
  | "JOIN_REQUEST_SENT" | "JOIN_REQUEST_APPROVED" | "JOIN_REQUEST_REJECTED"
  | "ROLE_CHANGED" | "ANNOUNCEMENT_POSTED" | "EVENT_CREATED" | "EVENT_JOINED"
  | "TREASURY_DEPOSIT" | "TREASURY_WITHDRAW"
  | "WAREHOUSE_DEPOSIT" | "WAREHOUSE_WITHDRAW" | "GUILD_UPDATED";

export type GuildPermission =
  | "INVITE" | "KICK" | "MANAGE_EVENTS" | "MANAGE_BANK"
  | "MANAGE_ROLES" | "POST_ANNOUNCEMENT" | "APPROVE_JOIN" | "VIEW_LOGS";

export const ROLE_RANK: Record<GuildRole, number> = {
  OWNER:   6,
  LEADER:  5,
  OFFICER: 4,
  ELDER:   3,
  MEMBER:  2,
  RECRUIT: 1,
};

export const DEFAULT_ROLE_PERMISSIONS: Record<GuildRole, GuildPermission[]> = {
  OWNER:   ["INVITE","KICK","MANAGE_EVENTS","MANAGE_BANK","MANAGE_ROLES","POST_ANNOUNCEMENT","APPROVE_JOIN","VIEW_LOGS"],
  LEADER:  ["INVITE","KICK","MANAGE_EVENTS","MANAGE_BANK","MANAGE_ROLES","POST_ANNOUNCEMENT","APPROVE_JOIN","VIEW_LOGS"],
  OFFICER: ["INVITE","KICK","MANAGE_EVENTS","POST_ANNOUNCEMENT","APPROVE_JOIN","VIEW_LOGS"],
  ELDER:   ["INVITE","POST_ANNOUNCEMENT","APPROVE_JOIN"],
  MEMBER:  ["INVITE"],
  RECRUIT: [],
};

export interface Guild {
  id:              string;
  name:            string;
  tag:             string;
  description:     string | null;
  avatar:          string | null;
  banner:          string | null;
  ownerId:         string;
  memberLimit:     number;
  level:           number;
  xp:              number;
  treasuryCredits: number;
  treasuryCoins:   number;
  reputation:      number;
  visibility:      GuildVisibility;
  createdAt:       string;
  updatedAt:       string;
}

export interface GuildMember {
  guildId:      string;
  userId:       string;
  role:         GuildRole;
  joinedAt:     string;
  contribution: number;
  lastActive:   string;
}

export interface GuildJoinRequest {
  id:        string;
  guildId:   string;
  userId:    string;
  message:   string | null;
  status:    JoinRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GuildInvite {
  id:         string;
  guildId:    string;
  inviterId:  string;
  inviteeId:  string;
  status:     GuildInviteStatus;
  createdAt:  string;
  expiresAt:  string | null;
}

export interface GuildAnnouncement {
  id:        string;
  guildId:   string;
  authorId:  string;
  title:     string;
  content:   string;
  isPinned:  boolean;
  createdAt: string;
}

export interface GuildLog {
  id:        string;
  guildId:   string;
  actorId:   string;
  action:    GuildLogAction;
  targetId:  string | null;
  metadata:  unknown | null;
  createdAt: string;
}

export interface GuildContribution {
  id:        string;
  guildId:   string;
  userId:    string;
  type:      GuildContributionType;
  amount:    number;
  itemId:    string | null;
  note:      string | null;
  createdAt: string;
}

export interface GuildEvent {
  id:              string;
  guildId:         string;
  creatorId:       string;
  title:           string;
  description:     string | null;
  startAt:         string;
  endAt:           string | null;
  maxParticipants: number | null;
  status:          GuildEventStatus;
  rewardPoints:    number;
  createdAt:       string;
}

export interface GuildEventParticipant {
  eventId:  string;
  userId:   string;
  joinedAt: string;
}

export interface GuildWarehouseItem {
  id:          string;
  guildId:     string;
  itemId:      string;
  itemName:    string;
  quantity:    number;
  depositedBy: string;
  depositedAt: string;
}

export interface GuildTreasuryTransaction {
  id:        string;
  guildId:   string;
  userId:    string;
  type:      string;
  currency:  string;
  amount:    number;
  note:      string | null;
  createdAt: string;
}

export interface CreateGuildInput {
  name:        string;
  tag:         string;
  description?: string;
  avatar?:     string;
  banner?:     string;
  ownerId:     string;
  memberLimit?: number;
  visibility?: GuildVisibility;
}

export interface UpdateGuildInput {
  name?:        string;
  description?: string;
  avatar?:      string;
  banner?:      string;
  memberLimit?: number;
  visibility?:  GuildVisibility;
}

export interface IGuildRepository {
  // Guild CRUD
  createGuild(input: CreateGuildInput): Promise<Guild>;
  getGuildById(id: string): Promise<Guild | null>;
  getGuildByTag(tag: string): Promise<Guild | null>;
  listGuilds(options?: { search?: string; limit?: number; offset?: number }): Promise<Guild[]>;
  updateGuild(id: string, input: UpdateGuildInput): Promise<Guild | null>;
  deleteGuild(id: string): Promise<void>;
  addXp(guildId: string, xp: number): Promise<Guild | null>;

  // Members
  addMember(guildId: string, userId: string, role?: GuildRole): Promise<GuildMember>;
  getMember(guildId: string, userId: string): Promise<GuildMember | null>;
  getMembers(guildId: string): Promise<GuildMember[]>;
  updateMemberRole(guildId: string, userId: string, role: GuildRole): Promise<GuildMember | null>;
  removeMember(guildId: string, userId: string): Promise<void>;
  getMemberCount(guildId: string): Promise<number>;
  addContributionPoints(guildId: string, userId: string, points: number): Promise<void>;
  updateLastActive(guildId: string, userId: string): Promise<void>;
  getUserGuild(userId: string): Promise<{ guild: Guild; member: GuildMember } | null>;

  // Join Requests
  createJoinRequest(guildId: string, userId: string, message?: string): Promise<GuildJoinRequest>;
  getJoinRequest(id: string): Promise<GuildJoinRequest | null>;
  getPendingJoinRequests(guildId: string): Promise<GuildJoinRequest[]>;
  hasActiveJoinRequest(guildId: string, userId: string): Promise<boolean>;
  updateJoinRequestStatus(id: string, status: JoinRequestStatus): Promise<GuildJoinRequest | null>;

  // Invites
  createInvite(guildId: string, inviterId: string, inviteeId: string): Promise<GuildInvite>;
  getInvite(id: string): Promise<GuildInvite | null>;
  getPendingInvitesForUser(inviteeId: string): Promise<GuildInvite[]>;
  hasActiveInvite(guildId: string, inviteeId: string): Promise<boolean>;
  updateInviteStatus(id: string, status: GuildInviteStatus): Promise<GuildInvite | null>;

  // Announcements
  createAnnouncement(input: Omit<GuildAnnouncement, "id" | "createdAt">): Promise<GuildAnnouncement>;
  getAnnouncements(guildId: string): Promise<GuildAnnouncement[]>;

  // Logs
  addLog(input: Omit<GuildLog, "id" | "createdAt">): Promise<GuildLog>;
  getLogs(guildId: string, limit?: number): Promise<GuildLog[]>;

  // Contributions
  addContribution(input: Omit<GuildContribution, "id" | "createdAt">): Promise<GuildContribution>;
  getContributions(guildId: string, limit?: number): Promise<GuildContribution[]>;

  // Events
  createEvent(input: Omit<GuildEvent, "id" | "createdAt">): Promise<GuildEvent>;
  getEvents(guildId: string): Promise<GuildEvent[]>;
  getEventById(id: string): Promise<GuildEvent | null>;
  joinEvent(eventId: string, userId: string): Promise<GuildEventParticipant>;
  getEventParticipants(eventId: string): Promise<GuildEventParticipant[]>;
  hasJoinedEvent(eventId: string, userId: string): Promise<boolean>;

  // Treasury
  updateTreasury(guildId: string, deltaCredits: number, deltaCoins: number): Promise<Guild | null>;
  addTreasuryTransaction(input: Omit<GuildTreasuryTransaction, "id" | "createdAt">): Promise<GuildTreasuryTransaction>;
  getTreasuryTransactions(guildId: string, limit?: number): Promise<GuildTreasuryTransaction[]>;

  // Warehouse
  depositItem(input: Omit<GuildWarehouseItem, "id" | "depositedAt">): Promise<GuildWarehouseItem>;
  withdrawItem(guildId: string, itemId: string, quantity: number): Promise<void>;
  getWarehouseItems(guildId: string): Promise<GuildWarehouseItem[]>;

  // Rankings
  getLeaderboard(limit?: number): Promise<Guild[]>;
}
