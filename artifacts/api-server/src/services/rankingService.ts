// ─────────────────────────────────────────────────────────────────────────────
// RankingService — HUB-23
// Season ranking, leaderboard, rewards distribution
// ─────────────────────────────────────────────────────────────────────────────

import type { IPvpRepository, PvpSeason, PvpRanking, PvpReward, RankTier } from "../repositories/pvpRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import { pvpEventBus } from "./pvpEventBus.js";

const SEASON_REWARDS: Record<RankTier, { credits: number; xu: number; tokens: number }> = {
  BRONZE:      { credits: 100,  xu: 50,  tokens: 0 },
  SILVER:      { credits: 250,  xu: 100, tokens: 0 },
  GOLD:        { credits: 500,  xu: 200, tokens: 1 },
  PLATINUM:    { credits: 1000, xu: 400, tokens: 2 },
  DIAMOND:     { credits: 2000, xu: 800, tokens: 5 },
  MASTER:      { credits: 4000, xu: 1500, tokens: 10 },
  GRANDMASTER: { credits: 8000, xu: 3000, tokens: 20 },
  LEGEND:      { credits: 15000, xu: 6000, tokens: 50 },
};

export class RankingService {
  constructor(
    private repo: IPvpRepository,
    private notifService: NotificationsService,
  ) {}

  async getCurrentSeason(): Promise<PvpSeason | null> {
    return this.repo.getCurrentSeason();
  }

  async getSeasons(): Promise<PvpSeason[]> {
    return this.repo.getSeasons();
  }

  async getLeaderboard(seasonId?: string, limit = 100): Promise<PvpRanking[]> {
    const season = seasonId ? { id: seasonId } : await this.repo.getCurrentSeason();
    if (!season) return [];
    return this.repo.getLeaderboard(season.id, limit);
  }

  async getUserRanking(userId: string, seasonId?: string): Promise<PvpRanking | null> {
    const season = seasonId ? { id: seasonId } : await this.repo.getCurrentSeason();
    if (!season) return null;
    return this.repo.getRanking(userId, season.id);
  }

  async startNewSeason(name: string): Promise<PvpSeason> {
    const seasons = await this.repo.getSeasons();
    const number = seasons.length + 1;

    // End current active season
    const currentSeason = await this.repo.getCurrentSeason();
    if (currentSeason && currentSeason.status === "ACTIVE") {
      await this.endSeason(currentSeason.id);
    }

    const newSeason = await this.repo.createSeason({
      name, number, status: "ACTIVE",
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: null,
    });

    pvpEventBus.publish({ type: "SEASON_STARTED", seasonId: newSeason.id, payload: { seasonId: newSeason.id, name, number } });
    return newSeason;
  }

  async endSeason(seasonId: string): Promise<{ season: PvpSeason; rewards: PvpReward[] }> {
    const season = await this.repo.updateSeason(seasonId, {
      status: "FINISHED",
      endAt: new Date().toISOString(),
    });
    if (!season) throw new Error("Season not found");

    // Distribute rewards to top players
    const leaderboard = await this.repo.getLeaderboard(seasonId, 500);
    const rewards: PvpReward[] = [];

    for (const ranking of leaderboard) {
      const rewardConfig = SEASON_REWARDS[ranking.tier];
      const reward = await this.repo.createReward({
        userId: ranking.userId,
        seasonId,
        tier: ranking.tier,
        rewardType: "SEASON",
        credits: rewardConfig.credits,
        xu: rewardConfig.xu,
        tokens: rewardConfig.tokens,
        items: null,
        claimed: false,
        claimedAt: null,
      });
      rewards.push(reward);

      await this.notifService.fire(
        ranking.userId,
        "pvp_season_reward",
        `Phần thưởng mùa ${season.name}!`,
        `Bạn kết thúc mùa ở hạng ${ranking.tier} — Nhận ${rewardConfig.credits} Credits + ${rewardConfig.xu} XU!`,
      );
    }

    pvpEventBus.publish({ type: "SEASON_ENDED", seasonId, payload: { seasonId, name: season.name, totalPlayers: leaderboard.length } });
    return { season, rewards };
  }
}
