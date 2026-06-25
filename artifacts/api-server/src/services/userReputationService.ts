import type { IUserReputationRepository, UserReputation, ReputationEvent, ReputationEventType } from "../repositories/userReputationRepository";
import { REPUTATION_RULES, LEVEL_THRESHOLDS } from "../repositories/userReputationRepository";
import { questEventBus } from "../realtime/questEventBus.js";

export interface ReputationProfile {
  userId:          string;
  totalPoints:     number;
  level:           string;
  nextLevel:       string | null;
  pointsToNext:    number | null;
  progressPercent: number;
  updatedAt:       string;
}

function buildProfile(rep: UserReputation): ReputationProfile {
  const idx   = LEVEL_THRESHOLDS.findIndex(t => t.level === rep.level);
  const cur   = LEVEL_THRESHOLDS[idx]!;
  const next  = LEVEL_THRESHOLDS[idx + 1] ?? null;

  const rangeStart = cur.min;
  const rangeEnd   = next ? next.min : cur.min + 1;
  const progress   = next
    ? Math.min(100, Math.round(((rep.totalPoints - rangeStart) / (rangeEnd - rangeStart)) * 100))
    : 100;

  return {
    userId:          rep.userId,
    totalPoints:     rep.totalPoints,
    level:           rep.level,
    nextLevel:       next?.level ?? null,
    pointsToNext:    next ? next.min - rep.totalPoints : null,
    progressPercent: progress,
    updatedAt:       rep.updatedAt,
  };
}

export class UserReputationService {
  constructor(private readonly repo: IUserReputationRepository) {}

  async getReputation(userId: string): Promise<ReputationProfile> {
    let rep = await this.repo.getByUserId(userId);
    if (!rep) {
      rep = await this.repo.upsert(userId, 0);
    }
    return buildProfile(rep);
  }

  async addEvent(
    userId: string,
    eventType: ReputationEventType,
    metadata?: unknown,
  ): Promise<{ event: ReputationEvent; reputation: ReputationProfile }> {
    const points = REPUTATION_RULES[eventType];
    const [event, rep] = await Promise.all([
      this.repo.addEvent({ userId, eventType, metadata }),
      this.repo.upsert(userId, points),
    ]);
    if (points > 0) {
      questEventBus.publish({ userId, type: "REPUTATION_GAINED", amount: points, metadata: { eventType: eventType as string } });
    }
    return { event, reputation: buildProfile(rep) };
  }

  fire(userId: string, eventType: ReputationEventType, metadata?: unknown): void {
    this.addEvent(userId, eventType, metadata).catch(() => {});
  }

  async getLeaderboard(limit = 20): Promise<Array<ReputationProfile & { rank: number }>> {
    const rows = await this.repo.getLeaderboard(limit);
    return rows.map(r => ({ ...buildProfile(r), rank: r.rank }));
  }

  async getHistory(userId: string, limit = 50): Promise<ReputationEvent[]> {
    return this.repo.getEvents(userId, limit);
  }
}
