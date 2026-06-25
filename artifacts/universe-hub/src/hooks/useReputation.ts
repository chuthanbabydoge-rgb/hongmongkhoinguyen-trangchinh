import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export interface ReputationProfile {
  userId:          string;
  totalPoints:     number;
  level:           string;
  nextLevel:       string | null;
  pointsToNext:    number | null;
  progressPercent: number;
  updatedAt:       string;
}

export interface ReputationEvent {
  id:        string;
  userId:    string;
  eventType: string;
  points:    number;
  metadata:  unknown;
  createdAt: string;
}

export interface LeaderboardEntry extends ReputationProfile {
  rank: number;
}

export interface Achievement {
  id:          string;
  key:         string;
  title:       string;
  description: string;
  icon:        string;
}

export interface UserAchievement {
  id:             string;
  userId:         string;
  achievementKey: string;
  unlockedAt:     string;
  achievement?:   Achievement;
}

async function apiFetch<T>(url: string, token: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type":  "application/json",
      ...(opts?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json() as { ok: boolean; data: T };
  return json.data;
}

export function useMyReputation() {
  const { token } = useAuth();
  return useQuery<ReputationProfile>({
    queryKey: ["reputation", "me"],
    queryFn:  () => apiFetch("/api/reputation/me", token!),
    enabled:  !!token,
    staleTime: 30_000,
  });
}

export function useReputationHistory(limit = 20) {
  const { token } = useAuth();
  return useQuery<ReputationEvent[]>({
    queryKey: ["reputation", "history", limit],
    queryFn:  async () => {
      const res = await fetch(`/api/reputation/history?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token!}` },
      });
      const json = await res.json() as { ok: boolean; data: ReputationEvent[] };
      return json.data ?? [];
    },
    enabled:  !!token,
    staleTime: 30_000,
  });
}

export function useLeaderboard(limit = 20) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["reputation", "leaderboard", limit],
    queryFn:  async () => {
      const res = await fetch(`/api/reputation/leaderboard?limit=${limit}`);
      const json = await res.json() as { ok: boolean; data: LeaderboardEntry[] };
      return json.data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useAllAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ["achievements", "all"],
    queryFn:  async () => {
      const res = await fetch("/api/achievements");
      const json = await res.json() as { ok: boolean; data: Achievement[] };
      return json.data ?? [];
    },
    staleTime: 300_000,
  });
}

export function useMyAchievements() {
  const { token } = useAuth();
  return useQuery<UserAchievement[]>({
    queryKey: ["achievements", "me"],
    queryFn:  async () => {
      const res = await fetch("/api/achievements/me", {
        headers: { Authorization: `Bearer ${token!}` },
      });
      const json = await res.json() as { ok: boolean; data: UserAchievement[] };
      return json.data ?? [];
    },
    enabled:  !!token,
    staleTime: 30_000,
  });
}

export function useAddReputationEvent() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (eventType: string) => {
      const res = await fetch("/api/reputation/event", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token!}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ eventType }),
      });
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["reputation"] });
      void qc.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
