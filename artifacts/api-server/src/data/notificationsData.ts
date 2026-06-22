// ─────────────────────────────────────────────────────────────────────────────
// Mock notifications data
// Replace with DB queries when integrating a database.
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType = "reward" | "transaction" | "system" | "social" | "marketplace";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    userId: "user-001",
    type: "reward",
    title: "Phần thưởng hàng ngày",
    message: "Bạn nhận được 500 xu từ phần thưởng đăng nhập hàng ngày.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "notif-002",
    userId: "user-001",
    type: "marketplace",
    title: "Giao dịch thành công",
    message: "Thú cưng Rồng Lửa của bạn đã được bán với giá 12.000 tín dụng.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "notif-003",
    userId: "user-001",
    type: "marketplace",
    title: "Đang dẫn đầu phiên đấu giá",
    message: "Bạn đang dẫn đầu phiên đấu giá 'Đảo Thiên Hà Nguyên Thủy' với 187.500 tín dụng.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "notif-004",
    userId: "user-001",
    type: "system",
    title: "Cập nhật hệ thống",
    message: "Universe Hub v4.8.0 đã phát hành. Nhiều tính năng mới.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "notif-005",
    userId: "user-001",
    type: "social",
    title: "Lời mời kết bạn",
    message: "StarLord99 muốn kết bạn với bạn.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "notif-006",
    userId: "user-001",
    type: "transaction",
    title: "Nhận chuyển khoản",
    message: "NebulaMaster đã chuyển 8.500 tín dụng cho bạn.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];
