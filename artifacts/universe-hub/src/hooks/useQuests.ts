import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export interface QuestObjective {
  id:          string;
  questId:     string;
  type:        string;
  description: string;
  targetCount: number;
  orderIndex:  number;
  metadata:    Record<string, unknown> | null;
}

export interface Quest {
  id:               string;
  title:            string;
  description:      string;
  type:             "MAIN" | "SIDE" | "DAILY" | "WEEKLY" | "EVENT";
  status:           "ACTIVE" | "INACTIVE" | "FINISHED";
  difficulty:       "EASY" | "NORMAL" | "HARD" | "LEGENDARY";
  requiredLevel:    number;
  repeatable:       boolean;
  startAt:          string | null;
  endAt:            string | null;
  rewardCredits:    number;
  rewardCoins:      number;
  rewardTokens:     number;
  rewardReputation: number;
  metadata:         Record<string, unknown> | null;
  objectives:       QuestObjective[];
  createdAt:        string;
  updatedAt:        string;
}

export interface UserQuestProgress {
  id:           string;
  userQuestId:  string;
  objectiveId:  string;
  currentCount: number;
  completed:    boolean;
  updatedAt:    string;
}

export interface UserQuest {
  id:          string;
  userId:      string;
  questId:     string;
  status:      "IN_PROGRESS" | "COMPLETED" | "CLAIMED" | "CANCELLED";
  startedAt:   string;
  completedAt: string | null;
  claimedAt:   string | null;
  progress:    UserQuestProgress[];
  createdAt:   string;
  updatedAt:   string;
}

export interface UserQuestEntry {
  quest:     Quest;
  userQuest: UserQuest;
}

const DIFF_COLORS: Record<Quest["difficulty"], string> = {
  EASY:      "text-green-400 border-green-400/30 bg-green-400/10",
  NORMAL:    "text-blue-400 border-blue-400/30 bg-blue-400/10",
  HARD:      "text-orange-400 border-orange-400/30 bg-orange-400/10",
  LEGENDARY: "text-purple-400 border-purple-400/30 bg-purple-400/10",
};

export const getDifficultyStyle = (d: Quest["difficulty"]) => DIFF_COLORS[d] ?? DIFF_COLORS.NORMAL;

const TYPE_LABELS: Record<Quest["type"], string> = {
  MAIN:    "Nhiệm vụ Chính",
  SIDE:    "Nhiệm vụ Phụ",
  DAILY:   "Hằng ngày",
  WEEKLY:  "Hằng tuần",
  EVENT:   "Sự kiện",
};
export const getTypeLabel = (t: Quest["type"]) => TYPE_LABELS[t] ?? t;

export function calcProgress(userQuest: UserQuest, quest: Quest): number {
  if (quest.objectives.length === 0) return 0;
  const total = quest.objectives.reduce((acc, o) => acc + o.targetCount, 0);
  const done  = userQuest.progress.reduce((acc, p) => acc + Math.min(p.currentCount, quest.objectives.find(o => o.id === p.objectiveId)?.targetCount ?? 0), 0);
  return Math.min(100, Math.round((done / total) * 100));
}

async function apiFetch<T>(url: string, token: string | null | undefined, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers: { ...headers, ...(options?.headers as Record<string, string> | undefined) } });
  const json = await res.json() as { ok: boolean; data?: T; error?: string };
  if (!json.ok) throw new Error(json.error ?? "API error");
  return json.data as T;
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useAvailableQuests() {
  return useQuery<Quest[]>({
    queryKey: ["quests", "available"],
    queryFn: () => apiFetch<Quest[]>("/api/quests", null),
  });
}

export function useDailyQuests() {
  return useQuery<Quest[]>({
    queryKey: ["quests", "daily"],
    queryFn: () => apiFetch<Quest[]>("/api/quests/daily", null),
  });
}

export function useWeeklyQuests() {
  return useQuery<Quest[]>({
    queryKey: ["quests", "weekly"],
    queryFn: () => apiFetch<Quest[]>("/api/quests/weekly", null),
  });
}

export function useMyQuests() {
  const { accessToken } = useAuth();
  return useQuery<UserQuestEntry[]>({
    queryKey: ["quests", "me"],
    queryFn: () => apiFetch<UserQuestEntry[]>("/api/quests/me", accessToken),
    enabled: !!accessToken,
  });
}

export function useCompletedQuests() {
  const { accessToken } = useAuth();
  return useQuery<UserQuestEntry[]>({
    queryKey: ["quests", "completed"],
    queryFn: () => apiFetch<UserQuestEntry[]>("/api/quests/completed", accessToken),
    enabled: !!accessToken,
  });
}

export function useQuestById(id: string | null) {
  return useQuery<Quest>({
    queryKey: ["quests", id],
    queryFn: () => apiFetch<Quest>(`/api/quests/${id}`, null),
    enabled: !!id,
  });
}

export function useStartQuest() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questId: string) =>
      apiFetch<UserQuest>(`/api/quests/${questId}/start`, accessToken, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quests"] });
    },
  });
}

export function useClaimQuest() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userQuestId: string) =>
      apiFetch(`/api/quests/${userQuestId}/claim`, accessToken, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quests"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["reputation"] });
    },
  });
}

export function useCancelQuest() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userQuestId: string) =>
      apiFetch(`/api/quests/${userQuestId}/cancel`, accessToken, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quests"] });
    },
  });
}
