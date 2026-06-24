// ─────────────────────────────────────────────────────────────────────────────
// Apps router — HUB-2 App Registry
//
// GET    /api/apps          — list all apps (supports ?q= and ?category=)
// GET    /api/apps/:id      — get app by id
// POST   /api/apps/register — register a new app
// PUT    /api/apps/:id      — update an app
// DELETE /api/apps/:id      — delete an app
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type IRouter } from "express";
import {
  handleGetApps,
  handleGetAppById,
  handleRegisterApp,
  handleUpdateApp,
  handleDeleteApp,
  handleGetStats,
} from "../controllers/appRegistryController.js";

const router: IRouter = Router();

router.get("/apps/stats",     handleGetStats);
router.get("/apps",           handleGetApps);
router.post("/apps/register", handleRegisterApp);
router.get("/apps/:id",       handleGetAppById);
router.put("/apps/:id",       handleUpdateApp);
router.delete("/apps/:id",    handleDeleteApp);

export default router;
