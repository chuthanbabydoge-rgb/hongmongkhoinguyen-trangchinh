import type { IAchievementsRepository, Achievement, UserAchievement, AchievementKey } from "../repositories/achievementsRepository";
import type { NotificationsService } from "./notificationsService";
import type { ReputationEventType } from "../repositories/userReputationRepository";

export interface AchievementUnlockResult {
  achievement: Achievement;
  userAchievement: UserAchievement;
}

export class AchievementService {
  constructor(
    private readonly repo: IAchievementsRepository,
    private readonly notif: NotificationsService | null = null,
  ) {}

  async getAllAchievements(): Promise<Achievement[]> {
    return this.repo.getAllAchievements();
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.repo.getUserAchievements(userId);
  }

  async checkAndUnlock(
    userId: string,
    eventType: ReputationEventType,
    context: { totalPoints?: number; itemCount?: number } = {},
  ): Promise<AchievementUnlockResult[]> {
    const unlocked: AchievementUnlockResult[] = [];

    const tryUnlock = async (key: AchievementKey): Promise<void> => {
      const already = await this.repo.hasAchievement(userId, key);
      if (already) return;

      const ach = await this.repo.getAchievement(key);
      if (!ach) return;

      const ua = await this.repo.unlock(userId, key);
      unlocked.push({ achievement: ach, userAchievement: ua });

      this.notif?.fire(
        userId,
        "reward",
        `🏆 Thành tựu mới: ${ach.icon} ${ach.title}`,
        ach.description,
      );
    };

    switch (eventType) {
      case "LOGIN":
        await tryUnlock("FIRST_LOGIN");
        break;

      case "INVENTORY_ACQUIRED":
        await tryUnlock("FIRST_ITEM");
        if (context.itemCount && context.itemCount >= 10) {
          await tryUnlock("COLLECTOR");
        }
        break;

      case "MARKETPLACE_PURCHASE":
        await tryUnlock("FIRST_PURCHASE");
        break;

      case "MARKETPLACE_SALE": {
        await tryUnlock("FIRST_SALE");
        const salesCount = await this.repo.countUserEvents(userId, "MARKETPLACE_SALE");
        if (salesCount >= 5) await tryUnlock("MERCHANT");
        break;
      }

      case "WALLET_TRANSFER":
        await tryUnlock("FIRST_TRANSFER");
        break;

      case "MARKETPLACE_LISTING":
        await tryUnlock("FIRST_LISTING");
        break;
    }

    if ((context.totalPoints ?? 0) >= 100) {
      await tryUnlock("VETERAN");
    }

    return unlocked;
  }

  async checkAndUnlockAsync(
    userId: string,
    eventType: ReputationEventType,
    context: { totalPoints?: number; itemCount?: number } = {},
  ): Promise<void> {
    this.checkAndUnlock(userId, eventType, context).catch(() => {});
  }
}
