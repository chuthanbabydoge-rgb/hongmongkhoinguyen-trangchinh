// ─────────────────────────────────────────────────────────────────────────────
// Notification service — GET /api/notifications
// ─────────────────────────────────────────────────────────────────────────────

import { apiFetch } from "@/lib/apiClient";

export type ApiNotificationType =
  | "reward"
  | "transaction"
  | "system"
  | "social"
  | "marketplace";

export interface ApiNotification {
  id: string;
  userId: string;
  type: ApiNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiNotificationsResponse {
  notifications: ApiNotification[];
  total: number;
  unreadCount: number;
}

export async function fetchNotifications(opts?: {
  type?: ApiNotificationType;
  unreadOnly?: boolean;
}): Promise<ApiNotificationsResponse> {
  const params = new URLSearchParams();
  if (opts?.type) params.set("type", opts.type);
  if (opts?.unreadOnly) params.set("unread", "true");

  // The endpoint wraps data in { ok, data, total, unreadCount }
  // apiFetch unwraps `data`, but we also need `total` and `unreadCount`.
  // So we fetch raw here and unwrap manually.
  const res = await fetch(`/api/notifications?${params}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: /api/notifications`);
  }

  const envelope = await res.json() as {
    ok: boolean;
    data: ApiNotification[];
    total: number;
    unreadCount: number;
    error?: string;
  };

  if (!envelope.ok) {
    throw new Error(envelope.error ?? "Không thể tải thông báo.");
  }

  return {
    notifications: envelope.data,
    total: envelope.total,
    unreadCount: envelope.unreadCount,
  };
}
