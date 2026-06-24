// ─────────────────────────────────────────────────────────────────────────────
// AccountClient — HTTP client for Universe Account API
//
// Reads UNIVERSE_ACCOUNT_API_URL from the environment.
// Every request forwards the caller's Authorization Bearer token.
// Requests time out after TIMEOUT_MS (default 10 s).
//
// Error mapping:
//   Network error / timeout  → AccountServiceUnavailableError  (→ 503)
//   HTTP 5xx                 → AccountServiceUnavailableError  (→ 503)
//   HTTP 401 / 403           → AccountUnauthorizedError        (→ 401)
//   HTTP other 4xx           → AccountServiceUnavailableError  (→ 503)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IdentityDTO,
  ProfileDTO,
  AvatarDTO,
  AchievementDTO,
  ReputationDTO,
  ActivityDTO,
  NotificationDTO,
  SettingsDTO,
} from "../models/accountBridge.js";

// ─── Error ────────────────────────────────────────────────────────────────────

export class AccountServiceUnavailableError extends Error {
  constructor(cause?: unknown) {
    const detail =
      cause instanceof Error
        ? cause.message
        : typeof cause === "string"
          ? cause
          : "unknown error";
    super(`Universe Account service unavailable: ${detail}`);
    this.name = "AccountServiceUnavailableError";
  }
}

export class AccountUnauthorizedError extends Error {
  constructor(status: number) {
    super(`Universe Account: unauthorized (HTTP ${status})`);
    this.name = "AccountUnauthorizedError";
  }
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAccountClient {
  getIdentity(token?: string): Promise<IdentityDTO>;
  getProfile(token?: string): Promise<ProfileDTO>;
  getAvatar(token?: string): Promise<AvatarDTO>;
  getAchievements(token?: string): Promise<AchievementDTO[]>;
  getAchievementCount(token?: string): Promise<number>;
  getReputation(token?: string): Promise<ReputationDTO>;
  getActivities(token?: string): Promise<ActivityDTO[]>;
  getNotifications(token?: string): Promise<NotificationDTO[]>;
  getUnreadNotificationCount(token?: string): Promise<number>;
  getSettings(token?: string): Promise<SettingsDTO>;
  markNotificationRead(id: string, token?: string): Promise<void>;
  markAllNotificationsRead(token?: string): Promise<number>;
  /** Kiểm tra service có reachable không — không phụ thuộc vào auth. */
  ping(): Promise<{ connected: boolean; error?: string }>;
}

// ─── Implementation ───────────────────────────────────────────────────────────

const TIMEOUT_MS = 10_000;

export class AccountClient implements IAccountClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(path: string, token?: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const fullUrl = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = token;
    }

    console.log(`[AccountClient] → ${fullUrl} | auth=${token ? "yes" : "no"}`);

    try {
      const res = await fetch(fullUrl, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      if (!res.ok) {
        let body = "<empty>";
        try { body = await res.text(); } catch { /* ignore */ }
        console.error(`[AccountClient] ✗ ${fullUrl} → HTTP ${res.status} | body=${body.slice(0, 300)}`);
        if (res.status === 401 || res.status === 403) {
          throw new AccountUnauthorizedError(res.status);
        }
        throw new AccountServiceUnavailableError(
          `HTTP ${res.status} from ${path}`,
        );
      }

      const raw = await res.text();
      console.log(`[AccountClient] ✓ ${fullUrl} → HTTP ${res.status} | shape=${raw.slice(0, 200)}`);

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        console.error(`[AccountClient] ✗ JSON parse failed for ${fullUrl}: ${parseErr}`);
        throw new AccountServiceUnavailableError(`JSON parse error from ${path}: ${parseErr}`);
      }

      return parsed as T;
    } catch (err) {
      if (err instanceof AccountServiceUnavailableError) throw err;
      if (err instanceof AccountUnauthorizedError) throw err;
      console.error(`[AccountClient] ✗ fetch failed for ${fullUrl}: ${err}`);
      throw new AccountServiceUnavailableError(err);
    } finally {
      clearTimeout(timer);
    }
  }

  async getIdentity(token?: string): Promise<IdentityDTO> {
    const env = await this.request<{ identity?: IdentityDTO } | IdentityDTO>("/api/identity/me", token);
    return ("identity" in env && env.identity) ? env.identity : env as IdentityDTO;
  }

  async getProfile(token?: string): Promise<ProfileDTO> {
    const env = await this.request<{ profile: ProfileDTO }>("/api/profile/me", token);
    return env.profile;
  }

  async getAvatar(token?: string): Promise<AvatarDTO> {
    const env = await this.request<{ avatar: AvatarDTO }>("/api/avatar/me", token);
    return env.avatar;
  }

  async getAchievements(token?: string): Promise<AchievementDTO[]> {
    const env = await this.request<{ achievements?: AchievementDTO[] } | AchievementDTO[]>("/api/achievements/me", token);
    return Array.isArray(env) ? env : (env.achievements ?? []);
  }

  async getAchievementCount(token?: string): Promise<number> {
    const env = await this.request<{ count: number }>("/api/achievements/count", token);
    return env.count;
  }

  async getReputation(token?: string): Promise<ReputationDTO> {
    const env = await this.request<{ reputation: ReputationDTO }>("/api/reputation/me", token);
    return env.reputation;
  }

  async getActivities(token?: string): Promise<ActivityDTO[]> {
    const env = await this.request<{ activities: ActivityDTO[] }>("/api/activity/me", token);
    return env.activities;
  }

  async getNotifications(token?: string): Promise<NotificationDTO[]> {
    const env = await this.request<{ notifications?: NotificationDTO[] } | NotificationDTO[]>("/api/notifications", token);
    return Array.isArray(env) ? env : (env.notifications ?? []);
  }

  async getUnreadNotificationCount(token?: string): Promise<number> {
    const env = await this.request<{ unread: number }>("/api/notifications/unread-count", token);
    return env.unread;
  }

  async getSettings(token?: string): Promise<SettingsDTO> {
    const env = await this.request<{ settings: SettingsDTO }>("/api/settings/me", token);
    return env.settings;
  }

  async markNotificationRead(id: string, token?: string): Promise<void> {
    await this.requestMutation<void>(`/api/notifications/${id}/read`, "PATCH", token);
  }

  async markAllNotificationsRead(token?: string): Promise<number> {
    return this.requestMutation<number>("/api/notifications/read-all", "PATCH", token);
  }

  /**
   * Kiểm tra Universe Account service có reachable không.
   *
   * Logic mapping:
   *   HTTP 2xx / 4xx (401, 403, 404, …) → connected: true  (service đang chạy)
   *   HTTP 5xx                           → connected: false (server error)
   *   Network error / timeout            → connected: false (không tới được)
   *
   * Không phụ thuộc vào auth — 401 vẫn nghĩa là service đang sống.
   */
  async ping(): Promise<{ connected: boolean; error?: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${this.baseUrl}/api/identity/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      if (res.status >= 500) {
        return {
          connected: false,
          error: `Universe Account service error: HTTP ${res.status}`,
        };
      }

      // 2xx, 3xx, 4xx (kể cả 401/403/404) → service reachable
      return { connected: true };
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      return {
        connected: false,
        error: `Universe Account service unavailable: ${detail}`,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  private async requestMutation<T>(path: string, method: "PATCH" | "POST", token?: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = token;

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new AccountServiceUnavailableError(`HTTP ${res.status} from ${path}`);
      }
      const text = await res.text();
      return (text ? JSON.parse(text) : undefined) as T;
    } catch (err) {
      if (err instanceof AccountServiceUnavailableError) throw err;
      throw new AccountServiceUnavailableError(err);
    } finally {
      clearTimeout(timer);
    }
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createAccountClient(): AccountClient {
  const baseUrl =
    process.env["UNIVERSE_ACCOUNT_API_URL"] ?? "http://localhost:3001";
  return new AccountClient(baseUrl);
}
