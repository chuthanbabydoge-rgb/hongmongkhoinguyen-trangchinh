import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const API = "/api/land";

async function apiFetch<T>(url: string, token?: string | null): Promise<T> {
  const res = await fetch(url, token ? { headers: { Authorization: token } } : undefined);
  const json = await res.json() as { success: boolean; data: T };
  return json.data;
}

export function useLandDashboard() {
  return useQuery({
    queryKey: ["land", "dashboard"],
    queryFn: () => apiFetch<Record<string, unknown>>(`${API}/dashboard`),
  });
}

export function useRegions(params?: Record<string, string>) {
  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useQuery({
    queryKey: ["land", "regions", params],
    queryFn: () => apiFetch<unknown[]>(`${API}/regions${search}`),
  });
}

export function useCities(params?: Record<string, string>) {
  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useQuery({
    queryKey: ["land", "cities", params],
    queryFn: () => apiFetch<unknown[]>(`${API}/cities${search}`),
  });
}

export function useCity(id: string) {
  return useQuery({
    queryKey: ["land", "cities", id],
    queryFn: () => apiFetch<Record<string, unknown>>(`${API}/cities/${id}`),
    enabled: !!id,
  });
}

export function useDistricts(params?: Record<string, string>) {
  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useQuery({
    queryKey: ["land", "districts", params],
    queryFn: () => apiFetch<unknown[]>(`${API}/districts${search}`),
  });
}

export function useParcels(params?: Record<string, string>) {
  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useQuery({
    queryKey: ["land", "parcels", params],
    queryFn: () => apiFetch<unknown[]>(`${API}/parcels${search}`),
  });
}

export function useParcel(id: string) {
  return useQuery({
    queryKey: ["land", "parcels", id],
    queryFn: () => apiFetch<Record<string, unknown>>(`${API}/parcels/${id}`),
    enabled: !!id,
  });
}

export function useBuildings(params?: Record<string, string>) {
  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useQuery({
    queryKey: ["land", "buildings", params],
    queryFn: () => apiFetch<unknown[]>(`${API}/buildings${search}`),
  });
}

export function useBuildingTemplates() {
  return useQuery({
    queryKey: ["land", "templates"],
    queryFn: () => apiFetch<unknown[]>(`${API}/templates`),
  });
}

export function useConstruction(params?: Record<string, string>) {
  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useQuery({
    queryKey: ["land", "construction", params],
    queryFn: () => apiFetch<unknown[]>(`${API}/construction${search}`),
  });
}

export function useRoads(params?: Record<string, string>) {
  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useQuery({
    queryKey: ["land", "roads", params],
    queryFn: () => apiFetch<unknown[]>(`${API}/roads${search}`),
  });
}

export function useUtilities(params?: Record<string, string>) {
  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useQuery({
    queryKey: ["land", "utilities", params],
    queryFn: () => apiFetch<unknown[]>(`${API}/utilities${search}`),
  });
}

export function useTeleports(params?: Record<string, string>) {
  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useQuery({
    queryKey: ["land", "teleports", params],
    queryFn: () => apiFetch<unknown[]>(`${API}/teleports${search}`),
  });
}

export function useLandMarketplace(params?: Record<string, string>) {
  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useQuery({
    queryKey: ["land", "marketplace", params],
    queryFn: () => apiFetch<unknown[]>(`${API}/marketplace${search}`),
  });
}

export function useLandBookmarks() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["land", "bookmarks"],
    queryFn: () => apiFetch<unknown[]>(`${API}/bookmarks`, accessToken),
    enabled: !!accessToken,
  });
}

export function useLandAnalytics() {
  return useQuery({
    queryKey: ["land", "analytics"],
    queryFn: () => apiFetch<Record<string, unknown>>(`${API}/analytics`),
  });
}

export function useLandStatistics() {
  return useQuery({
    queryKey: ["land", "statistics"],
    queryFn: () => apiFetch<Record<string, unknown>>(`${API}/statistics`),
  });
}

export function useBuyParcel() {
  const qc = useQueryClient();
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: async (parcelId: string) => {
      const res = await fetch(`${API}/parcels/${parcelId}/buy`, {
        method: "POST",
        headers: { Authorization: accessToken ?? "", "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["land"] }); },
  });
}

export function useUseTeleport() {
  const qc = useQueryClient();
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: async (teleportId: string) => {
      const res = await fetch(`${API}/teleports/${teleportId}/use`, {
        method: "POST",
        headers: { Authorization: accessToken ?? "", "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["land", "teleports"] }); },
  });
}

export function useAddBookmark() {
  const qc = useQueryClient();
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: async (parcelId: string) => {
      const res = await fetch(`${API}/bookmarks`, {
        method: "POST",
        headers: { Authorization: accessToken ?? "", "Content-Type": "application/json" },
        body: JSON.stringify({ parcelId }),
      });
      return res.json();
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["land", "bookmarks"] }); },
  });
}

export function useRemoveBookmark() {
  const qc = useQueryClient();
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: async (parcelId: string) => {
      const res = await fetch(`${API}/bookmarks/${parcelId}`, {
        method: "DELETE",
        headers: { Authorization: accessToken ?? "" },
      });
      return res.json();
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["land", "bookmarks"] }); },
  });
}
