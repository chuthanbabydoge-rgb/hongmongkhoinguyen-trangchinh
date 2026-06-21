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

// TODO: Replace with API call — GET /api/ecosystem/stats
export async function getEcosystemStats(): Promise<EcosystemStats> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalUsers: 2847392,
        totalAssets: 14293847,
        totalWorlds: 8423,
        totalFootballClubs: 1247,
        totalPets: 3891204,
        totalTransactions: 47293018,
        changes: {
          users: 12.3,
          assets: 8.7,
          worlds: 2.1,
          footballClubs: 0.5,
          pets: 15.4,
          transactions: 24.8,
        }
      });
    }, 500);
  });
}

// TODO: Replace with API call — GET /api/ecosystem/charts/user-growth
export async function getUserGrowthData() {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => resolve([
      { month: 'Jan', users: 1.2 }, { month: 'Feb', users: 1.4 },
      { month: 'Mar', users: 1.5 }, { month: 'Apr', users: 1.8 },
      { month: 'May', users: 2.1 }, { month: 'Jun', users: 2.3 },
      { month: 'Jul', users: 2.4 }, { month: 'Aug', users: 2.5 },
      { month: 'Sep', users: 2.6 }, { month: 'Oct', users: 2.7 },
      { month: 'Nov', users: 2.8 }, { month: 'Dec', users: 2.85 }
    ]), 500);
  });
}

// TODO: Replace with API call — GET /api/ecosystem/charts/asset-distribution
export async function getAssetDistributionData() {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => resolve([
      { name: 'Worlds', value: 8423 },
      { name: 'Football Clubs', value: 1247 },
      { name: 'Pets', value: 3891204 },
      { name: 'Items', value: 8000000 },
      { name: 'Land', value: 2392973 }
    ]), 500);
  });
}

// TODO: Replace with API call — GET /api/ecosystem/charts/transaction-volume
export async function getTransactionVolumeData() {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => resolve([
      { month: 'Jan', volume: 2.1 }, { month: 'Feb', volume: 2.5 },
      { month: 'Mar', volume: 2.8 }, { month: 'Apr', volume: 3.4 },
      { month: 'May', volume: 4.1 }, { month: 'Jun', volume: 4.8 },
      { month: 'Jul', volume: 5.2 }, { month: 'Aug', volume: 4.9 },
      { month: 'Sep', volume: 5.5 }, { month: 'Oct', volume: 6.1 },
      { month: 'Nov', volume: 6.8 }, { month: 'Dec', volume: 7.4 }
    ]), 500);
  });
}

// TODO: Replace with API call — GET /api/ecosystem/charts/active-users-region
export async function getActiveUsersByRegionData() {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => resolve([
      { region: 'Americas', users: 950000 },
      { region: 'Europe', users: 820000 },
      { region: 'Asia Pacific', users: 1100000 },
      { region: 'Middle East', users: 250000 },
      { region: 'Africa', users: 180000 }
    ]), 500);
  });
}

// TODO: Replace with API call — GET /api/ecosystem/charts/dau-trend
export async function getDauTrendData() {
  return new Promise<any[]>((resolve) => {
    const data = [];
    let base = 400000;
    for (let i = 1; i <= 30; i++) {
      base += Math.floor(Math.random() * 20000) - 5000;
      data.push({ day: i, dau: base });
    }
    setTimeout(() => resolve(data), 500);
  });
}

// TODO: Replace with API call — GET /api/ecosystem/charts/top-metrics
export async function getTopMetricsData() {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => resolve([
      { month: 'Q1', users: 1.5, assets: 5.2, transactions: 8.4 },
      { month: 'Q2', users: 2.1, assets: 8.1, transactions: 15.2 },
      { month: 'Q3', users: 2.5, assets: 11.4, transactions: 28.5 },
      { month: 'Q4', users: 2.85, assets: 14.3, transactions: 47.3 }
    ]), 500);
  });
}
