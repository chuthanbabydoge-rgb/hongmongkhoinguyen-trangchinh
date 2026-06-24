// ─────────────────────────────────────────────────────────────────────────────
// App Launcher models — HUB-3
//
// Represents all domain types for the App Launcher & Navigation Layer.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Request / Record types ───────────────────────────────────────────────────

export interface LaunchAppRequest {
  userId:        string;
  appSlug:       string;
  launchSource?: string;
  sessionId?:    string;
}

export interface LaunchRecord {
  id:           string;
  userId:       string;
  appSlug:      string;
  launchedAt:   string;
  launchSource: string;
  sessionId?:   string;
  metadata?:    Record<string, unknown>;
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface AppSummary {
  slug:     string;
  name:     string;
  iconUrl?: string;
}

export interface AppLaunchResponse {
  app:         AppSummary;
  launchUrl:   string;
  accessToken: string;
  expiresAt:   string;
}

// ─── Dashboard / Navigation types ─────────────────────────────────────────────

export interface RecentApp {
  appSlug:     string;
  appName:     string;
  launchedAt:  string;
  launchCount: number;
}

export interface NavigationItem {
  slug:      string;
  name:      string;
  iconUrl?:  string;
  launchUrl: string;
}

export interface LauncherDashboard {
  recentApps:    RecentApp[];
  favoriteApps:  RecentApp[];
  installedApps: number;
  totalLaunches: number;
}

// ─── Activity / Notification types ────────────────────────────────────────────

export interface LauncherActivity {
  id:          string;
  type:        "SYSTEM";
  title:       string;
  description: string;
  visibility:  "PRIVATE";
  sourceApp:   "universe-hub";
  createdAt:   string;
}

export interface LauncherNotification {
  id:        string;
  userId:    string;
  title:     string;
  message:   string;
  priority:  "NORMAL";
  source:    "universe-hub";
  createdAt: string;
}
