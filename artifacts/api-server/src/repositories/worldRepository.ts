import { randomUUID } from "node:crypto";

export type WorldType = "PUBLIC" | "PRIVATE" | "CREATOR" | "OFFICIAL" | "EVENT" | "GUILD" | "PARTY" | "TRAINING";
export type WorldStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "ARCHIVED";
export type InstanceType = "SHARED" | "PRIVATE" | "RESERVED" | "MATCH" | "EVENT";
export type InstanceStatus = "OPEN" | "FULL" | "CLOSED" | "RESERVED";
export type WorldMemberRole = "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER" | "VISITOR";
export type WorldEventStatus = "UPCOMING" | "ONGOING" | "ENDED" | "CANCELLED";

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

export interface WorldRegion {
  id:          string;
  worldId:     string;
  name:        string;
  description: string | null;
  capacity:    number;
  playerCount: number;
  isDefault:   boolean;
  metadata:    Record<string, unknown> | null;
  createdAt:   string;
}

export interface WorldZone {
  id:          string;
  regionId:    string;
  worldId:     string;
  name:        string;
  description: string | null;
  capacity:    number;
  playerCount: number;
  isDefault:   boolean;
  metadata:    Record<string, unknown> | null;
  createdAt:   string;
}

export interface WorldInstance {
  id:          string;
  zoneId:      string;
  worldId:     string;
  type:        InstanceType;
  status:      InstanceStatus;
  capacity:    number;
  playerCount: number;
  ownerId:     string | null;
  expiresAt:   string | null;
  createdAt:   string;
  closedAt:    string | null;
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
}

export interface WorldTravelHistory {
  id:           string;
  userId:       string;
  worldId:      string;
  instanceId:   string | null;
  enteredAt:    string;
  leftAt:       string | null;
  durationSecs: number | null;
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

export interface WorldEvent {
  id:              string;
  worldId:         string;
  creatorId:       string;
  name:            string;
  description:     string | null;
  status:          WorldEventStatus;
  maxParticipants: number | null;
  startAt:         string;
  endAt:           string | null;
  metadata:        Record<string, unknown> | null;
  createdAt:       string;
}

export interface CreateWorldInput {
  name:        string;
  slug?:       string;
  description?: string;
  thumbnail?:  string;
  banner?:     string;
  ownerId:     string;
  type?:       WorldType;
  capacity?:   number;
  tags?:       string[];
  guildId?:    string;
  metadata?:   Record<string, unknown>;
}

export interface UpdateWorldInput {
  name?:        string;
  description?: string;
  thumbnail?:   string;
  banner?:      string;
  type?:        WorldType;
  status?:      WorldStatus;
  capacity?:    number;
  isFeatured?:  boolean;
  tags?:        string[];
  metadata?:    Record<string, unknown>;
}

export interface ListWorldsOptions {
  search?:      string;
  type?:        WorldType;
  ownerId?:     string;
  isFeatured?:  boolean;
  limit?:       number;
  offset?:      number;
  sortBy?:      "playerCount" | "visitCount" | "createdAt";
  sortDir?:     "asc" | "desc";
}

export interface IWorldRepository {
  // World CRUD
  createWorld(input: CreateWorldInput): Promise<World>;
  getWorldById(id: string): Promise<World | null>;
  getWorldBySlug(slug: string): Promise<World | null>;
  updateWorld(id: string, input: UpdateWorldInput): Promise<World | null>;
  deleteWorld(id: string): Promise<boolean>;
  listWorlds(options?: ListWorldsOptions): Promise<World[]>;
  countWorlds(options?: ListWorldsOptions): Promise<number>;
  incrementPlayerCount(worldId: string, delta: number): Promise<void>;
  incrementVisitCount(worldId: string): Promise<void>;

  // Members
  addMember(worldId: string, userId: string, role?: WorldMemberRole): Promise<WorldMember>;
  getMember(worldId: string, userId: string): Promise<WorldMember | null>;
  listMembers(worldId: string): Promise<WorldMember[]>;
  removeMember(worldId: string, userId: string): Promise<boolean>;
  updateMemberVisit(worldId: string, userId: string): Promise<void>;

  // Bookmarks
  addBookmark(worldId: string, userId: string): Promise<WorldBookmark>;
  removeBookmark(worldId: string, userId: string): Promise<boolean>;
  getBookmark(worldId: string, userId: string): Promise<WorldBookmark | null>;
  listBookmarks(userId: string): Promise<(WorldBookmark & { world: World })[]>;

  // Travel History
  addTravelHistory(input: { userId: string; worldId: string; instanceId?: string }): Promise<WorldTravelHistory>;
  closeTravelHistory(id: string): Promise<WorldTravelHistory | null>;
  getActiveTravelHistory(userId: string): Promise<WorldTravelHistory | null>;
  listTravelHistory(userId: string, limit?: number): Promise<(WorldTravelHistory & { world: World })[]>;

  // Presence
  upsertPresence(userId: string, data: Partial<Omit<WorldPresence, "id" | "userId" | "lastSeen">>): Promise<WorldPresence>;
  getPresence(userId: string): Promise<WorldPresence | null>;
  listWorldPresence(worldId: string): Promise<WorldPresence[]>;
  clearPresence(userId: string): Promise<void>;

  // Instances
  createInstance(input: { zoneId: string; worldId: string; type?: InstanceType; capacity?: number; ownerId?: string }): Promise<WorldInstance>;
  getInstance(id: string): Promise<WorldInstance | null>;
  listInstances(worldId: string, zoneId?: string): Promise<WorldInstance[]>;
  getOpenInstance(worldId: string): Promise<WorldInstance | null>;
  updateInstancePlayerCount(id: string, delta: number): Promise<WorldInstance | null>;
  closeInstance(id: string): Promise<boolean>;

  // Events
  createEvent(input: { worldId: string; creatorId: string; name: string; description?: string; startAt: string; endAt?: string; maxParticipants?: number; metadata?: Record<string, unknown> }): Promise<WorldEvent>;
  listEvents(worldId: string): Promise<WorldEvent[]>;
  getEvent(id: string): Promise<WorldEvent | null>;

  // Regions & Zones
  listRegions(worldId: string): Promise<WorldRegion[]>;
  getDefaultRegion(worldId: string): Promise<WorldRegion | null>;
  listZones(regionId: string): Promise<WorldZone[]>;
  getDefaultZone(regionId: string): Promise<WorldZone | null>;
}

// ─── InMemory Implementation ──────────────────────────────────────────────────

function now(): string { return new Date().toISOString(); }
function id():  string { return randomUUID(); }

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export class InMemoryWorldRepository implements IWorldRepository {
  private worlds:        Map<string, World>             = new Map();
  private members:       Map<string, WorldMember>       = new Map();
  private bookmarks:     Map<string, WorldBookmark>     = new Map();
  private travelHistory: Map<string, WorldTravelHistory>= new Map();
  private presence:      Map<string, WorldPresence>     = new Map();
  private instances:     Map<string, WorldInstance>     = new Map();
  private events:        Map<string, WorldEvent>        = new Map();
  private regions:       Map<string, WorldRegion>       = new Map();
  private zones:         Map<string, WorldZone>         = new Map();

  async createWorld(input: CreateWorldInput): Promise<World> {
    const world: World = {
      id:          id(),
      name:        input.name,
      slug:        input.slug ?? slugify(input.name) + "-" + Date.now().toString(36),
      description: input.description ?? null,
      thumbnail:   input.thumbnail ?? null,
      banner:      input.banner ?? null,
      ownerId:     input.ownerId,
      type:        input.type ?? "PUBLIC",
      status:      "ACTIVE",
      capacity:    input.capacity ?? 100,
      playerCount: 0,
      visitCount:  0,
      isFeatured:  false,
      tags:        input.tags ?? [],
      metadata:    input.metadata ?? null,
      guildId:     input.guildId ?? null,
      createdAt:   now(),
      updatedAt:   now(),
    };
    this.worlds.set(world.id, world);
    return world;
  }

  async getWorldById(id: string): Promise<World | null> { return this.worlds.get(id) ?? null; }
  async getWorldBySlug(slug: string): Promise<World | null> {
    return [...this.worlds.values()].find(w => w.slug === slug) ?? null;
  }

  async updateWorld(id: string, input: UpdateWorldInput): Promise<World | null> {
    const world = this.worlds.get(id);
    if (!world) return null;
    const updated = { ...world, ...input, updatedAt: now() };
    this.worlds.set(id, updated);
    return updated;
  }

  async deleteWorld(id: string): Promise<boolean> { return this.worlds.delete(id); }

  async listWorlds(options?: ListWorldsOptions): Promise<World[]> {
    let list = [...this.worlds.values()].filter(w => w.status !== "ARCHIVED");
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(w => w.name.toLowerCase().includes(q) || (w.description ?? "").toLowerCase().includes(q));
    }
    if (options?.type)       list = list.filter(w => w.type === options.type);
    if (options?.ownerId)    list = list.filter(w => w.ownerId === options.ownerId);
    if (options?.isFeatured) list = list.filter(w => w.isFeatured === options.isFeatured);
    const sortBy  = options?.sortBy  ?? "createdAt";
    const sortDir = options?.sortDir ?? "desc";
    list.sort((a, b) => {
      const va = a[sortBy] as number | string;
      const vb = b[sortBy] as number | string;
      return sortDir === "desc" ? (va > vb ? -1 : 1) : (va < vb ? -1 : 1);
    });
    const offset = options?.offset ?? 0;
    const limit  = options?.limit  ?? 20;
    return list.slice(offset, offset + limit);
  }

  async countWorlds(options?: ListWorldsOptions): Promise<number> {
    return (await this.listWorlds({ ...options, limit: 9999, offset: 0 })).length;
  }

  async incrementPlayerCount(worldId: string, delta: number): Promise<void> {
    const w = this.worlds.get(worldId);
    if (w) this.worlds.set(worldId, { ...w, playerCount: Math.max(0, w.playerCount + delta), updatedAt: now() });
  }

  async incrementVisitCount(worldId: string): Promise<void> {
    const w = this.worlds.get(worldId);
    if (w) this.worlds.set(worldId, { ...w, visitCount: w.visitCount + 1, updatedAt: now() });
  }

  async addMember(worldId: string, userId: string, role: WorldMemberRole = "MEMBER"): Promise<WorldMember> {
    const key = `${worldId}:${userId}`;
    const existing = this.members.get(key);
    if (existing) return existing;
    const member: WorldMember = { id: id(), worldId, userId, role, joinedAt: now(), lastVisit: null, visitCount: 0 };
    this.members.set(key, member);
    return member;
  }

  async getMember(worldId: string, userId: string): Promise<WorldMember | null> {
    return this.members.get(`${worldId}:${userId}`) ?? null;
  }

  async listMembers(worldId: string): Promise<WorldMember[]> {
    return [...this.members.values()].filter(m => m.worldId === worldId);
  }

  async removeMember(worldId: string, userId: string): Promise<boolean> {
    return this.members.delete(`${worldId}:${userId}`);
  }

  async updateMemberVisit(worldId: string, userId: string): Promise<void> {
    const key = `${worldId}:${userId}`;
    const m = this.members.get(key);
    if (m) this.members.set(key, { ...m, lastVisit: now(), visitCount: m.visitCount + 1 });
  }

  async addBookmark(worldId: string, userId: string): Promise<WorldBookmark> {
    const key = `${worldId}:${userId}`;
    const existing = this.bookmarks.get(key);
    if (existing) return existing;
    const bm: WorldBookmark = { id: id(), worldId, userId, createdAt: now() };
    this.bookmarks.set(key, bm);
    return bm;
  }

  async removeBookmark(worldId: string, userId: string): Promise<boolean> {
    return this.bookmarks.delete(`${worldId}:${userId}`);
  }

  async getBookmark(worldId: string, userId: string): Promise<WorldBookmark | null> {
    return this.bookmarks.get(`${worldId}:${userId}`) ?? null;
  }

  async listBookmarks(userId: string): Promise<(WorldBookmark & { world: World })[]> {
    const bms = [...this.bookmarks.values()].filter(b => b.userId === userId);
    return bms.map(b => ({ ...b, world: this.worlds.get(b.worldId)! })).filter(b => b.world);
  }

  async addTravelHistory(input: { userId: string; worldId: string; instanceId?: string }): Promise<WorldTravelHistory> {
    const th: WorldTravelHistory = { id: id(), userId: input.userId, worldId: input.worldId, instanceId: input.instanceId ?? null, enteredAt: now(), leftAt: null, durationSecs: null };
    this.travelHistory.set(th.id, th);
    return th;
  }

  async closeTravelHistory(thId: string): Promise<WorldTravelHistory | null> {
    const th = this.travelHistory.get(thId);
    if (!th) return null;
    const leftAt = now();
    const durationSecs = Math.floor((Date.now() - new Date(th.enteredAt).getTime()) / 1000);
    const updated = { ...th, leftAt, durationSecs };
    this.travelHistory.set(thId, updated);
    return updated;
  }

  async getActiveTravelHistory(userId: string): Promise<WorldTravelHistory | null> {
    return [...this.travelHistory.values()].find(t => t.userId === userId && !t.leftAt) ?? null;
  }

  async listTravelHistory(userId: string, limit = 20): Promise<(WorldTravelHistory & { world: World })[]> {
    const list = [...this.travelHistory.values()]
      .filter(t => t.userId === userId)
      .sort((a, b) => b.enteredAt.localeCompare(a.enteredAt))
      .slice(0, limit);
    return list.map(t => ({ ...t, world: this.worlds.get(t.worldId)! })).filter(t => t.world);
  }

  async upsertPresence(userId: string, data: Partial<Omit<WorldPresence, "id" | "userId" | "lastSeen">>): Promise<WorldPresence> {
    const existing = this.presence.get(userId);
    const presence: WorldPresence = {
      id:         existing?.id ?? id(),
      userId,
      worldId:    data.worldId ?? existing?.worldId ?? null,
      regionId:   data.regionId ?? existing?.regionId ?? null,
      zoneId:     data.zoneId ?? existing?.zoneId ?? null,
      instanceId: data.instanceId ?? existing?.instanceId ?? null,
      joinedAt:   data.joinedAt !== undefined ? data.joinedAt : existing?.joinedAt ?? null,
      lastSeen:   now(),
      isOnline:   data.isOnline ?? existing?.isOnline ?? false,
    };
    this.presence.set(userId, presence);
    return presence;
  }

  async getPresence(userId: string): Promise<WorldPresence | null> { return this.presence.get(userId) ?? null; }

  async listWorldPresence(worldId: string): Promise<WorldPresence[]> {
    return [...this.presence.values()].filter(p => p.worldId === worldId && p.isOnline);
  }

  async clearPresence(userId: string): Promise<void> {
    const p = this.presence.get(userId);
    if (p) this.presence.set(userId, { ...p, worldId: null, regionId: null, zoneId: null, instanceId: null, isOnline: false, joinedAt: null, lastSeen: now() });
  }

  async createInstance(input: { zoneId: string; worldId: string; type?: InstanceType; capacity?: number; ownerId?: string }): Promise<WorldInstance> {
    const inst: WorldInstance = { id: id(), zoneId: input.zoneId, worldId: input.worldId, type: input.type ?? "SHARED", status: "OPEN", capacity: input.capacity ?? 20, playerCount: 0, ownerId: input.ownerId ?? null, expiresAt: null, createdAt: now(), closedAt: null };
    this.instances.set(inst.id, inst);
    return inst;
  }

  async getInstance(id: string): Promise<WorldInstance | null> { return this.instances.get(id) ?? null; }

  async listInstances(worldId: string, zoneId?: string): Promise<WorldInstance[]> {
    return [...this.instances.values()].filter(i => i.worldId === worldId && (!zoneId || i.zoneId === zoneId) && i.status !== "CLOSED");
  }

  async getOpenInstance(worldId: string): Promise<WorldInstance | null> {
    return [...this.instances.values()].find(i => i.worldId === worldId && i.status === "OPEN" && i.playerCount < i.capacity) ?? null;
  }

  async updateInstancePlayerCount(id: string, delta: number): Promise<WorldInstance | null> {
    const inst = this.instances.get(id);
    if (!inst) return null;
    const playerCount = Math.max(0, inst.playerCount + delta);
    const status: InstanceStatus = playerCount >= inst.capacity ? "FULL" : playerCount === 0 ? "OPEN" : "OPEN";
    const updated = { ...inst, playerCount, status };
    this.instances.set(id, updated);
    return updated;
  }

  async closeInstance(id: string): Promise<boolean> {
    const inst = this.instances.get(id);
    if (!inst) return false;
    this.instances.set(id, { ...inst, status: "CLOSED", closedAt: now() });
    return true;
  }

  async createEvent(input: { worldId: string; creatorId: string; name: string; description?: string; startAt: string; endAt?: string; maxParticipants?: number; metadata?: Record<string, unknown> }): Promise<WorldEvent> {
    const event: WorldEvent = { id: id(), worldId: input.worldId, creatorId: input.creatorId, name: input.name, description: input.description ?? null, status: "UPCOMING", maxParticipants: input.maxParticipants ?? null, startAt: input.startAt, endAt: input.endAt ?? null, metadata: input.metadata ?? null, createdAt: now() };
    this.events.set(event.id, event);
    return event;
  }

  async listEvents(worldId: string): Promise<WorldEvent[]> {
    return [...this.events.values()].filter(e => e.worldId === worldId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getEvent(id: string): Promise<WorldEvent | null> { return this.events.get(id) ?? null; }

  async listRegions(worldId: string): Promise<WorldRegion[]> {
    return [...this.regions.values()].filter(r => r.worldId === worldId);
  }

  async getDefaultRegion(worldId: string): Promise<WorldRegion | null> {
    return [...this.regions.values()].find(r => r.worldId === worldId && r.isDefault) ?? null;
  }

  async listZones(regionId: string): Promise<WorldZone[]> {
    return [...this.zones.values()].filter(z => z.regionId === regionId);
  }

  async getDefaultZone(regionId: string): Promise<WorldZone | null> {
    return [...this.zones.values()].find(z => z.regionId === regionId && z.isDefault) ?? null;
  }
}
