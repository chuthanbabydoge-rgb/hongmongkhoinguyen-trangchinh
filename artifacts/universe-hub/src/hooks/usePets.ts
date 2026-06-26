import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const API = "/api";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function usePetSpecies() {
  return useQuery({
    queryKey: ["pets", "species"],
    queryFn: async () => {
      const res = await fetch(`${API}/pets/species`);
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
  });
}

export function usePets() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const res = await fetch(`${API}/pets`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
    enabled: !!accessToken,
  });
}

export function usePet(petId: string | null) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["pets", petId],
    queryFn: async () => {
      const res = await fetch(`${API}/pets/${petId}`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown };
      return json.data;
    },
    enabled: !!accessToken && !!petId,
  });
}

export function useSummonedPet() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["pets", "summoned"],
    queryFn: async () => {
      const res = await fetch(`${API}/pets/summoned`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown };
      return json.data;
    },
    enabled: !!accessToken,
  });
}

export function usePetSkills() {
  return useQuery({
    queryKey: ["pets", "skills"],
    queryFn: async () => {
      const res = await fetch(`${API}/pets/skills/list`);
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
  });
}

export function usePetEquipment(petId: string | null) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["pets", petId, "equipment"],
    queryFn: async () => {
      const res = await fetch(`${API}/pets/${petId}/equipment`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
    enabled: !!accessToken && !!petId,
  });
}

export function usePetBond(petId: string | null) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["pets", petId, "bond"],
    queryFn: async () => {
      const res = await fetch(`${API}/pets/${petId}/bond`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown };
      return json.data;
    },
    enabled: !!accessToken && !!petId,
  });
}

export function usePetLogs(petId: string | null) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["pets", petId, "logs"],
    queryFn: async () => {
      const res = await fetch(`${API}/pets/${petId}/logs`, { headers: authHeaders(accessToken ?? "") });
      const json = await res.json() as { ok: boolean; data: unknown[] };
      return json.data ?? [];
    },
    enabled: !!accessToken && !!petId,
  });
}

export function useCreatePet() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { speciesId: string; name: string; nickname?: string }) => {
      const res = await fetch(`${API}/pets`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pets"] }),
  });
}

export function useFeedPet() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ petId, foodKey }: { petId: string; foodKey?: string }) => {
      const res = await fetch(`${API}/pets/${petId}/feed`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({ foodKey }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pets"] }),
  });
}

export function useTrainPet() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ petId, trainingType }: { petId: string; trainingType: string }) => {
      const res = await fetch(`${API}/pets/${petId}/train`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({ trainingType }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pets"] }),
  });
}

export function useEvolvePet() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (petId: string) => {
      const res = await fetch(`${API}/pets/${petId}/evolve`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({}),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pets"] }),
  });
}

export function useSummonPet() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (petId: string) => {
      const res = await fetch(`${API}/pets/${petId}/summon`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({}),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pets"] }),
  });
}

export function useDismissPet() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (petId: string) => {
      const res = await fetch(`${API}/pets/${petId}/dismiss`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({}),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pets"] }),
  });
}

export function useLearnPetSkill() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ petId, skillId }: { petId: string; skillId: string }) => {
      const res = await fetch(`${API}/pets/${petId}/skill`, {
        method: "POST", headers: authHeaders(accessToken ?? ""), body: JSON.stringify({ skillId }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pets"] }),
  });
}
