// ─────────────────────────────────────────────────────────────────────────────
// App Registry model — HUB-2 (canonical)
//
// Fields:
//   id, slug, name, description, icon, url, category, status, version,
//   createdAt, updatedAt
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enums ────────────────────────────────────────────────────────────────────

export const APP_CATEGORIES = [
  "SPORT",
  "ANIMAL",
  "WORLD",
  "FINANCE",
  "SECURITY",
  "SOCIAL",
  "AI",
  "UTILITY",
  "CREATOR",
  "EDUCATION",
  "BUSINESS",
  "LAND",
  "GOVERNMENT",
  "OTHER",
] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];

export const APP_STATUSES = ["ACTIVE", "INACTIVE", "MAINTENANCE"] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

// ─── Core model ───────────────────────────────────────────────────────────────

export interface EcosystemApp {
  id:           string;
  slug:         string;
  name:         string;
  description?: string;
  icon?:        string;
  url?:         string;
  category:     AppCategory;
  status:       AppStatus;
  version:      string;
  createdAt:    string;
  updatedAt:    string;
}

// ─── Request types ────────────────────────────────────────────────────────────

export interface RegisterAppRequest {
  slug:         string;
  name:         string;
  description?: string;
  icon?:        string;
  url:          string;
  category:     AppCategory;
  status?:      AppStatus;
  version:      string;
}

export interface UpdateAppRequest {
  name?:        string;
  description?: string;
  icon?:        string;
  url?:         string;
  category?:    AppCategory;
  status?:      AppStatus;
  version?:     string;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export interface AppRegistryActivity {
  id:          string;
  type:        "SYSTEM";
  title:       string;
  description: string;
  visibility:  "PUBLIC";
  sourceApp:   "universe-hub";
  createdAt:   string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface AppRegistryStats {
  totalApps:       number;
  activeApps:      number;
  maintenanceApps: number;
  inactiveApps:    number;
  categories:      Record<string, number>;
}
