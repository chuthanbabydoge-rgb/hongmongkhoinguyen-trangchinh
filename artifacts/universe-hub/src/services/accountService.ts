// ─────────────────────────────────────────────────────────────────────────────
// Universe Account Service
//
// Lớp tích hợp tài khoản Universe Hub.
// Hiện tại sử dụng mock data dựa trên Promise.
// Để kết nối API thực: thay thế phần thân các hàm trong `UniverseAccountService`
// bằng lệnh gọi fetch tới endpoint tương ứng.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string;
  title: string;
  status: "online" | "away" | "offline";
  level: number;
  xp: number;
  maxXp: number;
  reputation: number;
  joinedAt: string;
}

export interface UserAvatar {
  userId: string;
  initials: string;
  imageUrl: string | null;
  frameColor: string;
  badgeIcon: string | null;
}

export interface UserLevel {
  current: number;
  xp: number;
  maxXp: number;
  progressPercent: number;
  rank: string;
}

export interface UserXP {
  total: number;
  thisWeek: number;
  thisMonth: number;
  lastActivity: string;
}

export interface UserReputation {
  score: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  upvotes: number;
  downvotes: number;
  badges: string[];
}

export type NotificationType =
  | "reward"
  | "transaction"
  | "system"
  | "social"
  | "marketplace";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

/**
 * Đổi BASE_URL thành endpoint thực khi sẵn sàng kết nối.
 * Ví dụ: "https://api.universe.io/v1"
 */
const API_CONFIG = {
  BASE_URL: "",
  MOCK_DELAY_MS: 300,
} as const;

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROFILE: UserProfile = {
  id: "user-001",
  username: "Commander Zara",
  title: "Galactic Architect",
  status: "online",
  level: 47,
  xp: 84320,
  maxXp: 100000,
  reputation: 142,
  joinedAt: "2022-03-15T08:00:00Z",
};

const MOCK_AVATAR: UserAvatar = {
  userId: "user-001",
  initials: "CZ",
  imageUrl: null,
  frameColor: "#7c3aed",
  badgeIcon: "shield",
};

const MOCK_LEVEL: UserLevel = {
  current: 47,
  xp: 84320,
  maxXp: 100000,
  progressPercent: Math.round((84320 / 100000) * 100),
  rank: "Ưu tú",
};

const MOCK_XP: UserXP = {
  total: 84320,
  thisWeek: 1240,
  thisMonth: 4870,
  lastActivity: new Date().toISOString(),
};

const MOCK_REPUTATION: UserReputation = {
  score: 142,
  tier: "gold",
  upvotes: 198,
  downvotes: 12,
  badges: ["early-adopter", "trader", "explorer"],
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    type: "reward",
    title: "Phần thưởng hàng ngày",
    message: "Bạn nhận được 500 xu từ phần thưởng đăng nhập hàng ngày.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "notif-002",
    type: "marketplace",
    title: "Giao dịch thành công",
    message: "Thú cưng Rồng Lửa của bạn đã được bán với giá 12.000 tín dụng.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "notif-003",
    type: "system",
    title: "Cập nhật hệ thống",
    message: "Universe Hub v4.8.0 đã phát hành. Nhiều tính năng mới.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "notif-004",
    type: "social",
    title: "Lời mời kết bạn",
    message: "StarLord99 muốn kết bạn với bạn.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Mô phỏng độ trễ mạng. Xóa khi dùng API thực.
 */
function simulateDelay<T>(data: T): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(data), API_CONFIG.MOCK_DELAY_MS),
  );
}

/**
 * Khi dùng API thực, thay thế `simulateDelay` bằng hàm này:
 *
 *   async function apiFetch<T>(path: string): Promise<T> {
 *     const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
 *       headers: { Authorization: `Bearer ${getAuthToken()}` },
 *     });
 *     if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
 *     return res.json() as Promise<T>;
 *   }
 */

// ─── Service class ────────────────────────────────────────────────────────────

class UniverseAccountService {
  /**
   * Lấy toàn bộ thông tin hồ sơ người dùng.
   *
   * API thực: GET /accounts/me
   */
  async getUserProfile(): Promise<UserProfile> {
    return simulateDelay(MOCK_PROFILE);
  }

  /**
   * Lấy thông tin avatar của người dùng.
   *
   * API thực: GET /accounts/me/avatar
   */
  async getUserAvatar(): Promise<UserAvatar> {
    return simulateDelay(MOCK_AVATAR);
  }

  /**
   * Lấy cấp độ và tiến trình XP hiện tại.
   *
   * API thực: GET /accounts/me/level
   */
  async getUserLevel(): Promise<UserLevel> {
    return simulateDelay(MOCK_LEVEL);
  }

  /**
   * Lấy thống kê điểm kinh nghiệm (XP).
   *
   * API thực: GET /accounts/me/xp
   */
  async getUserXP(): Promise<UserXP> {
    return simulateDelay(MOCK_XP);
  }

  /**
   * Lấy điểm danh tiếng và huy hiệu.
   *
   * API thực: GET /accounts/me/reputation
   */
  async getUserReputation(): Promise<UserReputation> {
    return simulateDelay(MOCK_REPUTATION);
  }

  /**
   * Lấy danh sách thông báo. Trả về chưa đọc trước.
   *
   * API thực: GET /accounts/me/notifications?limit=50
   */
  async getNotifications(): Promise<Notification[]> {
    const sorted = [...MOCK_NOTIFICATIONS].sort((a, b) =>
      Number(a.isRead) - Number(b.isRead),
    );
    return simulateDelay(sorted);
  }

  /**
   * Đếm số thông báo chưa đọc.
   */
  async getUnreadNotificationCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter((n) => !n.isRead).length;
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const accountService = new UniverseAccountService();
