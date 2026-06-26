import { apiFetch } from "@/lib/apiClient";

export type WorldType = "PUBLIC" | "PRIVATE" | "CREATOR" | "OFFICIAL" | "EVENT" | "GUILD" | "PARTY" | "TRAINING";
export type WorldStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "ARCHIVED";
export type InstanceType = "SHARED" | "PRIVATE" | "RESERVED" | "MATCH" | "EVENT";
export type WorldMemberRole = "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER" | "VISITOR";

export interface World {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  thumbnail:   string | null;
  banner:      string | null;
  ownerId:     string;
  type:        WorldType;
  status:      WorldStatus;
  capacity:    number;
  playerCount: number;
  visitCount:  number;
  isFeatured:  boolean;
  tags:        string[];
  metadata:    Record<string, unknown> | null;
  guildId:     string | null;
  createdAt:   string;
  updatedAt:   string;
}

export interface WorldMember {
  id:         string;
  worldId:    string;
  userId:     string;
  role:       WorldMemberRole;
  joinedAt:   string;
  lastVisit:  string | null;
  visitCount: number;
}

export interface WorldBookmark {
  id:        string;
  worldId:   string;
  userId:    string;
  createdAt: string;
  world:     World;
}

export interface WorldTravelHistory {
  id:           string;
  userId:       string;
  worldId:      string;
  instanceId:   string | null;
  enteredAt:    string;
  leftAt:       string | null;
  durationSecs: number | null;
  world:        World;
}

export interface WorldPresence {
  id:         string;
  userId:     string;
  worldId:    string | null;
  regionId:   string | null;
  zoneId:     string | null;
  instanceId: string | null;
  joinedAt:   string | null;
  lastSeen:   string;
  isOnline:   boolean;
}

export interface WorldInstance {
  id:          string;
  zoneId:      string;
  worldId:     string;
  type:        InstanceType;
  status:      "OPEN" | "FULL" | "CLOSED" | "RESERVED";
  capacity:    number;
  playerCount: number;
  ownerId:     string | null;
  createdAt:   string;
}

export interface WorldEvent {
  id:              string;
  worldId:         string;
  creatorId:       string;
  name:            string;
  description:     string | null;
  status:          "UPCOMING" | "ONGOING" | "ENDED" | "CANCELLED";
  maxParticipants: number | null;
  startAt:         string;
  endAt:           string | null;
  createdAt:       string;
}

export interface CreateWorldInput {
  name:         string;
  description?: string;
  thumbnail?:   string;
  type?:        WorldType;
  capacity?:    number;
  tags?:        string[];
}

export interface WorldDashboard {
  currentWorld:   World | null;
  presence:       WorldPresence | null;
  bookmarks:      WorldBookmark[];
  recentHistory:  WorldTravelHistory[];
  popularWorlds:  World[];
  totalOnline:    number;
}

async function unwrap<T>(p: Promise<Response>): Promise<T> {
  const res = await p;
  const json = await res.json() as { ok: boolean; data?: T; error?: string };
  if (!json.ok) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}

export const worldService = {
  list(params?: { search?: string; type?: WorldType; limit?: number; offset?: number; sortBy?: string; sortDir?: string }) {
    const q = new URLSearchParams();
    if (params?.search)  q.set("search",  params.search);
    if (params?.type)    q.set("type",    params.type);
    if (params?.limit)   q.set("limit",   String(params.limit));
    if (params?.offset)  q.set("offset",  String(params.offset));
    if (params?.sortBy)  q.set("sortBy",  params.sortBy);
    if (params?.sortDir) q.set("sortDir", params.sortDir);
    return unwrap<World[]>(apiFetch(`/api/worlds?${q}`));
  },

  create(input: CreateWorldInput) {
    return unwrap<World>(apiFetch("/api/worlds", { method: "POST", body: JSON.stringify(input), headers: { "Content-Type": "application/json" } }));
  },

  get(id: string) {
    return unwrap<World>(apiFetch(`/api/worlds/${id}`));
  },

  update(id: string, input: Partial<CreateWorldInput & { status?: WorldStatus; isFeatured?: boolean }>) {
    return unwrap<World>(apiFetch(`/api/worlds/${id}`, { method: "PUT", body: JSON.stringify(input), headers: { "Content-Type": "application/json" } }));
  },

  delete(id: string) {
    return unwrap<void>(apiFetch(`/api/worlds/${id}`, { method: "DELETE" }));
  },

  featured(limit = 10) {
    return unwrap<World[]>(apiFetch(`/api/worlds/featured?limit=${limit}`));
  },

  popular(limit = 20) {
    return unwrap<World[]>(apiFetch(`/api/worlds/popular?limit=${limit}`));
  },

  recent(limit = 20) {
    return unwrap<World[]>(apiFetch(`/api/worlds/recent?limit=${limit}`));
  },

  search(q: string, limit = 20) {
    return unwrap<World[]>(apiFetch(`/api/worlds/search?q=${encodeURIComponent(q)}&limit=${limit}`));
  },

  addBookmark(worldId: string) {
    return unwrap<WorldBookmark>(apiFetch(`/api/worlds/${worldId}/bookmark`, { method: "POST" }));
  },

  removeBookmark(worldId: string) {
    return unwrap<void>(apiFetch(`/api/worlds/${worldId}/bookmark`, { method: "DELETE" }));
  },

  listBookmarks() {
    return unwrap<WorldBookmark[]>(apiFetch("/api/worlds/bookmarks"));
  },

  join(worldId: string) {
    return unwrap<{ world: World; instance: WorldInstance; member: WorldMember }>(apiFetch(`/api/worlds/${worldId}/join`, { method: "POST" }));
  },

  leave(worldId: string) {
    return unwrap<void>(apiFetch(`/api/worlds/${worldId}/leave`, { method: "POST" }));
  },

  travel(worldId: string) {
    return unwrap<{ world: World; instance: WorldInstance; member: WorldMember }>(apiFetch(`/api/worlds/${worldId}/travel`, { method: "POST" }));
  },

  listMembers(worldId: string) {
    return unwrap<WorldMember[]>(apiFetch(`/api/worlds/${worldId}/members`));
  },

  getPresence(worldId: string) {
    return unwrap<WorldPresence[]>(apiFetch(`/api/worlds/${worldId}/presence`));
  },

  listEvents(worldId: string) {
    return unwrap<WorldEvent[]>(apiFetch(`/api/worlds/${worldId}/events`));
  },

  createEvent(worldId: string, input: { name: string; description?: string; startAt: string; endAt?: string; maxParticipants?: number }) {
    return unwrap<WorldEvent>(apiFetch(`/api/worlds/${worldId}/events`, { method: "POST", body: JSON.stringify(input), headers: { "Content-Type": "application/json" } }));
  },

  dashboard() {
    return unwrap<WorldDashboard>(apiFetch("/api/worlds/dashboard"));
  },

  travelHistory(limit = 20) {
    return unwrap<WorldTravelHistory[]>(apiFetch(`/api/worlds/travel-history?limit=${limit}`));
  },
};
