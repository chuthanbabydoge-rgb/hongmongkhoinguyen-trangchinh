// ─────────────────────────────────────────────────────────────────────────────
// Social Repository — HUB-10
// Interface + InMemory implementation for the social graph
// ─────────────────────────────────────────────────────────────────────────────

export type RelationshipType    = "FRIEND" | "FOLLOWING" | "BLOCKED";
export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
export type PresenceStatus      = "ONLINE" | "AWAY" | "OFFLINE";

export interface SocialRelationship {
  userId:    string;
  targetId:  string;
  type:      RelationshipType;
  createdAt: string;
}

export interface FriendRequest {
  id:         string;
  fromUserId: string;
  toUserId:   string;
  status:     FriendRequestStatus;
  createdAt:  string;
  updatedAt:  string;
}

export interface UserPresence {
  userId:     string;
  status:     PresenceStatus;
  lastSeenAt: string;
  updatedAt:  string;
}

export interface PublicProfile {
  userId:      string;
  displayName: string;
  avatarUrl:   string | null;
  updatedAt:   string;
}

export interface ISocialRepository {
  // Friend requests
  createFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest>;
  getFriendRequestById(id: string): Promise<FriendRequest | null>;
  getPendingIncomingRequests(toUserId: string): Promise<FriendRequest[]>;
  getPendingSentRequests(fromUserId: string): Promise<FriendRequest[]>;
  updateFriendRequestStatus(id: string, status: FriendRequestStatus): Promise<FriendRequest | null>;
  hasPendingRequest(fromUserId: string, toUserId: string): Promise<boolean>;

  // Relationships
  createRelationship(userId: string, targetId: string, type: RelationshipType): Promise<SocialRelationship>;
  deleteRelationship(userId: string, targetId: string, type: RelationshipType): Promise<boolean>;
  hasRelationship(userId: string, targetId: string, type: RelationshipType): Promise<boolean>;
  getRelationships(userId: string, type: RelationshipType): Promise<SocialRelationship[]>;
  getIncomingRelationships(targetId: string, type: RelationshipType): Promise<SocialRelationship[]>;
  countRelationships(userId: string, type: RelationshipType): Promise<number>;
  countIncomingRelationships(targetId: string, type: RelationshipType): Promise<number>;

  // Presence
  setPresence(userId: string, status: PresenceStatus): Promise<UserPresence>;
  getPresence(userId: string): Promise<UserPresence | null>;
  getPresenceForUsers(userIds: string[]): Promise<UserPresence[]>;

  // Public profiles
  setPublicProfile(userId: string, data: Partial<Pick<PublicProfile, "displayName" | "avatarUrl">>): Promise<PublicProfile>;
  getPublicProfile(userId: string): Promise<PublicProfile | null>;
  searchPublicProfiles(query: string, limit?: number): Promise<PublicProfile[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// InMemory implementation
// ─────────────────────────────────────────────────────────────────────────────

export class InMemorySocialRepository implements ISocialRepository {
  private requests: FriendRequest[] = [];
  private relationships: SocialRelationship[] = [];
  private presence: Map<string, UserPresence> = new Map();
  private profiles: Map<string, PublicProfile> = new Map();

  // ── Friend requests ──────────────────────────────────────────────────────────

  async createFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    const now = new Date().toISOString();
    const req: FriendRequest = {
      id:         crypto.randomUUID(),
      fromUserId,
      toUserId,
      status:     "PENDING",
      createdAt:  now,
      updatedAt:  now,
    };
    this.requests.push(req);
    return req;
  }

  async getFriendRequestById(id: string): Promise<FriendRequest | null> {
    return this.requests.find(r => r.id === id) ?? null;
  }

  async getPendingIncomingRequests(toUserId: string): Promise<FriendRequest[]> {
    return this.requests.filter(r => r.toUserId === toUserId && r.status === "PENDING");
  }

  async getPendingSentRequests(fromUserId: string): Promise<FriendRequest[]> {
    return this.requests.filter(r => r.fromUserId === fromUserId && r.status === "PENDING");
  }

  async updateFriendRequestStatus(id: string, status: FriendRequestStatus): Promise<FriendRequest | null> {
    const idx = this.requests.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.requests[idx] = { ...this.requests[idx]!, status, updatedAt: new Date().toISOString() };
    return this.requests[idx]!;
  }

  async hasPendingRequest(fromUserId: string, toUserId: string): Promise<boolean> {
    return this.requests.some(
      r => r.fromUserId === fromUserId && r.toUserId === toUserId && r.status === "PENDING",
    );
  }

  // ── Relationships ────────────────────────────────────────────────────────────

  async createRelationship(userId: string, targetId: string, type: RelationshipType): Promise<SocialRelationship> {
    const existing = this.relationships.find(
      r => r.userId === userId && r.targetId === targetId && r.type === type,
    );
    if (existing) return existing;
    const rel: SocialRelationship = { userId, targetId, type, createdAt: new Date().toISOString() };
    this.relationships.push(rel);
    return rel;
  }

  async deleteRelationship(userId: string, targetId: string, type: RelationshipType): Promise<boolean> {
    const before = this.relationships.length;
    this.relationships = this.relationships.filter(
      r => !(r.userId === userId && r.targetId === targetId && r.type === type),
    );
    return this.relationships.length < before;
  }

  async hasRelationship(userId: string, targetId: string, type: RelationshipType): Promise<boolean> {
    return this.relationships.some(
      r => r.userId === userId && r.targetId === targetId && r.type === type,
    );
  }

  async getRelationships(userId: string, type: RelationshipType): Promise<SocialRelationship[]> {
    return this.relationships.filter(r => r.userId === userId && r.type === type);
  }

  async getIncomingRelationships(targetId: string, type: RelationshipType): Promise<SocialRelationship[]> {
    return this.relationships.filter(r => r.targetId === targetId && r.type === type);
  }

  async countRelationships(userId: string, type: RelationshipType): Promise<number> {
    return this.relationships.filter(r => r.userId === userId && r.type === type).length;
  }

  async countIncomingRelationships(targetId: string, type: RelationshipType): Promise<number> {
    return this.relationships.filter(r => r.targetId === targetId && r.type === type).length;
  }

  // ── Presence ─────────────────────────────────────────────────────────────────

  async setPresence(userId: string, status: PresenceStatus): Promise<UserPresence> {
    const now = new Date().toISOString();
    const p: UserPresence = { userId, status, lastSeenAt: now, updatedAt: now };
    this.presence.set(userId, p);
    return p;
  }

  async getPresence(userId: string): Promise<UserPresence | null> {
    return this.presence.get(userId) ?? null;
  }

  async getPresenceForUsers(userIds: string[]): Promise<UserPresence[]> {
    return userIds.flatMap(id => {
      const p = this.presence.get(id);
      return p ? [p] : [];
    });
  }

  // ── Public profiles ──────────────────────────────────────────────────────────

  async setPublicProfile(userId: string, data: Partial<Pick<PublicProfile, "displayName" | "avatarUrl">>): Promise<PublicProfile> {
    const existing = this.profiles.get(userId);
    const profile: PublicProfile = {
      userId,
      displayName: data.displayName ?? existing?.displayName ?? "",
      avatarUrl:   data.avatarUrl   ?? existing?.avatarUrl   ?? null,
      updatedAt:   new Date().toISOString(),
    };
    this.profiles.set(userId, profile);
    return profile;
  }

  async getPublicProfile(userId: string): Promise<PublicProfile | null> {
    return this.profiles.get(userId) ?? null;
  }

  async searchPublicProfiles(query: string, limit = 20): Promise<PublicProfile[]> {
    const lower = query.toLowerCase();
    return [...this.profiles.values()]
      .filter(p => p.displayName.toLowerCase().includes(lower))
      .slice(0, limit);
  }
}
