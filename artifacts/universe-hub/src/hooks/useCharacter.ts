import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const API = "/api";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function useCharacter() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["character", "me"],
    queryFn: async () => {
      const res = await fetch(`${API}/characters/me`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown };
      return json.data;
    },
    enabled: !!accessToken,
  });
}

export function useCharacterStats() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["character", "stats"],
    queryFn: async () => {
      const res = await fetch(`${API}/characters/stats`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown };
      return json.data;
    },
    enabled: !!accessToken,
  });
}

export function useCharacterSkills() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["character", "skills"],
    queryFn: async () => {
      const res = await fetch(`${API}/characters/skills`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
    enabled: !!accessToken,
  });
}

export function useCharacterTitles() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["character", "titles"],
    queryFn: async () => {
      const res = await fetch(`${API}/characters/titles`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
    enabled: !!accessToken,
  });
}

export function useCharacterEquipment() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["character", "equipment"],
    queryFn: async () => {
      const res = await fetch(`${API}/characters/equipment`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
    enabled: !!accessToken,
  });
}

export function useCharacterPresets() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["character", "presets"],
    queryFn: async () => {
      const res = await fetch(`${API}/characters/presets`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
    enabled: !!accessToken,
  });
}

export function useXPLogs() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["character", "xp-logs"],
    queryFn: async () => {
      const res = await fetch(`${API}/characters/xp/logs`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
    enabled: !!accessToken,
  });
}

export function useCreateCharacter() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; class?: string; race?: string }) => {
      const res = await fetch(`${API}/characters`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["character"] }),
  });
}

export function useGainXP() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; source: string; sourceId?: string }) => {
      const res = await fetch(`${API}/characters/xp`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["character"] }),
  });
}

export function useEquipItem() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { slot: string; itemId: string; itemName: string; itemRarity?: string; statBonus?: Record<string, number> }) => {
      const res = await fetch(`${API}/characters/equip`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["character"] }),
  });
}

export function useUnequipItem() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { slot: string }) => {
      const res = await fetch(`${API}/characters/unequip`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["character"] }),
  });
}

export function useLearnSkill() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ skillId, upgrade = false }: { skillId: string; upgrade?: boolean }) => {
      const res = await fetch(`${API}/characters/skills/${skillId}`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({ upgrade }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["character"] }),
  });
}

export function useSelectTitle() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (titleKey: string) => {
      const res = await fetch(`${API}/characters/titles/${titleKey}/select`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({}),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["character"] }),
  });
}

export function useSavePreset() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API}/characters/presets`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({ name }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["character", "presets"] }),
  });
}

export function useUpdateAppearance() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`${API}/characters/appearance`, {
        method: "PUT", headers: authHeaders(accessToken ?? ""), body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["character"] }),
  });
}
