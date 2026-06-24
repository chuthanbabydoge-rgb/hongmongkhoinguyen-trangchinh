// ─────────────────────────────────────────────────────────────────────────────
// Apps router — HUB-5
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type IRouter } from "express";
import {
  handleGetApps,
  handleGetFeaturedApps,
  handleGetRecentApps,
  handleGetMyApps,
  handleGetAppBySlug,
  handleRegisterApp,
  handleInstallApp,
  handleUninstallApp,
  handleOpenApp,
  handleDisableApp,
  handleEnableApp,
} from "../controllers/applicationController.js";

const router: IRouter = Router();

router.get("/apps/featured",          handleGetFeaturedApps);
router.get("/apps/recent",            handleGetRecentApps);
router.get("/apps/my",                handleGetMyApps);
router.get("/apps",                   handleGetApps);
router.get("/apps/:slug",             handleGetAppBySlug);
router.post("/apps/register",         handleRegisterApp);
router.post("/apps/install",          handleInstallApp);
router.delete("/apps/install/:slug",  handleUninstallApp);
router.post("/apps/:slug/open",       handleOpenApp);
router.patch("/apps/:slug/disable",   handleDisableApp);
router.patch("/apps/:slug/enable",    handleEnableApp);

export default router;
