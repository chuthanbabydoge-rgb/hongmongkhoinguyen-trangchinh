export type ReputationEventType =
  | "LOGIN"
  | "MARKETPLACE_LISTING"
  | "MARKETPLACE_SALE"
  | "MARKETPLACE_PURCHASE"
  | "WALLET_TRANSFER"
  | "INVENTORY_ACQUIRED"
  | "GUILD_CREATED"
  | "GUILD_JOINED"
  | "GUILD_EVENT"
  | "GUILD_CONTRIBUTION"
  | "GUILD_ANNOUNCEMENT"
  | "GUILD_RECRUIT"
  | "QUEST_COMPLETED"
  | "FIRST_CHAT"
  | "FIRST_GUILD_CHAT"
  | "FIRST_PRIVATE_CHAT"
  | "AI_CHAT"
  | "AI_HELP_USED"
  | "CREATOR_PROJECT_CREATED"
  | "CREATOR_PROJECT_PUBLISHED"
  | "CREATOR_PROJECT_FORKED";

export const REPUTATION_RULES: Record<ReputationEventType, number> = {
  LOGIN:                 5,
  MARKETPLACE_LISTING:  10,
  MARKETPLACE_SALE:     25,
  MARKETPLACE_PURCHASE: 15,
  WALLET_TRANSFER:      5,
  INVENTORY_ACQUIRED:   5,
  GUILD_CREATED:        50,
  GUILD_JOINED:         20,
  GUILD_EVENT:          30,
  GUILD_CONTRIBUTION:   10,
  GUILD_ANNOUNCEMENT:   5,
  GUILD_RECRUIT:        25,
  QUEST_COMPLETED:      0,
  FIRST_CHAT:           10,
  FIRST_GUILD_CHAT:     15,
  FIRST_PRIVATE_CHAT:   10,
  AI_CHAT:              3,
  AI_HELP_USED:         5,
  CREATOR_PROJECT_CREATED:   10,
  CREATOR_PROJECT_PUBLISHED: 30,
  CREATOR_PROJECT_FORKED:    15,
};

export const LEVEL_THRESHOLDS: Array<{ level: string; min: number; max: number | null }> = [
  { level: "Citizen",  min: 0,    max: 99   },
  { level: "Explorer", min: 100,  max: 499  },
  { level: "Merchant", min: 500,  max: 999  },
  { level: "Elite",    min: 1000, max: 4999 },
  { level: "Legend",   min: 5000, max: null },
];

export function resolveLevel(points: number): string {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]!.min) return LEVEL_THRESHOLDS[i]!.level;
  }
  return "Citizen";
}

export function nextLevelThreshold(points: number): number | null {
  const tier = LEVEL_THRESHOLDS.find(t => t.max !== null && points <= t.max);
  return tier?.max !== undefined ? (tier.max! + 1) : null;
}

export interface UserReputation {
  userId:      string;
  totalPoints: number;
  level:       string;
  updatedAt:   string;
}

export interface ReputationEvent {
  id:        string;
  userId:    string;
  eventType: ReputationEventType;
  points:    number;
  metadata:  unknown | null;
  createdAt: string;
}

export interface CreateReputationEventInput {
  userId:    string;
  eventType: ReputationEventType;
  metadata?: unknown;
}

export interface IUserReputationRepository {
  getByUserId(userId: string): Promise<UserReputation | null>;
  upsert(userId: string, deltaPoints: number): Promise<UserReputation>;
  getLeaderboard(limit: number): Promise<Array<UserReputation & { rank: number }>>;
  addEvent(input: CreateReputationEventInput): Promise<ReputationEvent>;
  getEvents(userId: string, limit: number): Promise<ReputationEvent[]>;
}

export class InMemoryUserReputationRepository implements IUserReputationRepository {
  private reps: Map<string, UserReputation> = new Map();
  private events: ReputationEvent[] = [];

  async getByUserId(userId: string): Promise<UserReputation | null> {
    return this.reps.get(userId) ?? null;
  }

  async upsert(userId: string, deltaPoints: number): Promise<UserReputation> {
    const existing = this.reps.get(userId);
    const totalPoints = (existing?.totalPoints ?? 0) + deltaPoints;
    const rep: UserReputation = {
      userId,
      totalPoints,
      level:     resolveLevel(totalPoints),
      updatedAt: new Date().toISOString(),
    };
    this.reps.set(userId, rep);
    return rep;
  }

  async getLeaderboard(limit: number): Promise<Array<UserReputation & { rank: number }>> {
    return [...this.reps.values()]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }

  async addEvent(input: CreateReputationEventInput): Promise<ReputationEvent> {
    const event: ReputationEvent = {
      id:        crypto.randomUUID(),
      userId:    input.userId,
      eventType: input.eventType,
      points:    REPUTATION_RULES[input.eventType],
      metadata:  input.metadata ?? null,
      createdAt: new Date().toISOString(),
    };
    this.events.unshift(event);
    return event;
  }

  async getEvents(userId: string, limit: number): Promise<ReputationEvent[]> {
    return this.events
      .filter(e => e.userId === userId)
      .slice(0, limit);
  }
}
