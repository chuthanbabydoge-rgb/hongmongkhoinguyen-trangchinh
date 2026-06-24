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

const router: IRouter = Router();

router.get("/ecosystem/stats",                handleGetStats);
router.get("/ecosystem/apps",                 handleGetApps);
router.get("/ecosystem/apps/:slug",           handleGetAppBySlug);
router.get("/ecosystem/categories/:category", handleGetByCategory);

export default router;
