import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const API = "/api";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function useMountTypes() {
  return useQuery({
    queryKey: ["mounts", "types"],
    queryFn: async () => {
      const res = await fetch(`${API}/mounts/types`);
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
  });
}

export function useMounts() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["mounts"],
    queryFn: async () => {
      const res = await fetch(`${API}/mounts`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
    enabled: !!accessToken,
  });
}

export function useMount(mountId: string | null) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["mounts", mountId],
    queryFn: async () => {
      const res = await fetch(`${API}/mounts/${mountId}`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown };
      return json.data;
    },
    enabled: !!accessToken && !!mountId,
  });
}

export function useMountRoutes() {
  return useQuery({
    queryKey: ["mounts", "routes"],
    queryFn: async () => {
      const res = await fetch(`${API}/mounts/routes`);
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
  });
}

export function useMountStatistics() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["mounts", "statistics"],
    queryFn: async () => {
      const res = await fetch(`${API}/mounts/statistics`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown };
      return json.data;
    },
    enabled: !!accessToken,
  });
}

export function useMountTravelLogs() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["mounts", "travel-logs"],
    queryFn: async () => {
      const res = await fetch(`${API}/mounts/travel-logs`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
    enabled: !!accessToken,
  });
}

export function useMountCustomization(mountId: string | null) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["mounts", mountId, "customization"],
    queryFn: async () => {
      const res = await fetch(`${API}/mounts/${mountId}/customization`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown };
      return json.data;
    },
    enabled: !!accessToken && !!mountId,
  });
}

export function useCreateMount() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { typeId: string; name: string }) => {
      const res = await fetch(`${API}/mounts`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mounts"] }),
  });
}

export function useTrainMount() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ mountId, trainingType }: { mountId: string; trainingType: string }) => {
      const res = await fetch(`${API}/mounts/${mountId}/train`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({ trainingType }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mounts"] }),
  });
}

export function useTravelMount() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ mountId, routeId }: { mountId: string; routeId: string }) => {
      const res = await fetch(`${API}/mounts/${mountId}/travel`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({ routeId }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mounts"] }),
  });
}

export function useUpdateMountCustomization() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ mountId, ...data }: { mountId: string; color?: string; pattern?: string; saddle?: string; armor?: string; glowEffect?: string; trailEffect?: string }) => {
      const res = await fetch(`${API}/mounts/${mountId}/customization`, {
        method: "PUT", headers: authHeaders(accessToken ?? ""), body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["mounts", v.mountId, "customization"] });
      qc.invalidateQueries({ queryKey: ["mounts"] });
    },
  });
}
