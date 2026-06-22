// ─────────────────────────────────────────────────────────────────────────────
// Profile service — GET /api/profile
// ─────────────────────────────────────────────────────────────────────────────

import { apiFetch } from "@/lib/apiClient";

export interface ApiProfile {
  id: string;
  username: string;
  title: string;
  status: "online" | "away" | "offline";
  level: number;
  xp: number;
  maxXp: number;
  progressPercent: number;
  reputation: number;
  reputationTier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  badges: string[];
  avatar: {
    initials: string;
    imageUrl: string | null;
    frameColor: string;
  };
  joinedAt: string;
}

export async function fetchProfile(): Promise<ApiProfile> {
  return apiFetch<ApiProfile>("/profile");
}
