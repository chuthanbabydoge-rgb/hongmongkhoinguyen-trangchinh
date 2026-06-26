// ─────────────────────────────────────────────────────────────────────────────
// MatchmakingService — HUB-23
// MMR-based queue matchmaking, group matching
// ─────────────────────────────────────────────────────────────────────────────

import type { IPvpRepository, PvpQueueEntry, PvpMatch, PvpMatchPlayer, MatchType, RankTier } from "../repositories/pvpRepository.js";
import type { PvpService } from "./pvpService.js";
import { pvpEventBus } from "./pvpEventBus.js";

export class MatchmakingError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message); this.name = "MatchmakingError";
  }
}

const MATCH_SIZE: Record<MatchType, number> = {
  DUEL:       2,
  ARENA_2V2:  4,
  ARENA_3V3:  6,
  ARENA_5V5: 10,
  GUILD_WAR: 10,
};

const MMR_WINDOW = 300; // ±300 MMR for matching

function mmrToTier(mmr: number): RankTier {
  if (mmr >= 3000) return "LEGEND";
  if (mmr >= 2500) return "GRANDMASTER";
  if (mmr >= 2000) return "MASTER";
  if (mmr >= 1800) return "DIAMOND";
  if (mmr >= 1500) return "PLATINUM";
  if (mmr >= 1200) return "GOLD";
  if (mmr >= 1000) return "SILVER";
  return "BRONZE";
}

export class MatchmakingService {
  private matchingIntervals = new Map<MatchType, NodeJS.Timeout>();

  constructor(
    private repo: IPvpRepository,
    private pvpService: PvpService,
  ) {
    this.startMatchingLoop();
  }

  private startMatchingLoop(): void {
    const types: MatchType[] = ["DUEL", "ARENA_2V2", "ARENA_3V3", "ARENA_5V5"];
    for (const type of types) {
      const interval = setInterval(() => {
        this.tryMatch(type).catch(() => {});
      }, 5000); // try every 5s
      this.matchingIntervals.set(type, interval);
    }
  }

  async joinQueue(userId: string, matchType: MatchType, seasonId?: string, isRanked = true): Promise<PvpQueueEntry> {
    const existing = await this.repo.getQueueEntry(userId);
    if (existing) throw new MatchmakingError("ALREADY_IN_QUEUE", "Bạn đang trong hàng đợi");

    let mmr = 1000;
    if (seasonId) {
      const ranking = await this.repo.getRanking(userId, seasonId);
      mmr = ranking?.mmr ?? 1000;
    }

    const entry = await this.repo.joinQueue({
      userId, matchType, mmr,
      tier: mmrToTier(mmr),
      loadoutId: null, guildId: null, isRanked,
    });

    pvpEventBus.publish({ type: "QUEUE_UPDATED", payload: { userId, action: "JOINED", matchType, mmr } });

    // Try to match immediately
    setTimeout(() => this.tryMatch(matchType).catch(() => {}), 100);

    return entry;
  }

  async leaveQueue(userId: string): Promise<void> {
    await this.repo.leaveQueue(userId);
    pvpEventBus.publish({ type: "QUEUE_UPDATED", payload: { userId, action: "LEFT" } });
  }

  async getQueueStatus(userId: string): Promise<{ inQueue: boolean; entry: PvpQueueEntry | null }> {
    const entry = await this.repo.getQueueEntry(userId);
    return { inQueue: !!entry, entry };
  }

  private async tryMatch(matchType: MatchType): Promise<void> {
    const queue = await this.repo.getQueue(matchType);
    if (queue.length < 2) return;

    const needed = MATCH_SIZE[matchType];
    if (queue.length < needed) return;

    // Find MMR-compatible group (within window of first player)
    const anchor = queue[0]!;
    const compatible = queue.filter((e) =>
      Math.abs(e.mmr - anchor.mmr) <= MMR_WINDOW
    ).slice(0, needed);

    if (compatible.length < needed) return;

    // Remove from queue and create match
    for (const entry of compatible) {
      await this.repo.leaveQueue(entry.userId);
    }

    const season = await this.repo.getCurrentSeason();
    const playerIds = compatible.map((e) => e.userId);

    await this.pvpService.createMatch({
      type: matchType,
      playerIds,
      seasonId: season?.id,
      isRanked: compatible.every((e) => e.isRanked),
    });
  }
}
