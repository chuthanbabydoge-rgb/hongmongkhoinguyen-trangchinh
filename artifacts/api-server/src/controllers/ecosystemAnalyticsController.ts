// ─────────────────────────────────────────────────────────────────────────────
// Ecosystem Analytics Controller
//
// GET /api/ecosystem/analytics/stats                — top-level KPIs
// GET /api/ecosystem/analytics/user-growth          — monthly user growth
// GET /api/ecosystem/analytics/asset-distribution   — asset breakdown pie
// GET /api/ecosystem/analytics/transaction-volume   — monthly tx volume
// GET /api/ecosystem/analytics/active-users-region  — users by region
// GET /api/ecosystem/analytics/dau-trend            — 30-day DAU area
// GET /api/ecosystem/analytics/top-metrics          — quarterly macro view
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response } from "express";

function ok(res: Response, data: unknown) {
  res.json({ ok: true, data });
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function handleGetAnalyticsStats(_req: Request, res: Response) {
  ok(res, {
    totalUsers:         2_847_392,
    totalAssets:       14_293_847,
    totalWorlds:            8_423,
    totalFootballClubs:     1_247,
    totalPets:          3_891_204,
    totalTransactions: 47_293_018,
    changes: {
      users:          12.3,
      assets:          8.7,
      worlds:          2.1,
      footballClubs:   0.5,
      pets:           15.4,
      transactions:   24.8,
    },
  });
}

// ── User growth ───────────────────────────────────────────────────────────────

export function handleGetUserGrowth(_req: Request, res: Response) {
  ok(res, [
    { month: "Jan", users: 1.2 }, { month: "Feb", users: 1.4 },
    { month: "Mar", users: 1.5 }, { month: "Apr", users: 1.8 },
    { month: "May", users: 2.1 }, { month: "Jun", users: 2.3 },
    { month: "Jul", users: 2.4 }, { month: "Aug", users: 2.5 },
    { month: "Sep", users: 2.6 }, { month: "Oct", users: 2.7 },
    { month: "Nov", users: 2.8 }, { month: "Dec", users: 2.85 },
  ]);
}

// ── Asset distribution ────────────────────────────────────────────────────────

export function handleGetAssetDistribution(_req: Request, res: Response) {
  ok(res, [
    { name: "Worlds",         value:    8_423 },
    { name: "Football Clubs", value:    1_247 },
    { name: "Pets",           value: 3_891_204 },
    { name: "Items",          value: 8_000_000 },
    { name: "Land",           value: 2_392_973 },
  ]);
}

// ── Transaction volume ────────────────────────────────────────────────────────

export function handleGetTransactionVolume(_req: Request, res: Response) {
  ok(res, [
    { month: "Jan", volume: 2.1 }, { month: "Feb", volume: 2.5 },
    { month: "Mar", volume: 2.8 }, { month: "Apr", volume: 3.4 },
    { month: "May", volume: 4.1 }, { month: "Jun", volume: 4.8 },
    { month: "Jul", volume: 5.2 }, { month: "Aug", volume: 4.9 },
    { month: "Sep", volume: 5.5 }, { month: "Oct", volume: 6.1 },
    { month: "Nov", volume: 6.8 }, { month: "Dec", volume: 7.4 },
  ]);
}

// ── Active users by region ────────────────────────────────────────────────────

export function handleGetActiveUsersByRegion(_req: Request, res: Response) {
  ok(res, [
    { region: "Americas",    users:   950_000 },
    { region: "Europe",      users:   820_000 },
    { region: "Asia Pacific",users: 1_100_000 },
    { region: "Middle East", users:   250_000 },
    { region: "Africa",      users:   180_000 },
  ]);
}

// ── DAU trend (30 days) ───────────────────────────────────────────────────────

export function handleGetDauTrend(_req: Request, res: Response) {
  const data: { day: number; dau: number }[] = [];
  let base = 400_000;
  let seed = 12345;
  for (let i = 1; i <= 30; i++) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    const delta = (seed % 25_000) - 5_000;
    base = Math.max(350_000, base + delta);
    data.push({ day: i, dau: base });
  }
  ok(res, data);
}

// ── Top metrics (quarterly macro) ─────────────────────────────────────────────

export function handleGetTopMetrics(_req: Request, res: Response) {
  ok(res, [
    { month: "Q1", users:  1.5, assets:  5.2, transactions:  8.4 },
    { month: "Q2", users:  2.1, assets:  8.1, transactions: 15.2 },
    { month: "Q3", users:  2.5, assets: 11.4, transactions: 28.5 },
    { month: "Q4", users: 2.85, assets: 14.3, transactions: 47.3 },
  ]);
}
