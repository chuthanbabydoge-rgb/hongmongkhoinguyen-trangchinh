import { apiFetch } from "@/lib/apiClient";

export type GuildRole = "OWNER" | "LEADER" | "OFFICER" | "ELDER" | "MEMBER" | "RECRUIT";
export type GuildVisibility = "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
export type GuildEventStatus = "UPCOMING" | "ONGOING" | "ENDED" | "CANCELLED";
export type GuildContributionType = "CREDITS" | "COINS" | "ITEM";

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

export interface GuildAnnouncement {
  id:        string;
  guildId:   string;
  authorId:  string;
  title:     string;
  content:   string;
  isPinned:  boolean;
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

export interface GuildLog {
  id:        string;
  guildId:   string;
  actorId:   string;
  action:    string;
  targetId:  string | null;
  metadata:  unknown | null;
  createdAt: string;
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

export interface GuildWarehouseItem {
  id:          string;
  guildId:     string;
  itemId:      string;
  itemName:    string;
  quantity:    number;
  depositedBy: string;
  depositedAt: string;
}

export interface GuildJoinRequest {
  id:        string;
  guildId:   string;
  userId:    string;
  message:   string | null;
  status:    string;
  createdAt: string;
  updatedAt: string;
}

export interface GuildInvite {
  id:         string;
  guildId:    string;
  inviterId:  string;
  inviteeId:  string;
  status:     string;
  createdAt:  string;
  expiresAt:  string | null;
}

type ApiResponse<T> = { ok: boolean; data: T; total?: number; error?: string };

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const r = await apiFetch<ApiResponse<T>>(path, opts);
  if (!r.ok) throw new Error((r as { error?: string }).error ?? "API error");
  return r.data;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return api<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return api<T>(path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

async function apiDelete(path: string): Promise<void> {
  await apiFetch(path, { method: "DELETE" });
}

export const guildService = {
  listGuilds: (search?: string) => api<Guild[]>(`/guilds${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getGuild:   (id: string)      => api<Guild>(`/guilds/${id}`),
  getMyGuild: ()                => api<{ guild: Guild; member: GuildMember } | null>("/guilds/me"),
  leaderboard:(limit = 20)      => api<Guild[]>(`/guilds/leaderboard?limit=${limit}`),
  createGuild:(data: Partial<Guild> & { name: string; tag: string }) => apiPost<Guild>("/guilds", data),
  updateGuild:(id: string, data: Partial<Guild>) => apiPut<Guild>(`/guilds/${id}`, data),
  deleteGuild:(id: string)      => apiDelete(`/guilds/${id}`),

  getMembers: (id: string)      => api<GuildMember[]>(`/guilds/${id}/members`),
  invite:     (id: string, inviteeId: string) => apiPost<GuildInvite>(`/guilds/${id}/invite`, { inviteeId }),
  join:       (id: string, message?: string)  => apiPost<GuildJoinRequest>(`/guilds/${id}/join`, { message }),
  approve:    (id: string, requestId: string) => apiPost<GuildMember>(`/guilds/${id}/approve`, { requestId }),
  reject:     (id: string, requestId: string) => apiPost<GuildJoinRequest>(`/guilds/${id}/reject`, { requestId }),
  leave:      (id: string)      => apiPost<void>(`/guilds/${id}/leave`, {}),
  kick:       (id: string, targetUserId: string) => apiPost<void>(`/guilds/${id}/kick`, { targetUserId }),
  changeRole: (id: string, userId: string, role: GuildRole) => apiPut<GuildMember>(`/guilds/${id}/member/${userId}/role`, { role }),

  getAnnouncements:(id: string) => api<GuildAnnouncement[]>(`/guilds/${id}/announcement`),
  postAnnouncement:(id: string, data: { title: string; content: string; isPinned?: boolean }) =>
    apiPost<GuildAnnouncement>(`/guilds/${id}/announcement`, data),

  getContributions:(id: string)  => api<GuildContribution[]>(`/guilds/${id}/contributions`),
  contribute: (id: string, data: { type: GuildContributionType; amount: number; itemId?: string; note?: string }) =>
    apiPost<GuildContribution>(`/guilds/${id}/contribute`, data),

  getTreasury: (id: string)      => api<GuildTreasuryTransaction[]>(`/guilds/${id}/treasury`),
  withdrawTreasury: (id: string, data: { currency: string; amount: number; note?: string }) =>
    apiPost<Guild>(`/guilds/${id}/treasury/withdraw`, data),

  getWarehouse: (id: string)     => api<GuildWarehouseItem[]>(`/guilds/${id}/warehouse`),
  withdrawWarehouse: (id: string, data: { itemId: string; quantity: number }) =>
    apiPost<void>(`/guilds/${id}/warehouse/withdraw`, data),

  getEvents: (id: string)        => api<GuildEvent[]>(`/guilds/${id}/events`),
  createEvent:(id: string, data: Omit<GuildEvent, "id"|"guildId"|"creatorId"|"createdAt">) =>
    apiPost<GuildEvent>(`/guilds/${id}/events`, data),
  joinEvent:  (id: string, eventId: string) => apiPost<void>(`/guilds/${id}/events/${eventId}/join`, {}),

  getLogs: (id: string)          => api<GuildLog[]>(`/guilds/${id}/logs`),
};
