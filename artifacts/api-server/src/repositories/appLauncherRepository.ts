// ─────────────────────────────────────────────────────────────────────────────
// App Launcher Repository — HUB-3
//
// IAppLauncherRepository: interface for all implementations.
// InMemoryAppLauncherRepository: fully in-memory, used as default and in tests.
// ─────────────────────────────────────────────────────────────────────────────

import type { LaunchRecord } from "../models/appLauncher.js";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAppLauncherRepository {
  recordLaunch(record: LaunchRecord): Promise<LaunchRecord>;
  getRecentLaunches(userId: string, limit?: number): Promise<LaunchRecord[]>;
  countLaunches(userId: string): Promise<number>;
  getMostUsedApps(userId: string, limit?: number): Promise<{ appSlug: string; count: number }[]>;
  deleteLaunchHistory(userId: string): Promise<boolean>;
  hasLaunchedApp(userId: string, appSlug: string): Promise<boolean>;
}

// ─── In-Memory Implementation ─────────────────────────────────────────────────

export class InMemoryAppLauncherRepository implements IAppLauncherRepository {
  private readonly records: LaunchRecord[] = [];

  async recordLaunch(record: LaunchRecord): Promise<LaunchRecord> {
    const stored: LaunchRecord = { ...record };
    this.records.push(stored);
    return { ...stored };
  }

  async getRecentLaunches(userId: string, limit = 10): Promise<LaunchRecord[]> {
    return this.records
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.launchedAt).getTime() - new Date(a.launchedAt).getTime())
      .slice(0, limit)
      .map(r => ({ ...r }));
  }

  async countLaunches(userId: string): Promise<number> {
    return this.records.filter(r => r.userId === userId).length;
  }

  async getMostUsedApps(userId: string, limit = 5): Promise<{ appSlug: string; count: number }[]> {
    const counts = new Map<string, number>();
    for (const r of this.records) {
      if (r.userId !== userId) continue;
      counts.set(r.appSlug, (counts.get(r.appSlug) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([appSlug, count]) => ({ appSlug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async deleteLaunchHistory(userId: string): Promise<boolean> {
    const before = this.records.length;
    const toKeep = this.records.filter(r => r.userId !== userId);
    this.records.length = 0;
    this.records.push(...toKeep);
    return this.records.length < before;
  }

  async hasLaunchedApp(userId: string, appSlug: string): Promise<boolean> {
    return this.records.some(r => r.userId === userId && r.appSlug === appSlug);
  }
}
