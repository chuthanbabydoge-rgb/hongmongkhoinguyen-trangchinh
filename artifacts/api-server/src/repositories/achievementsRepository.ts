export type AchievementKey =
  | "FIRST_LOGIN"
  | "FIRST_ITEM"
  | "FIRST_PURCHASE"
  | "FIRST_SALE"
  | "FIRST_TRANSFER"
  | "FIRST_LISTING"
  | "COLLECTOR"
  | "MERCHANT"
  | "VETERAN";

export interface Achievement {
  id:          string;
  key:         AchievementKey;
  title:       string;
  description: string;
  icon:        string;
  criteria:    unknown | null;
}

export interface UserAchievement {
  id:             string;
  userId:         string;
  achievementKey: AchievementKey;
  unlockedAt:     string;
  achievement?:   Achievement;
}

export const STARTER_ACHIEVEMENTS: Achievement[] = [
  { id: "ach-001", key: "FIRST_LOGIN",    title: "Chào mừng!",           description: "Đăng nhập lần đầu vào Universe Hub.",           icon: "🌟", criteria: null },
  { id: "ach-002", key: "FIRST_ITEM",     title: "Bộ sưu tập đầu tiên",  description: "Nhận vật phẩm đầu tiên vào kho đồ.",             icon: "📦", criteria: null },
  { id: "ach-003", key: "FIRST_PURCHASE", title: "Người mua đầu tiên",   description: "Thực hiện giao dịch mua đầu tiên trên chợ.",     icon: "🛍️", criteria: null },
  { id: "ach-004", key: "FIRST_SALE",     title: "Người bán đầu tiên",   description: "Hoàn thành giao dịch bán đầu tiên trên chợ.",    icon: "💰", criteria: null },
  { id: "ach-005", key: "FIRST_TRANSFER", title: "Giao dịch ví đầu tiên","description": "Thực hiện chuyển tiền ví lần đầu tiên.",        icon: "💳", criteria: null },
  { id: "ach-006", key: "FIRST_LISTING",  title: "Người niêm yết",       description: "Đăng niêm yết đầu tiên trên chợ trực tuyến.",   icon: "🏷️", criteria: null },
  { id: "ach-007", key: "COLLECTOR",      title: "Nhà sưu tập",          description: "Thu thập 10 vật phẩm trong kho đồ.",             icon: "🗃️", criteria: { minItems: 10 } },
  { id: "ach-008", key: "MERCHANT",       title: "Thương nhân",          description: "Hoàn thành 5 giao dịch bán hàng.",               icon: "🏪", criteria: { minSales: 5 } },
  { id: "ach-009", key: "VETERAN",        title: "Cựu chiến binh",       description: "Tích lũy 100 điểm danh tiếng.",                 icon: "⭐", criteria: { minPoints: 100 } },
];

export interface IAchievementsRepository {
  getAllAchievements(): Promise<Achievement[]>;
  getAchievement(key: AchievementKey): Promise<Achievement | null>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  hasAchievement(userId: string, key: AchievementKey): Promise<boolean>;
  unlock(userId: string, key: AchievementKey): Promise<UserAchievement>;
  countUserEvents(userId: string, eventType: string): Promise<number>;
}

export class InMemoryAchievementsRepository implements IAchievementsRepository {
  private achievements: Achievement[] = [...STARTER_ACHIEVEMENTS];
  private userAchievements: UserAchievement[] = [];
  private eventCounts: Map<string, Map<string, number>> = new Map();

  async getAllAchievements(): Promise<Achievement[]> {
    return this.achievements;
  }

  async getAchievement(key: AchievementKey): Promise<Achievement | null> {
    return this.achievements.find(a => a.key === key) ?? null;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const userAchs = this.userAchievements.filter(ua => ua.userId === userId);
    return userAchs.map(ua => ({
      ...ua,
      achievement: this.achievements.find(a => a.key === ua.achievementKey),
    }));
  }

  async hasAchievement(userId: string, key: AchievementKey): Promise<boolean> {
    return this.userAchievements.some(ua => ua.userId === userId && ua.achievementKey === key);
  }

  async unlock(userId: string, key: AchievementKey): Promise<UserAchievement> {
    const ua: UserAchievement = {
      id:             crypto.randomUUID(),
      userId,
      achievementKey: key,
      unlockedAt:     new Date().toISOString(),
      achievement:    this.achievements.find(a => a.key === key),
    };
    this.userAchievements.push(ua);
    return ua;
  }

  async countUserEvents(userId: string, eventType: string): Promise<number> {
    return this.eventCounts.get(userId)?.get(eventType) ?? 0;
  }

  incrementEventCount(userId: string, eventType: string): void {
    if (!this.eventCounts.has(userId)) this.eventCounts.set(userId, new Map());
    const userMap = this.eventCounts.get(userId)!;
    userMap.set(eventType, (userMap.get(eventType) ?? 0) + 1);
  }
}
