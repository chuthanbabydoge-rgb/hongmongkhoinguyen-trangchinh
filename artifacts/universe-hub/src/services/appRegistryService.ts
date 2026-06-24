// ─────────────────────────────────────────────────────────────────────────────
// App Registry service — GET /api/apps (HUB-2)
// ─────────────────────────────────────────────────────────────────────────────

import { apiFetch } from "@/lib/apiClient";

export type AppCategory =
  | "SPORT" | "ANIMAL" | "WORLD" | "FINANCE"
  | "SECURITY" | "SOCIAL" | "AI" | "UTILITY" | "OTHER";

export type AppStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

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

export async function fetchApps(): Promise<EcosystemApp[]> {
  return apiFetch<EcosystemApp[]>("/apps");
}

export async function fetchAppById(id: string): Promise<EcosystemApp> {
  return apiFetch<EcosystemApp>(`/apps/${id}`);
}
