import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const API = "/api/combat";

function authHeaders(token: string | null) {
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json() as { ok: boolean; data: T; error?: string };
  if (!json.ok) throw new Error(json.error ?? "Unknown error");
  return json.data;
}

export function useCombat() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const headers = useCallback(() => authHeaders(accessToken ?? null), [accessToken]);

  const listBattles = useCallback((status?: string, type?: string) =>
    wrap(() => apiFetch(`${API}?${new URLSearchParams({ ...(status ? { status } : {}), ...(type ? { type } : {}) })}`)),
  [wrap]);

  const createBattle = useCallback((type = "PVE", opts?: { bossId?: string; isRealtime?: boolean }) =>
    wrap(() => apiFetch(`${API}`, { method: "POST", headers: headers(), body: JSON.stringify({ type, ...opts }) })),
  [wrap, headers]);

  const getBattle = useCallback((id: string) =>
    wrap(() => apiFetch(`${API}/${id}`)),
  [wrap]);

  const joinBattle = useCallback((id: string, characterId?: string) =>
    wrap(() => apiFetch(`${API}/${id}/join`, { method: "POST", headers: headers(), body: JSON.stringify({ characterId }) })),
  [wrap, headers]);

  const startBattle = useCallback((id: string) =>
    wrap(() => apiFetch(`${API}/${id}/start`, { method: "POST", headers: headers(), body: JSON.stringify({}) })),
  [wrap, headers]);

  const attack = useCallback((id: string, targetUserId: string) =>
    wrap(() => apiFetch(`${API}/${id}/attack`, { method: "POST", headers: headers(), body: JSON.stringify({ targetUserId }) })),
  [wrap, headers]);

  const castSkill = useCallback((id: string, targetUserId: string, skillId: string) =>
    wrap(() => apiFetch(`${API}/${id}/skill`, { method: "POST", headers: headers(), body: JSON.stringify({ targetUserId, skillId }) })),
  [wrap, headers]);

  const surrender = useCallback((id: string) =>
    wrap(() => apiFetch(`${API}/${id}/surrender`, { method: "POST", headers: headers(), body: JSON.stringify({}) })),
  [wrap, headers]);

  const getHistory = useCallback((limit = 20, offset = 0) =>
    wrap(() => apiFetch(`${API}/history?limit=${limit}&offset=${offset}`, { headers: headers() })),
  [wrap, headers]);

  const getLeaderboard = useCallback((season = 1, limit = 50) =>
    wrap(() => apiFetch(`${API}/leaderboard?season=${season}&limit=${limit}`)),
  [wrap]);

  const listBosses = useCallback(() =>
    wrap(() => apiFetch(`${API}/bosses`)),
  [wrap]);

  const startBossBattle = useCallback((bossId: string) =>
    wrap(() => apiFetch(`${API}/bosses/${bossId}/start`, { method: "POST", headers: headers(), body: JSON.stringify({}) })),
  [wrap, headers]);

  const getArena = useCallback(() =>
    wrap(() => apiFetch(`${API}/arena`, { headers: headers() })),
  [wrap, headers]);

  const joinArenaQueue = useCallback(() =>
    wrap(() => apiFetch(`${API}/arena/queue`, { method: "POST", headers: headers(), body: JSON.stringify({}) })),
  [wrap, headers]);

  const getSkills = useCallback(() =>
    wrap(() => apiFetch(`${API}/skills`)),
  [wrap]);

  const getStatistics = useCallback(() =>
    wrap(() => apiFetch(`${API}/statistics`, { headers: headers() })),
  [wrap, headers]);

  return {
    loading, error,
    listBattles, createBattle, getBattle, joinBattle, startBattle,
    attack, castSkill, surrender,
    getHistory, getLeaderboard,
    listBosses, startBossBattle,
    getArena, joinArenaQueue,
    getSkills, getStatistics,
  };
}
