import { Router, type IRouter } from "express";
import {
  handleGetApps,
  handleGetAppBySlug,
  handleGetByCategory,
  handleRegisterApp,
  handleUpdateApp,
  handleDeleteApp,
  handleGetStats,
} from "../controllers/appRegistryController.js";

const router: IRouter = Router();

router.get("/ecosystem/stats",                handleGetStats);
router.get("/ecosystem/apps",                 handleGetApps);
router.get("/ecosystem/apps/:slug",           handleGetAppBySlug);
router.get("/ecosystem/categories/:category", handleGetByCategory);
router.post("/ecosystem/apps",                handleRegisterApp);
router.patch("/ecosystem/apps/:id",           handleUpdateApp);
router.delete("/ecosystem/apps/:id",          handleDeleteApp);

export default router;
