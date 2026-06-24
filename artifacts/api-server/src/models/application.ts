// ─────────────────────────────────────────────────────────────────────────────
// Application model — HUB-5
//
// Represents an application in the Universe App Registry.
// Separate from HUB-2 EcosystemApp — this model includes user-level
// install/open tracking (UserApplication) and featured flag.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enums ────────────────────────────────────────────────────────────────────

export const APP_HUB5_CATEGORIES = [
  "SYSTEM",
  "SPORT",
  "WORLD",
  "ANIMAL",
  "ECONOMY",
  "UTILITY",
  "EDUCATION",
  "AI",
] as const;

export type AppHUB5Category = typeof APP_HUB5_CATEGORIES[number];

export const APP_HUB5_STATUSES = ["ACTIVE", "DISABLED"] as const;
export type AppHUB5Status = typeof APP_HUB5_STATUSES[number];

// ─── Core models ──────────────────────────────────────────────────────────────

export interface Application {
  id:           string;
  slug:         string;
  name:         string;
  description?: string;
  iconUrl?:     string;
  bannerUrl?:   string;
  category:     AppHUB5Category;
  launchUrl:    string;
  ownerApp?:    string;
  status:       AppHUB5Status;
  featured:     boolean;
  createdAt:    string;
  updatedAt:    string;
}

export interface UserApplication {
  id:             string;
  userId:         string;
  applicationId:  string;
  installedAt:    string;
  lastOpenedAt?:  string;
}

// ─── Request types ────────────────────────────────────────────────────────────

export interface CreateApplicationRequest {
  slug:         string;
  name:         string;
  description?: string;
  iconUrl?:     string;
  bannerUrl?:   string;
  category:     AppHUB5Category;
  launchUrl:    string;
  ownerApp?:    string;
  status?:      AppHUB5Status;
  featured?:    boolean;
}

export interface InstallApplicationRequest {
  slug: string;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export interface AppHUB5Activity {
  id:          string;
  userId:      string;
  type:        "SYSTEM";
  title:       string;
  description: string;
  visibility:  "PUBLIC" | "PRIVATE";
  sourceApp:   "universe-hub";
  createdAt:   string;
}

// ─── Pagination helpers ───────────────────────────────────────────────────────

export interface PaginationOptions {
  page?:  number;
  limit?: number;
  sort?:  "createdAt" | "name" | "featured";
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}
