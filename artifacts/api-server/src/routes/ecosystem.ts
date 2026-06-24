// ─────────────────────────────────────────────────────────────────────────────
// Ecosystem router — HUB-2 (alias/extended routes)
//
// GET  /api/ecosystem/stats               — registry statistics
// GET  /api/ecosystem/apps               — list all apps
// GET  /api/ecosystem/apps/:slug         — get by slug
// GET  /api/ecosystem/categories/:cat    — filter by category
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type IRouter } from "express";
import {
  handleGetApps,
  handleGetAppBySlug,
  handleGetByCategory,
  handleGetStats,
} from "../controllers/appRegistryController.js";
import {
  handleGetAnalyticsStats,
  handleGetUserGrowth,
  handleGetAssetDistribution,
  handleGetTransactionVolume,
  handleGetActiveUsersByRegion,
  handleGetDauTrend,
  handleGetTopMetrics,
} from "../controllers/ecosystemAnalyticsController.js";

const router: IRouter = Router();

router.get("/ecosystem/stats",                handleGetStats);
router.get("/ecosystem/apps",                 handleGetApps);
router.get("/ecosystem/apps/:slug",           handleGetAppBySlug);
router.get("/ecosystem/categories/:category", handleGetByCategory);

router.get("/ecosystem/analytics/stats",               handleGetAnalyticsStats);
router.get("/ecosystem/analytics/user-growth",         handleGetUserGrowth);
router.get("/ecosystem/analytics/asset-distribution",  handleGetAssetDistribution);
router.get("/ecosystem/analytics/transaction-volume",  handleGetTransactionVolume);
router.get("/ecosystem/analytics/active-users-region", handleGetActiveUsersByRegion);
router.get("/ecosystem/analytics/dau-trend",           handleGetDauTrend);
router.get("/ecosystem/analytics/top-metrics",         handleGetTopMetrics);

export default router;
