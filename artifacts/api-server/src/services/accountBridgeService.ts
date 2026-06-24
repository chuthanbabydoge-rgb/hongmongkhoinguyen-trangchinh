// ─────────────────────────────────────────────────────────────────────────────
// AccountBridgeService — aggregates data from Universe Account API
//
// Implements a 60-second TTL in-memory cache for identity, profile,
// avatar, and settings to avoid spamming the Account service.
//
// If the Account service is unreachable, AccountServiceUnavailableError
// propagates to the controller layer, which returns 503.
// ─────────────────────────────────────────────────────────────────────────────

import type { IAccountClient } from "./accountClient.js";
import type {
  HubUserOverview,
  HubMeResponse,
  HubDashboardResponse,
  IdentityDTO,
  ProfileDTO,
  AvatarDTO,
  ReputationDTO,
  SettingsDTO,
  ActivityDTO,
} from "../models/accountBridge.js";

// ─── TTL Cache ────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  clear(): void {
    this.store.clear();
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60_000;

export class AccountBridgeService {
  private readonly identityCache  = new TtlCache<IdentityDTO>();
  private readonly profileCache   = new TtlCache<ProfileDTO>();
  private readonly avatarCache    = new TtlCache<AvatarDTO>();
  private readonly settingsCache  = new TtlCache<SettingsDTO>();

  constructor(private readonly client: IAccountClient) {}

  // ── Cached fetchers ─────────────────────────────────────────────────────────

  async getIdentityCached(token?: string): Promise<IdentityDTO> {
    const key = token ?? "__anonymous__";
    const cached = this.identityCache.get(key);
    if (cached) return cached;
    const value = await this.client.getIdentity(token);
    this.identityCache.set(key, value, CACHE_TTL_MS);
    return value;
  }

  async getProfileCached(token?: string): Promise<ProfileDTO> {
    const key = token ?? "__anonymous__";
    const cached = this.profileCache.get(key);
    if (cached) return cached;
    const value = await this.client.getProfile(token);
    this.profileCache.set(key, value, CACHE_TTL_MS);
    return value;
  }

  async getAvatarCached(token?: string): Promise<AvatarDTO> {
    const key = token ?? "__anonymous__";
    const cached = this.avatarCache.get(key);
    if (cached) return cached;
    const value = await this.client.getAvatar(token);
    this.avatarCache.set(key, value, CACHE_TTL_MS);
    return value;
  }

  async getSettingsCached(token?: string): Promise<SettingsDTO> {
    const key = token ?? "__anonymous__";
    const cached = this.settingsCache.get(key);
    if (cached) return cached;
    const value = await this.client.getSettings(token);
    this.settingsCache.set(key, value, CACHE_TTL_MS);
    return value;
  }

  // ── Aggregations ─────────────────────────────────────────────────────────────

  async getHubUserOverview(token?: string): Promise<HubUserOverview> {
    const [identity, profile, avatar, reputation, achievementCount, unreadNotifications] =
      await Promise.all([
        this.getIdentityCached(token),
        this.getProfileCached(token),
        this.getAvatarCached(token),
        this.client.getReputation(token),
        this.client.getAchievementCount(token),
        this.client.getUnreadNotificationCount(token),
      ]);

    return { identity, profile, avatar, reputation, achievementCount, unreadNotifications };
  }

  async getHubMe(token?: string): Promise<HubMeResponse> {
    const [profile, avatar, reputation, settings] = await Promise.all([
      this.getProfileCached(token),
      this.getAvatarCached(token),
      this.client.getReputation(token),
      this.getSettingsCached(token),
    ]);

    return { profile, avatar, reputation, settings };
  }

  async getHubDashboard(token?: string): Promise<HubDashboardResponse> {
    const [profile, avatar, reputation, achievementCount, unreadNotifications, latestActivities] =
      await Promise.all([
        this.getProfileCached(token),
        this.getAvatarCached(token),
        this.client.getReputation(token),
        this.client.getAchievementCount(token),
        this.client.getUnreadNotificationCount(token),
        this.client.getActivities(token),
      ]);

    return {
      profile,
      avatar,
      reputation,
      achievementCount,
      unreadNotifications,
      latestActivities,
    };
  }

  async checkAccountHealth(token?: string): Promise<{ connected: boolean; error?: string }> {
    try {
      await this.client.getIdentity(token);
      return { connected: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { connected: false, error: message };
    }
  }

  clearCache(): void {
    this.identityCache.clear();
    this.profileCache.clear();
    this.avatarCache.clear();
    this.settingsCache.clear();
  }
}
