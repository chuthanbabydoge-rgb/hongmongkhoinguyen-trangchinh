const API_BASE = "/api/ecosystem/analytics";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  const envelope = (await res.json()) as { ok: boolean; data: T; error?: string };
  if (!envelope.ok) throw new Error(envelope.error ?? "API error");
  return envelope.data;
}

export interface EcosystemStats {
  totalUsers: number;
  totalAssets: number;
  totalWorlds: number;
  totalFootballClubs: number;
  totalPets: number;
  totalTransactions: number;
  changes: {
    users: number;
    assets: number;
    worlds: number;
    footballClubs: number;
    pets: number;
    transactions: number;
  };
}

export function getEcosystemStats(): Promise<EcosystemStats> {
  return apiFetch<EcosystemStats>("/stats");
}

export function getUserGrowthData(): Promise<{ month: string; users: number }[]> {
  return apiFetch("/user-growth");
}

export function getAssetDistributionData(): Promise<{ name: string; value: number }[]> {
  return apiFetch("/asset-distribution");
}

export function getTransactionVolumeData(): Promise<{ month: string; volume: number }[]> {
  return apiFetch("/transaction-volume");
}

export function getActiveUsersByRegionData(): Promise<{ region: string; users: number }[]> {
  return apiFetch("/active-users-region");
}

export function getDauTrendData(): Promise<{ day: number; dau: number }[]> {
  return apiFetch("/dau-trend");
}

export function getTopMetricsData(): Promise<{ month: string; users: number; assets: number; transactions: number }[]> {
  return apiFetch("/top-metrics");
}
