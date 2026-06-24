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

// apiFetch automatically attaches Bearer token and unwraps { ok, data } envelope.
// GET /api/notifications returns envelope.data as ApiNotification[].
export async function fetchNotifications(opts?: {
  type?: ApiNotificationType;
  unreadOnly?: boolean;
}): Promise<ApiNotificationsResponse> {
  const params = new URLSearchParams();
  if (opts?.type) params.set("type", opts.type);
  if (opts?.unreadOnly) params.set("unread", "true");

  const suffix = params.toString() ? `?${params}` : "";
  const data = await apiFetch<ApiNotification[]>(`/notifications${suffix}`);

  return {
    notifications: data ?? [],
    total: data?.length ?? 0,
    unreadCount: (data ?? []).filter(n => !n.isRead).length,
  };
}
