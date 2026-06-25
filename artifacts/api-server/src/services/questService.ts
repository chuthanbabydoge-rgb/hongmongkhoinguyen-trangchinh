// ─────────────────────────────────────────────────────────────────────────────
// QuestService — HUB-12
//
// Quest/Mission engine: start, progress, complete, claim, cancel.
// Reward: wallet credit, reputation, achievement, notification, activity.
// ─────────────────────────────────────────────────────────────────────────────

import type { IQuestRepository, Quest, UserQuest, QuestType, ObjectiveType, CreateQuestInput } from "../repositories/questRepository.js";
import type { WalletService } from "./walletService.js";
import type { UserReputationService } from "./userReputationService.js";
import type { AchievementService } from "./achievementService.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";

export const QUEST_REPUTATION_REWARDS: Record<Quest["difficulty"], number> = {
  EASY:      5,
  NORMAL:    10,
  HARD:      25,
  LEGENDARY: 100,
};

const ACHIEVEMENT_KEYS = {
  FIRST_QUEST:    "FIRST_QUEST",
  QUEST_100:      "100_QUESTS",
  DAILY_MASTER:   "DAILY_MASTER",
  LEGEND_HUNTER:  "LEGEND_HUNTER",
} as const;

export class QuestNotFoundError extends Error {
  constructor(id: string) { super(`Quest không tồn tại: ${id}`); this.name = "QuestNotFoundError"; }
}
export class UserQuestNotFoundError extends Error {
  constructor(id: string) { super(`UserQuest không tồn tại: ${id}`); this.name = "UserQuestNotFoundError"; }
}
export class QuestAlreadyStartedError extends Error {
  constructor() { super("Bạn đã bắt đầu quest này rồi."); this.name = "QuestAlreadyStartedError"; }
}
export class QuestNotCompletedError extends Error {
  constructor() { super("Quest chưa hoàn thành, không thể nhận phần thưởng."); this.name = "QuestNotCompletedError"; }
}
export class QuestAlreadyClaimedError extends Error {
  constructor() { super("Phần thưởng đã được nhận."); this.name = "QuestAlreadyClaimedError"; }
}

export class QuestService {
  constructor(
    private readonly repo:         IQuestRepository,
    private readonly walletService: WalletService,
    private readonly reputation:   UserReputationService,
    private readonly achievements: AchievementService,
    private readonly notifications:NotificationsService,
    private readonly activities:   ActivitiesService,
  ) {}

  // ── Read ──────────────────────────────────────────────────────────────────────

  async getAvailableQuests(): Promise<Quest[]> {
    return this.repo.findAll({ status: "ACTIVE" });
  }

  async getQuestById(id: string): Promise<Quest> {
    const q = await this.repo.findById(id);
    if (!q) throw new QuestNotFoundError(id);
    return q;
  }

  async getDailyQuests(): Promise<Quest[]> {
    return this.repo.findAll({ type: "DAILY", status: "ACTIVE" });
  }

  async getWeeklyQuests(): Promise<Quest[]> {
    return this.repo.findAll({ type: "WEEKLY", status: "ACTIVE" });
  }

  async getMyQuests(userId: string): Promise<{ quest: Quest; userQuest: UserQuest }[]> {
    const userQuests = await this.repo.findUserQuestsByUserIdAndStatus(userId, ["IN_PROGRESS"]);
    const result: { quest: Quest; userQuest: UserQuest }[] = [];
    for (const uq of userQuests) {
      const q = await this.repo.findById(uq.questId);
      if (q) result.push({ quest: q, userQuest: uq });
    }
    return result;
  }

  async getCompletedQuests(userId: string): Promise<{ quest: Quest; userQuest: UserQuest }[]> {
    const userQuests = await this.repo.findUserQuestsByUserIdAndStatus(userId, ["COMPLETED", "CLAIMED"]);
    const result: { quest: Quest; userQuest: UserQuest }[] = [];
    for (const uq of userQuests) {
      const q = await this.repo.findById(uq.questId);
      if (q) result.push({ quest: q, userQuest: uq });
    }
    return result;
  }

  async getAllUserQuests(userId: string): Promise<{ quest: Quest; userQuest: UserQuest }[]> {
    const userQuests = await this.repo.findUserQuestsByUserId(userId);
    const result: { quest: Quest; userQuest: UserQuest }[] = [];
    for (const uq of userQuests) {
      const q = await this.repo.findById(uq.questId);
      if (q) result.push({ quest: q, userQuest: uq });
    }
    return result;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  async startQuest(userId: string, questId: string): Promise<UserQuest> {
    const quest = await this.repo.findById(questId);
    if (!quest) throw new QuestNotFoundError(questId);
    if (quest.status !== "ACTIVE") throw new Error("Quest không còn hoạt động.");

    const existing = await this.repo.findUserQuestByUserAndQuest(userId, questId);
    if (existing && existing.status === "IN_PROGRESS") throw new QuestAlreadyStartedError();

    if (existing && !quest.repeatable && (existing.status === "COMPLETED" || existing.status === "CLAIMED")) {
      throw new Error("Quest không thể lặp lại.");
    }

    const userQuest = await this.repo.createUserQuest(userId, questId);

    this.activities.fire({
      userId,
      type:        "quest",
      title:       "Quest bắt đầu",
      description: `Bạn đã bắt đầu quest "${quest.title}".`,
      metadata:    { questId: quest.id, questTitle: quest.title },
      sourceApp:   "universe-quests",
    });

    return userQuest;
  }

  async cancelQuest(userId: string, userQuestId: string): Promise<UserQuest> {
    const uq = await this.repo.findUserQuestById(userQuestId);
    if (!uq) throw new UserQuestNotFoundError(userQuestId);
    if (uq.userId !== userId) throw new Error("Không có quyền huỷ quest này.");
    if (uq.status !== "IN_PROGRESS") throw new Error("Chỉ có thể huỷ quest đang tiến hành.");

    const updated = await this.repo.updateUserQuestStatus(userQuestId, "CANCELLED");
    return updated!;
  }

  async claimReward(userId: string, questId: string): Promise<{
    userQuest: UserQuest;
    wallet: unknown;
    reputation: unknown;
  }> {
    const uq = await this.repo.findUserQuestByUserAndQuest(userId, questId);
    if (!uq) throw new UserQuestNotFoundError(questId);
    if (uq.status === "CLAIMED") throw new QuestAlreadyClaimedError();
    if (uq.status !== "COMPLETED") throw new QuestNotCompletedError();

    const quest = await this.repo.findById(uq.questId);
    if (!quest) throw new QuestNotFoundError(uq.questId);

    const now = new Date().toISOString();
    const updated = await this.repo.updateUserQuestStatus(uq.id, "CLAIMED", { claimedAt: now });

    // ── 1. Wallet rewards ─────────────────────────────────────────────────────
    let walletResult: unknown = null;
    if (quest.rewardCredits > 0) {
      walletResult = await this.walletService.createEntry(userId, "credits", "credit", quest.rewardCredits, `Phần thưởng quest: ${quest.title}`, "completed", `QUEST-${uq.id}-credits`).catch(() => null);
    }
    if (quest.rewardCoins > 0) {
      await this.walletService.createEntry(userId, "coins", "credit", quest.rewardCoins, `Phần thưởng quest: ${quest.title}`, "completed", `QUEST-${uq.id}-coins`).catch(() => null);
    }
    if (quest.rewardTokens > 0) {
      await this.walletService.createEntry(userId, "tokens", "credit", quest.rewardTokens, `Phần thưởng quest: ${quest.title}`, "completed", `QUEST-${uq.id}-tokens`).catch(() => null);
    }

    // ── 2. Reputation ─────────────────────────────────────────────────────────
    const repPoints = quest.rewardReputation > 0
      ? quest.rewardReputation
      : QUEST_REPUTATION_REWARDS[quest.difficulty];

    const repResult = await this.reputation.addEvent(userId, "QUEST_COMPLETED", {
      questId:    quest.id,
      questTitle: quest.title,
      difficulty: quest.difficulty,
      points:     repPoints,
    }).catch(() => null);

    // Override the 0-point rule with actual quest reward
    if (repResult && repPoints > 0) {
      await this.reputation.addEvent(userId, "QUEST_COMPLETED", { points: repPoints - 0 }).catch(() => null);
    }

    // ── 3. Achievements ───────────────────────────────────────────────────────
    const totalCompleted = (await this.repo.findUserQuestsByUserIdAndStatus(userId, ["CLAIMED"])).length;

    this.achievements.checkAndUnlockAsync(userId, "QUEST_COMPLETED", {
      totalPoints: repResult?.reputation.totalPoints ?? 0,
    });

    // ── 4. Notifications ──────────────────────────────────────────────────────
    this.notifications.fire(
      userId,
      "quest",
      "Phần thưởng Quest đã nhận!",
      `Bạn đã nhận thưởng cho quest "${quest.title}": ${[
        quest.rewardCredits > 0 ? `${quest.rewardCredits} Credits` : null,
        quest.rewardCoins   > 0 ? `${quest.rewardCoins} Coins`     : null,
        quest.rewardTokens  > 0 ? `${quest.rewardTokens} Tokens`   : null,
        `+${repPoints} Reputation`,
      ].filter(Boolean).join(", ")}.`,
    );

    // ── 5. Activity ───────────────────────────────────────────────────────────
    this.activities.fire({
      userId,
      type:        "quest",
      title:       "Phần thưởng Quest đã nhận",
      description: `Bạn đã nhận phần thưởng quest "${quest.title}" [${quest.difficulty}].`,
      metadata:    { questId: quest.id, questTitle: quest.title, difficulty: quest.difficulty, rewardCredits: quest.rewardCredits },
      sourceApp:   "universe-quests",
    });

    return { userQuest: updated!, wallet: walletResult, reputation: repResult };
  }

  // ── Progress tracking (called by other services / events) ─────────────────────

  async trackObjectiveEvent(
    userId: string,
    eventType: ObjectiveType,
    amount = 1,
  ): Promise<void> {
    const userQuests = await this.repo.findUserQuestsByUserIdAndStatus(userId, ["IN_PROGRESS"]);
    for (const uq of userQuests) {
      const quest = await this.repo.findById(uq.questId);
      if (!quest) continue;
      for (const obj of quest.objectives) {
        if (obj.type !== eventType) continue;
        const progress = uq.progress.find(p => p.objectiveId === obj.id);
        if (progress?.completed) continue;
        await this.repo.incrementProgress(uq.id, obj.id, amount);
      }
      // Re-fetch to check completion
      const refreshed = await this.repo.findUserQuestById(uq.id);
      if (!refreshed) continue;
      const allDone = refreshed.progress.every(p => p.completed);
      if (allDone && refreshed.status === "IN_PROGRESS") {
        const now = new Date().toISOString();
        await this.repo.updateUserQuestStatus(uq.id, "COMPLETED", { completedAt: now });
        const q = quest;
        this.notifications.fire(
          userId,
          "quest",
          "Quest hoàn thành!",
          `Bạn đã hoàn thành quest "${q.title}". Hãy vào nhận phần thưởng!`,
        );
        this.activities.fire({
          userId,
          type:        "quest",
          title:       "Quest hoàn thành",
          description: `Bạn đã hoàn thành quest "${q.title}" [${q.difficulty}].`,
          metadata:    { questId: q.id, questTitle: q.title },
          sourceApp:   "universe-quests",
        });
      }
    }
  }

  // ── Admin: create quest with objectives ───────────────────────────────────────

  async createQuest(input: CreateQuestInput): Promise<Quest> {
    return this.repo.create(input);
  }

  // ── Seed daily/weekly quests ──────────────────────────────────────────────────

  async seedDefaultQuests(): Promise<void> {
    const existing = await this.repo.findAll();
    if (existing.length > 0) return;

    const seeds: CreateQuestInput[] = [
      {
        title: "Đăng nhập hàng ngày",
        description: "Đăng nhập vào Universe Hub trong ngày hôm nay.",
        type: "DAILY", difficulty: "EASY",
        rewardCredits: 50, rewardReputation: 5,
        objectives: [{ type: "LOGIN", description: "Đăng nhập vào hệ thống", targetCount: 1, orderIndex: 0, metadata: null }],
      },
      {
        title: "Nhà buôn mới",
        description: "Tạo một listing trên Marketplace.",
        type: "DAILY", difficulty: "NORMAL",
        rewardCredits: 100, rewardCoins: 10, rewardReputation: 10,
        objectives: [{ type: "CREATE_LISTING", description: "Đăng bán 1 vật phẩm", targetCount: 1, orderIndex: 0, metadata: null }],
      },
      {
        title: "Mua sắm thông thái",
        description: "Mua 3 vật phẩm trên Marketplace trong tuần này.",
        type: "WEEKLY", difficulty: "NORMAL",
        rewardCredits: 500, rewardCoins: 50, rewardReputation: 30,
        objectives: [{ type: "BUY_ITEM", description: "Mua 3 vật phẩm trên Marketplace", targetCount: 3, orderIndex: 0, metadata: null }],
      },
      {
        title: "Người bán hàng xuất sắc",
        description: "Bán thành công 5 vật phẩm trong tuần này.",
        type: "WEEKLY", difficulty: "HARD",
        rewardCredits: 1000, rewardCoins: 100, rewardTokens: 5, rewardReputation: 75,
        objectives: [{ type: "SELL_ITEM", description: "Bán thành công 5 vật phẩm", targetCount: 5, orderIndex: 0, metadata: null }],
      },
      {
        title: "Hội viên Guild",
        description: "Gia nhập một Guild trong Universe.",
        type: "MAIN", difficulty: "EASY",
        rewardCredits: 200, rewardReputation: 20,
        objectives: [{ type: "JOIN_GUILD", description: "Tham gia 1 guild", targetCount: 1, orderIndex: 0, metadata: null }],
      },
      {
        title: "Người đóng góp nhiệt tình",
        description: "Đóng góp cho Guild 3 lần.",
        type: "SIDE", difficulty: "NORMAL",
        rewardCredits: 300, rewardCoins: 30, rewardReputation: 25,
        objectives: [{ type: "CONTRIBUTE_GUILD", description: "Đóng góp 3 lần cho guild", targetCount: 3, orderIndex: 0, metadata: null }],
      },
      {
        title: "Huyền thoại Vũ Trụ",
        description: "Hoàn thành tất cả: đăng nhập, giao dịch ví, mua và bán vật phẩm.",
        type: "EVENT", difficulty: "LEGENDARY",
        rewardCredits: 5000, rewardCoins: 500, rewardTokens: 50, rewardReputation: 200,
        objectives: [
          { type: "LOGIN",            description: "Đăng nhập",          targetCount: 1, orderIndex: 0, metadata: null },
          { type: "TRANSFER_WALLET",  description: "Chuyển ví 1 lần",    targetCount: 1, orderIndex: 1, metadata: null },
          { type: "BUY_ITEM",         description: "Mua 1 vật phẩm",     targetCount: 1, orderIndex: 2, metadata: null },
          { type: "SELL_ITEM",        description: "Bán 1 vật phẩm",     targetCount: 1, orderIndex: 3, metadata: null },
        ],
      },
      {
        title: "Nhà Khám Phá Marketplace",
        description: "Tạo 2 listings trên Marketplace.",
        type: "DAILY", difficulty: "NORMAL",
        rewardCredits: 150, rewardCoins: 15, rewardReputation: 15,
        objectives: [{ type: "CREATE_LISTING", description: "Tạo 2 listings", targetCount: 2, orderIndex: 0, metadata: null }],
      },
    ];

    for (const seed of seeds) {
      await this.repo.create(seed).catch(() => null);
    }
  }
}
